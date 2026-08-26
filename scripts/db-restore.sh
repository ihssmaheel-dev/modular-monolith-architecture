#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?set DATABASE_URL}"
FILE=${1:?usage: db-restore.sh <backup.sql.gz>}
echo "Restoring Postgres from $FILE to $DATABASE_URL..."
gunzip -c "$FILE" | psql "$DATABASE_URL"
echo "Restore complete"
