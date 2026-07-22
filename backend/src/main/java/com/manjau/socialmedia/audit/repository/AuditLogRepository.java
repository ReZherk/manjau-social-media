package com.manjau.socialmedia.audit.repository;

import com.manjau.socialmedia.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    long countByOccurredAtGreaterThanEqual(Instant from);
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:search IS NULL OR LOWER(a.actorName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(a.action) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:role IS NULL OR a.actorRole = :role) " +
           "AND (:action IS NULL OR a.action = :action) " +
           "AND (CAST(:from AS instant) IS NULL OR a.occurredAt >= :from) " +
           "AND (CAST(:to AS instant) IS NULL OR a.occurredAt <= :to)")
    Page<AuditLog> findByFilters(@Param("search") String search,
                                @Param("role") String role,
                                @Param("action") String action,
                                @Param("from") Instant from,
                                @Param("to") Instant to,
                                Pageable pageable);
}
