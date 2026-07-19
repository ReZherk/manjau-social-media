# Despliegue gratuito (Vercel + Render + Neon)

Guía **probada** para publicar Manjau con capa gratuita:

- **Frontend** (React) → **Vercel**
- **Backend** (Spring Boot) → **Render** (Docker)
- **Base de datos** (PostgreSQL) → **Neon**
- **Correo** → **Gmail SMTP** (o Brevo) — real, para que lleguen las credenciales.

> El proyecto ya viene preparado: puerto dinámico (`PORT`), CORS por variable,
> endpoint `/health`, `Dockerfile` de producción, `render.yaml`, `vercel.json` y el
> driver de PostgreSQL fijado a una versión compatible con Neon (ver nota más abajo).

---

## 0. Requisitos previos

1. Repo en **GitHub** (Render y Vercel despliegan desde ahí).
2. Cuentas gratis en [Neon](https://neon.tech), [Render](https://render.com) y [Vercel](https://vercel.com).

```bash
git init && git add . && git commit -m "Manjau - avance"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/manjau-social-media.git
git push -u origin main
```

---

## 1. Base de datos — Neon

1. Neon → **Create project**:
   - Nombre libre, región más cercana (ej. `AWS US East 2 (Ohio)`).
   - **Neon Auth: DÉJALO APAGADO** (no lo usamos, la app trae su propia auth).
2. Copia el **connection string** (botón *Connect* → **Show password** → **Copy snippet**):
   ```
   postgresql://neondb_owner:PASSWORD@ep-xxxx.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Desármalo para Render:
   - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://ep-xxxx.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require`
     *(pega la parte del host+db+`?sslmode=require`, con el prefijo `jdbc:`)*
   - `SPRING_DATASOURCE_USERNAME` = `neondb_owner`
   - `SPRING_DATASOURCE_PASSWORD` = `PASSWORD`

> Flyway crea todas las tablas y el admin inicial solo al arrancar el backend.
> Verás un `WARN` de Flyway diciendo que PostgreSQL 18 es más nuevo de lo probado
> — **es inofensivo**, las migraciones corren igual.

---

## 2. Backend — Render

1. Render → **New +** → **Blueprint** → conecta el repo → detecta `render.yaml`.
2. Rellena las variables que pide (`sync:false`):

| Variable | Valor |
|---|---|
| `SPRING_DATASOURCE_URL` | el `jdbc:...` de Neon |
| `SPRING_DATASOURCE_USERNAME` | `neondb_owner` |
| `SPRING_DATASOURCE_PASSWORD` | la password de Neon *(¡sin espacios!)* |
| `ADMIN_INITIAL_EMAIL` | `admin@manjau.com` |
| `ADMIN_INITIAL_PASSWORD` | una contraseña fuerte |
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_USERNAME` | tu correo Gmail |
| `MAIL_PASSWORD` | tu **App Password** de Gmail (16 chars, sin espacios) |
| `MAIL_FROM` | `Manjau <tu-correo@gmail.com>` |
| `FRONTEND_URL` | `https://<tu-proyecto>.vercel.app` *(el nombre del repo suele ser la URL)* |
| `CORS_ALLOWED_ORIGINS` | `*` *(acepta cualquier origen; se puede afinar luego)* |

- `JWT_ACCESS_SECRET` y `APP_ENCRYPTION_SECRET` → **los genera Render solo**.
- `MAIL_PORT` (587), `MAIL_SMTP_AUTH` (true), `MAIL_SMTP_STARTTLS` (true) y
  `APP_STORAGE_LOCATION` (uploads) ya vienen fijos en el `render.yaml`.

3. **Deploy Blueprint**. La primera build tarda unos minutos (compila el jar).
4. Al terminar (estado **Live**), abre `https://<tu-backend>.onrender.com/health` → `{"status":"UP"}`.

> Render vuelve a desplegar **automáticamente** con cada `git push` a `main`.

### App Password de Gmail (para el correo)
1. Requiere **verificación en 2 pasos** activada en tu cuenta Google.
2. Google Account → **Seguridad** → **Contraseñas de aplicaciones** → crea una → cópiala (16 caracteres).
3. Úsala como `MAIL_PASSWORD` (quítale los espacios).

---

## 3. Frontend — Vercel

1. Vercel → **Add New… → Project** → importa el repo.
2. **Root Directory** → **Edit** → **`frontend`**. ⚠️ (sin esto, el preset queda en "Other" y falla).
   Al ponerlo, el *Framework Preset* cambia solo a **Vite**.
3. **Environment Variables**:
   - `VITE_API_URL` = `https://<tu-backend>.onrender.com/api/v1`
4. **Deploy** → obtienes `https://<tu-proyecto>.vercel.app`.

> Si la URL de Vercel resulta distinta a la que pusiste en `FRONTEND_URL`,
> actualiza esa variable en Render (para que los enlaces de los correos apunten bien).

---

## 4. Probar en producción

1. Abre la URL de Vercel → inicia sesión con `ADMIN_INITIAL_EMAIL` / `ADMIN_INITIAL_PASSWORD`.
2. Crea un usuario con un **correo real** y confirma que **llega el correo** por Gmail.
3. Inicia sesión con ese usuario (cambia la contraseña) y prueba el módulo del Community Manager.

---

## Problemas comunes (y su solución)

| Síntoma en los logs | Causa | Solución |
|---|---|---|
| `IllegalArgumentException: iteration must be >= 4096` (SCRAM) | El driver JDBC por defecto de Spring Boot es incompatible con la auth de Neon | **Ya resuelto**: el `pom.xml` fija `postgresql` a `42.7.11`. Si reaparece, sube esa versión. |
| `password authentication failed for user ...` (SQLState `28P01`) | La contraseña quedó mal en Render (espacio/typo al pegar) | Reescribe `SPRING_DATASOURCE_PASSWORD` **exacta**, sin espacios ni comillas. |
| `Flyway ... PostgreSQL 18.4 is newer ...` (WARN) | Neon usa PG18; Flyway prueba hasta PG16 | **Inofensivo**, ignóralo. |
| `No open ports detected, continuing to scan...` | La app aún está arrancando | Normal; desaparece cuando la app toma el puerto `$PORT`. |
| Se crea el usuario pero **no llega el correo** | Google a veces bloquea SMTP desde IPs de nube | Revisa el `WARN "No se pudo enviar el correo..."` en los logs de Render. Aprueba el acceso desde la alerta de Google, o cambia a **Brevo** (`smtp-relay.brevo.com`, sin bloqueos de nube). |

---

## Trucos para el demo

- **Cold start:** el backend gratis de Render **se duerme tras 15 min** y el primer
  ingreso tarda ~30–60 s. **Abre la app 1–2 min antes** del demo para calentarla
  (o un ping periódico a `/health` desde [cron-job.org](https://cron-job.org)).
- **Neon** despierta en ~1 s, no molesta.
- **Imágenes subidas:** el disco de Render gratis es **efímero** — se borran en cada
  reinicio/redeploy. Súbelas justo antes del demo. Solución definitiva: **Cloudinary**
  (`StorageService` ya está aislado para migrarlo sin tocar el resto).
- **Nunca** subas `.env` reales; las credenciales van como variables en Render/Vercel.

---

## Alternativa de correo — Brevo (si Gmail se bloquea)

1. Brevo → **SMTP & API** → **SMTP**: anota host, login y una *master password*.
2. Verifica un remitente (*Senders*).
3. En Render cambia: `MAIL_HOST=smtp-relay.brevo.com`, `MAIL_USERNAME`=login de Brevo,
   `MAIL_PASSWORD`=master password, `MAIL_FROM`=remitente verificado.
