package com.manjau.socialmedia.reference.dto;

import java.util.UUID;

/**
 * Generic lookup item (id + code + name) shared by platforms and
 * content types, consumed by frontend select controls.
 */
public record ReferenceItemResponse(UUID id, String code, String name) {
}
