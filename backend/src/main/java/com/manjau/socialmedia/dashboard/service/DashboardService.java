package com.manjau.socialmedia.dashboard.service;

import com.manjau.socialmedia.audit.repository.AuditLogRepository;
import com.manjau.socialmedia.dashboard.dto.DashboardSummaryResponse;
import com.manjau.socialmedia.dashboard.dto.RecentActivityResponse;
import com.manjau.socialmedia.user.repository.UserRepository;
import com.manjau.socialmedia.publication.repository.PublicationRepository;
import com.manjau.socialmedia.reference.repository.PlatformRepository;
import com.manjau.socialmedia.role.repository.RoleRepository;
import com.manjau.socialmedia.socialaccount.repository.SocialAccountRepository;
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
    private final PublicationRepository publicationRepository;
    private final SocialAccountRepository socialAccountRepository;
    private final RoleRepository roleRepository;
    private final PlatformRepository platformRepository;

    public DashboardService(UserRepository userRepository, AuditLogRepository auditLogRepository,
                            PublicationRepository publicationRepository, SocialAccountRepository socialAccountRepository,
                            RoleRepository roleRepository, PlatformRepository platformRepository) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.publicationRepository = publicationRepository;
        this.socialAccountRepository = socialAccountRepository;
        this.roleRepository = roleRepository;
        this.platformRepository = platformRepository;
    }

    public DashboardSummaryResponse getSummary() {
        DashboardSummaryResponse response = new DashboardSummaryResponse();

        ZoneId zone = ZoneId.of("America/Lima");
        LocalDate today = LocalDate.now(zone);
        Instant todayStart = today.atStartOfDay(zone).toInstant();
        Instant monthStart = today.withDayOfMonth(1).atStartOfDay(zone).toInstant();
        Instant nextMonthStart = today.plusMonths(1).withDayOfMonth(1).atStartOfDay(zone).toInstant();

        response.setActiveUsers(userRepository.countByStatus("ACTIVE"));
        response.setConnectedSocialNetworks(socialAccountRepository.countByStatus("ACTIVE"));
        response.setPublicationsThisMonth(publicationRepository.countByStatusAndPublishedAtGreaterThanEqualAndPublishedAtLessThan(
                "PUBLISHED", monthStart, nextMonthStart));
        response.setActivitiesToday(auditLogRepository.countByOccurredAtGreaterThanEqual(todayStart));

        // Users by role
        List<DashboardSummaryResponse.UsersByRole> usersByRole = roleRepository.findAll().stream()
                .map(role -> createUsersByRole(role.getCode(), role.getName(), userRepository.countByRoleCode(role.getCode())))
                .toList();
        response.setUsersByRole(usersByRole);

        // Platforms
        List<DashboardSummaryResponse.PlatformInfo> platforms = platformRepository.findAll().stream()
                .map(platform -> createPlatform(platform.getName(),
                        socialAccountRepository.existsByPlatformIdAndStatus(platform.getId(), "ACTIVE")))
                .toList();
        response.setPlatforms(platforms);

        // Period label
        LocalDate now = today;
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
