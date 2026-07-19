package com.manjau.socialmedia.storage;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Local filesystem storage for publication media. Kept behind a small
 * abstraction so it can later be swapped for an object store (e.g. Cloudinary
 * or S3) without touching controllers/services. Files are stored under a
 * configurable directory with random UUID names to avoid collisions and
 * path-traversal.
 */
@Service
public class StorageService {

    private static final long MAX_SIZE_BYTES = 50L * 1024 * 1024; // 50 MB
    private static final Set<String> ALLOWED_PREFIXES = Set.of("image/", "video/");

    private final Path root;

    public StorageService(@Value("${app.storage.location:uploads}") String location) {
        this.root = Paths.get(location).toAbsolutePath().normalize();
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo inicializar el almacenamiento de archivos", e);
        }
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("El archivo supera el tamaño máximo permitido (50 MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || ALLOWED_PREFIXES.stream().noneMatch(contentType::startsWith)) {
            throw new IllegalArgumentException("Solo se permiten imágenes o videos");
        }

        String extension = resolveExtension(file.getOriginalFilename(), contentType);
        String storedName = UUID.randomUUID() + extension;
        Path target = root.resolve(storedName).normalize();
        if (!target.startsWith(root)) {
            throw new IllegalArgumentException("Nombre de archivo no válido");
        }
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo guardar el archivo", e);
        }
        return storedName;
    }

    public Resource loadAsResource(String filename) {
        Path file = root.resolve(filename).normalize();
        if (!file.startsWith(root)) {
            throw new IllegalArgumentException("Nombre de archivo no válido");
        }
        try {
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new StorageFileNotFoundException("Archivo no encontrado: " + filename);
            }
            return resource;
        } catch (java.net.MalformedURLException e) {
            throw new StorageFileNotFoundException("Archivo no encontrado: " + filename);
        }
    }

    private String resolveExtension(String originalName, String contentType) {
        if (originalName != null && originalName.contains(".")) {
            String ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
            if (ext.matches("\\.[a-z0-9]{1,5}")) {
                return ext;
            }
        }
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            case "video/mp4" -> ".mp4";
            default -> "";
        };
    }
}
