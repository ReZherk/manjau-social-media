package com.manjau.socialmedia.metric.controller;

import com.manjau.socialmedia.metric.dto.*;
import com.manjau.socialmedia.metric.service.MetricService;
import com.manjau.socialmedia.security.config.CustomUserDetails;
import com.manjau.socialmedia.shared.dto.PageResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;

@RestController @RequestMapping("/api/v1")
public class MetricController {
    private final MetricService service;
    public MetricController(MetricService service) { this.service = service; }

    @GetMapping("/metrics/publications") @PreAuthorize("hasAuthority('METRIC_VIEW')")
    public PageResponse<MetricPublicationResponse> list(@RequestParam(required=false) String search,
      @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) Instant from,
      @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) Instant to,
      @RequestParam(required=false) String status, @RequestParam(required=false) String platform,
      @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size) {
        return service.list(search, from, to, status, platform, page, size);
    }
    @PostMapping("/metrics") @PreAuthorize("hasAuthority('METRIC_CREATE')")
    public ResponseEntity<MetricPublicationResponse> create(@Valid @RequestBody MetricRequest request, @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(service.create(request, user.getId()));
    }
    @PutMapping("/metrics/{id}") @PreAuthorize("hasAuthority('METRIC_CREATE')")
    public ResponseEntity<MetricPublicationResponse> update(@PathVariable UUID id, @Valid @RequestBody MetricRequest request, @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(service.update(id, request, user.getId()));
    }
    @GetMapping("/analyst/dashboard") @PreAuthorize("hasAuthority('METRIC_VIEW')")
    public AnalystDashboardResponse dashboard() { return service.dashboard(); }
    @GetMapping("/reports/performance") @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ReportResponse report(@RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) Instant from,
       @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) Instant to,
       @RequestParam(required=false) List<String> platforms) { return service.report(from, to, platforms); }
}
