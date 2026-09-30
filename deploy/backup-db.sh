#!/usr/bin/env bash
# Dumps the production database to a compressed file and prunes old dumps.
# Schedule it on the server, e.g. nightly at 03:00:
#   0 3 * * * /srv/belly-dance-academy/deploy/backup-db.sh >> /var/log/bda-backup.log 2>&1
# Copy the backup directory off the server too; a backup on the same disk
# doesn't survive losing the server.
set -euo pipefail

cd "$(dirname "$0")/.."

backup_dir="${BACKUP_DIR:-./backups}"
keep_days="${KEEP_DAYS:-14}"
file="$backup_dir/bellydance-$(date -u +%Y%m%dT%H%M%SZ).sql.gz"

mkdir -p "$backup_dir"
docker compose -f docker-compose.prod.yml exec -T db \
    pg_dump -U bellydance --clean --if-exists bellydance | gzip > "$file"
find "$backup_dir" -name 'bellydance-*.sql.gz' -mtime +"$keep_days" -delete

echo "Backup written to $file"
