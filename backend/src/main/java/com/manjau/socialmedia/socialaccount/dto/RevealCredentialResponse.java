package com.manjau.socialmedia.socialaccount.dto;

/**
 * Returned only by the explicit, permission-gated credential reveal
 * action. The reveal is recorded in the audit log.
 */
public record RevealCredentialResponse(String accessUsername, String accessSecret) {
}
