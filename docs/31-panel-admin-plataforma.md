# Panel admin de plataforma Medfile

Consola interna para el **equipo Medfile** (no para médicos clientes): ver consultorios registrados, estados de cuenta y configurar medios de pago (Mercado Pago, QR Banco Económico).

Complementa [12-seguridad-tenant-sesion.md](./12-seguridad-tenant-sesion.md) y [30-banco-economico-qr-bolivia.md](./30-banco-economico-qr-bolivia.md).

> **Estado:** MVP implementado — overview, listado clientes, configuración pagos. Sin edición avanzada de tenants ni impersonación.

---

## Acceso

| Regla | Detalle |
|-------|---------|
| **Quién entra** | Usuarios cuyo email está en `MEDFILE_ADMIN_EMAILS` (env, separado por comas) |
| **Login admin** | Pantalla dedicada `/admin/login` → `POST /api/auth/admin/login` |
| **Login médico** | `/login` no concede admin aunque el email esté en la allowlist |
| **Autorización** | `PlatformAdminGuard` en API + middleware `admin` en web |
| **Rutas web** | `/admin/login`, `/admin`, `/admin/clientes`, `/admin/configuracion` |

No es un rol MongoDB separado en MVP: es **allowlist por email** en servidor. El endpoint `admin/login` rechaza credenciales válidas de médicos que no estén en la lista (`403`).

### Flujo de acceso admin

```text
/admin o /admin/*
  → sin sesión → /admin/login
  → POST /api/auth/admin/login (email + contraseña)
  → API valida credenciales Y allowlist MEDFILE_ADMIN_EMAILS
  → JWT en localStorage → /admin

/admin/login con sesión médica normal
  → no redirige al dashboard; permite iniciar sesión admin explícita
```

Variables de entorno: solo `MEDFILE_ADMIN_EMAILS` (no hay contraseña admin en env).

---

## Pantallas

### `/admin` — Resumen

- Métricas: consultorios, usuarios, suscripciones, planes de pago activos.
- Enlaces a clientes y configuración.

### `/admin/clientes` — Médicos / tenants

Tabla con:

- Nombre consultorio + Código Medfile
- Titular (nombre, email, verificación, status usuario)
- Plan y estado suscripción
- Proveedor de pago (mock / mercadopago / economico_qr)

API: `GET /api/admin/clients`

### `/admin/configuracion` — Pagos

- Proveedor por defecto
- Toggles Mercado Pago / QR Banco Económico
- Texto comercio e instrucciones QR

API: `GET|PATCH /api/admin/settings/payments`

**Secrets** (tokens MP, client secret BE) solo en variables de entorno — no editables desde UI.

---

## API admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/admin/login` | Login exclusivo admin (credenciales + allowlist) |
| GET | `/api/admin/overview` | Contadores plataforma |
| GET | `/api/admin/clients` | Listado tenants + owner + subscription |
| GET | `/api/admin/settings/payments` | Config pagos |
| PATCH | `/api/admin/settings/payments` | Actualizar toggles (sin secrets) |

Todas requieren header `Authorization: Bearer` + email admin.

---

## Modelo de datos

### `PlatformSettings`

```ts
{
  scope: 'global',
  payments: {
    defaultProvider: 'mock' | 'mercadopago' | 'economico_qr',
    mercadopagoEnabled: boolean,
    economicoQrEnabled: boolean,
    economicoMerchantLabel: string,
    economicoInstructions?: string,
  }
}
```

---

## Seguridad

- Guard independiente de `TenantAuthGuard` para rutas `/api/admin/*`.
- No exponer `/admin` en navegación médica (`DoctorShell`).
- En producción: emails admin corporativos, HTTPS obligatorio.
- Auditoría de cambios en settings: **fase 2** (registro en `AuditLog`).

---

## Roadmap admin

| Fase | Entregable |
|------|------------|
| **MVP (hoy)** | Overview, clientes, config pagos |
| **2** | Buscar/filtrar clientes, suspender tenant |
| **3** | Ver uso (pacientes, storage) por tenant |
| **4** | Reenvío manual activación plan tras QR confirmado |
| **5** | Impersonación soporte (solo lectura, auditada) |

---

## Relación con Fase 1 (equipo médico)

El panel admin **no** gestiona asistentes del médico — eso es `/cuenta/equipo` del tenant (doc [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md)).

Orden sugerido de implementación:

1. ✅ Precios BOB + admin + QR BE (este corte)
2. ⬜ Fase 1: rol asistente plan Básico (doc 29)

---

## Archivos

| Capa | Ruta |
|------|------|
| API módulo | `apps/api/src/modules/admin/` |
| Guard | `apps/api/src/modules/admin/platform-admin.guard.ts` |
| Web layout | `apps/web/layouts/admin.vue` |
| Web páginas | `apps/web/pages/admin/*.vue` |
| Login admin | `apps/web/pages/admin/login.vue` |
| Middleware | `apps/web/middleware/admin.ts` |
| Rutas admin | `apps/web/utils/admin-routes.ts` |
| Helper | `apps/api/src/common/platform-admin.ts` |

---

## Documentos relacionados

- [30-banco-economico-qr-bolivia.md](./30-banco-economico-qr-bolivia.md)
- [26-mercadopago-bolivia.md](./26-mercadopago-bolivia.md)
- [17-funcionalidad-catalogo.md](./17-funcionalidad-catalogo.md)
