# Suscripciones, planes y limites

> **Modelo:** **1 medico independiente = 1 tenant = 1 suscripcion.** Precios y costos: [24-planes-medico-independiente-bolivia.md](./24-planes-medico-independiente-bolivia.md).  
> Freemium permanente. El plan `trial` en codigo es **legacy** → `free`.

## Objetivo

Medfile monetiza **por medico**, no por clinica ni grupo. El medico **nunca pierde acceso a sus datos** por no pagar. El Plan Gratis debe ser util; el pago desbloquea capacidad y automatizacion.

## Principios

- Cada registro crea un `Tenant` y una `Subscription` propios.
- Alta → plan **`free`** activo, sin vencimiento.
- **Siempre 1 usuario** (el medico) en todos los planes del MVP.
- Limites desde el plan actual; backend es autoridad.
- No borrar datos por impago; bloquear solo premium y topes de creacion.
- **WhatsApp automatico:** incluido en planes de pago con cupo mensual ([25](./25-whatsapp-incluido-en-planes.md)).

## Planes (vigentes)

| Plan | USD/mes | Pacientes | Storage | Subidas/mes | WhatsApp/mes | Usuarios |
|------|---------|-----------|---------|-------------|--------------|----------|
| Gratis | 0 | 50 | 2 GB | 30 | 0 | 1 |
| Basico | 14 | 200 | 8 GB | 150 | 100 | 1 |
| Profesional | 32 | 800 | 25 GB | 500 | 600 | 1 |

Codigo: `packages/types/src/plans.ts`.

### Gratis
Historia clinica, documentos, wa.me, Codigo Medfile. Sin automatizacion email/WA API.

### Basico
Email + **100 WhatsApp/mes incluidos**, mas capacidad, branding.

### Profesional
Alto volumen **mismo medico**, **600 WhatsApp/mes**, automatizaciones, compartir historial, reportes.

## Uso WhatsApp

- Campo `whatsappMessagesUsedThisMonth` en `Subscription`.
- Campo `usagePeriodMonth` (`YYYY-MM`) — al cambiar mes se resetean contadores mensuales (lazy, en cada lectura/escritura).
- API expone `usage.whatsappMessages: { used, limit }` y `usageWarnings` (recursos >= 80 %).
- Aviso al **80 %**; bloqueo nuevos envios al **100 %** (cuando exista envio API).

## Enforcement de limites (Fase 1)

Servicio `PlanLimitsService` (`apps/api/.../plan-limits.service.ts`):

| Accion | Recurso | HTTP si excede |
|--------|---------|----------------|
| Crear paciente | `patients` | 403 `PLAN_LIMIT_EXCEEDED` |
| Crear solicitud subida | `uploadRequests` | 403 |
| Completar subida (archivo) | `storage` | 403 |
| WhatsApp automatico (futuro) | `whatsappMessages` | 403 |

Contadores sincronizados: pacientes (count DB en cada `/me` y `/subscriptions/current`), subidas (+1 al crear), storage (+bytes al completar subida).

## Estados de suscripcion

| Estado | Significado |
|--------|-------------|
| `active` | Plan free o pagado en regla |
| `past_due` | Pago fallido; lectura OK; pausar premium |
| `canceled` | Vuelta a free |
| `suspended` | Excepcion |

## Endpoints

- `GET /api/subscriptions/current`
- `GET /api/subscriptions/plans`
- `POST /api/subscriptions/simulate-upgrade` (dev)

## Pantalla web

- `/suscripcion`: plan, uso, comparativa, checkout (pendiente)

## Pago

Mercado Pago (Bolivia) — ver [26-mercadopago-bolivia.md](./26-mercadopago-bolivia.md).

- `POST /api/payments/checkout`
- `POST /api/payments/sync-checkout`
- `POST /api/webhooks/mercadopago`
- `/suscripcion`: checkout real + modo mock sin credenciales

## Documentos relacionados

- [24-planes-medico-independiente-bolivia.md](./24-planes-medico-independiente-bolivia.md)
- [18-modelo-freemium-y-oferta.md](./18-modelo-freemium-y-oferta.md)
- [25-whatsapp-incluido-en-planes.md](./25-whatsapp-incluido-en-planes.md)
