# OpenTask selbst hosten

Anleitung für einen eigenen Server, der nur über WireGuard erreichbar ist. Alles läuft mit
`docker compose`: eine PostgreSQL-Datenbank, die App und optional Caddy für HTTPS.

## Was du brauchst

- Einen Server mit Docker und dem Compose-Plugin (`docker compose version` muss funktionieren).
- Ein WireGuard-Interface auf dem Server, zum Beispiel `wg0` mit der IP `10.8.0.1`. Die IP zeigt dir
  `ip -4 addr show wg0`. Auf den folgenden Seiten steht dafür `10.8.0.1`.
- Git, um den Code auf den Server zu holen.

## 1. Installieren

```bash
git clone <dein-repository> opentask
cd opentask
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
läuft alles.

## 2. Ersten Account anlegen und Registrierung schließen

1. Öffne `http://10.8.0.1:3000` in einem Browser, der per WireGuard verbunden ist. Du landest auf der
   Login-Seite. Über „Create one“ legst du deinen Account an.
2. Setze danach in `.env` die Zeile `DISABLE_SIGNUP=true` und starte die App neu:

   ```bash
   docker compose up -d
   ```

   Ab jetzt zeigt die Registrierungsseite nur noch „Sign-ups are disabled“, und auch der Endpunkt
   `/api/auth/sign-up/email` lehnt neue Accounts ab.

## 3. Nur über WireGuard erreichbar machen

Die Ports sind schon so gesetzt, dass nichts nach außen offen ist:

- Die App lauscht nur auf `APP_BIND`. Mit der WireGuard-IP ist sie nur über das VPN erreichbar.
- Die Datenbank lauscht nur auf `127.0.0.1`, also nur auf dem Server selbst.

Verlass dich dabei nicht auf eine Firewall wie UFW. Docker setzt veröffentlichte Ports über eigene
iptables-Regeln, die UFW umgehen. Deshalb ist die Bindung an die IP die eigentliche Absicherung.

Prüfen kannst du es auf dem Server:

```bash
ss -ltn | grep -E ':3000|:5432'
```

Die App muss mit der WireGuard-IP erscheinen, die Datenbank mit `127.0.0.1`. Nie `0.0.0.0`.

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
```

`APP_DOMAIN` kann eine IP oder ein Domainname sein, `BETTER_AUTH_URL` muss genau dazu passen. Dann:

```bash
docker compose --profile https up -d --build
```

### Variante A: Caddys eigene Zertifizierungsstelle (läuft sofort)

Das ist die Voreinstellung in der `Caddyfile` (`tls internal`). Der Browser warnt aber, bis er Caddys
Root-Zertifikat kennt. Das holst du dir einmal vom Server:

```bash
docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt ./caddy-root.crt
```

Installiere `caddy-root.crt` auf deinen Geräten als vertrauenswürdige Zertifizierungsstelle.

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

```bash
git pull
docker compose up -d --build
```

Neue Migrationen laufen dabei automatisch. Mach vorher ein Backup, wenn sich das Datenbankschema
geändert hat.

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

## Fehlersuche

| Problem | Was du prüfst |
|---|---|
| Seite lädt nicht | `docker compose ps` und `docker compose logs -f app`. Läuft `migrate` durch? Ist `app` `healthy`? |
| „Invalid origin“ beim Anmelden | `BETTER_AUTH_URL` muss exakt der Adresse im Browser entsprechen, mit Schema und Port. Weitere Adressen gehören in `BETTER_AUTH_TRUSTED_ORIGINS`. |
| „Too many failed sign-in attempts“ | Nach 10 falschen Passwörtern sperrt die App die Anmeldung für diese E-Mail-Adresse 10 Minuten lang. `docker compose restart app` hebt die Sperre sofort auf. |
| Nach dem Login landest du wieder auf der Login-Seite | Du rufst die App über HTTP auf, aber `BETTER_AUTH_URL` beginnt mit `https://`. Dann setzt Better Auth Secure-Cookies, die der Browser über HTTP nicht zurückschickt. |
| `docker compose` bricht mit „Set POSTGRES_PASSWORD in .env“ ab | Die Variable fehlt in `.env`. |
| Port schon belegt | `APP_PORT`, `DB_PORT`, `CADDY_HTTP_PORT` oder `CADDY_HTTPS_PORT` in `.env` ändern. |
| App erreichbar, obwohl sie es nicht sein soll | `ss -ltn` zeigt, an welche Adresse ein Port gebunden ist (siehe Abschnitt 3). |
