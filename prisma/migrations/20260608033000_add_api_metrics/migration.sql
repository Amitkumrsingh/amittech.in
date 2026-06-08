-- CreateTable
CREATE TABLE "ApiMetric" (
    "id" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "environment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiMetric_createdAt_idx" ON "ApiMetric"("createdAt");

-- CreateIndex
CREATE INDEX "ApiMetric_route_method_createdAt_idx" ON "ApiMetric"("route", "method", "createdAt");

-- CreateIndex
CREATE INDEX "ApiMetric_statusCode_idx" ON "ApiMetric"("statusCode");

-- CreateIndex
CREATE INDEX "ApiMetric_ok_idx" ON "ApiMetric"("ok");
