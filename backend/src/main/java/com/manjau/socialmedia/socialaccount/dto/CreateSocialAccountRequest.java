package com.manjau.socialmedia.socialaccount.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateSocialAccountRequest {

    @NotBlank(message = "La plataforma es obligatoria")
    private String platformCode;

    @NotBlank(message = "El nombre de la cuenta es obligatorio")
    private String accountName;

    @NotBlank(message = "El usuario de acceso es obligatorio")
    private String accessUsername;

    @NotBlank(message = "La credencial de acceso es obligatoria")
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
