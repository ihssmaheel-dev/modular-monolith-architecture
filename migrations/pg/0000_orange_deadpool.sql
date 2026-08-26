CREATE TYPE "public"."audit_action" AS ENUM('CREATE', 'UPDATE', 'DELETE');--> statement-breakpoint
CREATE TYPE "public"."outbox_status" AS ENUM('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."file_parent_type" AS ENUM('note', 'user', 'general');--> statement-breakpoint
CREATE TYPE "public"."file_status" AS ENUM('pending', 'uploading', 'uploaded', 'failed');--> statement-breakpoint
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