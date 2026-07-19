package com.manjau.socialmedia.user.dto;

import java.time.Instant;
import java.util.UUID;

public class UserResponse {
    private UUID id;
    private String dni;
    private String firstName;
    private String paternalSurname;
    private String maternalSurname;
    private String fullName;
    private String institutionalEmail;
    private String initials;
    private RoleInfo role;
    private String status;
    private Instant lastAccessAt;
    private Instant createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getPaternalSurname() { return paternalSurname; }
    public void setPaternalSurname(String paternalSurname) { this.paternalSurname = paternalSurname; }
    public String getMaternalSurname() { return maternalSurname; }
    public void setMaternalSurname(String maternalSurname) { this.maternalSurname = maternalSurname; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getInstitutionalEmail() { return institutionalEmail; }
    public void setInstitutionalEmail(String institutionalEmail) { this.institutionalEmail = institutionalEmail; }
    public String getInitials() { return initials; }
    public void setInitials(String initials) { this.initials = initials; }
    public RoleInfo getRole() { return role; }
    public void setRole(RoleInfo role) { this.role = role; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getLastAccessAt() { return lastAccessAt; }
    public void setLastAccessAt(Instant lastAccessAt) { this.lastAccessAt = lastAccessAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static class RoleInfo {
        private String code;
        private String name;

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}
