CREATE TABLE "AiResponseCache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "action" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "contentType" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AiResponseCache_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiUsageCounter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AiUsageCounter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiResponseCache_userId_requestHash_key" ON "AiResponseCache"("userId", "requestHash");
CREATE INDEX "AiResponseCache_expiresAt_idx" ON "AiResponseCache"("expiresAt");
CREATE INDEX "AiResponseCache_userId_postId_action_idx" ON "AiResponseCache"("userId", "postId", "action");
CREATE UNIQUE INDEX "AiUsageCounter_userId_date_key" ON "AiUsageCounter"("userId", "date");

ALTER TABLE "AiResponseCache" ADD CONSTRAINT "AiResponseCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiResponseCache" ADD CONSTRAINT "AiResponseCache_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiUsageCounter" ADD CONSTRAINT "AiUsageCounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AiGenerationMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "postId" TEXT,
    "requestId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "cacheOutcome" TEXT NOT NULL,
    "timeToFirstOutputMs" INTEGER,
    "totalLatencyMs" INTEGER NOT NULL,
    "completionState" TEXT NOT NULL,
    "validationErrorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiGenerationMetric_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiGenerationMetric_createdAt_idx" ON "AiGenerationMetric"("createdAt");
CREATE INDEX "AiGenerationMetric_userId_createdAt_idx" ON "AiGenerationMetric"("userId", "createdAt");
CREATE INDEX "AiGenerationMetric_action_createdAt_idx" ON "AiGenerationMetric"("action", "createdAt");

ALTER TABLE "AiGenerationMetric" ADD CONSTRAINT "AiGenerationMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiGenerationMetric" ADD CONSTRAINT "AiGenerationMetric_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
