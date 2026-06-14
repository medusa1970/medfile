# Despliegue en produccion — Railway + medfile.my

Guia paso a paso para publicar Medfile con:

- **GitHub** (codigo)
- **Railway** (API + Web)
- **MongoDB Atlas** (base de datos)
- **Hostinger** (dominio `medfile.my` + correo SMTP)
- **Mercado Pago** (cobros Bolivia)
- **WhatsApp** (manual ya; API automatica en fase siguiente)

Complementa: [06-auth-onboarding.md](./06-auth-onboarding.md), [26-mercadopago-bolivia.md](./26-mercadopago-bolivia.md), [25-whatsapp-incluido-en-planes.md](./25-whatsapp-incluido-en-planes.md), [10-storage-uploads-firmados.md](./10-storage-uploads-firmados.md).

---

## Mapa general

```text
                    ┌─────────────────┐
                    │   GitHub repo   │
                    └────────┬────────┘
                             │ deploy auto
              ┌──────────────┴──────────────┐
              ▼                             ▼
     ┌────────────────┐          ┌────────────────┐
     │ Railway: Web   │          │ Railway: API   │
     │ (Nuxt)         │  HTTPS   │ (NestJS)       │
     │ medfile.my     │ ───────► │ api.medfile.my │
     └────────────────┘          └────────┬───────┘
                                          │
              ┌───────────────────────────┼───────────────────────┐
              ▼                           ▼                       ▼
     ┌────────────────┐          ┌────────────────┐     ┌────────────────┐
     │ MongoDB Atlas  │          │ Hostinger SMTP │     │ Mercado Pago   │
     │ (datos)        │          │ (OTP, reset)   │     │ (suscripciones)│
     └────────────────┘          └────────────────┘     └────────────────┘
              ▲
     ┌────────┴────────┐
     │ Cloudflare R2   │  (opcional MVP+: archivos medicos)
     │ o AWS S3        │
     └─────────────────┘

DNS (Hostinger):
  medfile.my      → Railway (Web)
  api.medfile.my  → Railway (API)
  www             → redirige a medfile.my
```

---

## Fase 0 — Cuentas y costos estimados (MVP)

| Servicio | Para que | Costo orientativo |
|----------|----------|-------------------|
| **Hostinger** | Dominio `medfile.my` + email | Ya lo tienes |
| **GitHub** | Repositorio privado o publico | Gratis |
| **Railway** | 2 servicios (Web + API) | ~USD 5–20/mes segun uso (plan Hobby) |
| **MongoDB Atlas** | Base de datos M0 | Gratis (512 MB) |
| **Cloudflare R2** | Archivos PDF/imagenes | ~USD 0–5/mes al inicio |
| **Mercado Pago** | Cobro suscripciones | Comision por transaccion |
| **Meta WhatsApp** | Mensajes automaticos (fase 2) | ~USD 0,011/msg utility |

---

## Fase 1 — GitHub

### 1.1 Crear repositorio

