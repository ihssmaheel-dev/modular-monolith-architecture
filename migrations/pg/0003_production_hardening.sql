-- Production hardening migration. Every file in this folder must be represented
-- in meta/_journal.json so Drizzle applies it on fresh and upgraded databases.
-- The outbox_status DEAD_LETTER value is owned by 0002_colossal_zodiak.sql.

CREATE OR REPLACE FUNCTION purge_audit_logs_older_than(days_to_keep INT) RETURNS INT
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

  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - make_interval(days => days_to_keep);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;--> statement-breakpoint

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE outbox_events FORCE ROW LEVEL SECURITY;--> statement-breakpoint

DROP POLICY IF EXISTS audit_system_scope ON audit_logs;--> statement-breakpoint
CREATE POLICY audit_system_scope ON audit_logs
  FOR ALL
  USING (
    current_setting('app.system_scope', true) = 'true'
    OR (current_setting('app.tenancy_mode', true) = 'single' AND tenant_id IS NULL)
    OR tenant_id = NULLIF(current_setting('app.current_tenant', true), '')
  )
  WITH CHECK (
    current_setting('app.system_scope', true) = 'true'
    OR (current_setting('app.tenancy_mode', true) = 'single' AND tenant_id IS NULL)
    OR tenant_id = NULLIF(current_setting('app.current_tenant', true), '')
  );--> statement-breakpoint

DROP POLICY IF EXISTS outbox_system_scope ON outbox_events;--> statement-breakpoint
CREATE POLICY outbox_system_scope ON outbox_events
  FOR ALL
  USING (
    current_setting('app.system_scope', true) = 'true'
    OR (current_setting('app.tenancy_mode', true) = 'single' AND tenant_id IS NULL)
    OR tenant_id = NULLIF(current_setting('app.current_tenant', true), '')
  )
  WITH CHECK (
    current_setting('app.system_scope', true) = 'true'
    OR (current_setting('app.tenancy_mode', true) = 'single' AND tenant_id IS NULL)
    OR tenant_id = NULLIF(current_setting('app.current_tenant', true), '')
  );--> statement-breakpoint

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE notes FORCE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS tenant_isolation_notes ON notes;--> statement-breakpoint
CREATE POLICY tenant_isolation_notes ON notes
  FOR ALL
  USING (
    current_setting('app.system_scope', true) = 'true'
    OR (current_setting('app.tenancy_mode', true) = 'single' AND tenant_id IS NULL)
    OR tenant_id = NULLIF(current_setting('app.current_tenant', true), '')
  )
  WITH CHECK (
    current_setting('app.system_scope', true) = 'true'
    OR (current_setting('app.tenancy_mode', true) = 'single' AND tenant_id IS NULL)
    OR tenant_id = NULLIF(current_setting('app.current_tenant', true), '')
  );--> statement-breakpoint

ALTER TABLE files ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE files FORCE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS tenant_isolation_files ON files;--> statement-breakpoint
CREATE POLICY tenant_isolation_files ON files
  FOR ALL
  USING (
    current_setting('app.system_scope', true) = 'true'
    OR (current_setting('app.tenancy_mode', true) = 'single' AND tenant_id IS NULL)
    OR tenant_id = NULLIF(current_setting('app.current_tenant', true), '')
  )
  WITH CHECK (
    current_setting('app.system_scope', true) = 'true'
    OR (current_setting('app.tenancy_mode', true) = 'single' AND tenant_id IS NULL)
    OR tenant_id = NULLIF(current_setting('app.current_tenant', true), '')
  );--> statement-breakpoint

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS tenant_isolation_memberships ON memberships;--> statement-breakpoint
CREATE POLICY tenant_isolation_memberships ON memberships
  FOR ALL
  USING (
    current_setting('app.system_scope', true) = 'true'
    OR tenant_id = NULLIF(current_setting('app.current_tenant', true), '')
    OR user_id = NULLIF(current_setting('app.current_user', true), '')
  )
  WITH CHECK (
    current_setting('app.system_scope', true) = 'true'
    OR tenant_id = NULLIF(current_setting('app.current_tenant', true), '')
  );--> statement-breakpoint

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE invitations FORCE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS tenant_isolation_invitations ON invitations;--> statement-breakpoint
CREATE POLICY tenant_isolation_invitations ON invitations
  FOR ALL
  USING (
    current_setting('app.system_scope', true) = 'true'
    OR tenant_id = NULLIF(current_setting('app.current_tenant', true), '')
    OR lower(email) = lower(NULLIF(current_setting('app.current_user_email', true), ''))
  )
  WITH CHECK (
    current_setting('app.system_scope', true) = 'true'
    OR tenant_id = NULLIF(current_setting('app.current_tenant', true), '')
  );
