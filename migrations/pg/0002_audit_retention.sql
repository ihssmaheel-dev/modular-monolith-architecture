-- Audit logs retention / GDPR purge helper function
-- Enables authorized administrative purging of records older than retention threshold without compromising application-level immutability.
CREATE OR REPLACE FUNCTION purge_audit_logs_older_than(days_to_keep INT) RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  IF days_to_keep < 30 THEN
    RAISE EXCEPTION 'Retention period cannot be less than 30 days';
  END IF;

  ALTER TABLE audit_logs DISABLE TRIGGER audit_logs_immutable;
  DELETE FROM audit_logs WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  ALTER TABLE audit_logs ENABLE TRIGGER audit_logs_immutable;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
