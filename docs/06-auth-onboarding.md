# Autenticacion y onboarding

## Objetivo

El primer flujo real de Medfile debe permitir que un medico independiente cree su cuenta, obtenga un espacio privado y entre con el **Plan Gratis permanente**. Todo dato clinico posterior dependera de esta base porque cada paciente, consulta, documento y suscripcion pertenece a un `tenant`.

## Principios

- Cada registro de medico crea un `Tenant`.
- El usuario creador queda como `owner`.
- El tenant inicia con suscripcion **activa** en plan `free` (sin trial con vencimiento).
- La API es la autoridad para identidad, tenant actual, permisos y estado de suscripcion.
- El frontend no debe asumir acceso solo porque una pantalla se ve disponible.
- Las contrasenas nunca se guardan en texto plano.
- **Correo verificado obligatorio** para usar modulos clinicos (pacientes, documentos, etc.).

Ver separacion gratis vs. de pago: [20-gratis-vs-pago.md](./20-gratis-vs-pago.md).

## Flujo completo (funcional)

```text
/registro
  → POST /api/auth/register (JWT + verification.devCode en dev)
  → /verificar-correo (OTP 6 digitos)
  → POST /api/auth/verify-email
  → /onboarding (POST /api/auth/onboarding)
  → /dashboard

/login
  → POST /api/auth/login
  → redirige segun estado: verificar | onboarding | dashboard

/olvide-contrasena → POST /api/auth/forgot-password
/restablecer-contrasena → POST /api/auth/reset-password

/cuenta (Mi perfil)
  → PATCH /api/auth/profile
  → POST /api/auth/change-password
```

Middleware Nuxt: `middleware/auth.global.ts` aplica sesion, verificacion de correo y onboarding en rutas privadas.

## Flujo de registro

1. El medico entra a `medfile.my`.
2. Selecciona **Empezar gratis**.
3. Ingresa nombre(s), apellido(s), email, **telefono/WhatsApp**, contrasena y nombre de consulta.
4. La API crea `Tenant`, `User`, `Subscription` (plan `free`).
5. La API devuelve JWT y (en dev) codigo OTP.
6. Verificacion de correo → onboarding → dashboard.

## Flujo de login

1. Email + contrasena → `POST /api/auth/login`.
2. Frontend guarda JWT y redirige con `resolvePostAuthRoute()`:
   - `emailVerified === false` → `/verificar-correo`
   - sin onboarding → `/onboarding`
   - listo → `/dashboard`

## Verificacion de correo

| Endpoint | Auth | Uso |
|----------|------|-----|
| `POST /api/auth/verify-email` | Bearer + codigo 6 digitos | Confirmar OTP con sesion activa |
| `POST /api/auth/verify-email-public` | email + codigo 6 digitos | Confirmar OTP sin sesion (devuelve JWT nuevo) |
| `POST /api/auth/resend-verification` | Bearer | Reenviar con sesion |
| `POST /api/auth/resend-verification-public` | email | Reenviar sin sesion |

- TTL OTP: **30 min**.
- **Desarrollo** (`NODE_ENV !== production`): consola API + `verification.devCode` en respuesta + `sessionStorage`.
- **Produccion** con SMTP configurado: correo real via `MailService` (`apps/api/src/modules/mail/`). Sin `devCode` ni token en JSON.
- Variables: `RESEND_API_KEY`, `RESEND_FROM` (produccion Railway Hobby); SMTP opcional en local/Pro.
- Orden de validacion: expiracion antes que codigo incorrecto.
- `TenantAuthGuard` bloquea API clinica si `emailVerified === false`.

Cuentas legacy sin campo `emailVerified` se tratan como verificadas (`!== false`).

## Recuperacion de contraseña

| Endpoint | Descripcion |
|----------|-------------|
| `POST /api/auth/forgot-password` | Genera token (60 min). Respuesta generica `{ sent: true }`. En dev: `reset.token` en respuesta y consola. En prod: enlace por correo SMTP |
| `POST /api/auth/reset-password` | `{ email, token, password }` — invalida token tras uso |

Pantallas: `/olvide-contrasena`, `/restablecer-contrasena?email=&token=`.

## Mi perfil (`/cuenta`)

Seccion **Cuenta** en el panel medico (`DoctorShell` → Mi perfil).

### Datos personales (PATCH `/api/auth/profile`)

| Campo | Editable | Notas |
|-------|----------|-------|
| Nombre completo | Si | `User.fullName` |
| WhatsApp / telefono | Si | Normalizado `+digits` |
| Correo | No (solo lectura) | Cambio de email = flujo futuro con re-verificacion |
| Codigo Medfile | Solo lectura | Tarjeta informativa |

### Seguridad (POST `/api/auth/change-password`)

- Contrasena actual + nueva + confirmacion.
- Requiere correo verificado.

### Onboarding (`POST /api/auth/onboarding`)

Guarda en `tenant.settings.profile`:

- `professionalName`, `specialty`, `country`, `notes`
- Marca `User.onboardingCompletedAt`

Telefono ya capturado en registro; onboarding lo precarga.

## Modelos backend

### User

- `fullName`, `email`, `phone`, `passwordHash`, `role`, `status`
- `emailVerified`, `emailVerificationCode`, `emailVerificationExpiresAt`
- `passwordResetTokenHash`, `passwordResetExpiresAt`
- `onboardingCompletedAt`

### Tenant.settings.profile

Objeto JSON con datos profesionales del onboarding.

## Endpoints auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/verify-email-public`
- `POST /api/auth/resend-verification`
- `POST /api/auth/resend-verification-public`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `PATCH /api/auth/profile`
- `POST /api/auth/onboarding`
- `GET /api/auth/me`

## Pantallas

| Ruta | Proposito |
|------|-----------|
| `/registro` | Alta cuenta + tenant |
| `/verificar-correo` | OTP correo |
| `/login` | Acceso + enlace olvide contrasena |
| `/olvide-contrasena` | Solicitar reset |
| `/restablecer-contrasena` | Nueva contrasena |
| `/onboarding` | Perfil profesional inicial |
| `/cuenta` | Perfil + cambio contrasena |
| `/dashboard` | Panel principal |

## Implementacion frontend

- `AuthShell`, `auth.css`, `FormField` con iconos y toggle contrasena.
- `utils/auth-form.ts` — validacion registro, OTP/reset preview en dev.
- `utils/auth-routing.ts` — redireccion post-login.
- `middleware/auth.global.ts` — guards de sesion, verificacion y onboarding.
- `useMedfileApi` — redirige en 401 y 403 `EMAIL_NOT_VERIFIED`.

## Pendientes produccion

- Envio real de correo (SMTP/Resend) para OTP y reset.
- Refresh tokens httpOnly.
- Cambio de email con re-verificacion.
- Verificacion SMS/WhatsApp del telefono.
- MFA opcional, rate limiting, auditoria de login.

## Decision de sesion

JWT de acceso en `localStorage` para el corte actual. Migrar a cookies httpOnly antes de produccion con datos clinicos reales.
