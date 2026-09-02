-- Allow only the controlled retention function to remove expired audit rows.
CREATE OR REPLACE FUNCTION prevent_audit_update() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE'
     AND current_setting('app.system_scope', true) = 'true'
     AND current_setting('app.audit_retention_purge', true) = 'true' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'audit_logs is immutable: updates and deletes are forbidden';
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.purge_audit_logs_older_than(days_to_keep INT) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INT;
BEGIN
  IF days_to_keep < 30 THEN
    RAISE EXCEPTION 'Retention period cannot be less than 30 days';
  END IF;

  PERFORM set_config('app.system_scope', 'true', true);
  PERFORM set_config('app.audit_retention_purge', 'true', true);
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - make_interval(days => days_to_keep);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;--> statement-breakpoint

REVOKE ALL ON FUNCTION public.purge_audit_logs_older_than(INT) FROM PUBLIC;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.purge_audit_logs_older_than(INT) TO CURRENT_USER;
