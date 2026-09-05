#!/usr/bin/env bash
set -euo pipefail

: "${RESTORE_VERIFY_DATABASE_URL:?set RESTORE_VERIFY_DATABASE_URL to a disposable database}"
FILE=${1:?usage: db-restore-verify.sh <backup.sql.gz>}

if [[ "${RESTORE_VERIFY_ALLOW_RESET:-}" != "true" ]]; then
  echo "Refusing restore verification: set RESTORE_VERIFY_ALLOW_RESET=true for a disposable database."
  exit 1
fi
if [[ ! -f "$FILE" ]]; then
  echo "Backup file does not exist: $FILE"
  exit 1
fi
gzip -t "$FILE"

TARGET_DATABASE=$(psql "$RESTORE_VERIFY_DATABASE_URL" -Atqc "SELECT current_database()")
case "$TARGET_DATABASE" in
  *restore*|*scratch*|*test*) ;;
  *)
    echo "Refusing restore verification: target database must contain restore, scratch, or test."
    exit 1
    ;;
esac

echo "Resetting disposable restore target: $TARGET_DATABASE"
psql "$RESTORE_VERIFY_DATABASE_URL" -v ON_ERROR_STOP=1 -c \
  "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "Restoring and verifying: $FILE"
gunzip -c "$FILE" | psql "$RESTORE_VERIFY_DATABASE_URL" --set ON_ERROR_STOP=1 --single-transaction
psql "$RESTORE_VERIFY_DATABASE_URL" --set ON_ERROR_STOP=1 -Atqc "SELECT 1" >/dev/null

TABLE_COUNT=$(psql "$RESTORE_VERIFY_DATABASE_URL" -Atqc \
  "SELECT count(*) FROM pg_catalog.pg_class WHERE relkind IN ('r', 'p') AND relnamespace = 'public'::regnamespace")
if [[ "$TABLE_COUNT" -lt 1 ]]; then
  echo "Restore verification failed: no public tables were restored."
  exit 1
fi

echo "Restore verification passed: database=$TARGET_DATABASE public_tables=$TABLE_COUNT"
