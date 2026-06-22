# Suscripciones, planes y limites

> **Modelo:** **1 medico independiente = 1 tenant = 1 suscripcion.** Precios y costos: [24-planes-medico-independiente-bolivia.md](./24-planes-medico-independiente-bolivia.md).  
> Freemium permanente. El plan `trial` en codigo es **legacy** → `free`.

## Objetivo

Medfile monetiza **por medico**, no por clinica ni grupo. El medico **nunca pierde acceso a sus datos** por no pagar. El Plan Gratis debe ser util; el pago desbloquea capacidad y automatizacion.

## Principios

- Cada registro crea un `Tenant` y una `Subscription` propios.
- Alta → plan **`free`** activo, sin vencimiento.
- **Siempre 1 usuario** (el medico) en todos los planes del **MVP actual**.
- **Roadmap:** Basico = medico + 1 asistente; Profesional = medico + 2 colaboradores (asistente + captura clinica). Ver [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md).
- Limites desde el plan actual; backend es autoridad.
- No borrar datos por impago; bloquear solo premium y topes de creacion.
- **WhatsApp automatico:** incluido en planes de pago con cupo mensual ([25](./25-whatsapp-incluido-en-planes.md)).

## Planes (vigentes)

| Plan | USD/mes | Pacientes | Storage | Subidas/mes | WhatsApp/mes | Usuarios (MVP) | Usuarios (objetivo) |
|------|---------|-----------|---------|-------------|--------------|----------------|---------------------|
| Gratis | 0 | 50 | 2 GB | 30 | 0 | 1 | 1 |
| Basico | 14 | 200 | 8 GB | 150 | 100 | 1 | **2** (medico + asistente) |
| Profesional | 32 | 800 | 25 GB | 500 | 600 | 1 | **3** (medico + 2 colaboradores) |

Codigo vigente: `limits.users` — Gratis **1**, Basico **2**, Profesional **3**. Ver doc [29](./29-equipo-colaboradores-y-acceso-delegado.md).

### Gratis
Historia clinica, documentos, wa.me, Codigo Medfile. Sin automatizacion email/WA API.

### Basico
Email + **100 WhatsApp/mes incluidos**, mas capacidad, branding.

### Profesional
Alto volumen **mismo medico**, **600 WhatsApp/mes**, automatizaciones, **compartir historial con colega**, captura clinica delegada (enfermeria), reportes.

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

- `/suscripcion`: plan, uso, comparativa; **precios en BOB**; Mercado Pago + QR Banco Económico
- Checkout pausado en produccion por defecto: sin `NUXT_PUBLIC_PAYMENTS_CHECKOUT_ENABLED=true`, los botones de pago siguen visibles y al pulsarlos muestran un toast flotante (sin banner superior ni iniciar checkout).

## Pago

**Moneda comercial:** bolivianos (BOB) en UI; referencia USD secundaria (`packages/types/src/plans.ts`).

| Proveedor | Doc | Endpoints |
|-----------|-----|-----------|
| Mercado Pago (recurrente) | [26](./26-mercadopago-bolivia.md) | `POST /api/payments/checkout`, webhook MP |
| QR Banco Económico | [30](./30-banco-economico-qr-bolivia.md) | `POST /api/payments/economico-qr/checkout` |
| Opciones visibles | [31](./31-panel-admin-plataforma.md) | `GET /api/payments/options` |

- `POST /api/payments/sync-checkout`
- Modo mock sin credenciales (`PAYMENTS_PROVIDER=mock`)

## Documentos relacionados

- [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md)
- [24-planes-medico-independiente-bolivia.md](./24-planes-medico-independiente-bolivia.md)
- [18-modelo-freemium-y-oferta.md](./18-modelo-freemium-y-oferta.md)
- [30-banco-economico-qr-bolivia.md](./30-banco-economico-qr-bolivia.md)
- [31-panel-admin-plataforma.md](./31-panel-admin-plataforma.md)
