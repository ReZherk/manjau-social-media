package com.manjau.socialmedia.config;

import com.manjau.socialmedia.role.entity.Role;
import com.manjau.socialmedia.role.repository.RoleRepository;
import com.manjau.socialmedia.user.entity.User;
import com.manjau.socialmedia.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public DataInitializer(UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${admin.initial-email}") String adminEmail,
                          @Value("${admin.initial-password}") String adminPassword) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByInstitutionalEmail(adminEmail)) {
            Role adminRole = roleRepository.findByCode("ADMINISTRATOR")
                    .orElseThrow(() -> new RuntimeException("Role ADMINISTRATOR not found"));

            User admin = new User();
            admin.setDni("00000000");
            admin.setFirstName("Admin");
            admin.setPaternalSurname("Manjau");
            admin.setMaternalSurname("Sistema");
            admin.setInstitutionalEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setStatus("ACTIVE");
            admin.setMustChangePassword(false);
            admin.setRole(adminRole);
            admin.setCreatedAt(Instant.now());
            admin.setUpdatedAt(Instant.now());
            userRepository.save(admin);
        }
    }
}
