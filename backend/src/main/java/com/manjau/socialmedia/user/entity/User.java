package com.manjau.socialmedia.user.entity;

import com.manjau.socialmedia.role.entity.Role;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 8)
    private String dni;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String paternalSurname;

    @Column(nullable = false)
    private String maternalSurname;

    @Column(unique = true, nullable = false)
    private String institutionalEmail;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column(nullable = false)
    private boolean mustChangePassword = true;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    private Instant lastAccessAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public String getFullName() {
        return firstName + " " + paternalSurname + " " + maternalSurname;
    }

    public String getInitials() {
        return (firstName != null ? String.valueOf(firstName.charAt(0)) : "") +
               (paternalSurname != null ? String.valueOf(paternalSurname.charAt(0)) : "");
    }

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserData {
        private String firstName;
        private String paternalSurname;
        private String maternalSurname;
        private String institutionalEmail;
        private String roleCode;
    }
}
