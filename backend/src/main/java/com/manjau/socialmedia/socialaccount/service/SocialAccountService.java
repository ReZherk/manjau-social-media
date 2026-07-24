package com.manjau.socialmedia.socialaccount.service;

import com.manjau.socialmedia.reference.entity.Platform;
import com.manjau.socialmedia.reference.repository.PlatformRepository;
import com.manjau.socialmedia.shared.audit.AuditService;
import com.manjau.socialmedia.shared.crypto.CryptoService;
import com.manjau.socialmedia.shared.dto.PageResponse;
import com.manjau.socialmedia.socialaccount.dto.*;
import com.manjau.socialmedia.socialaccount.entity.SocialAccount;
import com.manjau.socialmedia.socialaccount.entity.SocialAccountCredential;
import com.manjau.socialmedia.socialaccount.repository.SocialAccountCredentialRepository;
import com.manjau.socialmedia.socialaccount.repository.SocialAccountRepository;
import com.manjau.socialmedia.user.entity.User;
import com.manjau.socialmedia.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SocialAccountService {

    private final SocialAccountRepository socialAccountRepository;
    private final SocialAccountCredentialRepository credentialRepository;
    private final PlatformRepository platformRepository;
    private final UserRepository userRepository;
    private final CryptoService cryptoService;
    private final AuditService auditService;

    public SocialAccountService(SocialAccountRepository socialAccountRepository,
                                SocialAccountCredentialRepository credentialRepository,
                                PlatformRepository platformRepository,
                                UserRepository userRepository,
                                CryptoService cryptoService,
                                AuditService auditService) {
        this.socialAccountRepository = socialAccountRepository;
        this.credentialRepository = credentialRepository;
        this.platformRepository = platformRepository;
        this.userRepository = userRepository;
        this.cryptoService = cryptoService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public PageResponse<SocialAccountResponse> findAll(String search, String platform, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<SocialAccount> result = socialAccountRepository.findByFilters(search, platform, status, pageable);
        return PageResponse.of(result, this::toResponse);
    }

    @Transactional(readOnly = true)
    public SocialAccountResponse findById(UUID id) {
        return toResponse(getAccount(id));
    }

    @Transactional
    public SocialAccountResponse create(CreateSocialAccountRequest request, UUID actorId) {
        Platform platform = platformRepository.findByCode(request.getPlatformCode())
                .orElseThrow(() -> new IllegalArgumentException("Plataforma no válida"));

        SocialAccount account = new SocialAccount();
        account.setPlatform(platform);
        account.setAccountName(request.getAccountName());
        account.setStatus("ACTIVE");
        account.setCreatedBy(actorId);
        account = socialAccountRepository.save(account);

        SocialAccountCredential credential = new SocialAccountCredential();
        credential.setSocialAccountId(account.getId());
        credential.setAccessUsernameEncrypted(cryptoService.encrypt(request.getAccessUsername()));
        credential.setAccessSecretEncrypted(cryptoService.encrypt(request.getAccessSecret()));
        credentialRepository.save(credential);

        SocialAccountResponse response = toResponse(account);
        audit(actorId, "SOCIAL_ACCOUNT_CREATED", account.getId(), null, response);
        return response;
    }

    @Transactional
    public SocialAccountResponse update(UUID id, UpdateSocialAccountRequest request, UUID actorId) {
        SocialAccount account = getAccount(id);
        SocialAccountResponse previous = toResponse(account);

        Platform platform = platformRepository.findByCode(request.getPlatformCode())
                .orElseThrow(() -> new IllegalArgumentException("Plataforma no válida"));
        account.setPlatform(platform);
        account.setAccountName(request.getAccountName());
        account = socialAccountRepository.save(account);

        if (request.getAccessUsername() != null && !request.getAccessUsername().isBlank()
                && request.getAccessSecret() != null && !request.getAccessSecret().isBlank()) {
            SocialAccountCredential credential = credentialRepository.findById(id)
                    .orElseGet(SocialAccountCredential::new);
            credential.setSocialAccountId(id);
            credential.setAccessUsernameEncrypted(cryptoService.encrypt(request.getAccessUsername()));
            credential.setAccessSecretEncrypted(cryptoService.encrypt(request.getAccessSecret()));
            credentialRepository.save(credential);
        }

        SocialAccountResponse response = toResponse(account);
        audit(actorId, "SOCIAL_ACCOUNT_UPDATED", account.getId(), previous, response);
        return response;
    }

    @Transactional
    public SocialAccountResponse changeStatus(UUID id, String status, UUID actorId) {
        if (!"ACTIVE".equals(status) && !"INACTIVE".equals(status)) {
            throw new IllegalArgumentException("Estado no válido");
        }
        SocialAccount account = getAccount(id);
        String previousStatus = account.getStatus();
        account.setStatus(status);
        account = socialAccountRepository.save(account);
        audit(actorId, "SOCIAL_ACCOUNT_STATUS_CHANGED", account.getId(), previousStatus, status);
        return toResponse(account);
    }

    @Transactional
    public RevealCredentialResponse revealCredentials(UUID id, UUID actorId) {
        getAccount(id); // ensure it exists
        SocialAccountCredential credential = credentialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La cuenta no tiene credenciales registradas"));
        String username = cryptoService.decrypt(credential.getAccessUsernameEncrypted());
        String secret = cryptoService.decrypt(credential.getAccessSecretEncrypted());

        // Audit only successful reveals and never store the credential values.
        audit(actorId, "SOCIAL_CREDENTIAL_REVEALED", id, null, null);
        return new RevealCredentialResponse(username, secret);
    }

    private SocialAccount getAccount(UUID id) {
        return socialAccountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta de red social no encontrada"));
    }

    private SocialAccountResponse toResponse(SocialAccount account) {
        return new SocialAccountResponse(
                account.getId(),
                account.getPlatform().getCode(),
                account.getPlatform().getName(),
                account.getAccountName(),
                account.getStatus(),
                account.getCreatedAt()
        );
    }

    private void audit(UUID actorId, String action, UUID entityId, Object previous, Object current) {
        User actor = userRepository.findById(actorId).orElse(null);
        String actorName = actor != null ? actor.getFullName() : "Sistema";
        String actorRole = actor != null ? actor.getRole().getCode() : "SYSTEM";
        auditService.log(actorId, actorName, actorRole, action, "SocialAccount", entityId.toString(), previous, current);
    }
}
