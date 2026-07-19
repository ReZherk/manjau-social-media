# Despliegue gratuito (Vercel + Render + Neon)

Guía para publicar un **avance** de Manjau con capa gratuita:

- **Frontend** (React) → **Vercel**
- **Backend** (Spring Boot) → **Render** (Docker)
- **Base de datos** (PostgreSQL) → **Neon**
- **Correo** (opcional) → **Brevo** (SMTP real) — si no lo configuras, el usuario
  igual se crea; solo no se envía el correo.

> El proyecto ya está preparado: puerto dinámico (`PORT`), CORS por variable,
> `/health`, `Dockerfile` de producción, `render.yaml` y `vercel.json`.

---

## 0. Requisitos previos

1. Cuenta en **GitHub** con este repo subido (Render y Vercel despliegan desde GitHub).
2. Cuentas gratis en: [Neon](https://neon.tech), [Render](https://render.com), [Vercel](https://vercel.com) y (opcional) [Brevo](https://www.brevo.com).

Sube el repo a GitHub si aún no está:
```bash
git init && git add . && git commit -m "Manjau - avance"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/manjau-social-media.git
git push -u origin main
```

---

## 1. Base de datos — Neon

1. Entra a Neon → **Create project** (región más cercana, p. ej. `AWS us-east`).
2. Copia el **connection string** (botón *Connect*). Se ve así:
   ```
   postgresql://usuario:PASSWORD@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Desármalo para Spring (lo usarás en Render):
   - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME` = `usuario`
   - `SPRING_DATASOURCE_PASSWORD` = `PASSWORD`

> Flyway crea todas las tablas y datos iniciales solo al arrancar el backend.

---

## 2. Backend — Render

Opción rápida con el blueprint incluido:

1. Render → **New +** → **Blueprint** → conecta tu repo → detecta `render.yaml`.
2. Render crea el servicio `manjau-backend` y te pide las variables marcadas
   `sync:false`. Complétalas:

| Variable | Valor |
|---|---|
| `SPRING_DATASOURCE_URL` | el `jdbc:...` de Neon |
| `SPRING_DATASOURCE_USERNAME` | usuario de Neon |
| `SPRING_DATASOURCE_PASSWORD` | password de Neon |
| `ADMIN_INITIAL_EMAIL` | `admin@manjau.com` |
| `ADMIN_INITIAL_PASSWORD` | una contraseña fuerte |
| `FRONTEND_URL` | (lo pones tras el paso 4) |
| `CORS_ALLOWED_ORIGINS` | (lo pones tras el paso 4) |
| `MAIL_*` | (paso 3, opcional) |

`JWT_ACCESS_SECRET` y `APP_ENCRYPTION_SECRET` los **genera Render** solo.

3. Deploy. La primera build tarda unos minutos (compila el jar).
4. Cuando termine, tu backend queda en `https://manjau-backend.onrender.com`.
   Pruébalo: abre `https://manjau-backend.onrender.com/health` → `{"status":"UP"}`.

> **Setup manual (sin blueprint):** New + → **Web Service** → repo → *Root Directory* =
> `backend`, *Runtime* = Docker, *Health Check Path* = `/health`, plan Free, y añade
> las variables de la tabla a mano.

---

## 3. Correo — Brevo (opcional pero recomendado)

Para que los correos de credenciales lleguen a bandejas reales:

1. Brevo → crea cuenta → **SMTP & API** → **SMTP**. Anota host, puerto, login y una *master password/API key*.
2. Verifica un remitente (*Senders*) — un correo tuyo real.
3. En Render añade:
   - `MAIL_HOST` = `smtp-relay.brevo.com`
   - `MAIL_PORT` = `587`
   - `MAIL_USERNAME` = tu login SMTP de Brevo
   - `MAIL_PASSWORD` = tu master password de Brevo
   - `MAIL_SMTP_AUTH` = `true`
   - `MAIL_SMTP_STARTTLS` = `true`
   - `MAIL_FROM` = el remitente verificado

Para el demo, crea usuarios con **correos reales** que puedas abrir.

---

## 4. Frontend — Vercel

1. Vercel → **Add New… → Project** → importa el repo.
2. **Root Directory** = `frontend`. Framework: *Vite* (auto). El `vercel.json`
   ya configura el build y el enrutado SPA.
3. En **Environment Variables** añade:
   - `VITE_API_URL` = `https://manjau-backend.onrender.com/api/v1`
4. **Deploy**. Obtendrás una URL tipo `https://manjau.vercel.app`.

---

## 5. Conectar CORS y probar

1. Vuelve a Render → variables del backend y pon la URL de Vercel:
   - `FRONTEND_URL` = `https://manjau.vercel.app`
   - `CORS_ALLOWED_ORIGINS` = `https://manjau.vercel.app`
   (puedes poner varias separadas por coma). Guarda → Render redespliega.
2. Abre la URL de Vercel, inicia sesión con `ADMIN_INITIAL_EMAIL` / `ADMIN_INITIAL_PASSWORD`
   y prueba el flujo del Community Manager.

---

## Trucos para el demo con el cliente

- **Cold start:** el backend gratis de Render se duerme tras 15 min y tarda
  ~30–60 s en despertar. **Abre la app 1–2 minutos antes** del demo para calentarla.
  (Opcional: un ping cada 10 min desde [cron-job.org](https://cron-job.org) a
  `/health`).
- **Neon** despierta en ~1 s, no te preocupa.
- **Imágenes subidas:** en el plan gratis de Render el disco es **efímero** — se
  borran en cada redeploy/reinicio. Para el demo, **súbelas justo antes** y no
  redepliegues. Solución definitiva a futuro: integrar **Cloudinary**
  (`StorageService` ya está aislado para migrar sin tocar el resto).
- **No subas** `.env` reales; todas las credenciales van como variables en Render/Vercel.
