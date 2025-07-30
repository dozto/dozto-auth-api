CREATE TYPE "public"."auth_method" AS ENUM('username_password', 'email_link', 'email_totp', 'phone_totp', 'wechat_oauth');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('pending', 'active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TABLE "auth_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"auth_id" uuid,
	"method" "auth_method" NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"success" boolean NOT NULL,
	"failure_reason" varchar(255),
	"user_agent" varchar(500),
	"ip_address" varchar(45),
	"device_id" varchar(255),
	"location" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authentications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"method" "auth_method" NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"credential" text NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"expires_at" timestamp,
	"attempts" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 5,
	"locked_until" timestamp,
	"metadata" jsonb,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "token_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"auth_id" uuid,
	"auth_method" "auth_method" NOT NULL,
	"refresh_token" text,
	"is_revoked" boolean DEFAULT false,
	"is_expired" boolean DEFAULT false,
	"user_agent" varchar(500),
	"ip_address" varchar(45),
	"device_id" varchar(255),
	"device_type" varchar(50),
	"device_name" varchar(255),
	"location" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"refresh_token_expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "token_records_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE "totp_temp_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"temp_user_id" varchar(255) NOT NULL,
	"method" "auth_method" NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"credential" text NOT NULL,
	"attempts" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 5,
	"expires_at" timestamp NOT NULL,
	"verified_at" timestamp,
	"user_info" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "totp_temp_records_temp_user_id_unique" UNIQUE("temp_user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"first_name" varchar(50),
	"last_name" varchar(50),
	"avatar" text,
	"email" varchar(255),
	"phone" varchar(20),
	"status" "user_status" DEFAULT 'active',
	"role" "user_role" DEFAULT 'user',
	"preferences" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "auth_history" ADD CONSTRAINT "auth_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_history" ADD CONSTRAINT "auth_history_auth_id_authentications_id_fk" FOREIGN KEY ("auth_id") REFERENCES "public"."authentications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authentications" ADD CONSTRAINT "authentications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_records" ADD CONSTRAINT "token_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_records" ADD CONSTRAINT "token_records_auth_id_authentications_id_fk" FOREIGN KEY ("auth_id") REFERENCES "public"."authentications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_method_identifier_unique" ON "authentications" USING btree ("method","identifier");