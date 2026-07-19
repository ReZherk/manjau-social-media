package com.manjau.socialmedia.reference.controller;

import com.manjau.socialmedia.reference.dto.ReferenceItemResponse;
import com.manjau.socialmedia.reference.repository.ContentTypeRepository;
import com.manjau.socialmedia.reference.repository.PlatformRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ReferenceController {

    private final PlatformRepository platformRepository;
    private final ContentTypeRepository contentTypeRepository;

    public ReferenceController(PlatformRepository platformRepository,
                               ContentTypeRepository contentTypeRepository) {
        this.platformRepository = platformRepository;
        this.contentTypeRepository = contentTypeRepository;
    }

    @GetMapping("/platforms")
    public ResponseEntity<List<ReferenceItemResponse>> platforms() {
        List<ReferenceItemResponse> items = platformRepository.findAll(Sort.by("name")).stream()
                .map(p -> new ReferenceItemResponse(p.getId(), p.getCode(), p.getName()))
                .toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/content-types")
    public ResponseEntity<List<ReferenceItemResponse>> contentTypes() {
        List<ReferenceItemResponse> items = contentTypeRepository.findAll(Sort.by("name")).stream()
                .map(c -> new ReferenceItemResponse(c.getId(), c.getCode(), c.getName()))
                .toList();
        return ResponseEntity.ok(items);
    }
}
