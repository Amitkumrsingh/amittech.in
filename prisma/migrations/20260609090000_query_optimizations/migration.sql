-- Post list filters/orderings used by public, owner, and admin dashboards.
CREATE INDEX "Post_deletedAt_status_publishedAt_createdAt_idx" ON "Post"("deletedAt", "status", "publishedAt", "createdAt");
CREATE INDEX "Post_authorId_deletedAt_status_createdAt_idx" ON "Post"("authorId", "deletedAt", "status", "createdAt");
CREATE INDEX "Post_deletedAt_isFeatured_publishedAt_createdAt_idx" ON "Post"("deletedAt", "isFeatured", "publishedAt", "createdAt");

-- Media library listing by owner and newest-first admin pages.
CREATE INDEX "Media_uploadedById_deletedAt_createdAt_idx" ON "Media"("uploadedById", "deletedAt", "createdAt");
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");

-- Monitoring dashboard window scans, endpoint percentiles, and slowest samples.
CREATE INDEX "ApiMetric_createdAt_latencyMs_idx" ON "ApiMetric"("createdAt", "latencyMs");
CREATE INDEX "ApiMetric_route_method_createdAt_latencyMs_idx" ON "ApiMetric"("route", "method", "createdAt", "latencyMs");
