-- CreateTable AnalyticsEvent
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable QueryLog
CREATE TABLE "query_logs" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "contract_type" TEXT NOT NULL,
    "risk_score" INTEGER NOT NULL,
    "analysis_time" INTEGER NOT NULL,
    "red_flag_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "query_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable Subscription
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "tier" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "queries_used" INTEGER NOT NULL DEFAULT 0,
    "queries_limit" INTEGER NOT NULL,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "last_reset_at" TIMESTAMP(3),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_events_user_id_idx" ON "analytics_events"("user_id");

-- CreateIndex
CREATE INDEX "analytics_events_event_type_idx" ON "analytics_events"("event_type");

-- CreateIndex
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events"("created_at");

-- CreateIndex
CREATE INDEX "query_logs_user_id_idx" ON "query_logs"("user_id");

-- CreateIndex
CREATE INDEX "query_logs_contract_type_idx" ON "query_logs"("contract_type");

-- CreateIndex
CREATE INDEX "query_logs_created_at_idx" ON "query_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_tier_idx" ON "subscriptions"("tier");
