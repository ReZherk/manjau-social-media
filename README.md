# Manjau Social Media

Sistema de gestión de redes sociales para la pastelería Manjau.

## Tecnologías

### Frontend
- React 18 + TypeScript (strict mode)
- Vite 5
- React Router v6
- TanStack Query
- React Hook Form + Zod
- Axios
- Tailwind CSS
- Radix UI (Dialog, DropdownMenu, Toast, Avatar)
- Lucide React

### Backend
- Java 21
- Spring Boot 3.3
- Spring Security + JWT
- Spring Data JPA
- Bean Validation
- PostgreSQL
- Flyway
- Spring Mail
- OpenAPI / Swagger

### Infraestructura
- Docker + Docker Compose
- Mailpit (correo en desarrollo)

## Arquitectura

Monorepo con frontend y backend independientes:

```
manjau-social-media/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Spring Boot + Maven
├── docs/              # Documentación (architecture, api, permissions, deploy)
├── docker-compose.yml
├── render.yaml        # Blueprint de despliegue (Render)
└── README.md
```

Comunicación: React → HTTPS/REST → Spring Boot → PostgreSQL

## Estructura del Frontend

Organización por funcionalidades:

```
frontend/src/
├── app/               # Configuración global
│   ├── config/        # Menú central y landing por permisos
│   ├── providers/     # AuthProvider
│   ├── router/        # AppRouter (lazy loading)
│   └── permissions/   # PERMISSIONS, PermissionGuard, ProtectedRoute, GuestRoute
├── modules/           # Módulos funcionales
│   ├── auth/
│   ├── dashboard/     # Dashboard admin + panel del Community Manager
│   ├── users/
│   ├── audit/
│   ├── social-accounts/
│   ├── publications/
│   ├── metrics/       # (base, fase 2)
│   ├── kpis/          # (base, fase 2)
│   └── reports/       # (base, fase 2)
└── shared/            # Componentes, hooks, api, tipos y utilidades compartidas
    ├── api/           # client Axios, referenceApi, mediaApi
    ├── components/
    ├── hooks/
    ├── layouts/       # AppLayout, AppSidebar, AppTopbar
    ├── lib/
    ├── types/
    └── styles/
```

## Estructura del Backend

Monolito modular por dominio, con capas (controller → service → repository):

```
backend/src/main/java/com/manjau/socialmedia/
├── auth/              # Login, refresh, cambio de contraseña, tokens
├── user/              # Gestión de usuarios
├── role/ permission/  # Roles y permisos
├── dashboard/         # Resumen y actividad reciente
├── audit/             # Registro de auditoría
├── socialaccount/     # Cuentas de redes sociales + credenciales cifradas
├── publication/       # Publicaciones (N:M con redes, multimedia)
├── reference/         # Catálogos (plataformas, tipos de contenido)
├── storage/           # Subida y servido de archivos multimedia
├── notification/      # Envío de correo
├── security/          # Spring Security, JWT
├── config/            # OpenAPI, seed inicial
└── shared/            # DTOs, excepciones, auditoría, cifrado, health
```

> Los módulos `metric`, `kpi` y `report` (rol Analista) son la **fase 2** y aún no
> están implementados en el backend.

## Requisitos Previos

- Node.js 20+ (npm o pnpm)
- Java 21 JDK
- Docker + Docker Compose

## Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```bash
cp .env.example .env
```

Variables principales:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | BD | manjau_social / manjau / change_me |
| `POSTGRES_PORT` | Puerto host de Postgres | 5432 |
| `JWT_ACCESS_SECRET` | Secreto JWT (≥32 chars) | - |
| `APP_ENCRYPTION_SECRET` | Secreto para cifrar credenciales | - |
| `APP_STORAGE_LOCATION` | Carpeta de archivos subidos | uploads |
| `ADMIN_INITIAL_EMAIL` / `ADMIN_INITIAL_PASSWORD` | Admin inicial | admin@manjau.com / ChangeMe123! |
| `MAIL_HOST` / `MAIL_PORT` | SMTP (Mailpit en dev) | localhost / 1025 |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos (coma) | http://localhost:5173,http://localhost:5174 |
| `VITE_API_URL` | URL API para el frontend | http://localhost:8081/api/v1 |

## Ejecución

Base de datos y Mailpit en Docker; frontend y backend en local:

```bash
# 1) Infraestructura (BD + correo)
docker compose up -d postgres mailpit

# 2) Backend  → http://localhost:8081
cd backend
./mvnw spring-boot:run

# 3) Frontend → http://localhost:5173
cd frontend
npm install     # o: pnpm install
npm run dev     # o: pnpm dev
```

Todo el sistema con Docker:

```bash
docker compose up --build
```

Servicios:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8081
- Swagger UI: http://localhost:8081/swagger-ui.html
- Mailpit Web: http://localhost:8025

## Administrador Inicial

Se crea automáticamente al arrancar el backend con las variables de entorno
(`ADMIN_INITIAL_EMAIL` / `ADMIN_INITIAL_PASSWORD`).

## Roles y Permisos

| Rol | Código | Alcance |
|-----|--------|---------|
| Administrador | ADMINISTRATOR | Todos los permisos |
| Community Manager | COMMUNITY_MANAGER | Redes sociales y publicaciones |
| Analista de Marketing | MARKETING_ANALYST | Métricas, KPI, reportes (fase 2) |

Matriz completa en [`docs/permissions.md`](docs/permissions.md).

## API

Prefijo `/api/v1`. Detalle en [`docs/api.md`](docs/api.md).

- **Auth:** `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`, `/auth/change-password`
- **Usuarios:** `/users` (CRUD, `/status`, `/reset-credentials`), `/roles/assignable`
- **Dashboard:** `/admin/dashboard/summary`, `/admin/dashboard/recent-activities`
- **Auditoría:** `/audit-logs`
- **Catálogos:** `/platforms`, `/content-types`
- **Redes sociales:** `/social-accounts` (CRUD, `/status`, `/credentials`)
- **Publicaciones:** `/publications/scheduled`, `/publications/history`, `/publications`, `/publications/{id}`, `/publications/{id}/publish`
- **Multimedia:** `/media` (subir), `/media/{archivo}` (servir)

## Funcionalidades Implementadas

- [x] Autenticación JWT y cambio obligatorio de contraseña temporal
- [x] Gestión de usuarios (CRUD, activar/desactivar, restablecer credenciales)
- [x] Envío de credenciales por correo (Mailpit en dev)
- [x] Dashboard administrativo y auditoría
- [x] Layout responsive con sidebar y menú filtrado por permisos
- [x] Redes sociales: CRUD, activar/desactivar y credenciales cifradas (revelado con permiso)
- [x] Publicaciones: crear, programar, borradores, editar/eliminar, marcar como realizada, historial y vista calendario
- [x] Subida de archivos multimedia (guardado en backend, servido para vista previa)
- [x] Panel del Community Manager

## Fase 2 (pendiente)

- [ ] Registro de métricas (Instagram / Facebook / TikTok)
- [ ] Cálculo de KPI
- [ ] Generación de reportes PDF
- [ ] Almacenamiento de archivos en la nube (Cloudinary)

## Despliegue

Guía para publicar gratis (Vercel + Render + Neon) en [`docs/deploy.md`](docs/deploy.md).
