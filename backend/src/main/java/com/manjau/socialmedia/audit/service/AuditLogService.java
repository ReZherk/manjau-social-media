package com.manjau.socialmedia.audit.service;

import com.manjau.socialmedia.audit.dto.AuditLogResponse;
import com.manjau.socialmedia.audit.entity.AuditLog;
import com.manjau.socialmedia.audit.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private static final Map<String, String> ACTION_LABELS = new HashMap<>();

    static {
        ACTION_LABELS.put("LOGIN_SUCCEEDED", "Inicio de sesión exitoso");
        ACTION_LABELS.put("LOGIN_FAILED", "Inicio de sesión fallido");
        ACTION_LABELS.put("LOGOUT", "Cierre de sesión");
        ACTION_LABELS.put("PASSWORD_CHANGED", "Contraseña cambiada");
        ACTION_LABELS.put("USER_CREATED", "Usuario creado");
        ACTION_LABELS.put("USER_UPDATED", "Usuario actualizado");
        ACTION_LABELS.put("USER_ACTIVATED", "Usuario activado");
        ACTION_LABELS.put("USER_DEACTIVATED", "Usuario desactivado");
        ACTION_LABELS.put("USER_ROLE_CHANGED", "Rol de usuario cambiado");
        ACTION_LABELS.put("USER_CREDENTIALS_RESET", "Credenciales restablecidas");
        ACTION_LABELS.put("SOCIAL_CREDENTIAL_REVEALED", "Credenciales de red social reveladas");
    }

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public org.springframework.data.domain.Page<AuditLogResponse> findAll(
            String search, String role, String action, Instant from, Instant to,
            int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "occurredAt"));
        Page<AuditLog> logs = auditLogRepository.findByFilters(search, role, action, from, to, pageable);
        return logs.map(this::toResponse);
    }

    private AuditLogResponse toResponse(AuditLog log) {
        AuditLogResponse r = new AuditLogResponse();
        r.setId(log.getId());
        r.setActorUserId(log.getActorUserId());
        r.setActorName(log.getActorName());
        r.setActorRole(log.getActorRole());
        r.setAction(log.getAction());
        r.setActionLabel(ACTION_LABELS.getOrDefault(log.getAction(), log.getAction()));
        r.setEntityType(log.getEntityType());
        r.setEntityId(log.getEntityId());
        r.setPreviousData(log.getPreviousData());
        r.setNewData(log.getNewData());
        r.setIpAddress(log.getIpAddress());
        r.setUserAgent(log.getUserAgent());
        r.setOccurredAt(log.getOccurredAt());
        return r;
    }
}
