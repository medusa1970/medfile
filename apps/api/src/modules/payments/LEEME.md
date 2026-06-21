# Kit Medfile — cobro QR Banco Económico

**Empieza aquí.** Esta carpeta es todo lo que necesitas copiar a Medfile para cobrar con QR del Banco Económico igual que en SiiPi.

> **Estado en Medfile (2026-06):** kit **integrado** — ver `payments.service.ts`, `qr-payment.schema.ts`, `docs/30-banco-economico-qr-bolivia.md`. Persistencia en MongoDB (`QrPayment`), no PostgreSQL del paso 4.

---

## ¿Qué es esto en una frase?

Tu API genera un QR con monto fijo en BOB → el cliente paga con su app bancaria → el banco avisa por webhook → activas el plan (mensual/trimestral/anual).

**No copies nada de SiiPi** excepto los archivos de esta carpeta `medfile-kit/`.

---

## Qué tienes que hacer (orden)

| # | Acción | ¿Obligatorio? |
|---|--------|---------------|
| 0 | Pedir credenciales al banco (carta BEC QR Connect) | Sí, para producción/sandbox real |
| 1 | Copiar archivos `.ts` de esta carpeta a Medfile | Sí |
| 2 | Añadir variables al `.env` | Sí |
| 3 | Registrar `PaymentsModule` en la app | Sí |
| 4 | Crear tabla `qr_payments` en tu BD | Sí |
| 5 | Completar los `TODO` en `payments.service.ts` | Sí |
| 6 | Registrar URL webhook con el banco | Sí, antes de producción |
| 7 | Pantalla Nuxt que muestre el QR y haga polling | Sí (frontend) |

---

## Paso 0 — Credenciales del banco (antes de codear en serio)

Sin esto el QR no funciona contra Baneco real. Solicita al **Banco Económico**:

- `userName` — código usuario API  
- `password` — clave en texto plano (el código la cifra solo)  
- `aesKey` — llave AES 256 bits  
- `accountCredit` — número de cuenta donde entra el dinero  

Carta modelo: `../6-15-2026/CARTA MODELO - SERVICIO BEC QR CONNECT.DOCX`

Mientras no tengas credenciales, puedes montar el código y probar que compila; las llamadas al banco fallarán hasta tenerlas.

---

## Paso 1 — Copiar archivos a Medfile

Copia **toda** la carpeta `medfile-kit/` (solo los `.ts`, no este LEEME si no quieres) a:

```
apps/api/src/modules/payments/
├── economico-qr.service.ts      ← cliente HTTP del banco
├── payments.service.ts          ← tu lógica (checkout, webhook, activar plan)
├── payments.controller.ts       ← POST checkout, GET status
├── economico-webhook.controller.ts  ← POST webhook (público)
└── payments.module.ts
```

Ajusta rutas de import si tu monorepo usa otros alias (`@/`, etc.).

---

## Paso 2 — Variables de entorno

Copia `.env.example` a tu `.env` de Medfile y rellena:

```env
BANECO_USER_NAME=
BANECO_PASSWORD=
BANECO_AES_KEY=
BANECO_ACCOUNT_CREDIT=
BANECO_BASE_URL=https://apimktdesa.baneco.com.bo/ApiGateway
BANECO_BRANCH_CODE=
```

| Variable | Secreto |
|----------|---------|
| `BANECO_PASSWORD`, `BANECO_AES_KEY`, `BANECO_ACCOUNT_CREDIT` | **Sí** — no commitear |

---

## Paso 3 — Registrar el módulo

En `apps/api/src/app.module.ts` (o donde registres módulos):

```typescript
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    // ...otros módulos
    PaymentsModule,
  ],
})
export class AppModule {}
```

---

## Paso 4 — Tabla en base de datos

Guarda cada intento de cobro para idempotencia y webhook. Ejemplo SQL:

```sql
CREATE TABLE qr_payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  plan          VARCHAR(20) NOT NULL,  -- monthly | quarterly | yearly
  order_id      VARCHAR(50) NOT NULL UNIQUE,
  qr_id         VARCHAR(80) NOT NULL,
  amount        NUMERIC(12,2) NOT NULL,
  currency      VARCHAR(3) NOT NULL DEFAULT 'BOB',
  status        VARCHAR(20) NOT NULL DEFAULT 'pending',
  expires_at    TIMESTAMPTZ NOT NULL,
  paid_at       TIMESTAMPTZ,
  raw_webhook   JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX qr_payments_qr_id_idx ON qr_payments (qr_id);
CREATE INDEX qr_payments_user_status_idx ON qr_payments (user_id, status);
```

