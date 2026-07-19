package com.manjau.socialmedia.publication.dto;

import jakarta.validation.constraints.NotBlank;

public class MarkPublishedRequest {

    @NotBlank(message = "El enlace de evidencia es obligatorio")
    private String evidenceLink;

    public String getEvidenceLink() { return evidenceLink; }
    public void setEvidenceLink(String evidenceLink) { this.evidenceLink = evidenceLink; }
}
