package com.manjau.socialmedia.publication.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PublicationResponse(
        UUID id,
        String title,
        String description,
        String additionalInfo,
        BigDecimal budget,
        String contentTypeCode,
        String contentTypeName,
        String status,
        Instant scheduledAt,
        Instant publishedAt,
        String evidenceLink,
        Instant createdAt,
        List<TargetAccount> targetAccounts,
        List<Media> media
) {
    public record TargetAccount(UUID id, String platformCode, String platformName, String accountName) {
    }

    public record Media(UUID id, String fileUrl, String mediaType) {
    }
}
