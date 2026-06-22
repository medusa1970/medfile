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
BREVO_API_KEY=xkeysib-...
EMAIL_FROM=noreply@medfile.my
# o Resend:
# RESEND_API_KEY=re_...
# RESEND_FROM=Medfile <noreply@medfile.my>
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
# Omitir o false hasta activar cobro en produccion; true habilita Mercado Pago y QR en /suscripcion
# NUXT_PUBLIC_PAYMENTS_CHECKOUT_ENABLED=true
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

## Fase 5 — Correo en produccion (Resend)

> **Railway Hobby bloquea SMTP** (puertos 465/587). Los logs muestran `Connection timeout` con Hostinger SMTP. Usa **Resend** (API HTTPS) o sube a **Railway Pro**.

### 5.1 Opcion recomendada: Brevo (como tu app Siipi)

Si ya tienes Brevo funcionando en otro proyecto Railway, reutiliza el mismo patron:

1. [brevo.com](https://www.brevo.com) → **SMTP & API** → **API Keys** → crea clave `xkeysib-...`
2. **Senders** → verifica `noreply@medfile.my` (dominio `medfile.my`)
3. Railway API:

```env
BREVO_API_KEY=xkeysib-tu_clave
EMAIL_FROM=noreply@medfile.my
```

El codigo usa **API HTTPS** (no SMTP saliente), igual que `my-backApp` cuando `EMAIL_HOST` es Brevo.

Variables alias compatibles con tu otra app:

```env
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=tu_id@smtp-brevo.com
EMAIL_PASSWORD=xkeysib-tu_clave
EMAIL_FROM=noreply@medfile.my
```

Si `EMAIL_HOST` contiene `brevo`, Medfile envia por API aunque Railway bloquee SMTP.

### 5.2 Alternativa: Resend

1. [resend.com](https://resend.com) → registro gratis
2. **API Keys** → **Create API Key** → copia `re_...`

### 5.2 Verificar dominio `medfile.my`

1. Resend → **Domains** → **Add Domain** → `medfile.my`
2. Resend te da registros DNS (SPF, DKIM)
3. Hostinger → DNS → agrega esos registros
4. Espera verificacion verde en Resend

### 5.3 Variables en Railway (API)

```env
RESEND_API_KEY=re_tu_clave_aqui
RESEND_FROM=Medfile <noreply@medfile.my>
```

Prioridad en codigo: si existe `RESEND_API_KEY`, usa Resend; si no, intenta SMTP (solo Railway Pro).

### 5.4 Prueba rapida (sin dominio verificado)

Resend permite enviar desde `onboarding@resend.dev` **solo al email de tu cuenta Resend** (prueba inicial):

```env
RESEND_FROM=Medfile <onboarding@resend.dev>
```

### 5.5 Estado en codigo

`MailModule` (`apps/api/src/modules/mail/mail.service.ts`) soporta **Resend API** y SMTP (nodemailer). Logs al arrancar:

- `Correo: provider Resend API` → OK para Hobby
- `Fallo SMTP ... Connection timeout` → SMTP bloqueado; usa Resend

### 5.6 Hostinger SMTP (opcional)

El buzon `noreply@medfile.my` en Hostinger sirve para webmail humano. Para la app en Railway Hobby, **no uses SMTP**; usa Resend con el mismo remitente una vez verificado el dominio.

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
| OTP no llega | SMTP no configurado en prod | Configurar Resend (`RESEND_API_KEY`) |
| OTP `Connection timeout` en logs | Railway Hobby bloquea SMTP | Usar Resend API o Railway Pro |
| Registro **409** / cuenta atascada | Intento previo creo usuario pero fallo el correo | Borrar en Atlas (ver abajo) o `scripts/delete-account-by-email.mjs` |
| MP checkout falla | Token TEST invalido o webhook | Revisar credenciales y URL webhook |
| 502 en dominio | Servicio dormido (plan free Railway) | Upgrade plan o healthcheck |
| Consola: MIME `application/json` en `/_nuxt/*.js` | HTML/JS en cache de un deploy anterior; chunks viejos ya no existen | Ctrl+Shift+R o borrar cache de `medfile.my`; tras redeploy la web recarga sola una vez |

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
RESEND_API_KEY=
RESEND_FROM=Medfile <noreply@medfile.my>
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

## Borrar cuenta de prueba en MongoDB Atlas

Si el registro fallo con **500** pero el correo ya existe (**409**), elimina el usuario y su tenant:

1. [MongoDB Atlas](https://cloud.mongodb.com) → cluster → **Browse Collections** → base `medfile_prod`.
2. Coleccion **`users`** → busca `email: jaimewvf@gmail.com` → anota el campo **`tenantId`**.
3. Elimina en este orden:
   - `subscriptions` donde `tenantId` = ese id
   - `users` donde `email` = ese correo
   - `tenants` donde `_id` = ese `tenantId`
4. Vuelve a registrar en `https://medfile.my/registro`.

**Alternativa (mongosh en Atlas → Connect → Shell):**

```javascript
use medfile_prod
const email = "jaimewvf@gmail.com";
const user = db.users.findOne({ email });
if (user) {
  const tid = user.tenantId;
  db.subscriptions.deleteMany({ tenantId: tid });
  db.users.deleteMany({ tenantId: tid });
  db.tenants.deleteOne({ _id: ObjectId(tid) });
  print("Eliminado tenant " + tid);
} else {
  print("Usuario no encontrado");
}
```

Script local: `MONGODB_URI=... node scripts/delete-account-by-email.mjs email@ejemplo.com`

---

## Documentos relacionados

- [14-desarrollo-local-terminales.md](./14-desarrollo-local-terminales.md) — desarrollo local
- [06-auth-onboarding.md](./06-auth-onboarding.md) — flujos auth
- [26-mercadopago-bolivia.md](./26-mercadopago-bolivia.md) — pagos
- [25-whatsapp-incluido-en-planes.md](./25-whatsapp-incluido-en-planes.md) — WhatsApp
- [12-seguridad-tenant-sesion.md](./12-seguridad-tenant-sesion.md) — JWT y tenants
