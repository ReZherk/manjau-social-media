package com.manjau.socialmedia.notification.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String from;

    public EmailService(JavaMailSender mailSender, @Value("${spring.mail.from}") String from) {
        this.mailSender = mailSender;
        this.from = from;
    }

    public void sendCredentials(String fullName, String email, String tempPassword, String setupLink, Instant expiresAt) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(email);
        message.setSubject("Credenciales de acceso - Manjau Social Media");
        message.setText(String.format("""
            Hola %s,
            
            Se ha creado tu cuenta en el sistema de gestión de redes sociales de Manjau.
            
            Tus credenciales temporales son:
            Correo: %s
            Contraseña temporal: %s
            
            Para configurar tu contraseña, ingresa al siguiente enlace:
            %s
            
            Este enlace expirará el: %s
            
            Por seguridad, te recomendamos no compartir estas credenciales y cambiar tu contraseña al ingresar.
            
            Saludos,
            Equipo Manjau
            """,
                fullName, email, tempPassword, setupLink,
                DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                        .withZone(ZoneId.of("America/Lima"))
                        .format(expiresAt)
        ));
        mailSender.send(message);
    }
}
