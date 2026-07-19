package com.manjau.socialmedia.socialaccount.repository;

import com.manjau.socialmedia.socialaccount.entity.SocialAccountCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SocialAccountCredentialRepository extends JpaRepository<SocialAccountCredential, UUID> {
}
