package com.manjau.socialmedia.audit.service;

import com.manjau.socialmedia.audit.dto.AuditLogResponse;
import com.manjau.socialmedia.audit.dto.AuditActionResponse;
import com.manjau.socialmedia.audit.entity.AuditLog;
import com.manjau.socialmedia.audit.repository.AuditLogRepository;
import com.manjau.socialmedia.shared.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private static final Map<String, String> ACTION_LABELS = Map.ofEntries(
            Map.entry("LOGIN_SUCCEEDED", "Inicio de sesión exitoso"),
            Map.entry("LOGIN_FAILED", "Inicio de sesión fallido"),
            Map.entry("LOGOUT", "Cierre de sesión"),
            Map.entry("PASSWORD_CHANGED", "Contraseña cambiada"),
            Map.entry("USER_CREATED", "Usuario creado"),
            Map.entry("USER_UPDATED", "Usuario actualizado"),
            Map.entry("USER_ACTIVATED", "Usuario activado"),
            Map.entry("USER_DEACTIVATED", "Usuario desactivado"),
            Map.entry("USER_ROLE_CHANGED", "Rol de usuario cambiado"),
            Map.entry("USER_CREDENTIALS_RESET", "Credenciales restablecidas"),
            Map.entry("SOCIAL_ACCOUNT_CREATED", "Cuenta social creada"),
            Map.entry("SOCIAL_ACCOUNT_UPDATED", "Cuenta social actualizada"),
            Map.entry("SOCIAL_ACCOUNT_STATUS_CHANGED", "Estado de cuenta social modificado"),
            Map.entry("SOCIAL_CREDENTIAL_REVEALED", "Credenciales de red social reveladas"),
            Map.entry("PUBLICATION_CREATED", "Publicación creada"),
            Map.entry("PUBLICATION_UPDATED", "Publicación actualizada"),
            Map.entry("PUBLICATION_DELETED", "Publicación eliminada"),
            Map.entry("PUBLICATION_MARKED_PUBLISHED", "Publicación marcada como realizada"),
            Map.entry("METRIC_CREATED", "Métricas registradas"),
            Map.entry("METRIC_UPDATED", "Métricas actualizadas")
    );

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public PageResponse<AuditLogResponse> findAll(
            String search, String role, String action, Instant from, Instant to,
            int page, int size) {
        if (page < 0) throw new IllegalArgumentException("El parámetro page debe ser un entero mayor o igual que 0");
        if (size < 1 || size > 100) throw new IllegalArgumentException("El parámetro size debe estar entre 1 y 100");
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "occurredAt"));
        Page<AuditLog> logs = auditLogRepository.findByFilters(search, role, action, from, to, pageable);
        return PageResponse.of(logs, this::toResponse);
    }

    public List<AuditActionResponse> findActions() {
        return auditLogRepository.findDistinctActions().stream()
                .map(code -> new AuditActionResponse(code, ACTION_LABELS.getOrDefault(code, humanize(code))))
                .toList();
    }

    private String humanize(String code) {
        if (code == null || code.isBlank()) return "Acción desconocida";
        String value = code.toLowerCase().replace('_', ' ');
        return Character.toUpperCase(value.charAt(0)) + value.substring(1);
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
