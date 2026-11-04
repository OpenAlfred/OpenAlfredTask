# OpenTask selbst hosten

Anleitung für einen eigenen Server, den nur du erreichst: im Heimnetz oder über ein VPN wie
WireGuard. Alles läuft mit `docker compose`: eine PostgreSQL-Datenbank, die App und optional Caddy
für HTTPS.

## Was du brauchst

- Einen Server mit Docker und dem Compose-Plugin (`docker compose version` muss funktionieren).
- Die IP, unter der du den Server erreichst, sobald du verbunden bist. Auf den folgenden Seiten steht
  dafür `10.8.0.1`. Je nach Aufbau ist das:
  - die IP einer WireGuard-Schnittstelle auf dem Server (`ip -4 addr show wg0`), oder
  - die Adresse des Servers im Heimnetz, zum Beispiel `192.168.178.99`, wenn dein Router den
    VPN-Tunnel beendet, wie bei der FRITZ!Box. Gib dem Server dann im Router eine feste IP-Adresse,
    sonst bricht alles, sobald sie sich ändert.
- Git, oder `rsync` auf dem Server und auf deinem Laptop, um den Code auf den Server zu bringen.

## 1. Installieren

Bring den Code auf den Server. Erreicht der Server ein Git-Repository mit dem Code:

```bash
git clone <dein-repository> opentask
cd opentask
```

Ohne Git-Server schickt `scripts/deploy.sh` den letzten Commit von deinem Laptop aus (mehr dazu bei
„Updates“). Der erste Aufruf legt den Ordner an und bricht dann ab, weil noch die `.env` fehlt:

```bash
./scripts/deploy.sh alexander@10.8.0.1 opentask
ssh alexander@10.8.0.1
cd opentask
```

Lege auf dem Server die `.env` an:

```bash
cp .env.example .env
```

Trage in `.env` mindestens diese Werte ein:

| Variable | Wert |
|---|---|
| `POSTGRES_PASSWORD` | `openssl rand -hex 24`. Nur Hex-Zeichen, weil das Passwort in einer URL landet. |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Die Adresse, die du im Browser eintippst, mit `http://` und Port, zum Beispiel `http://10.8.0.1:3000`. Kein Slash am Ende. |
| `APP_BIND` | Die WireGuard-IP des Servers, zum Beispiel `10.8.0.1` |

`DATABASE_URL` in `.env` brauchst du nur für die lokale Entwicklung. Compose baut die URL für die
Container selbst.

Dann starten:

```bash
docker compose up -d --build
docker compose ps
```

Der erste Build dauert einige Minuten. `migrate` legt die Tabellen an und beendet sich danach, `app`
startet erst, wenn das geklappt hat. Wenn `docker compose ps` bei `app` den Status `healthy` zeigt,
läuft alles. Hast du den Code mit `scripts/deploy.sh` geschickt, startest du den Stack, indem du das
Skript ein zweites Mal ausführst.

## 2. Ersten Account anlegen und Registrierung schließen

1. Öffne `http://10.8.0.1:3000` in einem Browser, der per WireGuard verbunden ist. Du landest auf der
   Login-Seite. Über „Create one“ legst du deinen Account an.
2. Setze danach in `.env` die Zeile `DISABLE_SIGNUP=true` und starte die App neu:

   ```bash
   docker compose up -d
   ```

   Ab jetzt zeigt die Registrierungsseite nur noch „Sign-ups are disabled“, und auch der Endpunkt
   `/api/auth/sign-up/email` lehnt neue Accounts ab.

## 3. Wer den Server erreicht

Die Ports sind schon so gesetzt, dass nichts aus dem Internet offen ist:

- Die App lauscht nur auf `APP_BIND`. Mit der IP einer WireGuard-Schnittstelle erreicht sie nur das
  VPN. Mit der Heimnetz-Adresse (`192.168.178.99`) erreichen sie alle Geräte im Heimnetz und die
  VPN-Verbindungen, die der Router dorthin durchlässt. Aus dem Internet erreicht sie nur jemand, wenn
  du im Router eine Portfreigabe einrichtest.
- Die Datenbank lauscht nur auf `127.0.0.1`, also nur auf dem Server selbst.

Verlass dich dabei nicht auf eine Firewall wie UFW. Docker setzt veröffentlichte Ports über eigene
iptables-Regeln, die UFW umgehen. Deshalb ist die Bindung an die IP die eigentliche Absicherung.
Gebunden wird nur an IPv4-Adressen, die globale IPv6-Adresse des Servers bleibt zu.

Prüfen kannst du es auf dem Server:

```bash
ss -ltn | grep -E ':3000|:5432'
```

