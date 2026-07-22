package com.manjau.socialmedia.metric.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MetricPublicationResponse(
        UUID publicationId, String title, String contentTypeName, BigDecimal budget,
        Instant publishedAt, UUID socialAccountId, String platformCode,
        String platformName, String accountName, String registrationStatus,
        UUID metricId, long reactions, long reach, long saves, long shares,
        long comments, Instant updatedAt) {}
