#!/usr/bin/env bash
# Dumps the database into backups/opentask-<date>.sql.gz and keeps the newest KEEP files.
#
#   ./scripts/backup.sh
#   KEEP=30 BACKUP_DIR=/mnt/backup/opentask ./scripts/backup.sh
#
# Restore into a running stack:
#   gunzip -c backups/opentask-<date>.sql.gz | docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
set -euo pipefail

cd "$(dirname "$0")/.."

backup_dir="${BACKUP_DIR:-backups}"
keep="${KEEP:-14}"
file="$backup_dir/opentask-$(date +%Y-%m-%d_%H%M%S).sql.gz"

mkdir -p "$backup_dir"

# Write to a temporary name first, so a failed dump never leaves a truncated backup behind.
docker compose exec -T db sh -c 'pg_dump --clean --if-exists -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  | gzip > "$file.tmp"
mv "$file.tmp" "$file"

ls -1t "$backup_dir"/opentask-*.sql.gz | tail -n +"$((keep + 1))" | xargs -r rm --

echo "Backup written to $file"
