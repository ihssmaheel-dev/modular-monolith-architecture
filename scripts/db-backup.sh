#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?set DATABASE_URL}"
BACKUP_DIR=${1:-./backups}
RETENTION_COUNT=${BACKUP_RETENTION_COUNT:-7}
TIMESTAMP=$(date +%Y%m%d%H%M%S)
mkdir -p "$BACKUP_DIR"
FILE="$BACKUP_DIR/pg_backup_$TIMESTAMP.sql.gz"
echo "Backing up Postgres to $FILE..."
pg_dump "$DATABASE_URL" | gzip > "$FILE"
gzip -t "$FILE"
test -s "$FILE"
echo "Backup complete: $FILE"
ls -lh "$FILE"
# Retention: keep newest N backups, prune older ones.
ls -1t "$BACKUP_DIR"/pg_backup_*.sql.gz | tail -n +$((RETENTION_COUNT + 1)) | xargs -r rm -f
echo "Retention: kept newest $RETENTION_COUNT backups in $BACKUP_DIR"
