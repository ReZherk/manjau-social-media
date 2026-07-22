package com.manjau.socialmedia.auth.dto;

import java.util.List;
import java.util.UUID;

public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private boolean mustChangePassword;
    private UserInfo user;

    public LoginResponse(String accessToken, String refreshToken, long expiresIn, boolean mustChangePassword, UserInfo user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.mustChangePassword = mustChangePassword;
        this.user = user;
    }

    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public long getExpiresIn() { return expiresIn; }
    public boolean isMustChangePassword() { return mustChangePassword; }
    public UserInfo getUser() { return user; }

    public static class UserInfo {
        private UUID id;
        private String fullName;
        private String institutionalEmail;
        private String initials;
        private RoleInfo role;
        private List<String> permissions;
        private boolean mustChangePassword;

        public UserInfo(UUID id, String fullName, String institutionalEmail, String initials,
                       RoleInfo role, List<String> permissions, boolean mustChangePassword) {
            this.id = id;
            this.fullName = fullName;
            this.institutionalEmail = institutionalEmail;
            this.initials = initials;
            this.role = role;
            this.permissions = permissions;
            this.mustChangePassword = mustChangePassword;
        }

        public UUID getId() { return id; }
        public String getFullName() { return fullName; }
        public String getInstitutionalEmail() { return institutionalEmail; }
        public String getInitials() { return initials; }
        public RoleInfo getRole() { return role; }
        public List<String> getPermissions() { return permissions; }
        public boolean isMustChangePassword() { return mustChangePassword; }
    }

    public static class RoleInfo {
        private String code;
        private String name;

        public RoleInfo(String code, String name) {
            this.code = code;
            this.name = name;
        }

        public String getCode() { return code; }
        public String getName() { return name; }
    }
}
