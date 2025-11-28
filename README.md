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

3. **Mit docker-compose (empfohlen):**
```yaml
version: '3.8'
services:
  lightshow:
    image: ghcr.io/[dein-username]/lightshow:latest
    ports:
      - "3000:3000"
    volumes:
      - ./programmes:/app/programmes
    restart: unless-stopped
```

## API-Endpunkte

- `POST /start` - Startet eine Show
  ```json
  { "filename": "feuer.xml" }
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

