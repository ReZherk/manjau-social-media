package com.manjau.socialmedia.metric.repository;

import com.manjau.socialmedia.metric.entity.PublicationMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface PublicationMetricRepository extends JpaRepository<PublicationMetric, UUID> {
    Optional<PublicationMetric> findByPublicationIdAndSocialAccountId(UUID publicationId, UUID socialAccountId);
    List<PublicationMetric> findAllByPublicationIdIn(Collection<UUID> publicationIds);
    long countByUpdatedAtAfter(java.time.Instant from);
}