Adapta a Prisma/TypeORM según uses en Medfile.

---

## Paso 5 — Completar TODOs en `payments.service.ts`

Abre `payments.service.ts` y busca `TODO`. Debes conectar:

1. **`savePendingPayment`** — insertar fila `pending` tras generar QR  
2. **`findByQrId` / `findByOrderId`** — para webhook e idempotencia  
3. **`markPaid`** — `pending` → `paid` + **`activateSubscription(userId, plan)`**  

La parte del **banco** ya está en `economico-qr.service.ts`; no la toques salvo credenciales.

---

## Paso 6 — Webhook con el banco

Registra esta URL **pública HTTPS** en homologación Baneco:

```
POST https://TU-DOMINIO/api/webhooks/economico
```

El banco enviará pagos confirmados ahí. Tu API debe responder siempre:

```json
{ "responseCode": 0, "message": "" }
```

---

## Paso 7 — Endpoints que expone Medfile

| Método | Ruta | Auth | Uso |
|--------|------|------|-----|
| `POST` | `/api/payments/checkout/qr` | Usuario logueado | Genera QR para un plan |
| `GET` | `/api/payments/checkout/:id/status` | Usuario logueado | Polling cada 2–3 s |
| `POST` | `/api/webhooks/economico` | **Público** (llama el banco) | Confirma pago |

### Body checkout (ejemplo)

```json
{
  "plan": "monthly"
}
```

Montos BOB — edita el mapa `PLAN_PRICES` en `payments.service.ts`.

### Response checkout

```json
{
  "checkoutId": "uuid-interno",
  "qrImage": "data:image/png;base64,...",
  "expiresAt": "2026-06-21T15:00:00.000Z",
  "status": "pending"
}
```

---

## Paso 8 — Frontend Nuxt (mínimo)

1. Usuario elige plan → `POST /api/payments/checkout/qr`  
2. Muestra `<img :src="qrImage" />` + countdown hasta `expiresAt`  
3. Cada 2–3 s → `GET /api/payments/checkout/:id/status`  
4. Si `status === 'paid'` → redirigir a dashboard / plan activo  
5. Si `expired` → botón «Generar nuevo QR» (nuevo checkout)

---

## Flujo visual

```
Usuario → elige plan
    ↓
API → Baneco generateQR → guarda pending en BD → devuelve imagen QR
    ↓
Usuario → escanea y paga en app bancaria
    ↓
Baneco → POST /api/webhooks/economico
    ↓
API → marca paid + activa suscripción
    ↓
Nuxt (polling) → ve paid → pantalla de éxito
```

---

## Qué NO copiar de SiiPi

| SiiPi | Por qué no |
|-------|------------|
| `pos-qr-payment/*` completo | Multi-PV, Mongo, establecimientos |
| `POS_QR_SECRET` | Cifrado credenciales por PV en SiiPi |
| Credenciales de producción SiiPi | Cuenta/comercio distinto |
| `mock-qr.provider.ts` | Solo dev interno SiiPi |

---

## Documentación extra (si algo falla)

| Doc | Para qué |
|-----|----------|
| [INTEGRACION_BANCO_ECONOMICO.md](../INTEGRACION_BANCO_ECONOMICO.md) | Detalle técnico API Baneco, curl, errores |
| [ALCANCE_TECNICO.md](../ALCANCE_TECNICO.md) | Cómo lo usa SiiPi en caja |
| Spec PDF `Api Market Baneco v1.3.0` | Contrato oficial del banco |

---

## Checklist rápido

- [ ] Copié los 5 archivos `.ts` a `apps/api/src/modules/payments/`
- [ ] `.env` con `BANECO_*` rellenado
- [ ] `PaymentsModule` importado en `AppModule`
- [ ] Tabla `qr_payments` creada
- [ ] TODOs de `payments.service.ts` implementados
- [ ] Webhook registrado con el banco
- [ ] Pantalla Nuxt con QR + polling

Cuando marques todo, ya puedes cobrar planes en BOB con Baneco.
