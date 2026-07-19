package com.manjau.socialmedia.user.service;

import com.manjau.socialmedia.auth.entity.PasswordSetupToken;
import com.manjau.socialmedia.auth.repository.PasswordSetupTokenRepository;
import com.manjau.socialmedia.notification.service.EmailService;
import com.manjau.socialmedia.role.entity.Role;
import com.manjau.socialmedia.role.repository.RoleRepository;
import com.manjau.socialmedia.shared.audit.AuditService;
import com.manjau.socialmedia.user.dto.*;
import com.manjau.socialmedia.user.entity.User;
import com.manjau.socialmedia.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
public class UserService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final EmailService emailService;
    private final PasswordSetupTokenRepository passwordSetupTokenRepository;
    private final String frontendUrl;

    public UserService(UserRepository userRepository,
                      RoleRepository roleRepository,
                      PasswordEncoder passwordEncoder,
                      AuditService auditService,
                      EmailService emailService,
                      PasswordSetupTokenRepository passwordSetupTokenRepository,
                      @Value("${frontend.url}") String frontendUrl) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.emailService = emailService;
        this.passwordSetupTokenRepository = passwordSetupTokenRepository;
        this.frontendUrl = frontendUrl;
    }

    public UserPageResponse findAll(String search, String role, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage = userRepository.findByFilters(search, role, status, pageable);
        UserPageResponse response = new UserPageResponse();
        response.setContent(userPage.getContent().stream().map(this::toResponse).toList());
        response.setPage(userPage.getNumber());
        response.setSize(userPage.getSize());
        response.setTotalElements(userPage.getTotalElements());
        response.setTotalPages(userPage.getTotalPages());
        response.setFirst(userPage.isFirst());
        response.setLast(userPage.isLast());
        return response;
    }

    public UserResponse findById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("USER_NOT_FOUND"));
        return toResponse(user);
    }

    @Transactional
    public UserResponse create(CreateUserRequest request, UUID actorId) {
        if (userRepository.existsByDni(request.getDni())) {
            throw new IllegalArgumentException("DNI_ALREADY_EXISTS");
        }
        if (userRepository.existsByInstitutionalEmail(request.getInstitutionalEmail())) {
            throw new IllegalArgumentException("EMAIL_ALREADY_EXISTS");
        }

        Role role = roleRepository.findByCode(request.getRoleCode())
                .orElseThrow(() -> new IllegalArgumentException("Rol no válido"));

        if (!"COMMUNITY_MANAGER".equals(request.getRoleCode()) && !"MARKETING_ANALYST".equals(request.getRoleCode())) {
            throw new IllegalArgumentException("Rol no permitido");
        }

        String tempPassword = generateTemporaryPassword();
        User user = new User();
        user.setDni(request.getDni());
        user.setFirstName(request.getFirstName());
        user.setPaternalSurname(request.getPaternalSurname());
        user.setMaternalSurname(request.getMaternalSurname());
        user.setInstitutionalEmail(request.getInstitutionalEmail().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        user.setStatus("ACTIVE");
        user.setMustChangePassword(true);
        user.setRole(role);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        user = userRepository.save(user);

        // Create setup token
        String rawToken = generateTemporaryPassword() + UUID.randomUUID().toString();
        PasswordSetupToken pst = new PasswordSetupToken();
        pst.setUserId(user.getId());
        pst.setTokenHash(passwordEncoder.encode(rawToken));
        pst.setExpiresAt(Instant.now().plus(48, ChronoUnit.HOURS));
        pst.setCreatedAt(Instant.now());
        passwordSetupTokenRepository.save(pst);

        User finalUser = user;
        UserResponse userResponse = toResponse(user);

        auditService.log(actorId, "Admin", "ADMINISTRATOR", "USER_CREATED", "User", user.getId().toString(), null, userResponse);

        String setupLink = frontendUrl + "/change-password?token=" + rawToken;
        try {
            emailService.sendCredentials(user.getFullName(), user.getInstitutionalEmail(), tempPassword, setupLink, pst.getExpiresAt());
        } catch (Exception e) {
            log.warn("No se pudo enviar el correo de credenciales a {}: {}", user.getInstitutionalEmail(), e.getMessage());
        }

        return userResponse;
    }

    @Transactional
    public UserResponse update(UUID id, UpdateUserRequest request, UUID actorId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("USER_NOT_FOUND"));

        User.UserData previousData = new User.UserData(user.getFirstName(), user.getPaternalSurname(),
                user.getMaternalSurname(), user.getInstitutionalEmail(), user.getRole().getCode());

        String oldRole = user.getRole().getCode();

        user.setFirstName(request.getFirstName());
        user.setPaternalSurname(request.getPaternalSurname());
        user.setMaternalSurname(request.getMaternalSurname());
        user.setInstitutionalEmail(request.getInstitutionalEmail().toLowerCase());

        Role role = roleRepository.findByCode(request.getRoleCode())
                .orElseThrow(() -> new IllegalArgumentException("Rol no válido"));
        user.setRole(role);
        user.setUpdatedAt(Instant.now());
        user = userRepository.save(user);

        User.UserData newData = new User.UserData(user.getFirstName(), user.getPaternalSurname(),
                user.getMaternalSurname(), user.getInstitutionalEmail(), user.getRole().getCode());

        auditService.log(actorId, "Admin", "ADMINISTRATOR", "USER_UPDATED", "User", user.getId().toString(), previousData, newData);

        if (!oldRole.equals(request.getRoleCode())) {
            auditService.log(actorId, "Admin", "ADMINISTRATOR", "USER_ROLE_CHANGED", "User",
                    user.getId().toString(), previousData, newData);
        }

        return toResponse(user);
    }

    @Transactional
    public UserResponse changeStatus(UUID id, String newStatus, UUID actorId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("USER_NOT_FOUND"));

        String oldStatus = user.getStatus();
        user.setStatus(newStatus);
        user.setUpdatedAt(Instant.now());
        user = userRepository.save(user);

        String action = "ACTIVE".equals(newStatus) ? "USER_ACTIVATED" : "USER_DEACTIVATED";
        auditService.log(actorId, "Admin", "ADMINISTRATOR", action, "User", user.getId().toString(), oldStatus, newStatus);

        return toResponse(user);
    }

    @Transactional
    public void resetCredentials(UUID id, UUID actorId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("USER_NOT_FOUND"));

        String tempPassword = generateTemporaryPassword();
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        user.setMustChangePassword(true);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        String rawToken = generateTemporaryPassword() + UUID.randomUUID().toString();
        PasswordSetupToken pst = new PasswordSetupToken();
        pst.setUserId(user.getId());
        pst.setTokenHash(passwordEncoder.encode(rawToken));
        pst.setExpiresAt(Instant.now().plus(48, ChronoUnit.HOURS));
        pst.setCreatedAt(Instant.now());
        passwordSetupTokenRepository.save(pst);

        auditService.log(actorId, "Admin", "ADMINISTRATOR", "USER_CREDENTIALS_RESET", "User", user.getId().toString(), null, null);

        String setupLink = frontendUrl + "/change-password?token=" + rawToken;
        try {
            emailService.sendCredentials(user.getFullName(), user.getInstitutionalEmail(), tempPassword, setupLink, pst.getExpiresAt());
        } catch (Exception e) {
            log.warn("No se pudo enviar el correo de credenciales a {}: {}", user.getInstitutionalEmail(), e.getMessage());
        }
    }

    private UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setDni(user.getDni());
        response.setFirstName(user.getFirstName());
        response.setPaternalSurname(user.getPaternalSurname());
        response.setMaternalSurname(user.getMaternalSurname());
        response.setFullName(user.getFullName());
        response.setInstitutionalEmail(user.getInstitutionalEmail());
        response.setInitials(user.getInitials());
        UserResponse.RoleInfo roleInfo = new UserResponse.RoleInfo();
        roleInfo.setCode(user.getRole().getCode());
        roleInfo.setName(user.getRole().getName());
        response.setRole(roleInfo);
        response.setStatus(user.getStatus());
        response.setLastAccessAt(user.getLastAccessAt());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }

    private String generateTemporaryPassword() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[12];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
