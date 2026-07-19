package com.manjau.socialmedia.user.controller;

import com.manjau.socialmedia.security.config.CustomUserDetails;
import com.manjau.socialmedia.user.dto.*;
import com.manjau.socialmedia.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<UserPageResponse> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.findAll(search, role, status, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<UserResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public ResponseEntity<UserResponse> create(
            @Valid @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.create(request, userDetails.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<UserResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.update(id, request, userDetails.getId()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('USER_STATUS_UPDATE')")
    public ResponseEntity<UserResponse> changeStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.changeStatus(id, body.get("status"), userDetails.getId()));
    }

    @PostMapping("/{id}/reset-credentials")
    @PreAuthorize("hasAuthority('USER_RESET_CREDENTIALS')")
    public ResponseEntity<Void> resetCredentials(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.resetCredentials(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
