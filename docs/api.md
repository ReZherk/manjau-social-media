# API REST

Base URL: `/api/v1`

## Autenticación

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "admin@manjau.com",
  "password": "ChangeMe123!"
}

Response 200:
{
  "accessToken": "jwt...",
  "expiresIn": 900,
  "mustChangePassword": false,
  "user": {
    "id": "uuid",
    "fullName": "Admin",
    "institutionalEmail": "admin@manjau.com",
    "initials": "A",
    "role": { "code": "ADMINISTRATOR", "name": "Administrador" },
    "permissions": ["USER_VIEW", "USER_CREATE", ...],
    "mustChangePassword": false
  }
}
```

### Refresh Token
```
POST /auth/refresh
{ "refreshToken": "..." }
```

### Logout
```
POST /auth/logout
{ "refreshToken": "..." }
```

### Obtener usuario actual
```
GET /auth/me
Authorization: Bearer <token>
```

### Cambiar contraseña
```
POST /auth/change-password
{
  "currentPassword": "...",
  "newPassword": "...",
  "confirmPassword": "..."
}
```

## Dashboard

Requiere permiso: `ADMIN_DASHBOARD_VIEW`

### Resumen
```
GET /admin/dashboard/summary
```

### Actividades recientes
```
GET /admin/dashboard/recent-activities
```

## Usuarios

Requiere permiso: `USER_VIEW`

### Listar (paginado)
```
GET /users?search=&role=&status=&page=0&size=10
```

### Obtener por ID
```
GET /users/{id}
```

### Crear (USER_CREATE)
```
POST /users
{
  "dni": "76543210",
  "firstName": "Camila",
  "paternalSurname": "Torres",
  "maternalSurname": "Rojas",
  "institutionalEmail": "ctorres@manjau.com",
  "roleCode": "COMMUNITY_MANAGER"
}
```

### Actualizar (USER_UPDATE)
```
PUT /users/{id}
{
  "firstName": "...",
  "paternalSurname": "...",
  "maternalSurname": "...",
  "institutionalEmail": "...",
  "roleCode": "..."
}
```

### Cambiar estado (USER_STATUS_UPDATE)
```
PATCH /users/{id}/status
{ "status": "ACTIVE" | "INACTIVE" }
```

### Restablecer credenciales (USER_RESET_CREDENTIALS)
```
POST /users/{id}/reset-credentials
```

## Roles

### Roles asignables
```
GET /roles/assignable
```

## Auditoría

Requiere permiso: `AUDIT_VIEW`

### Listar (paginado)
```
GET /audit-logs?search=&role=&action=&from=&to=&page=0&size=10
```

## Catálogos de referencia

```
GET /platforms       -> [{ id, code, name }]  (Instagram, Facebook, TikTok)
GET /content-types   -> [{ id, code, name }]  (Imagen, Reel, Video, Carrusel, Historia)
```

## Redes sociales (Community Manager) — RF-B-01

| Método | Ruta | Permiso |
|--------|------|---------|
| GET    | `/social-accounts?search=&platform=&status=&page=&size=` | `SOCIAL_ACCOUNT_VIEW` |
| GET    | `/social-accounts/{id}` | `SOCIAL_ACCOUNT_VIEW` |
| POST   | `/social-accounts` | `SOCIAL_ACCOUNT_CREATE` |
| PUT    | `/social-accounts/{id}` | `SOCIAL_ACCOUNT_UPDATE` |
| PATCH  | `/social-accounts/{id}/status` | `SOCIAL_ACCOUNT_STATUS_UPDATE` |
| GET    | `/social-accounts/{id}/credentials` | `SOCIAL_ACCOUNT_CREDENTIAL_REVEAL` |

Las credenciales se almacenan **cifradas (AES-GCM)**, nunca se devuelven en los
listados y su revelación se registra en auditoría (`SOCIAL_CREDENTIAL_REVEALED`)
sin guardar el valor.

```
POST /social-accounts
{ "platformCode": "INSTAGRAM", "accountName": "@manjau",
  "accessUsername": "user", "accessSecret": "secret" }
```

## Publicaciones (Community Manager) — RF-B-02..08

| Método | Ruta | Permiso |
|--------|------|---------|
| GET    | `/publications/scheduled?search=&from=&to=&page=&size=` | `PUBLICATION_VIEW` |
| GET    | `/publications/history?search=&from=&to=&page=&size=` | `PUBLICATION_HISTORY_VIEW` |
| GET    | `/publications/{id}` | `PUBLICATION_VIEW` |
| POST   | `/publications` | `PUBLICATION_CREATE` |
| PUT    | `/publications/{id}` (solo si `SCHEDULED`) | `PUBLICATION_UPDATE` |
| DELETE | `/publications/{id}` (solo si `SCHEDULED`) | `PUBLICATION_DELETE` |
| POST   | `/publications/{id}/publish` | `PUBLICATION_MARK_AS_PUBLISHED` |

```
POST /publications
{ "title": "Promo", "description": "...", "additionalInfo": "...",
  "budget": 150.00, "contentTypeCode": "REEL",
  "scheduledAt": "2026-02-14T15:00:00Z",
  "socialAccountIds": ["<uuid>", "..."],
  "media": [{ "fileUrl": "https://...", "mediaType": "image" }] }

POST /publications/{id}/publish
{ "evidenceLink": "https://instagram.com/p/abc" }
```

## Archivos multimedia (RF-B-02)

| Método | Ruta | Permiso |
|--------|------|---------|
| POST   | `/media` (multipart, campo `file`) | `PUBLICATION_CREATE` o `PUBLICATION_UPDATE` |
| GET    | `/media/{filename}` | público (para `<img>`/`<video>`) |

- Solo imágenes o video, máximo 50 MB.
- Se guardan en disco (`app.storage.location`, por defecto `uploads/`) con nombre
  UUID; la respuesta devuelve `{ fileUrl, mediaType, originalName }`.
- `fileUrl` se persiste en `publication_media` y se usa directamente como
  `src`. Diseñado detrás de `StorageService` para migrar luego a Cloudinary/S3
  sin tocar controladores.

```
POST /media   (multipart/form-data, file=<archivo>)
-> { "fileUrl": "http://localhost:8081/api/v1/media/<uuid>.jpg",
     "mediaType": "image/jpeg", "originalName": "torta.jpg" }
```

Nota: al crear una publicación se puede enviar `"draft": true` para guardarla
como borrador (estado `DRAFT`); los borradores aparecen junto a las programadas.

## Errores

Formato consistente:
```json
{
  "timestamp": "2026-07-13T04:00:00Z",
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Existen datos inválidos",
  "path": "/api/v1/users",
  "fieldErrors": {
    "dni": "El DNI debe tener 8 dígitos"
  }
}
```

Códigos de error:
- VALIDATION_ERROR
- INVALID_CREDENTIALS
- ACCOUNT_INACTIVE
- ACCESS_DENIED
- USER_NOT_FOUND
- DNI_ALREADY_EXISTS
- EMAIL_ALREADY_EXISTS
- INTERNAL_ERROR
