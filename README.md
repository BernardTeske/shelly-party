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

**Mit docker-compose im Repo:** `docker compose up -d --profile host lightshow-host` (vorher ggf. `docker compose stop lightshow`).

**Docker Desktop (macOS / Windows):** Der Docker-Engine läuft in einer **Linux-VM**; ausgehende Verbindungen gehen über NAT und den Prozess `com.docker.backend` — nicht so, als läge die App direkt auf deinem Mac im Heimnetz. `--network host` bewirkt hier **kein** echtes Host-Netz wie auf dem Pi. In der Praxis sieht man dann oft **Timeouts** zu Geräten unter `192.168.x.x`, obwohl `curl` vom Mac aus zur gleichen IP funktioniert. **Empfehlung zum Entwickeln mit echten Lampen:** App nativ starten (`yarn dev` / `yarn start`). Docker auf dem Mac eher für „API ohne Hardware“ oder nach dem Deploy auf dem **Pi (Linux)** nutzen. Wenn du trotzdem Container brauchst: VPN/Firewall prüfen (Traffic läuft als `com.docker.backend`), Docker-Desktop-Version (bekannte LAN-Regressionen in Release Notes), und ob Docker-interne Netze nicht mit deinem LAN-Subnetz kollidieren (Einstellungen → Netzwerk).

## CORS (Frontend von anderem Host / Browser)

Wenn die UI z. B. von `http://localhost:5174` und die API von `http://triton:3033` geladen wird, muss der Server **CORS** korrekt beantworten (inkl. ggf. `Access-Control-Allow-Private-Network` für Anfragen aus dem lokalen Netz in Chrome). Im Code wird dafür `cors` genutzt – bitte **neu bauen und den Dienst auf dem Zielrechner neu starten** (`yarn build` / `yarn start` bzw. neues Image deployen), sonst liefert eine alte Version weiterhin Antworten ohne CORS-Header.

Alternativ: im Vite-Frontend eine **Proxy-URL** nutzen (siehe `frontend`-`.env.example`: gleiche Origin, kein CORS im Browser).

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

