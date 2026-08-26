#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?set DATABASE_URL}"
BACKUP_DIR=${1:-./backups}
TIMESTAMP=$(date +%Y%m%d%H%M%S)
mkdir -p "$BACKUP_DIR"
FILE="$BACKUP_DIR/pg_backup_$TIMESTAMP.sql.gz"
echo "Backing up Postgres to $FILE..."
pg_dump "$DATABASE_URL" | gzip > "$FILE"
echo "Backup complete: $FILE"
ls -lh "$FILE"
