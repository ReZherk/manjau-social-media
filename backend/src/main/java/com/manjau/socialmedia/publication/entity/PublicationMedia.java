package com.manjau.socialmedia.publication.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "publication_media")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PublicationMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "publication_id")
    private Publication publication;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "media_type", length = 50)
    private String mediaType;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
