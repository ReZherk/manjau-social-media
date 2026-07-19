package com.manjau.socialmedia.publication.controller;

import com.manjau.socialmedia.publication.dto.*;
import com.manjau.socialmedia.publication.service.PublicationService;
import com.manjau.socialmedia.security.config.CustomUserDetails;
import com.manjau.socialmedia.shared.dto.PageResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/publications")
public class PublicationController {

    private final PublicationService publicationService;

    public PublicationController(PublicationService publicationService) {
        this.publicationService = publicationService;
    }

    @GetMapping("/scheduled")
    @PreAuthorize("hasAuthority('PUBLICATION_VIEW')")
    public ResponseEntity<PageResponse<PublicationResponse>> scheduled(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(publicationService.findScheduled(search, from, to, page, size));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAuthority('PUBLICATION_HISTORY_VIEW')")
    public ResponseEntity<PageResponse<PublicationResponse>> history(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(publicationService.findHistory(search, from, to, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PUBLICATION_VIEW')")
    public ResponseEntity<PublicationResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(publicationService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PUBLICATION_CREATE')")
    public ResponseEntity<PublicationResponse> create(
            @Valid @RequestBody CreatePublicationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(publicationService.create(request, userDetails.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PUBLICATION_UPDATE')")
    public ResponseEntity<PublicationResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePublicationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(publicationService.update(id, request, userDetails.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PUBLICATION_DELETE')")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        publicationService.delete(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAuthority('PUBLICATION_MARK_AS_PUBLISHED')")
    public ResponseEntity<PublicationResponse> markAsPublished(
            @PathVariable UUID id,
            @Valid @RequestBody MarkPublishedRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(publicationService.markAsPublished(id, request, userDetails.getId()));
    }
}
