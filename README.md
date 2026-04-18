# Lightshow - IoT Lichtshow Controller

Node.js/TypeScript-App für die Steuerung von IoT-Lichtgeräten über XML-basierte Programme.

## Features

- XML-basierte Lichtshow-Definitionen
- Sequenzielle Step-Abarbeitung mit konfigurierbaren Durations
- Transition-Unterstützung für flüssige Farbübergänge
- Express-Server mit REST-API
- Endlos-Wiederholung von Shows

## Docker Deployment

### GitHub Container Registry

Das Projekt wird automatisch als Docker Image gebaut und zu GitHub Container Registry (GHCR) gepusht.

**Image-URL:** `ghcr.io/[dein-username]/lightshow:latest`

### Auf Raspberry Pi deployen

1. **Image von GHCR pullen:**
```bash
docker pull ghcr.io/[dein-username]/lightshow:latest
```

2. **Container starten:**
```bash
docker run -d \
  --name lightshow \
  -p 3000:3000 \
  -v $(pwd)/programmes:/app/programmes \
  ghcr.io/[dein-username]/lightshow:latest
```

3. **Mit docker-compose (empfohlen):** Im Repo liegt eine `docker-compose.yml` mit zwei Varianten:
   - Standard: `docker compose up -d` (Port 3000 gemappt).
   - **Host-Netzwerk (für Geräte im LAN):** zuerst ggf. `docker compose stop lightshow`, dann nur den Host-Service starten:  
     `docker compose up -d --profile host lightshow-host`  
     (Ohne Service-Namen würde Compose zusätzlich weiterhin `lightshow` mit starten und Port 3000 doppelt belegen.)

### Netzwerk: Geräte im LAN ansteuern

Die App ruft die Lampen per HTTP direkt über die in der XML hinterlegten IPs auf (`http://<gerät-ip>/…`). Läuft der Container im **Standard-Bridge-Netzwerk**, kann je nach Umgebung das Routing zu Geräten im Heimnetz fehlschlagen oder sich anders verhalten als ein Prozess direkt auf dem Host.

**Auf dem Raspberry Pi (Linux)** kannst du den Container im **Host-Netzwerk** starten — er nutzt dann denselben Netzwerk-Stack wie der Pi und erreicht Geräte im LAN wie jeder andere Dienst auf dem Gerät:

```bash
docker run -d \
  --name lightshow \
  --network host \
  -v $(pwd)/programmes:/app/programmes \
  ghcr.io/[dein-username]/lightshow:latest
```

Mit Port `3000` erreichst du die API dann unter `http://<pi-ip>:3000` (kein `-p` nötig; wird bei `--network host` ignoriert).

**Mit docker-compose im Repo:** `docker compose --profile host up -d` (Service `lightshow-host`). Den Standard-Service `lightshow` dafür stoppen, damit kein Konflikt um Port 3000 entsteht.

**Hinweis:** Unter **Docker Desktop (macOS/Windows)** entspricht `host` nicht dem echten Host-Netzwerk wie auf Linux; zum Testen im LAN ist dort oft nativer `yarn start` auf dem Rechner oder ein Linux-Host (z. B. Pi) die zuverlässigere Option.

## API-Endpunkte

- `POST /start` - Startet eine Show
  ```json
  { "filename": "feuer.xml" }
  ```

  Beispiel mit `curl` (Show `programmes/hit.xml` auf dem lokalen Server, Port 3000):

  ```bash
  curl -sS -X POST http://localhost:3000/start \
    -H "Content-Type: application/json" \
    -d '{"filename":"hit.xml"}'
  ```

- `POST /stop` - Stoppt die laufende Show

- `GET /status` - Gibt den aktuellen Status zurück

## Entwicklung

```bash
# Dependencies installieren
yarn install

# Development-Server starten
yarn dev

# Build
yarn build

# Production starten
yarn start
```

