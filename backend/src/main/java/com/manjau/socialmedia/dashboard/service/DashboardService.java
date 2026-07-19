package com.manjau.socialmedia.dashboard.service;

import com.manjau.socialmedia.audit.repository.AuditLogRepository;
import com.manjau.socialmedia.dashboard.dto.DashboardSummaryResponse;
import com.manjau.socialmedia.dashboard.dto.RecentActivityResponse;
import com.manjau.socialmedia.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public DashboardService(UserRepository userRepository, AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public DashboardSummaryResponse getSummary() {
        DashboardSummaryResponse response = new DashboardSummaryResponse();

        response.setActiveUsers(userRepository.count());
        response.setConnectedSocialNetworks(3);
        response.setPublicationsThisMonth(48);
        response.setActivitiesToday(auditLogRepository.count());

        // Users by role
        List<DashboardSummaryResponse.UsersByRole> usersByRole = List.of(
                createUsersByRole("ADMINISTRATOR", "Administradores", 1),
                createUsersByRole("COMMUNITY_MANAGER", "Community Managers", 2),
                createUsersByRole("MARKETING_ANALYST", "Analistas de Marketing", 2)
        );
        response.setUsersByRole(usersByRole);

        // Platforms
        List<DashboardSummaryResponse.PlatformInfo> platforms = List.of(
                createPlatform("Instagram", true),
                createPlatform("Facebook", true),
                createPlatform("TikTok", true)
        );
        response.setPlatforms(platforms);

        // Period label
        LocalDate now = LocalDate.now();
        String periodLabel = now.format(DateTimeFormatter.ofPattern("MMMM yyyy", new Locale("es", "ES")));
        response.setPeriodLabel(periodLabel.substring(0, 1).toUpperCase() + periodLabel.substring(1));

        return response;
    }

    public List<RecentActivityResponse> getRecentActivities() {
        var auditLogs = auditLogRepository.findAll(
                org.springframework.data.domain.PageRequest.of(0, 10,
                        org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "occurredAt"))
        ).getContent();

        return auditLogs.stream().map(log -> {
            RecentActivityResponse r = new RecentActivityResponse();
            r.setActorName(log.getActorName());
            r.setActorInitials(getInitials(log.getActorName()));
            r.setAction(log.getAction());
            r.setDescription(log.getAction());
            r.setOccurredAt(log.getOccurredAt());
            return r;
        }).toList();
    }

    private DashboardSummaryResponse.UsersByRole createUsersByRole(String role, String label, long count) {
        DashboardSummaryResponse.UsersByRole u = new DashboardSummaryResponse.UsersByRole();
        u.setRole(role);
        u.setLabel(label);
        u.setCount(count);
        return u;
    }

    private DashboardSummaryResponse.PlatformInfo createPlatform(String name, boolean active) {
        DashboardSummaryResponse.PlatformInfo p = new DashboardSummaryResponse.PlatformInfo();
        p.setName(name);
        p.setActive(active);
        return p;
    }

    private String getInitials(String name) {
        if (name == null || name.isBlank()) return "?";
        String[] parts = name.split(" ");
        if (parts.length == 1) return parts[0].substring(0, 1).toUpperCase();
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }
}