Die App (mit HTTPS Caddy) muss mit der gewünschten IP erscheinen, die Datenbank mit `127.0.0.1`.
Nie `0.0.0.0`.

## 4. HTTPS

Du brauchst HTTPS, wenn du OpenTask auf dem Handy als App installieren willst. Service Worker und die
Installation als PWA funktionieren nur über HTTPS, im normalen Browser reicht sonst auch HTTP. Dafür
gibt es das Compose-Profil `https` mit Caddy.

In `.env`:

```
APP_BIND=127.0.0.1
CADDY_BIND=10.8.0.1
APP_DOMAIN=10.8.0.1
BETTER_AUTH_URL=https://10.8.0.1
COMPOSE_PROFILES=https
```

`APP_DOMAIN` kann eine IP oder ein Domainname sein, `BETTER_AUTH_URL` muss genau dazu passen.
`COMPOSE_PROFILES=https` sorgt dafür, dass ein einfaches `docker compose up -d --build` Caddy
mitstartet, sonst brauchst du immer `--profile https`. Dann:

```bash
docker compose up -d --build
```

Belegt schon etwas anderes die Ports 80 und 443, zum Beispiel Pi-hole, setz in `.env` andere Ports für
Caddy, etwa `CADDY_HTTPS_PORT=3000` und `CADDY_HTTP_PORT=3080`. Die Adresse im Browser und
`BETTER_AUTH_URL` bekommen dann den Port, also `https://10.8.0.1:3000`. Caddys Weiterleitung von HTTP
auf HTTPS führt bei solchen Ports ins Leere, rufe die HTTPS-Adresse direkt auf.

### Variante A: Caddys eigene Zertifizierungsstelle (läuft sofort)

Das ist die Voreinstellung in der `Caddyfile` (`tls internal`). Der Browser warnt aber, bis er Caddys
Root-Zertifikat kennt. Das holst du dir einmal vom Server:

```bash
docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt ./caddy-root.crt
```

Prüfe den Fingerabdruck, bevor du etwas installierst:

```bash
openssl x509 -in caddy-root.crt -noout -fingerprint -sha256
```

Installiere `caddy-root.crt` danach auf deinen Geräten als vertrauenswürdige Zertifizierungsstelle.

### Variante B: Zertifikat, dem Browser von sich aus vertrauen

Let's Encrypt stellt auch Zertifikate für einen Server aus, der nur über ein privates Netz erreichbar
ist, wenn du die DNS-Challenge nutzt. Dafür brauchst du:

1. Einen Domainnamen, den du besitzt, zum Beispiel `tasks.example.com`, mit einem A-Record auf die
   WireGuard-IP des Servers (`10.8.0.1`). Der Record darf auf eine private IP zeigen.
