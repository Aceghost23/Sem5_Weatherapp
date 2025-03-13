const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================== MongoDB Connection ==========================
const mongoURI = process.env.MONGO_URI || 'mongodb://mongodb_container:27017/ghcnd_database';
let db = null;

MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db("ghcnd_database");
    console.log("✅ Verbindung zu MongoDB erfolgreich! DB:", db.databaseName);
  })
  .catch(err => {
    console.error("❌ Fehler bei der MongoDB-Verbindung:", err);
    process.exit(1);
  });

// ========================== Statische Dateien (Frontend) ==========================
const frontendPath = path.join(__dirname, '../Frontend');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  console.log("🔍 GET / -> index.html");
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ========================== Bounding Box ==========================
app.get('/stations_in_bounds', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Datenbank nicht verbunden" });
    }
    const { swLat, swLng, neLat, neLng, startYear, endYear } = req.query;
    if (!swLat || !swLng || !neLat || !neLng) {
      return res.status(400).json({ error: "Fehlende Parameter: swLat, swLng, neLat, neLng" });
    }

    const swLatNum = parseFloat(swLat);
    const swLngNum = parseFloat(swLng);
    const neLatNum = parseFloat(neLat);
    const neLngNum = parseFloat(neLng);

    const query = {
      latitude:  { $gte: swLatNum, $lte: neLatNum },
      longitude: { $gte: swLngNum, $lte: neLngNum },
    };
    console.log("🔎 BBox-Query:", query);

    let stationsInBox = await db.collection('stations').find(query).toArray();
    console.log("🔍 Gefundene Stationen in BBox:", stationsInBox.length);

    // => Optional Entire-Coverage
    const sY = parseInt(startYear, 10);
    const eY = parseInt(endYear, 10);
    if (!isNaN(sY) && !isNaN(eY)) {
      stationsInBox = stationsInBox.filter(st =>
        st.start_year <= sY && st.end_year >= eY
      );
      console.log(`   Nach Entire-Coverage (${sY}-${eY}) =>`, stationsInBox.length, "Stationen");
    }

    res.json(stationsInBox);
  } catch (err) {
    console.error("❌ Fehler /stations_in_bounds:", err);
    res.status(500).send("Fehler beim BBox-Abruf.");
  }
});

// ========================== Koordinatensuche mit Radius & Limit ==========================
app.get('/search_by_coords', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Datenbank nicht verbunden" });
    }

    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 50;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sY = parseInt(req.query.startYear, 10);
    const eY = parseInt(req.query.endYear, 10);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Ungültige Koordinaten" });
    }

    let allStations = await db.collection('stations').find().toArray();

    if (!isNaN(sY) && !isNaN(eY)) {
      // Entire Coverage
      allStations = allStations.filter(st =>
        st.start_year <= sY && st.end_year >= eY
      );
    }

    const filtered = [];
    for (const st of allStations) {
      const stLat = parseFloat(st.latitude);
      const stLng = parseFloat(st.longitude);
      if (!isNaN(stLat) && !isNaN(stLng)) {
        const dist = haversine(lat, lng, stLat, stLng);
        if (dist <= radius) {
          filtered.push({ ...st, distance: dist });
        }
      }
    }
    filtered.sort((a, b) => a.distance - b.distance);
    const limited = filtered.slice(0, limit);

    console.log(`🔎 /search_by_coords: lat=${lat}, lng=${lng}, radius=${radius}, limit=${limit}`);
    if (!isNaN(sY) && !isNaN(eY)) {
      console.log(`   Entire-Coverage: ${sY}..${eY}`);
    }
    console.log("   Gefundene Stationen:", limited.length);
    res.json(limited);
  } catch (err) {
    console.error("❌ Fehler in /search_by_coords:", err);
    res.status(500).send("Fehler bei Koordinaten-Suche");
  }
});

