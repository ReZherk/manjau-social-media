package com.manjau.socialmedia.publication.repository;

import com.manjau.socialmedia.publication.entity.Publication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;
import java.util.List;

public interface PublicationRepository extends JpaRepository<Publication, UUID> {
    long countByStatusAndPublishedAtGreaterThanEqualAndPublishedAtLessThan(String status, Instant from, Instant to);

    // Published publications eligible for metrics (RF-C-02): only those at least
    // 7 days old (publishedAt <= :maxPublishedAt), with optional search/period/platform.
    @Query("SELECT DISTINCT p FROM Publication p JOIN FETCH p.targetAccounts a JOIN FETCH a.platform " +
           "WHERE p.status = 'PUBLISHED' " +
           "AND p.publishedAt <= :maxPublishedAt " +
           "AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (CAST(:from AS instant) IS NULL OR p.publishedAt >= :from) " +
           "AND (CAST(:to AS instant) IS NULL OR p.publishedAt <= :to) " +
           "AND (:platform IS NULL OR a.platform.code = :platform) ORDER BY p.publishedAt DESC")
    List<Publication> findPublishedForMetrics(@Param("search") String search,
                                               @Param("from") Instant from,
                                               @Param("to") Instant to,
                                               @Param("platform") String platform,
                                               @Param("maxPublishedAt") Instant maxPublishedAt);

    // Pending publications (RF-B-05): scheduled + drafts, filter by title and scheduled_at range.
    @Query("SELECT p FROM Publication p WHERE p.status IN ('SCHEDULED', 'DRAFT') " +
           "AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (CAST(:from AS instant) IS NULL OR p.scheduledAt >= :from) " +
           "AND (CAST(:to AS instant) IS NULL OR p.scheduledAt <= :to)")
    Page<Publication> findScheduled(@Param("search") String search,
                                    @Param("from") Instant from,
                                    @Param("to") Instant to,
                                    Pageable pageable);

    // History of published items (RF-B-08): filter by title and published_at range.
    @Query("SELECT p FROM Publication p WHERE p.status = 'PUBLISHED' " +
           "AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (CAST(:from AS instant) IS NULL OR p.publishedAt >= :from) " +
           "AND (CAST(:to AS instant) IS NULL OR p.publishedAt <= :to)")
    Page<Publication> findHistory(@Param("search") String search,
                                  @Param("from") Instant from,
                                  @Param("to") Instant to,
                                  Pageable pageable);
}
