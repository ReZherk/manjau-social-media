package com.manjau.socialmedia.shared.audit;

import com.manjau.socialmedia.audit.entity.AuditLog;
import com.manjau.socialmedia.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    public void log(UUID actorUserId, String actorName, String actorRole, String action,
                    String entityType, String entityId, Object previousData, Object newData) {
        AuditLog log = new AuditLog();
        log.setActorUserId(actorUserId);
        log.setActorName(actorName);
        log.setActorRole(actorRole);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setPreviousData(toJson(previousData));
        log.setNewData(toJson(newData));
        log.setIpAddress(getClientIp());
        log.setUserAgent(getUserAgent());
        log.setOccurredAt(Instant.now());
        auditLogRepository.save(log);
    }

    public void log(String actorName, String actorRole, String action,
                    String entityType, String entityId) {
        log(null, actorName, actorRole, action, entityType, entityId, null, null);
    }

    private String toJson(Object data) {
        if (data == null) return null;
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    private String getClientIp() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isEmpty()) ip = request.getRemoteAddr();
            return ip;
        } catch (Exception e) {
            return null;
        }
    }

    private String getUserAgent() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            return request.getHeader("User-Agent");
        } catch (Exception e) {
            return null;
        }
    }
}