// ========================== Station Data (Yearly + Seasonal) ==========================
app.get('/station_data', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "DB nicht verbunden" });
    }

    const stationId = req.query.station_id;
    const startYear = parseInt(req.query.startYear, 10);
    const endYear   = parseInt(req.query.endYear, 10);

    if (!stationId) {
      return res.status(400).json({ error: "station_id erforderlich." });
    }
    // => Falls Start/EndYear fehlen, fallback
    const sY = (!isNaN(startYear)) ? startYear : 1700;
    const eY = (!isNaN(endYear))   ? endYear   : 2025;

    // -----------------------------------------------
    // YEARLY => "tableYearlyAverages" + "yearlyAverages"
    // -----------------------------------------------
    const yearlyPipeline = [
      {
        $match: {
          station_id: stationId,
          year: { $gte: sY, $lte: eY }
        }
      },
      {
        $group: {
          _id: "$year",
          avgTmin: { $avg: "$avg_tmin" },
          avgTmax: { $avg: "$avg_tmax" }
        }
      },
      { $sort: { _id: 1 } }
    ];
    const yearlyData = await db.collection('stations_monthly').aggregate(yearlyPipeline).toArray();

    // => Nur echte DB-Datensätze (für die Tabelle)
    const tableYearlyAverages = yearlyData.map(doc => ({
      year: doc._id,
      avgTmin: (doc.avgTmin !== null && typeof doc.avgTmin === 'object')
        ? parseFloat(doc.avgTmin.toString())
        : doc.avgTmin,
      avgTmax: (doc.avgTmax !== null && typeof doc.avgTmax === 'object')
        ? parseFloat(doc.avgTmax.toString())
        : doc.avgTmax
    }));

    // => Finde minYear / maxYear aus den echten Daten
    if (tableYearlyAverages.length === 0) {
      return res.json({
        yearlyAverages: [],
        tableYearlyAverages: [],
        seasonalAverages: [],
        tableSeasonalAverages: []
      });
    }

    const minYear = tableYearlyAverages[0].year;
    const maxYear = tableYearlyAverages[tableYearlyAverages.length - 1].year;

    // => "yearlyAverages" mit Lücken füllen (für Graph)
    const filledYearly = [];
    for (let y = minYear; y <= maxYear; y++) {
      const found = tableYearlyAverages.find(d => d.year === y);
      if (found) {
        filledYearly.push(found);
      } else {
        filledYearly.push({
          year: y,
          avgTmin: null,
          avgTmax: null
        });
      }
    }

    // -----------------------------------------------
    // SEASONAL => "tableSeasonalAverages" + "seasonalAverages"
    // -----------------------------------------------
    const seasonalPipeline = [
      {
        $match: {
          station_id: stationId,
          year: { $gte: sY, $lte: eY }
        }
      },
      {
        $group: {
          _id: {
            year: "$year",
            season: {
              $switch: {
                branches: [
                  { case: { $in: ["$month", [3, 4, 5]] }, then: "Spring" },
                  { case: { $in: ["$month", [6, 7, 8]] }, then: "Summer" },
                  { case: { $in: ["$month", [9, 10, 11]] }, then: "Fall" },
                  { case: { $in: ["$month", [12, 1, 2]] }, then: "Winter" }
                ],
                default: "Unknown"
              }
            }
          },
          avgTmin: { $avg: "$avg_tmin" },
          avgTmax: { $avg: "$avg_tmax" }
        }
      },
      { $sort: { "_id.year": 1 } }
    ];
    const seasonalData = await db.collection('stations_monthly').aggregate(seasonalPipeline).toArray();

    // => Nur echte DB-Datensätze (für die Tabelle)
    const tableSeasonalAverages = seasonalData.map(doc => ({
      year: doc._id.year,
      season: doc._id.season,
      avgTmin: (doc.avgTmin !== null && typeof doc.avgTmin === 'object')
        ? parseFloat(doc.avgTmin.toString())
        : doc.avgTmin,
      avgTmax: (doc.avgTmax !== null && typeof doc.avgTmax === 'object')
        ? parseFloat(doc.avgTmax.toString())
        : doc.avgTmax
    }));

    const seasons = ["Spring", "Summer", "Fall", "Winter"];
    const filledSeasonal = [];
    // => Falls du Seasons mit Lücken füllen willst:
    for (let y = minYear; y <= maxYear; y++) {
      for (const s of seasons) {
        const found = tableSeasonalAverages.find(d => d.year === y && d.season === s);
        if (found) {
          filledSeasonal.push(found);
        } else {
          filledSeasonal.push({
            year: y,
            season: s,
            avgTmin: null,
            avgTmax: null
          });
        }
      }
    }

    // => Ergebnis
    res.json({
      // => Für die Tabelle:
      tableYearlyAverages,
      tableSeasonalAverages,
      // => Für den Graph
      yearlyAverages: filledYearly,
      seasonalAverages: filledSeasonal
    });
  } catch (err) {
    console.error("❌ Fehler /station_data:", err);
    res.status(500).json({ error: "Fehler station_data" });
  }
});

// ========================== Haversine-Funktion ==========================
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ========================== Server Start ==========================
app.listen(PORT, () => {
  console.log(`🌍 Server läuft auf http://localhost:${PORT}`);
});
