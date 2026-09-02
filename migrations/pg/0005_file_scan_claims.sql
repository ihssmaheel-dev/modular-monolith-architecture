-- Claim uploads before external scanning so worker replicas cannot process the same object.
ALTER TYPE "public"."file_status" ADD VALUE IF NOT EXISTS 'scanning';
