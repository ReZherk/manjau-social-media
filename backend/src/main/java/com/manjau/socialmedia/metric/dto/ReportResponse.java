package com.manjau.socialmedia.metric.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Performance report (RF-C-05/06/07). Includes the accumulated metrics AND the
 * calculated KPIs (engagement rate, average reach, cost per interaction) both at
 * the overall level and per platform, plus a per-platform breakdown by content type.
 */
public record ReportResponse(
        Instant from, Instant to,
        long publications, long registeredMetrics,
        long reactions, long reach, long saves, long shares, long comments,
        BigDecimal budget,
        double engagementRate,
        double avgReach,
        BigDecimal costPerInteraction,
        List<PlatformSummary> platforms) {

    public record PlatformSummary(
            String code, String name, long publications,
            long reactions, long reach, long saves, long shares, long comments,
            BigDecimal budget,
            double engagementRate,
            double avgReach,
            BigDecimal costPerInteraction,
            List<ContentTypeBreakdown> contentTypes) {}

    public record ContentTypeBreakdown(
            String contentType, long publications,
            long reactions, long reach, long saves, long shares, long comments) {}
}
