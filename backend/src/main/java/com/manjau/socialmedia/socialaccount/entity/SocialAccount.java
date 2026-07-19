package com.manjau.socialmedia.socialaccount.entity;

import com.manjau.socialmedia.reference.entity.Platform;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "social_accounts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SocialAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "platform_id")
    private Platform platform;

    @Column(nullable = false, length = 150)
    private String accountName;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
