package com.manjau.socialmedia.metric.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record MetricRequest(
        @NotNull UUID publicationId,
        @NotNull UUID socialAccountId,
        @Min(0) long reactions,
        @Min(0) long reach,
        @Min(0) long saves,
        @Min(0) long shares,
        @Min(0) long comments) {}
