CREATE TYPE "public"."audit_action" AS ENUM('CREATE', 'UPDATE', 'DELETE');--> statement-breakpoint
CREATE TYPE "public"."outbox_status" AS ENUM('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED', 'DEAD_LETTER');--> statement-breakpoint
CREATE TYPE "public"."file_parent_type" AS ENUM('note', 'user', 'general');--> statement-breakpoint
CREATE TYPE "public"."file_status" AS ENUM('pending', 'uploading', 'scanning', 'uploaded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."invitation_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."membership_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"collection_name" text NOT NULL,
	"document_id" text NOT NULL,
	"action" "audit_action" NOT NULL,
	"actor_id" text,
	"tenant_id" text,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbox_events" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text,
	"topic" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "outbox_status" DEFAULT 'PENDING' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"error" text,
	"next_attempt_at" timestamp with time zone,
	"locked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text,
	"key" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"bucket" text NOT NULL,
	"parent_id" text,
	"parent_type" "file_parent_type" DEFAULT 'general' NOT NULL,
	"uploaded_by" text NOT NULL,
	"status" "file_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"email" text NOT NULL,
	"role" "invitation_role" NOT NULL,
	"token_hash" text NOT NULL,
	"invited_by" text NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_by" text,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"user_id" text NOT NULL,
	"user_email" text NOT NULL,
	"user_name" text NOT NULL,
	"role" "membership_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"password_reset_token_hash" text,
	"password_reset_expires_at" timestamp with time zone,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"auth_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "audit_tenant_created_idx" ON "audit_logs" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_collection_created_idx" ON "audit_logs" USING btree ("collection_name","created_at");--> statement-breakpoint
CREATE INDEX "audit_document_id_idx" ON "audit_logs" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "outbox_status_next_attempt_idx" ON "outbox_events" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE INDEX "outbox_tenant_id_idx" ON "outbox_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "outbox_topic_idx" ON "outbox_events" USING btree ("topic");--> statement-breakpoint
CREATE INDEX "files_tenant_parent_idx" ON "files" USING btree ("tenant_id","parent_type","parent_id");--> statement-breakpoint
CREATE INDEX "files_uploaded_by_idx" ON "files" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "files_key_idx" ON "files" USING btree ("key");--> statement-breakpoint
CREATE INDEX "files_deleted_at_idx" ON "files" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "notes_tenant_id_idx" ON "notes" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "notes_created_by_idx" ON "notes" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "notes_deleted_at_idx" ON "notes" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "notes_tenant_deleted_idx" ON "notes" USING btree ("tenant_id","deleted_at");--> statement-breakpoint
CREATE INDEX "invitations_tenant_email_status_idx" ON "invitations" USING btree ("tenant_id","email","status");--> statement-breakpoint
CREATE INDEX "invitations_token_hash_idx" ON "invitations" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "invitations_expires_at_idx" ON "invitations" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_tenant_user_unique" ON "memberships" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "memberships_tenant_id_idx" ON "memberships" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "memberships_user_id_idx" ON "memberships" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_unique" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_deleted_at_idx" ON "users" USING btree ("deleted_at");
--> statement-breakpoint
-- Audit logs immutability: prevent UPDATE/DELETE
REVOKE UPDATE, DELETE ON audit_logs FROM PUBLIC;
CREATE OR REPLACE FUNCTION prevent_audit_update() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is immutable: updates and deletes are forbidden';
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS audit_logs_immutable ON audit_logs;
CREATE TRIGGER audit_logs_immutable BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_update();--> statement-breakpoint
--> statement-breakpoint
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
--> statement-breakpoint
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