2. Einen Caddy mit dem DNS-Plugin deines Anbieters. Das Beispiel gilt für Cloudflare. Bei anderen
   Anbietern tauschst du Plugin und Variablenname aus ([Liste](https://github.com/caddy-dns)).
   **Dieses Beispiel ist nicht getestet.**

`caddy/Dockerfile`:

```dockerfile
FROM caddy:2-builder AS builder
RUN xcaddy build --with github.com/caddy-dns/cloudflare

FROM caddy:2
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
```

In der `Caddyfile` ersetzt du `tls internal` durch:

```
tls {
	dns cloudflare {env.CLOUDFLARE_API_TOKEN}
}
```

In `docker-compose.yml` bekommt der Dienst `caddy` statt `image: caddy:2` die Zeile
`build: ./caddy`, und unter `environment` kommt `CLOUDFLARE_API_TOKEN: ${CLOUDFLARE_API_TOKEN}` dazu.
Den Token trägst du in `.env` ein.

Hat dein Router einen DNS-Rebind-Schutz (bei der FritzBox heißt das so), blockiert er Namen, die auf
private IPs zeigen. Gib die Domain dort frei.

### Wenn die Adresse im Browser nicht zur Konfiguration passt

Better Auth lehnt Anfragen ab, deren Herkunft nicht zu `BETTER_AUTH_URL` passt. Rufst du die App unter
mehreren Adressen auf, trage die weiteren kommagetrennt in `BETTER_AUTH_TRUSTED_ORIGINS` ein,
zum Beispiel `https://10.8.0.1,https://tasks.example.com`.

## 5. Updates

Mit Git auf dem Server:

```bash
git pull
docker compose up -d --build
```

Ohne Git-Server von deinem Laptop aus:

```bash
./scripts/deploy.sh alexander@10.8.0.1 opentask
```

Das Skript schickt den letzten Commit. Änderungen, die du noch nicht committet hast, bleiben draußen.
Was im Repository nicht mehr existiert, löscht es auf dem Server, nur `.env`,
`docker-compose.override.yml` und `backups/` lässt es in Ruhe. Danach startet es
`docker compose up -d --build`. Mit `DRY_RUN=1` davor listet es nur auf, was sich ändern würde.

Neue Migrationen laufen dabei automatisch. Mach vorher ein Backup, wenn sich das Datenbankschema
geändert hat. Ein Build belastet den Server einige Minuten lang. Läuft darauf etwas Empfindliches, zum
Beispiel ein Spieleserver, wähle eine ruhige Zeit. Ändert sich nur die Doku oder ein Skript, baut
Docker nichts neu.

## 6. Backups

```bash
./scripts/backup.sh
```

Das Skript schreibt `backups/opentask-<Datum>.sql.gz` und behält die letzten 14 Dateien
(`KEEP=30 ./scripts/backup.sh` ändert das, `BACKUP_DIR=/pfad` das Ziel). Kopiere die Dateien zusätzlich
auf einen anderen Rechner. Ein Backup auf demselben Server schützt nicht vor einem Plattenausfall.

Zurückspielen in einen laufenden Stack:

```bash
gunzip -c backups/opentask-<Datum>.sql.gz | docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
```

Für ein nächtliches Backup kannst du einen systemd-Timer nutzen. **Das Beispiel ist nicht getestet.**
Pfade und Benutzer passt du an.

`/etc/systemd/system/opentask-backup.service`:

```ini
[Unit]
Description=OpenTask database backup

[Service]
Type=oneshot
User=<dein-benutzer>
ExecStart=/home/<dein-benutzer>/opentask/scripts/backup.sh
```

`/etc/systemd/system/opentask-backup.timer`:

```ini
[Unit]
Description=Nightly OpenTask backup

[Timer]
OnCalendar=*-*-* 03:30:00
Persistent=true

[Install]
WantedBy=timers.target
```

Aktivieren mit `sudo systemctl enable --now opentask-backup.timer`.

## 7. MCP-Server nutzen

OpenTask hat einen MCP-Server unter `/api/mcp`. Damit kann ein KI-Assistent wie Claude Code deine
Projekte und Tasks lesen und ändern.

### Token anlegen

Öffne in OpenTask die **Einstellungen** und lege unter „API tokens“ einen Token an. Gib ihm einen Namen,
zum Beispiel „Claude Code auf dem Laptop“, und wähle, wann er abläuft (voreingestellt: 1 Jahr). Der
Token steht nur direkt nach dem Anlegen im Klartext da, in der Datenbank liegt nur sein Hash. Er gibt
dieselben Rechte wie dein Account. In derselben Liste kannst du ihn jederzeit widerrufen, danach
schlägt er sofort fehl.

### Claude Code verbinden

Die Einstellungen zeigen den fertigen Befehl direkt nach dem Anlegen. Er sieht so aus:

```bash
claude mcp add --transport http opentask https://tasks.example.com/api/mcp --header "Authorization: Bearer <token>"
```

Ob die Verbindung steht, siehst du in Claude Code mit `/mcp`. Soll der Token nicht in einer Datei
landen, die du ins Repository eincheckst, nimm in der `.mcp.json` eine Umgebungsvariable:

```json
{
  "mcpServers": {
    "opentask": {
      "type": "http",
      "url": "https://tasks.example.com/api/mcp",
      "headers": { "Authorization": "Bearer ${OPENTASK_TOKEN}" }
    }
  }
}
```

Claude Code läuft auf deinem Rechner und verbindet sich von dort, es geht also, solange WireGuard
läuft. claude.ai und die Apps auf dem Handy verbinden sich laut Anthropic aus der Cloud. Ein Server,
der nur über ein VPN erreichbar ist, geht damit nicht.

Zwei Dinge sind **nicht getestet**:

- Bei Variante A (`tls internal`) kennt Claude Code Caddys Zertifizierungsstelle nicht. Starte es dann
  mit `NODE_EXTRA_CA_CERTS=/pfad/zu/caddy-root.crt claude`.
- Für Clients ohne HTTP-Unterstützung gibt es die stdio-Brücke `mcp-remote`:
  `npx -y mcp-remote https://tasks.example.com/api/mcp --header "Authorization: Bearer ${OPENTASK_TOKEN}"`.

### Was der Server kann

| Tool | Wofür |
|---|---|
| `list_projects` | Projekte mit ihren IDs, aktive oder archivierte |
| `create_project`, `update_project` | Projekt anlegen, umbenennen, archivieren und wiederherstellen |
| `list_tasks` | Offene, erledigte oder alle Tasks, nach Projekt, Tag (`due_on`) oder bis zu einem Tag (`due_by`) gefiltert |
| `get_task` | Ein Task mit allen Feldern |
| `create_task`, `update_task` | Task anlegen, ändern, in ein anderes Projekt verschieben, Fälligkeit setzen oder entfernen |
| `complete_task` | Task erledigen oder wieder öffnen |
| `delete_task` | Task endgültig löschen |

Termine sind Kalendertage im Format `YYYY-MM-DD` in der Zeitzone deines Accounts. Die Zeitzone setzt
die App, sobald du sie im Browser öffnest, bis dahin gilt UTC. Projekte lassen sich bewusst nicht
löschen, nur archivieren, weil dabei alle ihre Tasks verschwinden würden. Auch `delete_task` ist
endgültig. Für erledigte Tasks ist `complete_task` die bessere Wahl.

### Wie er abgesichert ist

- Jede Anfrage braucht einen gültigen Token im Header `Authorization: Bearer`, sonst antwortet der
  Server mit 401.
- Anfragen mit einem fremden `Origin`-Header beantwortet er mit 403. Browser senden immer einen,
  MCP-Clients keinen. Erlaubt sind die Adressen aus `BETTER_AUTH_URL` und
  `BETTER_AUTH_TRUSTED_ORIGINS`.
- Ein Token sieht und ändert nur die Projekte und Tasks seines Besitzers.

## Fehlersuche

| Problem | Was du prüfst |
|---|---|
| Seite lädt nicht | `docker compose ps` und `docker compose logs -f app`. Läuft `migrate` durch? Ist `app` `healthy`? |
| „Invalid origin“ beim Anmelden | `BETTER_AUTH_URL` muss exakt der Adresse im Browser entsprechen, mit Schema und Port. Weitere Adressen gehören in `BETTER_AUTH_TRUSTED_ORIGINS`. |
| „Too many failed sign-in attempts“ | Nach 10 falschen Passwörtern sperrt die App die Anmeldung für diese E-Mail-Adresse 10 Minuten lang. `docker compose restart app` hebt die Sperre sofort auf. |
| Nach dem Login landest du wieder auf der Login-Seite | Du rufst die App über HTTP auf, aber `BETTER_AUTH_URL` beginnt mit `https://`. Dann setzt Better Auth Secure-Cookies, die der Browser über HTTP nicht zurückschickt. |
| `docker compose` bricht mit „Set POSTGRES_PASSWORD in .env“ ab | Die Variable fehlt in `.env`. |
| Port schon belegt | `APP_PORT`, `DB_PORT`, `CADDY_HTTP_PORT` oder `CADDY_HTTPS_PORT` in `.env` ändern. |
| MCP antwortet mit 401 | Der Token ist falsch, widerrufen oder abgelaufen. Lege in den Einstellungen einen neuen an. |
| MCP antwortet mit 403 | Die Anfrage hat einen `Origin`-Header, der nicht zu `BETTER_AUTH_URL` oder `BETTER_AUTH_TRUSTED_ORIGINS` passt. MCP-Clients senden keinen, Browser immer. |
| Claude Code meldet bei HTTPS einen Zertifikatsfehler | Bei Variante A: `NODE_EXTRA_CA_CERTS` auf Caddys Root-Zertifikat setzen (Abschnitt 7). |
| Der Build bricht mit „Temporary failure resolving“ ab | Die Container erreichen den DNS-Server des Servers nicht. Siehe „Build ohne DNS“ unten. |
| Caddy startet nicht, „address already in use“ | Ein anderer Dienst belegt den Port. Setz `CADDY_HTTPS_PORT` und `CADDY_HTTP_PORT` auf freie Ports (Abschnitt 4). |
| App erreichbar, obwohl sie es nicht sein soll | `ss -ltn` zeigt, an welche Adresse ein Port gebunden ist (siehe Abschnitt 3). |

### Build ohne DNS

Bricht der Build bei `apt-get` oder `npm` mit „Temporary failure resolving“ ab, erreichen die
Container den DNS-Server des Servers nicht. Das passiert, wenn der Router dem Server nur IPv6-DNS-Server
gibt, denn Docker-Container hängen an einem IPv4-Netz. Lege neben der `docker-compose.yml` eine Datei
`docker-compose.override.yml` an. Compose liest sie automatisch, sie bleibt nur auf dem Server, und
`scripts/deploy.sh` lässt sie in Ruhe:

```yaml
services:
  migrate:
    build:
      network: host
  app:
    build:
      network: host
```

Der Build läuft dann im Netz des Servers und nutzt dessen Resolver. Die laufenden Container brauchen
kein DNS.
