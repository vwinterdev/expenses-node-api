CREATE TABLE "categories_to_wallets" (
	"category_id" integer NOT NULL,
	"wallet_id" integer NOT NULL,
	CONSTRAINT "categories_to_wallets_category_id_wallet_id_pk" PRIMARY KEY("category_id","wallet_id")
);
--> statement-breakpoint
CREATE TABLE "users_to_wallets" (
	"user_id" integer NOT NULL,
	"wallet_id" integer NOT NULL,
	CONSTRAINT "users_to_wallets_user_id_wallet_id_pk" PRIMARY KEY("user_id","wallet_id")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "checks" ADD COLUMN "category_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "checks" ADD COLUMN "wallet_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "categories_to_wallets" ADD CONSTRAINT "categories_to_wallets_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories_to_wallets" ADD CONSTRAINT "categories_to_wallets_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_wallets" ADD CONSTRAINT "users_to_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_wallets" ADD CONSTRAINT "users_to_wallets_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checks" ADD CONSTRAINT "checks_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checks" ADD CONSTRAINT "checks_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;