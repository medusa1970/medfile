# Planes para medico independiente (Bolivia)

Medfile está diseñado para **medicos independientes**: **1 registro = 1 medico = 1 consultorio = 1 suscripcion**. No hay planes “por grupo” ni facturacion compartida entre colegas en el MVP.

Documento maestro de **precios, limites y costos** para calibrar la oferta en Bolivia. Complementa [20-gratis-vs-pago.md](./20-gratis-vs-pago.md), [25-whatsapp-incluido-en-planes.md](./25-whatsapp-incluido-en-planes.md) y [18-modelo-freemium-y-oferta.md](./18-modelo-freemium-y-oferta.md).

---

## Modelo comercial

| Regla | Detalle |
|-------|---------|
| **Quien se registra** | Un medico (owner) |
| **Quien paga** | Ese mismo medico, su tarjeta / cuenta |
| **Usuarios incluidos** | **1** | **2** (medico + asistente) | **3** (medico + 2 colaboradores) — [29](./29-equipo-colaboradores-y-acceso-delegado.md) |
| **Tenant** | Aislado; datos no se mezclan |
| **WhatsApp automatico** | **Incluido** en Basico / Profesional (cupo mensual) |
| **Tipo de cambio ref.** | 1 USD ≈ 7 BOB (ajustar en UI/checkout) |

**Futuro (fuera MVP):** plan Clinica multi-medico — distinto de asistente/captura clinica en doc [29](./29-equipo-colaboradores-y-acceso-delegado.md).

---

## Planes vigentes (codigo: `packages/types/src/plans.ts`)

| Plan | USD/mes | ~BOB/mes | Pacientes | Storage | Subidas/mes | WhatsApp auto/mes | Medico |
|------|---------|----------|-----------|---------|-------------|-------------------|--------|
| **Gratis** | 0 | 0 | 50 | 2 GB | 30 | 0 (wa.me) | 1 |
| **Basico** | **14** | **98** | 200 | 8 GB | 150 | **100** | 1 |
| **Profesional** | **32** | **224** | 800 | 25 GB | 500 | **600** | 1 |

Trimestral −10 %, **anual: paga 10 meses, 12 meses de servicio** (2 meses gratis). Misma logica en `calculatePlanChargeBob()` y landing.

Analisis de volumen WhatsApp: [25-whatsapp-incluido-en-planes.md](./25-whatsapp-incluido-en-planes.md).

---

## Que incluye cada plan (medico solo)

### Gratis — $0 / Bs 0

Para **conocer Medfile** sin riesgo: consultorio ordenado, datos que no expiran.

- Historia clinica, consultas, documentos, enlace paciente
- WhatsApp **manual** (`wa.me`) sin limite
- **Codigo Medfile** (compartir historial con colegas: plan Profesional)
- Sin recordatorios automaticos email/WhatsApp API

### Basico — $14 / ~Bs 98

Para el medico independiente con **consulta regular** que quiere automatizar recordatorios **sin calcular centavos**.

Todo Gratis, mas:

- Mas pacientes y storage (tabla arriba)
- **Cupo 100 WhatsApp automaticos/mes** (envio automatico proximamente)
- Recordatorios **email** (proximamente)
- Logo / nombre del consultorio en enlaces (proximamente)
- **1 asistente o secretaria** incluida: filiacion, enlaces de subida, bandeja y recordatorios ([29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md))

### Profesional — $32 / ~Bs 224

Para el **mismo medico** con **alto volumen** o automatizaciones avanzadas — **no** es plan multi-medico.

Todo Basico, mas:

- Mas pacientes, storage y subidas
- **Cupo 600 WhatsApp automaticos/mes** (envio automatico proximamente)
- **Enfermeria delegada:** signos vitales, cola del dia, triage (permiso temporal revocable)
- **Auditoria por usuario** en acciones del equipo
- Automatizaciones, **digest semanal** (proximamente)
- **Compartir historial** con colegas Medfile (Codigo Medfile; API exige plan Profesional)
- Reportes, soporte prioritario (proximamente)

---

## Costos para Medfile (por medico / mes)

Estimacion interna para **no perder dinero** con precios actuales. Cifras orientativas en USD.

### Infraestructura variable por medico