1. [github.com/new](https://github.com/new) → nombre sugerido: `medfile` o `medicenter`.
2. **Privado** recomendado (datos de producto medico).
3. No inicialices con README si ya tienes codigo local.

### 1.2 Subir el monorepo

Desde tu carpeta del proyecto:

```bash
git init
git add .
git commit -m "Initial Medfile monorepo"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/medfile.git
git push -u origin main
```

Asegurate de que **no** subas `.env` (debe estar en `.gitignore`).

### 1.3 Ramas recomendadas

- `main` → produccion (Railway despliega desde aqui).
- `develop` → pruebas (opcional segundo entorno en Railway).

---

## Fase 2 — MongoDB Atlas

1. Crea cuenta en [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Cluster M0** (gratis), region cercana (ej. `us-east-1` o Sao Paulo si disponible).
3. **Database Access** → usuario `medfile_app` + contraseña fuerte.
4. **Network Access** → `0.0.0.0/0` (Railway usa IPs dinamicas; luego puedes restringir).
5. **Connect** → driver Node → copia URI:

```text
mongodb+srv://medfile_app:PASSWORD@cluster0.xxxxx.mongodb.net/medfile_prod?retryWrites=true&w=majority
```

Guardala como `MONGODB_URI` en Railway (servicio API).

---

## Fase 3 — Railway (2 servicios)

### 3.1 Proyecto

1. [railway.app](https://railway.app) → **New Project**.
2. **Deploy from GitHub repo** → autoriza GitHub → elige el repo `medfile`.
3. Crearas **dos servicios** dentro del mismo proyecto.

### 3.2 Servicio `medfile-api`

| Campo | Valor |
|-------|-------|
| **Root Directory** | `/` (raiz del monorepo) |
| **Build Command** | `npm ci && npm run build:types && npm run build --workspace @medfile/api` |
| **Start Command** | `npm run start:prod --workspace @medfile/api` |
| **Watch Paths** | `apps/api/**`, `packages/types/**`, `package.json` |

> Si el deploy aparece **SKIPPED / No changes to watched files**, amplia Watch Paths o haz **Redeploy** manual. El fix del monorepo suele tocar `packages/types/` fuera de `apps/api/` solo.

Railway asigna `PORT` automaticamente; el API ya lo lee.

**Variables de entorno (API):**

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=genera-un-secreto-largo-aleatorio-min-32-chars
JWT_ACCESS_TTL_SECONDS=3600
WEB_ORIGIN=https://medfile.my,https://www.medfile.my
APP_PUBLIC_URL=https://medfile.my
PAYMENTS_PROVIDER=mock
# Email Hostinger (MailModule + nodemailer):
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@medfile.my
SMTP_PASS=...
SMTP_FROM=Medfile <noreply@medfile.my>
# Storage R2 (opcional):
# S3_ENDPOINT=https://....r2.cloudflarestorage.com
# S3_REGION=auto
# S3_BUCKET=medfile-prod
# S3_ACCESS_KEY_ID=...
# S3_SECRET_ACCESS_KEY=...
# S3_FORCE_PATH_STYLE=true
```

Generar secreto JWT (PowerShell):

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

### 3.3 Servicio `medfile-web`

| Campo | Valor |
|-------|-------|
| **Build Command** | `npm ci && npm run build:types && npm run build --workspace @medfile/web` |
| **Start Command** | `npm run start --workspace @medfile/web` |
| **Watch Paths** | `apps/web`, `packages/types`, `packages/ui` |

**Variables de entorno (Web):**

```env
NODE_ENV=production
NUXT_PUBLIC_APP_NAME=medfile
NUXT_PUBLIC_API_URL=https://api.medfile.my
HOST=0.0.0.0
PORT=3000
```

> Railway inyecta `PORT`; Nuxt/Nitro lo respeta en runtime.

### 3.4 Dominios en Railway

En cada servicio → **Settings → Networking → Custom Domain**:

| Servicio | Dominio |
|----------|---------|
| Web | `medfile.my` y `www.medfile.my` |
| API | `api.medfile.my` |

Railway te dara registros DNS (CNAME o A). **Copialos** para Hostinger.

---

## Fase 4 — DNS en Hostinger

En hPanel → **Dominios** → `medfile.my` → **DNS / Zona DNS**:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| CNAME | `@` o A | *(lo que indique Railway para Web)* | 3600 |
| CNAME | `www` | *(Railway web)* | 3600 |
| CNAME | `api` | *(Railway API)* | 3600 |

Espera propagacion (5 min – 48 h). Verifica:

```bash
curl -I https://medfile.my
curl -I https://api.medfile.my/api/auth/me
```

El segundo debe responder `401` (sin token) — eso confirma que el API esta vivo.

---

## Fase 5 — Correo Hostinger (auth en produccion)

### 5.1 Crear buzon

1. hPanel → **Emails** → **Create email account**.
2. Sugerido: `noreply@medfile.my` (verificacion OTP, reset contraseña).
3. Opcional: `soporte@medfile.my` para respuestas humanas.

### 5.2 Datos SMTP Hostinger (tipicos)

| Campo | Valor |
|-------|-------|
| Servidor | `smtp.hostinger.com` |
| Puerto | `465` (SSL) o `587` (TLS) |
| Usuario | `noreply@medfile.my` |
| Contrasena | La del buzon |

### 5.3 Estado en codigo

El API usa **`MailModule`** (`apps/api/src/modules/mail/mail.service.ts`) con **nodemailer** e integracion en `AuthService`:

- Codigo OTP al registrarse o reenviar verificacion
- Enlace de recuperacion: `https://medfile.my/restablecer-contrasena?token=...&email=...`

**Desarrollo:** sin SMTP, OTP/token en consola del API + `devCode`/`reset.token` en JSON.

**Produccion:** configura las variables SMTP en Railway; no expone codigos en la respuesta.

**Prueba rapida tras deploy:**

1. Registro en `https://medfile.my/registro` → revisa bandeja de `noreply@medfile.my`.
2. `/olvide-contrasena` → correo con enlace de reset.

---

## Fase 6 — Pruebas funcionales (checklist)

### Auth (prioridad)

| # | Prueba | URL / accion | Resultado esperado |
|---|--------|--------------|-------------------|
| 1 | Landing | `https://medfile.my` | Carga sin errores |
| 2 | Registro | `/registro` | Cuenta creada |
| 3 | Email OTP | Correo o logs | Codigo recibido |
| 4 | Verificar | `/verificar-correo` | Pasa a onboarding |
| 5 | Onboarding | `/onboarding` | Guarda y va a dashboard |
| 6 | Login | `/login` | Redirige segun estado |
| 7 | Olvide contraseña | `/olvide-contrasena` | Email/token |
| 8 | Reset | `/restablecer-contrasena` | Nueva contraseña OK |
| 9 | Perfil | `/cuenta` | Editar nombre/telefono |
| 10 | API protegida sin verificar | Pacientes sin OTP | 403 en API |

### Clinico basico

| # | Prueba | Resultado |
|---|--------|-----------|
| 11 | Crear paciente | OK en `/pacientes/nuevo` |
| 12 | Dashboard | Metricas cargan |
| 13 | Enlace subida paciente | Token + pagina `/paciente/subir` |

### Suscripcion (Mercado Pago)

Ver [26-mercadopago-bolivia.md](./26-mercadopago-bolivia.md).

| # | Modo | Accion |
|---|------|--------|
| 14 | `mock` | `/suscripcion` → checkout simulado |
| 15 | `TEST` MP | Tarjetas sandbox MP Bolivia |
| 16 | Webhook | URL publica `https://api.medfile.my/api/webhooks/mercadopago` |

---

## Fase 7 — Mercado Pago (cobros online)

### 7.1 Cuenta negocio

1. [mercadopago.com.bo](https://www.mercadopago.com.bo) → cuenta **negocio** verificada.
2. [developers.mercadopago.com](https://www.mercadopago.com.bo/developers) → **Crear aplicacion**.

### 7.2 Credenciales

| Entorno | Token | Uso |
|---------|-------|-----|
| Pruebas | `TEST-...` | Staging Railway |
| Produccion | `APP_USR-...` | Cuando vayas en vivo |

En Railway (API):

```env
PAYMENTS_PROVIDER=mercadopago
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx
```

### 7.3 Webhook

En panel MP → Webhooks → URL:

```text
https://api.medfile.my/api/webhooks/mercadopago
```

Eventos: `subscription_preapproval`, pagos relacionados (segun doc MP Bolivia).

### 7.4 Flujo de prueba

1. Medico en plan Gratis → `/suscripcion`.
2. Elige **Basico** o **Profesional** → **Pagar con Mercado Pago**.
3. Redirige a checkout MP → paga con tarjeta **TEST**.
4. Vuelve a `/suscripcion?checkout=return` → sync activa plan.
5. Verifica limites (pacientes, WhatsApp/mes).

Tarjetas de prueba: documentacion oficial MP Developers.

---

## Fase 8 — WhatsApp

### 8.1 Lo que ya funciona hoy (sin API Meta)

| Funcion | Plan | Como |
|---------|------|------|
| Compartir enlace al paciente | **Gratis** | Boton `wa.me` — abre WhatsApp del medico con mensaje prefijado |
| Enlace de subida de examenes | **Gratis** | Mismo mecanismo manual |

No requiere cuenta Meta Business. **Prueba:** crear solicitud de subida → boton WhatsApp → debe abrir chat con texto correcto.

### 8.2 Mensajes automaticos (planes de pago) — fase siguiente

Requiere **WhatsApp Business Platform (Meta)**:

1. [business.facebook.com](https://business.facebook.com) → Business verificado.
2. **WhatsApp Business Account (WABA)**.
3. Numero dedicado +591 (no el personal del medico idealmente; en MVP puede ser numero del consultorio).
4. Plantillas **Utility** aprobadas (recordatorio cita, link subida).
5. Proveedor BSP o Cloud API directa.
6. Variables en API (futuro): `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, etc.

Cupo incluido en producto: **Basico 100/mes**, **Profesional 600/mes** — ver [25-whatsapp-incluido-en-planes.md](./25-whatsapp-incluido-en-planes.md).

**Orden recomendado:** primero produccion con `wa.me` + email; WhatsApp API cuando tengas primeros medicos de pago.

---

## Fase 9 — Archivos medicos (R2 / S3)

Sin storage configurado, las subidas funcionan en **modo mock** (metadatos sin binario real).

Para produccion seria:

1. Cuenta [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (sin egress fee).
2. Bucket privado `medfile-prod`.
3. API keys → variables `S3_*` en Railway API.
4. Probar flujo paciente: subir PDF → aparece en bandeja del medico.

Ver [10-storage-uploads-firmados.md](./10-storage-uploads-firmados.md).

---

## Fase 10 — Seguridad antes de medicos reales

- [ ] `JWT_ACCESS_SECRET` unico y largo (no el de `.env.example`).
- [ ] `NODE_ENV=production` en ambos servicios.
- [ ] HTTPS forzado (Railway + Hostinger).
- [ ] MongoDB Atlas: usuario con permisos minimos.
- [ ] Backups Atlas activados (M0 tiene snapshots limitados).
- [ ] No commitear secretos a GitHub.
- [ ] Rotar tokens MP y SMTP si se filtran.
- [ ] Politica de privacidad / terminos en landing (legal Bolivia).

---

## Orden de implementacion recomendado

```text
Semana 1 — Infra base
  GitHub → Railway (API+Web) → Atlas → DNS medfile.my

Semana 2 — Auth real
  SMTP Hostinger → probar registro/verify/reset en produccion

Semana 3 — Producto clinico
  R2 storage → prueba subida paciente end-to-end

Semana 4 — Pagos
  Mercado Pago TEST → webhook → plan Basico/Profesional

Semana 5+ — WhatsApp API
  Meta Business → plantillas → cupo automatico
```

---

## Solucion de problemas frecuentes

| Sintoma | Causa probable | Solucion |
|---------|----------------|----------|
| CORS error en registro | `WEB_ORIGIN` no incluye `https://medfile.my` | Actualizar variable API y redeploy |
| API no responde | Build fallo o `MONGODB_URI` mal | Logs en Railway → servicio API |
| Web muestra localhost en fetch | `NUXT_PUBLIC_API_URL` incorrecto | Rebuild Web con URL correcta |
| Web muestra **Upgrade Required** | Railway arranca `dev` en vez de produccion | Start: `npm run start --workspace @medfile/web` |
| API **Application failed to respond** / **502** | `nest start` en prod, MongoDB caído, puerto distinto | Start: `node apps/api/dist/main.js`, `PORT=8080`, URI Mongo correcta |
| OTP no llega | SMTP no configurado en prod | Configurar Hostinger SMTP |
| MP checkout falla | Token TEST invalido o webhook | Revisar credenciales y URL webhook |
| 502 en dominio | Servicio dormido (plan free Railway) | Upgrade plan o healthcheck |

---

## Variables de entorno — resumen unificado

Copia a Railway segun servicio:

### API (`api.medfile.my`)

```env
NODE_ENV=production
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_ACCESS_TTL_SECONDS=3600
WEB_ORIGIN=https://medfile.my,https://www.medfile.my
PAYMENTS_PROVIDER=mock
MERCADOPAGO_ACCESS_TOKEN=
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=noreply@medfile.my
SMTP_PASS=
SMTP_FROM=Medfile <noreply@medfile.my>
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_FORCE_PATH_STYLE=true
```

### Web (`medfile.my`)

```env
NODE_ENV=production
NUXT_PUBLIC_APP_NAME=medfile
NUXT_PUBLIC_API_URL=https://api.medfile.my
```

---

## Documentos relacionados

- [14-desarrollo-local-terminales.md](./14-desarrollo-local-terminales.md) — desarrollo local
- [06-auth-onboarding.md](./06-auth-onboarding.md) — flujos auth
- [26-mercadopago-bolivia.md](./26-mercadopago-bolivia.md) — pagos
- [25-whatsapp-incluido-en-planes.md](./25-whatsapp-incluido-en-planes.md) — WhatsApp
- [12-seguridad-tenant-sesion.md](./12-seguridad-tenant-sesion.md) — JWT y tenants
