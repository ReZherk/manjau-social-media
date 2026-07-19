package com.manjau.socialmedia.socialaccount.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Public representation of a social account. Intentionally excludes any
 * credential data (never returned in general listings).
 */
public record SocialAccountResponse(
        UUID id,
        String platformCode,
        String platformName,
        String accountName,
        String status,
        Instant createdAt
) {
}
