package com.manjau.socialmedia.reference.repository;

import com.manjau.socialmedia.reference.entity.ContentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ContentTypeRepository extends JpaRepository<ContentType, UUID> {
    Optional<ContentType> findByCode(String code);
}
