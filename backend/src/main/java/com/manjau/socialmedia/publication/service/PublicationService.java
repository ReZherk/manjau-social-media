package com.manjau.socialmedia.publication.service;

import com.manjau.socialmedia.publication.dto.*;
import com.manjau.socialmedia.publication.entity.Publication;
import com.manjau.socialmedia.publication.entity.PublicationMedia;
import com.manjau.socialmedia.publication.repository.PublicationRepository;
import com.manjau.socialmedia.reference.entity.ContentType;
import com.manjau.socialmedia.reference.repository.ContentTypeRepository;
import com.manjau.socialmedia.shared.audit.AuditService;
import com.manjau.socialmedia.shared.dto.PageResponse;
import com.manjau.socialmedia.socialaccount.entity.SocialAccount;
import com.manjau.socialmedia.socialaccount.repository.SocialAccountRepository;
import com.manjau.socialmedia.user.entity.User;
import com.manjau.socialmedia.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class PublicationService {

    private static final String STATUS_SCHEDULED = "SCHEDULED";
    private static final String STATUS_PUBLISHED = "PUBLISHED";
    private static final String STATUS_DRAFT = "DRAFT";

    private static boolean isEditable(String status) {
        return STATUS_SCHEDULED.equals(status) || STATUS_DRAFT.equals(status);
    }

    private final PublicationRepository publicationRepository;
    private final ContentTypeRepository contentTypeRepository;
    private final SocialAccountRepository socialAccountRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public PublicationService(PublicationRepository publicationRepository,
                              ContentTypeRepository contentTypeRepository,
                              SocialAccountRepository socialAccountRepository,
                              UserRepository userRepository,
                              AuditService auditService) {
        this.publicationRepository = publicationRepository;
        this.contentTypeRepository = contentTypeRepository;
        this.socialAccountRepository = socialAccountRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public PageResponse<PublicationResponse> findScheduled(String search, Instant from, Instant to, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "scheduledAt"));
        Page<Publication> result = publicationRepository.findScheduled(search, from, to, pageable);
        return PageResponse.of(result, this::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<PublicationResponse> findHistory(String search, Instant from, Instant to, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<Publication> result = publicationRepository.findHistory(search, from, to, pageable);
        return PageResponse.of(result, this::toResponse);
    }

    @Transactional(readOnly = true)
    public PublicationResponse findById(UUID id) {
        return toResponse(getPublication(id));
    }

    @Transactional
    public PublicationResponse create(CreatePublicationRequest request, UUID actorId) {
        ContentType contentType = contentTypeRepository.findByCode(request.getContentTypeCode())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de contenido no válido"));

        Publication publication = new Publication();
        publication.setTitle(request.getTitle());
        publication.setDescription(request.getDescription());
        publication.setAdditionalInfo(request.getAdditionalInfo());
        publication.setBudget(request.getBudget());
        publication.setContentType(contentType);
        publication.setScheduledAt(request.getScheduledAt());
        publication.setStatus(request.isDraft() ? STATUS_DRAFT : STATUS_SCHEDULED);
        publication.setCreatedBy(actorId);
        publication.setTargetAccounts(resolveAccounts(request.getSocialAccountIds()));
        applyMedia(publication, request.getMedia());

        publication = publicationRepository.save(publication);

        PublicationResponse response = toResponse(publication);
        audit(actorId, "PUBLICATION_CREATED", publication.getId(), null, response);
        return response;
    }

    @Transactional
    public PublicationResponse update(UUID id, UpdatePublicationRequest request, UUID actorId) {
        Publication publication = getPublication(id);
        if (!isEditable(publication.getStatus())) {
            throw new IllegalArgumentException("Solo se pueden editar publicaciones programadas no ejecutadas");
        }
        PublicationResponse previous = toResponse(publication);

        ContentType contentType = contentTypeRepository.findByCode(request.getContentTypeCode())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de contenido no válido"));

        publication.setTitle(request.getTitle());
        publication.setDescription(request.getDescription());
        publication.setAdditionalInfo(request.getAdditionalInfo());
        publication.setBudget(request.getBudget());
        publication.setContentType(contentType);
        publication.setScheduledAt(request.getScheduledAt());
        publication.setTargetAccounts(resolveAccounts(request.getSocialAccountIds()));

        publication.getMedia().clear();
        applyMedia(publication, request.getMedia());

        publication = publicationRepository.save(publication);

        PublicationResponse response = toResponse(publication);
        audit(actorId, "PUBLICATION_UPDATED", publication.getId(), previous, response);
        return response;
    }

    @Transactional
    public void delete(UUID id, UUID actorId) {
        Publication publication = getPublication(id);
        if (!isEditable(publication.getStatus())) {
            throw new IllegalArgumentException("Solo se pueden eliminar publicaciones que aún no han sido ejecutadas");
        }
        publicationRepository.delete(publication);
        audit(actorId, "PUBLICATION_DELETED", id, null, null);
    }

    @Transactional
    public PublicationResponse markAsPublished(UUID id, MarkPublishedRequest request, UUID actorId) {
        Publication publication = getPublication(id);
        if (!isEditable(publication.getStatus())) {
            throw new IllegalArgumentException("La publicación ya fue ejecutada o cancelada");
        }
        publication.setStatus(STATUS_PUBLISHED);
        publication.setPublishedAt(Instant.now());
        publication.setEvidenceLink(request.getEvidenceLink());
        publication = publicationRepository.save(publication);

        PublicationResponse response = toResponse(publication);
        audit(actorId, "PUBLICATION_MARKED_PUBLISHED", publication.getId(), null, response);
        return response;
    }

    private Set<SocialAccount> resolveAccounts(List<UUID> ids) {
        List<SocialAccount> accounts = socialAccountRepository.findAllById(ids);
        if (accounts.size() != ids.stream().distinct().count()) {
            throw new IllegalArgumentException("Una o más redes sociales de destino no existen");
        }
        return new LinkedHashSet<>(accounts);
    }

    private void applyMedia(Publication publication, List<MediaRequest> mediaRequests) {
        if (mediaRequests == null) {
            return;
        }
        for (MediaRequest item : mediaRequests) {
            PublicationMedia media = new PublicationMedia();
            media.setFileUrl(item.fileUrl());
            media.setMediaType(item.mediaType());
            publication.addMedia(media);
        }
    }

    private Publication getPublication(UUID id) {
        return publicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Publicación no encontrada"));
    }

    private PublicationResponse toResponse(Publication p) {
        List<PublicationResponse.TargetAccount> accounts = p.getTargetAccounts().stream()
                .map(a -> new PublicationResponse.TargetAccount(
                        a.getId(), a.getPlatform().getCode(), a.getPlatform().getName(), a.getAccountName()))
                .toList();
        List<PublicationResponse.Media> media = p.getMedia().stream()
                .map(m -> new PublicationResponse.Media(m.getId(), m.getFileUrl(), m.getMediaType()))
                .toList();
        return new PublicationResponse(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                p.getAdditionalInfo(),
                p.getBudget(),
                p.getContentType().getCode(),
                p.getContentType().getName(),
                p.getStatus(),
                p.getScheduledAt(),
                p.getPublishedAt(),
                p.getEvidenceLink(),
                p.getCreatedAt(),
                accounts,
                media
        );
    }

    private void audit(UUID actorId, String action, UUID entityId, Object previous, Object current) {
        User actor = userRepository.findById(actorId).orElse(null);
        String actorName = actor != null ? actor.getFullName() : "Sistema";
        String actorRole = actor != null ? actor.getRole().getCode() : "SYSTEM";
        auditService.log(actorId, actorName, actorRole, action, "Publication", entityId.toString(), previous, current);
    }
}
