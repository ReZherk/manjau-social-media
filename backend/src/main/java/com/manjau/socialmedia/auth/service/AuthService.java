package com.manjau.socialmedia.auth.service;

import com.manjau.socialmedia.auth.dto.*;
import com.manjau.socialmedia.auth.entity.PasswordSetupToken;
import com.manjau.socialmedia.auth.entity.RefreshToken;
import com.manjau.socialmedia.auth.repository.PasswordSetupTokenRepository;
import com.manjau.socialmedia.auth.repository.RefreshTokenRepository;
import com.manjau.socialmedia.security.jwt.JwtService;
import com.manjau.socialmedia.shared.audit.AuditService;
import com.manjau.socialmedia.user.entity.User;
import com.manjau.socialmedia.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordSetupTokenRepository passwordSetupTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final long accessExpirationMinutes;

    public AuthService(UserRepository userRepository,
                      RefreshTokenRepository refreshTokenRepository,
                      PasswordSetupTokenRepository passwordSetupTokenRepository,
                      JwtService jwtService,
                      PasswordEncoder passwordEncoder,
                      AuditService auditService,
                      @Value("${jwt.access-expiration-minutes}") long accessExpirationMinutes) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordSetupTokenRepository = passwordSetupTokenRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.accessExpirationMinutes = accessExpirationMinutes;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByInstitutionalEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales incorrectas"));

        if (!"ACTIVE".equals(user.getStatus())) {
            auditService.log(user.getId().toString(), user.getRole().getCode(), "LOGIN_FAILED", "User", user.getId().toString());
            throw new IllegalArgumentException("ACCOUNT_INACTIVE");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            auditService.log(user.getId().toString(), user.getRole().getCode(), "LOGIN_FAILED", "User", user.getId().toString());
            throw new IllegalArgumentException("Credenciales incorrectas");
        }

        user.setLastAccessAt(Instant.now());
        userRepository.save(user);

        List<String> permissions = user.getRole().getPermissions().stream()
                .map(p -> p.getCode())
                .toList();

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getInstitutionalEmail(), permissions);
        String refreshTokenStr = jwtService.generateRefreshToken(user.getId());

        RefreshToken rt = new RefreshToken();
        rt.setUserId(user.getId());
        rt.setTokenHash(passwordEncoder.encode(refreshTokenStr));
        rt.setExpiresAt(Instant.now().plus(jwtService.getRefreshExpirationDays(), ChronoUnit.DAYS));
        rt.setCreatedAt(Instant.now());
        refreshTokenRepository.save(rt);

        auditService.log(user.getId(), user.getFullName(), user.getRole().getCode(), "LOGIN_SUCCEEDED", "User", user.getId().toString(), null, null);

        LoginResponse.RoleInfo roleInfo = new LoginResponse.RoleInfo(user.getRole().getCode(), user.getRole().getName());
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                user.getId(), user.getFullName(), user.getInstitutionalEmail(),
                user.getInitials(), roleInfo, permissions, user.isMustChangePassword()
        );

        return new LoginResponse(accessToken, accessExpirationMinutes * 60, user.isMustChangePassword(), userInfo);
    }

    @Transactional
    public LoginResponse refresh(String refreshTokenStr) {
        var refreshTokens = refreshTokenRepository.findAll();
        RefreshToken storedToken = null;
        for (var rt : refreshTokens) {
            if (passwordEncoder.matches(refreshTokenStr, rt.getTokenHash())) {
                storedToken = rt;
                break;
            }
        }
        if (storedToken == null || storedToken.getRevokedAt() != null || storedToken.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Token inválido o expirado");
        }
        storedToken.setRevokedAt(Instant.now());
        refreshTokenRepository.save(storedToken);

        User user = userRepository.findById(storedToken.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        List<String> permissions = user.getRole().getPermissions().stream()
                .map(p -> p.getCode())
                .toList();

        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getInstitutionalEmail(), permissions);
        String newRefreshToken = jwtService.generateRefreshToken(user.getId());

        RefreshToken newRt = new RefreshToken();
        newRt.setUserId(user.getId());
        newRt.setTokenHash(passwordEncoder.encode(newRefreshToken));
        newRt.setExpiresAt(Instant.now().plus(jwtService.getRefreshExpirationDays(), ChronoUnit.DAYS));
        newRt.setCreatedAt(Instant.now());
        refreshTokenRepository.save(newRt);

        LoginResponse.RoleInfo roleInfo = new LoginResponse.RoleInfo(user.getRole().getCode(), user.getRole().getName());
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                user.getId(), user.getFullName(), user.getInstitutionalEmail(),
                user.getInitials(), roleInfo, permissions, user.isMustChangePassword()
        );
        return new LoginResponse(newAccessToken, accessExpirationMinutes * 60, user.isMustChangePassword(), userInfo);
    }

    @Transactional
    public void logout(String refreshTokenStr) {
        var refreshTokens = refreshTokenRepository.findAll();
        for (var rt : refreshTokens) {
            if (passwordEncoder.matches(refreshTokenStr, rt.getTokenHash())) {
                rt.setRevokedAt(Instant.now());
                refreshTokenRepository.save(rt);
                break;
            }
        }
    }

    @Transactional(readOnly = true)
    public LoginResponse.UserInfo me(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        List<String> permissions = user.getRole().getPermissions().stream()
                .map(p -> p.getCode())
                .toList();
        LoginResponse.RoleInfo roleInfo = new LoginResponse.RoleInfo(user.getRole().getCode(), user.getRole().getName());
        return new LoginResponse.UserInfo(
                user.getId(), user.getFullName(), user.getInstitutionalEmail(),
                user.getInitials(), roleInfo, permissions, user.isMustChangePassword()
        );
    }

    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("La contraseña actual no es correcta");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        userRepository.save(user);
        auditService.log(user.getId(), user.getFullName(), user.getRole().getCode(), "PASSWORD_CHANGED", "User", user.getId().toString(), null, null);
    }
}
