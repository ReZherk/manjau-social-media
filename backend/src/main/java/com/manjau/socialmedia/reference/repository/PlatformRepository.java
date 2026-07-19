package com.manjau.socialmedia.reference.repository;

import com.manjau.socialmedia.reference.entity.Platform;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PlatformRepository extends JpaRepository<Platform, UUID> {
    Optional<Platform> findByCode(String code);
}
