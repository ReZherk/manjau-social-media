package com.manjau.socialmedia.auth.repository;

import com.manjau.socialmedia.auth.entity.PasswordSetupToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordSetupTokenRepository extends JpaRepository<PasswordSetupToken, UUID> {
    Optional<PasswordSetupToken> findByTokenHash(String tokenHash);
    void deleteByUserId(UUID userId);
}
