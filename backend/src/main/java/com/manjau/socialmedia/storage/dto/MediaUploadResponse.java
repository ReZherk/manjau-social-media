package com.manjau.socialmedia.storage.dto;

/**
 * Result of a media upload. {@code fileUrl} is an absolute, publicly
 * reachable URL that can be used directly as an <img>/<video> source and
 * persisted on the publication.
 */
public record MediaUploadResponse(String fileUrl, String mediaType, String originalName) {
}
