# start_project.ps1
# ---------------------------------------------
# 1) Entfernt alte Container/Volumes
# 2) Bestimmt Skript-Ordner ($PSScriptRoot)
# 3) Legt Ordner 'mongo-seed' an
# 4) Lädt mongo-seed.tar.gz herunter
# 5) Docker build & up
# 6) Browser öffnen

Write-Host "Entferne alte Container/Volumes..."
docker-compose down -v

# Bestimme den Ordner, in dem dieses Skript liegt (ab PowerShell 3.0 verfügbar).
$scriptDir = $PSScriptRoot

Write-Host "Erstelle Ordner 'mongo-seed' neben dem Skript..."
$mongoSeedPath = Join-Path $scriptDir "mongo-seed"
New-Item -ItemType Directory -Force -Path $mongoSeedPath | Out-Null

Write-Host "Lade mongo-seed.tar.gz herunter..."
# Achtung: Dieser Link kann zeitlich begrenzt gültig sein!
$downloadLink = "https://my.microsoftpersonalcontent.com/personal/a3e1de9afbb4c16b/_layouts/15/download.aspx?UniqueId=598a2263-09df-4c6e-82a6-0420a601a191&Translate=false&tempauth=v1e.eyJzaXRlaWQiOiIyNDMwNDdmZS05M2FhLTQ3NjAtYTFhMS1lZDI1OWNiNTc2OGMiLCJhcHBpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDA0ODE3MTBhNCIsImF1ZCI6IjAwMDAwMDAzLTAwMDAtMGZmMS1jZTAwLTAwMDAwMDAwMDAwMC9teS5taWNyb3NvZnRwZXJzb25hbGNvbnRlbnQuY29tQDkxODgwNDBkLTZjNjctNGM1Yi1iMTEyLTM2YTMwNGI2NmRhZCIsImV4cCI6IjE3NDE5MDM4MTMifQ.6xbTJGda0EJfLtDwKVaqpR0sXqEjOxEVfpR5Q8srOlFcONeGheCgByDsm7OgvtBuGZgkxqHZphFm7FTU9mVMFn_VylFYdxgJ-K9OFiGw04TWDOj3jnvH_TsHjBWYWFVZ_uUy5ahDFeG3kg1KG5PXvn2FcRN-4hWRNTNWrpxS01SorIOC7XoKTwohJcAbQIM5wa2T5cVZ9-BuBguXgmkv9pWhNGnLouO_Ts3T-VCl83qrRSndTK7aNSb3Cwry36xiqkIGa1c2YwyB2lCkpjidBOS08V8GN3glZmz2DI0ouHZhIJfsSWQuangR4htWwT61qrXIPtvh09FEtx3KXrmApsbOspaB9bEGRji-C_CbloMHh8wrn1TCN-2-vZmc_Jl7XdQc6qyYBCl1iB1DX4zYew.uIGVe6DvTrTXcrqrGXQM1hShy2i86PUznjp2GbJMMUU&ApiVersion=2.0&AVOverride=1"

# Ziel-Datei: <skriptOrdner>\mongo-seed\mongo-seed.tar.gz
$targetFile = Join-Path $mongoSeedPath "mongo-seed.tar.gz"

Invoke-WebRequest -Uri $downloadLink -OutFile $targetFile

Write-Host "Baue Docker-Images ohne Cache..."
docker-compose build --no-cache

Write-Host "Starte Container im Hintergrund..."
docker-compose up -d

Write-Host "Öffne http://localhost:3000/ im Browser..."
Start-Process "http://localhost:3000/"

Write-Host "Fertig! Das Projekt sollte nun laufen."