| Recurso | Gratis (activo) | Basico | Profesional |
|---------|-----------------|--------|-------------|
| MongoDB (cuota compartida) | ~$0,15 | ~$0,35 | ~$0,60 |
| Object storage (R2/S3 ~$0,015/GB) | ~$0,03 (2 GB) | ~$0,12 (8 GB) | ~$0,38 (25 GB) |
| Email transaccional (~100–300/mes) | $0 | ~$0,15 | ~$0,30 |
| Hosting / API (prorrateo) | ~$0,20 | ~$0,40 | ~$0,60 |
| **Subtotal infra** | **~$0,40** | **~$1,00** | **~$1,90** |

### WhatsApp Meta (incluido en precio, worst case 100 % cupo)

| Plan | Cupo msgs | Costo Meta max |
|------|-----------|----------------|
| Basico | 100 | ~$1,13 |
| Profesional | 600 | ~$6,78 |

### Margen bruto objetivo (plataforma + WA incluido)

| Plan | Precio | Costo est. (100 % WA) | Margen bruto ~ |
|------|--------|----------------------|----------------|
| Gratis | $0 | ~$0,40 | Inversion adquisicion |
| Basico | $14 | ~$2,13 | **~85 %** |
| Profesional | $32 | ~$8,68 | **~73 %** |

Con uso medio (~60 % cupo WA): margen **~88 %** Basico, **~80 %** Profesional.

---

## Costos para el medico (una sola factura)

| Concepto | Gratis | Basico | Profesional |
|----------|--------|--------|-------------|
| Suscripcion Medfile (todo incluido) | Bs 0 | **~Bs 98/mes** | **~Bs 224/mes** |
| WhatsApp extra | wa.me gratis | **0** (100 incl.) | **0** (600 incl.) |
| **Total aprox.** | **Bs 0** | **~Bs 98/mes** | **~Bs 224/mes** |

Al **80 %** del cupo WhatsApp: aviso en app. Al **100 %**: pausa WA auto hasta mes nuevo o upgrade.

**Anual:** paga **10 meses**, recibe **12 meses** de servicio (2 meses gratis). WhatsApp incluido sigue siendo **por mes** (100 Basico / 600 Profesional).

---

## Por que estos precios

| Antes | Problema | Ahora |
|-------|----------|-------|
| WA aparte (~Bs 0,08/msg) | Confuso; “precio bajo + sorpresa” | **Incluido** con cupo claro |
| $12 Basico sin WA | Margen estrecho si subsidiamos msgs | **$14** con 100 msgs |
| $29 Profesional | Insuficiente si WA intensivo | **$32** con 600 msgs |

---

## Matriz funcionalidad × plan (medico independiente)

| Funcionalidad | Gratis | Basico | Profesional |
|---------------|:------:|:------:|:-----------:|
| 1 medico (cuenta propia) | ✅ | ✅ | ✅ |
| Pacientes / consultas / documentos | ✅ | ✅ | ✅ |
| Codigo Medfile | ✅ | ✅ | ✅ |
| wa.me manual | ✅ | ✅ | ✅ |
| Email automatico | ❌ | 🟡 proximamente | 🟡 proximamente |
| WhatsApp automatico (incluido) | ❌ | **100/mes** cupo | **600/mes** cupo |
| Logo en enlaces | ❌ | 🟡 proximamente | 🟡 proximamente |
| Compartir historial con colega | ❌ | ❌ | ✅ |
| Digest / automatizaciones | ❌ | ❌ | 🟡 proximamente |
| Reportes avanzados | ❌ | ❌ | 🟡 proximamente |
| Asistente administrativo | ❌ | ✅ **1** | ✅ **hasta 2 slots** |
| Captura clinica (enfermeria delegada) | ❌ | ❌ | ✅ **1** |
| Auditoria por usuario | ❌ | ❌ | ✅ |

Detalle permisos y roadmap: [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md).

---

## Implementacion

| Capa | Archivo |
|------|---------|
| Planes y precios | `packages/types/src/plans.ts` |
| Uso WhatsApp | `subscription.schema.ts` → `whatsappMessagesUsedThisMonth` |
| API | `subscriptions.service.ts` → `usage.whatsappMessages` |
| Landing | `apps/web/pages/index.vue` |
| Suscripcion | `apps/web/pages/suscripcion/index.vue` |
| Compartir historial | `clinical-shares.service.ts` → `assertCanShareClinicalHistory` (plan Pro) |

---

## Documentos relacionados

- [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md)
- [25-whatsapp-incluido-en-planes.md](./25-whatsapp-incluido-en-planes.md)
- [11-suscripciones-limites.md](./11-suscripciones-limites.md)
- [20-gratis-vs-pago.md](./20-gratis-vs-pago.md)
- [23-codigo-medfile.md](./23-codigo-medfile.md)
