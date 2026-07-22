package com.manjau.socialmedia.socialaccount.repository;

import com.manjau.socialmedia.socialaccount.entity.SocialAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface SocialAccountRepository extends JpaRepository<SocialAccount, UUID> {
    long countByStatus(String status);
    boolean existsByPlatformIdAndStatus(UUID platformId, String status);

    @Query("SELECT sa FROM SocialAccount sa WHERE " +
           "(:search IS NULL OR LOWER(sa.accountName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:platform IS NULL OR sa.platform.code = :platform) " +
           "AND (:status IS NULL OR sa.status = :status)")
    Page<SocialAccount> findByFilters(@Param("search") String search,
                                      @Param("platform") String platform,
                                      @Param("status") String status,
                                      Pageable pageable);
}
