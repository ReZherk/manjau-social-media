package com.manjau.socialmedia.metric.service;

import com.manjau.socialmedia.metric.dto.*;
import com.manjau.socialmedia.metric.entity.PublicationMetric;
import com.manjau.socialmedia.metric.repository.PublicationMetricRepository;
import com.manjau.socialmedia.publication.entity.Publication;
import com.manjau.socialmedia.publication.repository.PublicationRepository;
import com.manjau.socialmedia.shared.audit.AuditService;
import com.manjau.socialmedia.shared.dto.PageResponse;
import com.manjau.socialmedia.socialaccount.entity.SocialAccount;
import com.manjau.socialmedia.socialaccount.repository.SocialAccountRepository;
import com.manjau.socialmedia.user.entity.User;
import com.manjau.socialmedia.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MetricService {
    /** RF-C-02: only publications at least this many days old are eligible for metrics. */
    private static final int METRICS_MIN_AGE_DAYS = 7;

    private final PublicationRepository publications;
    private final SocialAccountRepository accounts;
    private final PublicationMetricRepository metrics;
    private final UserRepository users;
    private final AuditService audit;

    public MetricService(PublicationRepository publications, SocialAccountRepository accounts,
                         PublicationMetricRepository metrics, UserRepository users, AuditService audit) {
        this.publications = publications; this.accounts = accounts; this.metrics = metrics;
        this.users = users; this.audit = audit;
    }

    @Transactional(readOnly = true)
    public PageResponse<MetricPublicationResponse> list(String search, Instant from, Instant to,
                                                         String status, String platform, int page, int size) {
        String cleanSearch = blankToNull(search);
        String cleanPlatform = blankToNull(platform);
        List<Publication> source = publications.findPublishedForMetrics(cleanSearch, from, to, cleanPlatform, metricsCutoff());
        Map<String, PublicationMetric> byTarget = metrics.findAllByPublicationIdIn(source.stream().map(Publication::getId).toList())
                .stream().collect(Collectors.toMap(m -> key(m.getPublication().getId(), m.getSocialAccount().getId()), m -> m));
        List<MetricPublicationResponse> rows = source.stream().flatMap(p -> p.getTargetAccounts().stream()
                .filter(a -> cleanPlatform == null || cleanPlatform.equals(a.getPlatform().getCode()))
                .map(a -> response(p, a, byTarget.get(key(p.getId(), a.getId())))))
                .filter(r -> status == null || status.isBlank() || status.equalsIgnoreCase(r.registrationStatus()))
                .toList();
        int safeSize = Math.max(1, Math.min(size, 100));
        int safePage = Math.max(0, page);
        int fromIndex = Math.min(safePage * safeSize, rows.size());
        int toIndex = Math.min(fromIndex + safeSize, rows.size());
        PageResponse<MetricPublicationResponse> result = new PageResponse<>();
        result.setContent(rows.subList(fromIndex, toIndex)); result.setPage(safePage); result.setSize(safeSize);
        result.setTotalElements(rows.size()); result.setTotalPages((int) Math.ceil(rows.size() / (double) safeSize));
        result.setFirst(safePage == 0); result.setLast(toIndex >= rows.size());
        return result;
    }

    @Transactional
    public MetricPublicationResponse create(MetricRequest request, UUID actorId) {
        if (metrics.findByPublicationIdAndSocialAccountId(request.publicationId(), request.socialAccountId()).isPresent())
            throw new IllegalArgumentException("Las métricas de esta publicación y plataforma ya fueron registradas");
        Publication p = published(request.publicationId());
        SocialAccount a = targetAccount(p, request.socialAccountId());
        PublicationMetric metric = apply(new PublicationMetric(), request, p, a, actorId);
        metric = metrics.save(metric); log(actorId, "METRIC_CREATED", metric.getId());
        return response(p, a, metric);
    }

    @Transactional
    public MetricPublicationResponse update(UUID id, MetricRequest request, UUID actorId) {
        PublicationMetric metric = metrics.findById(id).orElseThrow(() -> new IllegalArgumentException("Métricas no encontradas"));
        if (!metric.getPublication().getId().equals(request.publicationId()) || !metric.getSocialAccount().getId().equals(request.socialAccountId()))
            throw new IllegalArgumentException("No se puede cambiar la publicación o plataforma de un registro");
        apply(metric, request, metric.getPublication(), metric.getSocialAccount(), actorId);
        metric = metrics.save(metric); log(actorId, "METRIC_UPDATED", metric.getId());
        return response(metric.getPublication(), metric.getSocialAccount(), metric);
    }

    @Transactional(readOnly = true)
    public AnalystDashboardResponse dashboard() {
        List<Publication> published = publications.findPublishedForMetrics(null, null, null, null, metricsCutoff());
        long targets = published.stream().mapToLong(p -> p.getTargetAccounts().size()).sum();
        long registered = metrics.count();
        return new AnalystDashboardResponse(accounts.count(), targets, registered, Math.max(0, targets - registered));
    }

    @Transactional(readOnly = true)
    public ReportResponse report(Instant from, Instant to, List<String> platformCodes) {
        List<Publication> pubs = publications.findPublishedForMetrics(null, from, to, null, metricsCutoff());
        Set<String> selected = platformCodes == null ? Set.of() : platformCodes.stream().filter(Objects::nonNull).collect(Collectors.toSet());
        List<PublicationMetric> data = metrics.findAllByPublicationIdIn(pubs.stream().map(Publication::getId).toList()).stream()
                .filter(m -> selected.isEmpty() || selected.contains(m.getSocialAccount().getPlatform().getCode())).toList();

        Map<String, List<PublicationMetric>> byPlatform = data.stream()
                .collect(Collectors.groupingBy(m -> m.getSocialAccount().getPlatform().getCode(), LinkedHashMap::new, Collectors.toList()));
        List<ReportResponse.PlatformSummary> summaries = byPlatform.entrySet().stream().map(e -> {
            List<PublicationMetric> ms = e.getValue();
            Kpi k = kpi(ms);
            List<ReportResponse.ContentTypeBreakdown> contentTypes = ms.stream()
                    .collect(Collectors.groupingBy(m -> m.getPublication().getContentType().getName(), LinkedHashMap::new, Collectors.toList()))
                    .entrySet().stream().map(c -> new ReportResponse.ContentTypeBreakdown(c.getKey(),
                            c.getValue().stream().map(m -> m.getPublication().getId()).distinct().count(),
                            sum(c.getValue(), "reactions"), sum(c.getValue(), "reach"), sum(c.getValue(), "saves"),
                            sum(c.getValue(), "shares"), sum(c.getValue(), "comments")))
                    .toList();
            return new ReportResponse.PlatformSummary(e.getKey(), ms.get(0).getSocialAccount().getPlatform().getName(),
                    k.publications, k.reactions, k.reach, k.saves, k.shares, k.comments,
                    k.budget, k.engagementRate, k.avgReach, k.costPerInteraction, contentTypes);
        }).toList();

        Kpi total = kpi(data);
        return new ReportResponse(from, to, total.publications, data.size(),
                total.reactions, total.reach, total.saves, total.shares, total.comments,
                total.budget, total.engagementRate, total.avgReach, total.costPerInteraction, summaries);
    }

    /** Aggregated metrics + KPIs (RF-C-04) for a set of metric records. */
    private record Kpi(long publications, long reactions, long reach, long saves, long shares, long comments,
                       BigDecimal budget, double engagementRate, double avgReach, BigDecimal costPerInteraction) {}

    private Kpi kpi(List<PublicationMetric> ms) {
        long reactions = sum(ms, "reactions"), reach = sum(ms, "reach"), saves = sum(ms, "saves"),
             shares = sum(ms, "shares"), comments = sum(ms, "comments");
        long interactions = reactions + comments + shares + saves;
        // Distinct publications (a publication's budget is counted once per group).
        Map<UUID, Publication> distinctPubs = ms.stream()
                .collect(Collectors.toMap(m -> m.getPublication().getId(), PublicationMetric::getPublication, (a, b) -> a, LinkedHashMap::new));
        long publications = distinctPubs.size();
        BigDecimal budget = distinctPubs.values().stream()
                .map(p -> p.getBudget() == null ? BigDecimal.ZERO : p.getBudget())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        double engagementRate = reach > 0 ? round2(interactions * 100.0 / reach) : 0.0;
        double avgReach = publications > 0 ? round2((double) reach / publications) : 0.0;
        BigDecimal costPerInteraction = interactions > 0
                ? budget.divide(BigDecimal.valueOf(interactions), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        return new Kpi(publications, reactions, reach, saves, shares, comments, budget, engagementRate, avgReach, costPerInteraction);
    }

    private double round2(double v) { return Math.round(v * 100.0) / 100.0; }
    private Instant metricsCutoff() { return Instant.now().minus(METRICS_MIN_AGE_DAYS, ChronoUnit.DAYS); }

    private long sum(List<PublicationMetric> ms, String field) { return ms.stream().mapToLong(m -> switch(field) {
        case "reactions" -> m.getReactions(); case "reach" -> m.getReach(); case "saves" -> m.getSaves();
        case "shares" -> m.getShares(); default -> m.getComments(); }).sum(); }
    private PublicationMetric apply(PublicationMetric m, MetricRequest r, Publication p, SocialAccount a, UUID actor) {
        m.setPublication(p); m.setSocialAccount(a); m.setReactions(r.reactions()); m.setReach(r.reach());
        m.setSaves(r.saves()); m.setShares(r.shares()); m.setComments(r.comments()); m.setRecordedBy(actor); return m;
    }
    private Publication published(UUID id) { Publication p = publications.findById(id).orElseThrow(() -> new IllegalArgumentException("Publicación no encontrada"));
        if (!"PUBLISHED".equals(p.getStatus())) throw new IllegalArgumentException("Solo se registran métricas de publicaciones realizadas"); return p; }
    private SocialAccount targetAccount(Publication p, UUID id) { return p.getTargetAccounts().stream().filter(a -> a.getId().equals(id)).findFirst()
            .orElseThrow(() -> new IllegalArgumentException("La plataforma no pertenece a esta publicación")); }
    private MetricPublicationResponse response(Publication p, SocialAccount a, PublicationMetric m) { return new MetricPublicationResponse(
            p.getId(), p.getTitle(), p.getContentType().getName(), p.getBudget(), p.getPublishedAt(), a.getId(), a.getPlatform().getCode(),
            a.getPlatform().getName(), a.getAccountName(), m == null ? "PENDING" : "REGISTERED", m == null ? null : m.getId(),
            m == null ? 0 : m.getReactions(), m == null ? 0 : m.getReach(), m == null ? 0 : m.getSaves(),
            m == null ? 0 : m.getShares(), m == null ? 0 : m.getComments(), m == null ? null : m.getUpdatedAt()); }
    private String key(UUID p, UUID a) { return p + ":" + a; }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private void log(UUID actorId, String action, UUID id) { User u = users.findById(actorId).orElse(null); audit.log(actorId,
            u == null ? "Sistema" : u.getFullName(), u == null ? "SYSTEM" : u.getRole().getCode(), action, "PublicationMetric", id.toString(), null, null); }
}
