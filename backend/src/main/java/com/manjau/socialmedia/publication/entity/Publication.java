package com.manjau.socialmedia.publication.entity;

import com.manjau.socialmedia.reference.entity.ContentType;
import com.manjau.socialmedia.socialaccount.entity.SocialAccount;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "publications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Publication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "additional_info", columnDefinition = "TEXT")
    private String additionalInfo;

    @Column(precision = 12, scale = 2)
    private BigDecimal budget;

    @ManyToOne(optional = false)
    @JoinColumn(name = "content_type_id")
    private ContentType contentType;

    @Column(nullable = false, length = 20)
    private String status = "SCHEDULED";

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "evidence_link", length = 500)
    private String evidenceLink;

    @Column(name = "created_by")
    private UUID createdBy;

    @ManyToMany
    @JoinTable(
            name = "publication_social_accounts",
            joinColumns = @JoinColumn(name = "publication_id"),
            inverseJoinColumns = @JoinColumn(name = "social_account_id")
    )
    @Builder.Default
    private Set<SocialAccount> targetAccounts = new LinkedHashSet<>();

    @OneToMany(mappedBy = "publication", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PublicationMedia> media = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public void addMedia(PublicationMedia item) {
        item.setPublication(this);
        this.media.add(item);
    }

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
