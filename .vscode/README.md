# README

## Projektbeschreibung
Diese Anwendung dient der grafischen und tabellarischen Darstellung von Wetterdaten, basierend auf geografischen Koordinaten. Sie wird in einer Client-Server-Architektur ausgeführt und ist als Desktop-Anwendung oder als Web-Anwendung nutzbar. Der Server wird in Containern bereitgestellt und die Anwendung ist kompatibel mit Windows 11.

Die detaillierten Anforderungen sowie das Design und die Bedienung der Oberfläche werden während des Projekts hinzugefügt.

---

## Features

### 1. Grundlegende Bedienung
- **Suche und Auswahl einer Station:**
  - Direkte Eingabe geografischer Koordinaten (Länge und Breite).
  - Anzeige der nächsten Stationen innerhalb eines konfigurierbaren Suchradius.
  - Anpassbare Anzahl der anzuzeigenden Stationen.
- **Zeitraumseinstellung:**
  - Festlegung eines Zeitraums (in Jahren), in dem Daten vorliegen sollen.
- **Stationsauswahl:**
  - Auswahl einer Station zur Anzeige der Daten in grafischer und tabellarischer Form.

### 2. Datenanzeige
- **Jährliche Mittelwerte:**
  - Darstellung der jährlichen Temperaturminima und -maxima (ein Datenpunkt pro Jahr).
  - Anzeige sowohl grafisch als auch tabellarisch.
- **Jahreszeitliche Mittelwerte:**
  - Berechnung der Temperaturminima und -maxima für meteorologische Jahreszeiten (ein Datenpunkt pro Jahreszeit pro Jahr).
  - Anzeige sowohl grafisch als auch tabellarisch.

---

## Systemanforderungen
- **Betriebssystem:** Windows 11
  - Optional: Windows Subsystem for Linux (WSL) Virtual Machine (VM)
- **Client-Server-Architektur:**
  - Der Server wird in einem oder mehreren Containern bereitgestellt.

---

## Installation und Einrichtung
1. **Server-Setup:**
   - Installieren Sie Docker oder eine vergleichbare Container-Lösung.
   - Laden Sie die Server-Container aus dem bereitgestellten Repository.
2. **Client-Setup:**
   - Je nach gewähltem Client-Typ:
     - Für die Desktop-Anwendung: Führen Sie die Installationsdatei aus.
     - Für die Web-Anwendung: Öffnen Sie die Web-App im Browser.
3. **Konfiguration:**
   - Stellen Sie den Suchradius und die maximale Anzahl anzuzeigender Stationen ein.
   - Konfigurieren Sie den Zeitraum für die Datenanzeige.

---

## Bedienung
1. Starten Sie die Anwendung und geben Sie die geografischen Koordinaten ein.
2. Wählen Sie eine Station aus den angezeigten Suchergebnissen aus.
3. Legen Sie den gewünschten Zeitraum fest.
4. Sehen Sie sich die berechneten Werte für Temperaturminima und -maxima an, entweder:
   - Grafisch, als Diagramm.
   - Tabellarisch, als Text.

---

## Lizenz


---

## Kontakt




