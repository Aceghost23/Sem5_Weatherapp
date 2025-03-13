const { MongoClient } = require('mongodb');

async function createIndexes() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://mongodb_container:27017/ghcnd_database';

  let client;
  try {
    client = await MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db("ghcnd_database");
    console.log("✅ Verbindung zu MongoDB! Erstelle Indexe...");

    // Stations: Index für BBox?
    await db.collection('stations').createIndex({ latitude: 1, longitude: 1 });

    // stations_monthly -> Index für Aggregation
    await db.collection('stations_monthly').createIndex({ station_id: 1, year: 1, month: 1 });

    console.log("✅ Indexe erstellt!");
  } catch (err) {
    console.error("❌ Fehler beim Index-Setup:", err);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

createIndexes();
