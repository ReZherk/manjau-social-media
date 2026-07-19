package com.manjau.socialmedia.socialaccount.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Sensitive access credentials for a social account. Kept in a separate
 * 1:1 table so they are never loaded by general account listings, and
 * stored encrypted at rest ({@code *_encrypted} columns).
 */
@Entity
@Table(name = "social_account_credentials")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SocialAccountCredential {

    @Id
    @Column(name = "social_account_id")
    private UUID socialAccountId;

    @Column(name = "access_username_encrypted", nullable = false, columnDefinition = "TEXT")
    private String accessUsernameEncrypted;

    @Column(name = "access_secret_encrypted", nullable = false, columnDefinition = "TEXT")
    private String accessSecretEncrypted;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = Instant.now();
    }
}
