package com.manjau.socialmedia.socialaccount.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateSocialAccountRequest {

    @NotBlank(message = "La plataforma es obligatoria")
    private String platformCode;

    @NotBlank(message = "El nombre de la cuenta es obligatorio")
    private String accountName;

    // Optional: only rotates the stored credentials when both are provided.
    private String accessUsername;

    private String accessSecret;

    public String getPlatformCode() { return platformCode; }
    public void setPlatformCode(String platformCode) { this.platformCode = platformCode; }
    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }
    public String getAccessUsername() { return accessUsername; }
    public void setAccessUsername(String accessUsername) { this.accessUsername = accessUsername; }
    public String getAccessSecret() { return accessSecret; }
    public void setAccessSecret(String accessSecret) { this.accessSecret = accessSecret; }
}
