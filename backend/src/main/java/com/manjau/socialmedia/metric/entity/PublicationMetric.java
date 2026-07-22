package com.manjau.socialmedia.metric.entity;

import com.manjau.socialmedia.publication.entity.Publication;
import com.manjau.socialmedia.socialaccount.entity.SocialAccount;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "publication_metrics", uniqueConstraints = @UniqueConstraint(columnNames = {"publication_id", "social_account_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PublicationMetric {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(optional = false) @JoinColumn(name = "publication_id")
    private Publication publication;
    @ManyToOne(optional = false) @JoinColumn(name = "social_account_id")
    private SocialAccount socialAccount;
    @Column(nullable = false) private long reactions;
    @Column(nullable = false) private long reach;
    @Column(nullable = false) private long saves;
    @Column(nullable = false) private long shares;
    @Column(nullable = false) private long comments;
    @Column(name = "recorded_by") private UUID recordedBy;
    @Column(nullable = false, updatable = false) private Instant createdAt;
    @Column(nullable = false) private Instant updatedAt;

    @PrePersist void onCreate() { createdAt = Instant.now(); updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }
}
