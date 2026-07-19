package com.manjau.socialmedia.publication.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class CreatePublicationRequest {

    @NotBlank(message = "El título es obligatorio")
    private String title;

    private String description;

    private String additionalInfo;

    @PositiveOrZero(message = "El presupuesto no puede ser negativo")
    private BigDecimal budget;

    @NotBlank(message = "El tipo de contenido es obligatorio")
    private String contentTypeCode;

    @NotNull(message = "La fecha y hora de programación son obligatorias")
    private Instant scheduledAt;

    @NotEmpty(message = "Debe seleccionar al menos una red social de destino")
    private List<UUID> socialAccountIds;

    @Valid
    private List<MediaRequest> media;

    /** When true the publication is saved as a draft instead of scheduled. */
    private boolean draft;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAdditionalInfo() { return additionalInfo; }
    public void setAdditionalInfo(String additionalInfo) { this.additionalInfo = additionalInfo; }
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    public String getContentTypeCode() { return contentTypeCode; }
    public void setContentTypeCode(String contentTypeCode) { this.contentTypeCode = contentTypeCode; }
    public Instant getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Instant scheduledAt) { this.scheduledAt = scheduledAt; }
    public List<UUID> getSocialAccountIds() { return socialAccountIds; }
    public void setSocialAccountIds(List<UUID> socialAccountIds) { this.socialAccountIds = socialAccountIds; }
    public List<MediaRequest> getMedia() { return media; }
    public void setMedia(List<MediaRequest> media) { this.media = media; }
    public boolean isDraft() { return draft; }
    public void setDraft(boolean draft) { this.draft = draft; }
}
