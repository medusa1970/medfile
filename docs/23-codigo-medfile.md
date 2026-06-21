# Codigo Medfile — identificador publico del consultorio

Cada medico independiente en Medfile recibe al registrarse un **Codigo Medfile** unico: identificador publico del consultorio para conectar con colegas en la plataforma **sin exponer datos internos** (slug, MongoDB id, email).

---

## Nombre comercial

| Termino | Uso |
|---------|-----|
| **Codigo Medfile** | UI, marketing, soporte (recomendado) |
| `medfileCode` | Campo tecnico en API y base de datos |

Ejemplo visible: **`MF-K7R4N2`**

---

## Formato

```text
MF-XXXXXX
 │    └── 6 caracteres (A-Z, 2-9; sin 0/O, 1/I/L)
 └── prefijo de marca Medfile
```

Reglas:

- Generado **automaticamente** en el registro (`TenantsService.createFreeTenant`).
- **Unico** en toda la plataforma (indice MongoDB).
- **Inmutable** en operacion normal (cambio solo por soporte excepcional).
- Entrada flexible: `MF-K7R4N2`, `k7r4n2`, `MFK7R4N2` → normaliza a `MF-K7R4N2`.
- Validacion: `packages/types/src/medfile-code.ts` → `isValidMedfileCode()`, `normalizeMedfileCode()`.

Por que no email ni slug:

- El email es privado y cambia.
- El slug es tecnico y puede repetir patrones confusos.
- El codigo es **corto, dictable por telefono** y pensado para referencias entre colegas.

---

## Donde aparece

| Pantalla | Proposito |
|----------|-----------|
| Onboarding | Primera vez que el medico ve su codigo |
| Dashboard | Copiar y compartir |
| `/compartidos` | Identidad al recibir solicitudes |
| Ficha paciente → **Compartir con colega** | Abre `/pacientes/[id]/compartir` (vista dedicada) |

---

## API

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/tenants/me/code` | Codigo del tenant autenticado |
| GET | `/api/tenants/lookup/:code` | Perfil publico del consultorio (nombre, codigo, medico) |
| POST | `/api/clinical-shares` | Compartir historial usando `targetMedfileCode` |

Respuesta lookup (sin datos sensibles):

```json
{
  "id": "...",
  "name": "Consultorio Rivas",
  "medfileCode": "MF-K7R4N2",
  "ownerName": "Ana Rivas",
  "isSelf": false
}
```

Incluido en `POST /api/auth/register`, login y `GET /api/auth/me` → `tenant.medfileCode`.

---

## Flujo medico A → medico B

1. **B** comparte su codigo `MF-XXXXXX` (WhatsApp, verbal, tarjeta).
2. **A** (titular del paciente) abre ficha → Compartir con colega → ingresa codigo.
3. API valida codigo → crea `ClinicalShare` en estado `pending`.
4. **B** acepta en `/compartidos` → acceso temporal de lectura.

Detalle de permisos e intenciones: [22-intercambio-historiales-entre-medicos.md](./22-intercambio-historiales-entre-medicos.md).

---

## Seguridad

- Lookup requiere **sesion JWT** (medico autenticado); no es publico anonimo.
- Lookup **no** devuelve pacientes, emails de tenant ni metricas.
- No permite enumerar codigos secuenciales (generacion aleatoria).
- Compartir historial exige **consentimiento del paciente** registrado.

---

## Implementacion

| Archivo | Rol |
|---------|-----|
| `packages/types/src/medfile-code.ts` | Tipos y validacion |
| `apps/api/src/common/medfile-code-generator.ts` | Generacion aleatoria |
| `apps/api/src/modules/tenants/tenant.schema.ts` | Campo `medfileCode` |
| `apps/api/src/modules/clinical-shares/` | Compartir por codigo |
| `apps/web/components/app/MedfileCodeCard.vue` | UI copiar codigo |

Tenants existentes sin codigo: `TenantsService.ensureMedfileCode()` al leer el tenant.

---

## Documentos relacionados

- [22-intercambio-historiales-entre-medicos.md](./22-intercambio-historiales-entre-medicos.md)
- [12-seguridad-tenant-sesion.md](./12-seguridad-tenant-sesion.md)
- [06-auth-onboarding.md](./06-auth-onboarding.md)
