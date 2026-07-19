package com.manjau.socialmedia.publication.dto;

import jakarta.validation.constraints.NotBlank;

public record MediaRequest(
        @NotBlank(message = "La URL del archivo es obligatoria") String fileUrl,
        String mediaType
) {
}
