-- PostgreSQL Row-Level Security (RLS) policies for multi-tenant data isolation defense-in-depth

-- 1. Notes Table RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_notes ON notes;
CREATE POLICY tenant_isolation_notes ON notes
  FOR ALL
  USING (
    tenant_id IS NULL OR
    NULLIF(current_setting('app.current_tenant', true), '') IS NULL OR
    tenant_id = current_setting('app.current_tenant', true)
  );

-- 2. Files Table RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_files ON files;
CREATE POLICY tenant_isolation_files ON files
  FOR ALL
  USING (
    tenant_id IS NULL OR
    NULLIF(current_setting('app.current_tenant', true), '') IS NULL OR
    tenant_id = current_setting('app.current_tenant', true)
  );

-- 3. Invitations Table RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_invitations ON invitations;
CREATE POLICY tenant_isolation_invitations ON invitations
  FOR ALL
  USING (
    tenant_id IS NULL OR
    NULLIF(current_setting('app.current_tenant', true), '') IS NULL OR
    tenant_id = current_setting('app.current_tenant', true)
  );

-- 4. Memberships Table RLS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_memberships ON memberships;
CREATE POLICY tenant_isolation_memberships ON memberships
  FOR ALL
  USING (
    tenant_id IS NULL OR
    NULLIF(current_setting('app.current_tenant', true), '') IS NULL OR
    tenant_id = current_setting('app.current_tenant', true)
  );
