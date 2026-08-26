-- Outbox Dead-Letter Queue (DLQ) status enhancement
ALTER TYPE outbox_status ADD VALUE IF NOT EXISTS 'DEAD_LETTER';
