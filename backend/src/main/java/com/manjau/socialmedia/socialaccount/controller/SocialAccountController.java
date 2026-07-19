package com.manjau.socialmedia.socialaccount.controller;

import com.manjau.socialmedia.security.config.CustomUserDetails;
import com.manjau.socialmedia.shared.dto.PageResponse;
import com.manjau.socialmedia.socialaccount.dto.*;
import com.manjau.socialmedia.socialaccount.service.SocialAccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/social-accounts")
public class SocialAccountController {

    private final SocialAccountService socialAccountService;

    public SocialAccountController(SocialAccountService socialAccountService) {
        this.socialAccountService = socialAccountService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SOCIAL_ACCOUNT_VIEW')")
    public ResponseEntity<PageResponse<SocialAccountResponse>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(socialAccountService.findAll(search, platform, status, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SOCIAL_ACCOUNT_VIEW')")
    public ResponseEntity<SocialAccountResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(socialAccountService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SOCIAL_ACCOUNT_CREATE')")
    public ResponseEntity<SocialAccountResponse> create(
            @Valid @RequestBody CreateSocialAccountRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(socialAccountService.create(request, userDetails.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SOCIAL_ACCOUNT_UPDATE')")
    public ResponseEntity<SocialAccountResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSocialAccountRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(socialAccountService.update(id, request, userDetails.getId()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('SOCIAL_ACCOUNT_STATUS_UPDATE')")
    public ResponseEntity<SocialAccountResponse> changeStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(socialAccountService.changeStatus(id, body.get("status"), userDetails.getId()));
    }

    @GetMapping("/{id}/credentials")
    @PreAuthorize("hasAuthority('SOCIAL_ACCOUNT_CREDENTIAL_REVEAL')")
    public ResponseEntity<RevealCredentialResponse> reveal(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(socialAccountService.revealCredentials(id, userDetails.getId()));
    }
}
