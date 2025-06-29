CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'admin', 'manager', 'user', 'guest');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('pending_confirmation', 'active', 'inactive', 'suspended', 'banned');--> statement-breakpoint
CREATE TABLE "token_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"jti" text NOT NULL,
	"token_type" varchar(50) NOT NULL,
	"is_revoked" boolean DEFAULT false,
	"user_agent" varchar(255),
	"ip_address" varchar(255),
	"location" jsonb,
	"revoked_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "verification_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"code" varchar(10) NOT NULL,
	"type" varchar(20) NOT NULL,
	"purpose" varchar(50) NOT NULL,
	"is_used" boolean DEFAULT false,
	"attempts" integer DEFAULT 0,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"verified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(255),
	"phone_country_code" varchar(5),
	"phone" varchar(20),
	"name" varchar(100),
	"avatar" text,
	"is_email_verified" boolean DEFAULT false,
	"is_phone_verified" boolean DEFAULT false,
	"hashed_password" varchar(255),
	"status" "user_status" DEFAULT 'active',
	"role" "user_role" DEFAULT 'user',
	"login_count" integer DEFAULT 0,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"wechat_open_id" varchar(255),
	"wechat_union_id" varchar(255),
	"preferences" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "token_records" ADD CONSTRAINT "token_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;