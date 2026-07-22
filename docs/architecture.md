# Arquitectura del Sistema

## Visión General

Manjau Social Media es un sistema monolítico modular para gestionar redes sociales de la pastelería Manjau.

## Stack Tecnológico

### Frontend
- React 18 con TypeScript modo estricto
- Vite como bundler
- React Router v6 para enrutamiento
- TanStack Query para fetching de datos
- React Hook Form + Zod para formularios
- Tailwind CSS para estilos
- Radix UI para componentes accesibles
- Lucide React para iconografía

### Backend
- Java 21
- Spring Boot 3.3
- Spring Security con JWT
- Spring Data JPA con PostgreSQL
- Flyway para migraciones
- Bean Validation
- Mapeadores manuales DTO ↔ entidad
- OpenAPI/Swagger para documentación

## Principios Arquitectónicos

1. **Frontend y Backend independientes**: Cada uno puede compilarse y desplegarse por separado
2. **Organización por funcionalidades**: Módulos auto-contenidos con sus capas
3. **DTOs separados de entidades**: Nunca exponer entidades JPA en la API
4. **Autorización en backend**: El frontend oculta acciones, el backend las valida
5. **Paginación del lado del servidor**: Los listados usan paginación desde la BD

## Flujo de Datos

```
React App
  ↓ HTTPS/REST (JSON)
Spring Boot API
  ↓ JDBC
PostgreSQL
```

El backend también se comunica con:
- Mailpit/SMTP para envío de correos
- Almacenamiento de archivos multimedia en disco local (`StorageService`),
  aislado para migrar a la nube (Cloudinary/S3) sin tocar el resto

## Seguridad

- Access token JWT (15 min) enviado en header Authorization
- Refresh token rotativo (7 días), almacenado por la sesión del cliente
- Contraseñas hasheadas con BCrypt
- Credenciales de redes sociales cifradas con AES-GCM (reversibles, revelables por permiso)
- Autorización a nivel de método con @PreAuthorize
- CORS configurado explícitamente
- Auditoría de todas las acciones sensibles

## Modelo de datos — Módulo de publicaciones (3FN)

Migración `V6__create_publications.sql`. Diseñado en tercera forma normal:
los atributos derivados (nombre de plataforma, nombre del tipo de contenido)
se extraen a tablas de catálogo para evitar dependencias transitivas, y la
relación publicación↔redes se modela con tabla puente (N:M), no con columnas
booleanas fijas.

```
platforms (id, code, name)                 -- catálogo: Instagram, Facebook, TikTok
content_types (id, code, name)             -- catálogo: Imagen, Reel, Video, Carrusel, Historia

social_accounts (id, platform_id →platforms, account_name, status, created_by →users)
social_account_credentials (social_account_id →social_accounts [PK/1:1],
                            access_username_encrypted, access_secret_encrypted)

publications (id, title, description, additional_info, budget,
              content_type_id →content_types, status, scheduled_at,
              published_at, evidence_link, created_by →users)
publication_social_accounts (publication_id →publications,
                             social_account_id →social_accounts)   -- N:M
publication_media (id, publication_id →publications, file_url, media_type)
```

Justificación 3FN:
- **1FN**: todos los campos son atómicos; la multiplicidad (varias redes, varios
  archivos) se resuelve con filas en tablas hijas, no con listas en una columna.
- **2FN**: todas las tablas usan clave primaria simple (UUID) salvo las puente,
  cuyos atributos dependen de la clave compuesta completa.
- **3FN**: no hay dependencias transitivas — el nombre de la plataforma y del
  tipo de contenido viven en su catálogo y se referencian por FK; las credenciales
  sensibles se aíslan en su propia tabla 1:1.

Las tablas administrativas existentes (`users`, `roles`, `permissions`,
`role_permissions`) ya cumplían 3FN. `audit_logs` mantiene deliberadamente
copias desnormalizadas (`actor_name`, `actor_role`) por ser un registro
histórico inmutable (snapshot al momento del evento).

## Módulo del Analista de Marketing

La migración `V7__create_publication_metrics.sql` agrega `publication_metrics`.
Cada registro pertenece a una publicación realizada y una cuenta social, con
una restricción única sobre ambas claves. Esto permite almacenar resultados
independientes por plataforma sin duplicar datos de publicaciones o catálogos.

El dashboard, los KPI y los reportes se calculan desde estas métricas. El
frontend consume `/metrics`, `/analyst/dashboard` y `/reports/performance`
siguiendo el mismo patrón API → hook de TanStack Query → pantalla.
