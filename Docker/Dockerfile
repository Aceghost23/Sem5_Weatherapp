# ========== STAGE 1: builder ==========
FROM node:18-alpine AS builder

# 1) Arbeitsverzeichnis
WORKDIR /app

# 2) package.json + package-lock.json kopieren (Caching)
COPY Backend/package*.json /app/Backend/

# 3) Dependencies installieren (alle, damit build klappt)
WORKDIR /app/Backend
RUN npm install

# 4) Gesamten Backend-Code kopieren
COPY Backend /app/Backend

# 5) Frontend kopieren 
WORKDIR /app
COPY Frontend /app/Frontend

# ========== STAGE 2: production ==========
FROM node:18-alpine AS production

WORKDIR /app

# 6) Kopiere builder
COPY --from=builder /app /app

# 7) Nur Production-Dependencies installieren

WORKDIR /app/Backend
RUN npm install --only=production

# 8) Port
EXPOSE 3000

# 9) CMD: zuerst Index-Skript, dann Server
CMD ["sh", "-c", "echo 'Erstelle Indexe...'; node /app/Backend/initIndexes.js || echo '⚠ Index-Skript fehlerhaft oder Indexe schon vorhanden.'; echo '✅ Index-Skript ausgeführt! Starte Server...'; node Server.js"]

