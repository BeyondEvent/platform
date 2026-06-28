CREATE TYPE "public"."simulation_status" AS ENUM('pending', 'running', 'paused', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."worker_state" AS ENUM('idle', 'subscribing', 'receiving', 'validating', 'executing', 'publishing', 'acking', 'error');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"trace_id" text NOT NULL,
	"span_id" text NOT NULL,
	"correlation_id" text NOT NULL,
	"causation_id" text,
	"simulation_id" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"value" real NOT NULL,
	"labels" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"simulation_id" uuid,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "simulations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"status" "simulation_status" DEFAULT 'pending' NOT NULL,
	"topology_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"simulation_id" uuid NOT NULL,
	"data" jsonb NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "topologies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"snapshot" jsonb DEFAULT '{"nodes":[],"edges":[]}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "traces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trace_id" text NOT NULL,
	"root_span_id" text NOT NULL,
	"correlation_id" text NOT NULL,
	"simulation_id" uuid,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "traces_trace_id_unique" UNIQUE("trace_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" text NOT NULL,
	"name" text NOT NULL,
	"version" text NOT NULL,
	"state" "worker_state" DEFAULT 'idle' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workers_worker_id_unique" UNIQUE("worker_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_trace_id_idx" ON "events" USING btree ("trace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_correlation_id_idx" ON "events" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_simulation_id_idx" ON "events" USING btree ("simulation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_type_idx" ON "events" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_occurred_at_idx" ON "events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "metrics_name_idx" ON "metrics" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "metrics_simulation_id_idx" ON "metrics" USING btree ("simulation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "metrics_recorded_at_idx" ON "metrics" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "simulations_status_idx" ON "simulations" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "simulations_topology_id_idx" ON "simulations" USING btree ("topology_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "snapshots_simulation_id_idx" ON "snapshots" USING btree ("simulation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "snapshots_captured_at_idx" ON "snapshots" USING btree ("captured_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "traces_trace_id_idx" ON "traces" USING btree ("trace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "traces_correlation_id_idx" ON "traces" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "traces_simulation_id_idx" ON "traces" USING btree ("simulation_id");