package com.manjau.socialmedia.user.repository;

import com.manjau.socialmedia.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByInstitutionalEmail(String email);
    Optional<User> findByDni(String dni);
    boolean existsByInstitutionalEmail(String email);
    boolean existsByDni(String dni);
    long countByStatus(String status);
    long countByRoleCode(String roleCode);

    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(u.paternalSurname) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(u.maternalSurname) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(u.institutionalEmail) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR u.dni LIKE CONCAT('%', CAST(:search AS string), '%')) " +
           "AND (:role IS NULL OR u.role.code = :role) " +
           "AND (:status IS NULL OR u.status = :status)")
    Page<User> findByFilters(@Param("search") String search,
                            @Param("role") String role,
                            @Param("status") String status,
                            Pageable pageable);
}
