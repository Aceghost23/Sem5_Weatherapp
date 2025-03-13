# start_project.ps1
# ---------------------------------------------
# Dieses Skript:
#  1) Entfernt alte Container/Volumes (docker-compose down -v)
#  2) Baut Docker-Images ohne Cache (docker-compose build --no-cache)
#  3) Startet die Container (docker-compose up -d)
#  4) Öffnet http://localhost:3000 im Browser

Write-Host "Starte das Projekt.. "

Invoke-WebRequest `
  -Uri "https://drive.google.com/uc?export=download&id=1uWBEeyzV1k4WUtaumbpYdq_INT3qejCn" `
  -OutFile ".\Docker\mongo-seed\mongo-seed.tar.gz"

Write-Host "mongo-seed.tar.gz wurde erfolgreich heruntergeladen."

# 1) Alte Container + Volumes entfernen
Write-Host "Entferne alte Container/Volumes (docker-compose down -v)..."
docker-compose down -v

# 2) Docker-Compose Build (ohne Cache)
Write-Host "Baue Docker-Images ohne Cache (docker-compose build --no-cache)..."
docker-compose build --no-cache

# 3) Docker-Compose Up (Detached)
Write-Host "Starte Container im Hintergrund (docker-compose up -d)..."
docker-compose up -d

# 4) Öffne den Browser
Write-Host "Öffne http://localhost:3000 im Browser..."
Start-Process "http://localhost:3000"




