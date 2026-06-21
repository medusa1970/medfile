# Seguridad, sesion y tenant context

## Objetivo

Medfile debe aislar los datos de cada medico. Ningun endpoint privado debe depender de un `x-tenant-id` enviado libremente por el navegador. El tenant debe salir de una sesion autenticada.

## Cambio de este corte

- Se agrega un guard JWT para endpoints privados.
- El backend extrae `tenantId`, `userId`, `role` y `email` del access token.
- Los controladores privados usan `@CurrentTenant()`.
- Los endpoints publicos de paciente por token siguen sin JWT.
- El frontend centraliza llamadas autenticadas con un composable.

## Implementacion actual

Backend:

- `SecurityModule` es **global** (`@Global()`), se importa en `AppModule` y registra `JwtModule` con `JWT_ACCESS_SECRET`. Exporta `TenantAuthGuard`, `JwtModule` y `UsersModule` para que cualquier modulo que use el guard resuelva dependencias en produccion (Railway).
- `TenantAuthGuard` valida Bearer token y adjunta `request.auth`.
- `CurrentTenant` expone el contexto autenticado a controladores.
- `PatientsController`, `EncountersController`, `DocumentsController` y `SubscriptionsController` ya usan tenant desde JWT para endpoints privados.

Frontend:

- `useMedfileApi` agrega `Authorization: Bearer <token>` desde `localStorage`, expone `clearSession()` y redirige a `/login?expired=1` ante respuestas `401`.
- `DoctorShell` muestra la cuenta activa y un boton **Cerrar sesion** al pie del menu lateral.
- El shell medico fija el sidebar a la altura de la ventana; solo `.app-main` hace scroll cuando el contenido es largo.
- Pantallas privadas usan el composable para llamadas protegidas.
- Si no hay sesion o el API no esta disponible, las pantallas mantienen fallback demo para desarrollo.

## Endpoints privados

- Pacientes.
- Consultas.
- Bandeja de documentos.
- Crear solicitudes de subida.
- Suscripcion actual.
- Simular cambio de plan.

## Endpoints publicos

- Registro.
- Login.
- Health.
- Catalogo de planes.
- Lectura/completado de solicitud de subida por token.

## Limitacion actual

El access token sigue en `localStorage` para desarrollo. En local expira segun `JWT_ACCESS_TTL_SECONDS` (por defecto 1 hora). Antes de produccion se debe migrar a:

- Cookie `httpOnly`.
- Refresh token rotativo.
- CSRF si aplica.
- Rate limiting.
- Auditoria de login y acceso clinico.

## HTTPS

En desarrollo local la web puede correr sobre `http://localhost:3100`, por lo que el navegador puede mostrar una advertencia en pantallas con campos de password. Ese aviso no bloquea el desarrollo.

En produccion, Medfile debe publicarse exclusivamente por HTTPS. No se deben enviar credenciales, tokens ni documentos clinicos sobre HTTP.

## Roles por tenant (actual y roadmap)

Hoy el JWT incluye `role`: `owner` | `doctor` | `assistant` | `clinical_capture` (`packages/types`, `user.schema.ts`).

| Rol | Estado | Alcance |
|-----|--------|---------|
| `owner` | ✅ | Medico titular; comparte con colegas; gestiona tenant |
| `doctor` | Reservado | Plan Clinica futuro |
| `assistant` | ✅ Basico+ | Admin delegado — [29](./29-equipo-colaboradores-y-acceso-delegado.md) |
| `clinical_capture` | ✅ Profesional | Captura clínica / cola del día — [29](./29-equipo-colaboradores-y-acceso-delegado.md) |

Matriz de permisos y convivencia con **compartir inter-tenant**: [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md) y [22-intercambio-historiales-entre-medicos.md](./22-intercambio-historiales-entre-medicos.md).

## Intercambio entre medicos

Por defecto **no hay acceso cross-tenant**. El **medico titular** puede compartir historial con otro medico Medfile (solo lectura temporal, colaboracion con notas, o transferencia del paciente):

- Consentimiento del paciente y registro en auditoria.
- Permisos granulares y expiracion; revocable por titular o paciente.
- Ver catalogo completo: [22-intercambio-historiales-entre-medicos.md](./22-intercambio-historiales-entre-medicos.md).

