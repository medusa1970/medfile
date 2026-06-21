# WhatsApp incluido en el plan (analisis Bolivia)

Medfile **incluye** mensajes WhatsApp automaticos en los planes de pago. El medico paga **una sola suscripcion**; no hay factura aparte de Meta ni recargas de mensajes en el MVP.

Complementa [24-planes-medico-independiente-bolivia.md](./24-planes-medico-independiente-bolivia.md) y reemplaza el modelo “pass-through” de [21-whatsapp-cobro-por-medico-bolivia.md](./21-whatsapp-cobro-por-medico-bolivia.md) para planes de pago.

---

## Decision de producto

| Antes | Ahora |
|-------|-------|
| WhatsApp API aparte (~Bs 0,08/msg) | **Incluido** en Basico / Profesional |
| Medico gestiona saldo Meta | Medfile gestiona cupo mensual |
| Precio “bajo” + variable oculta | Precio **todo incluido** con limite claro |

**Gratis:** solo `wa.me` manual (0 mensajes API automaticos).

**Al llegar al 80 %** del cupo: aviso en `/suscripcion` y al enviar.  
**Al 100 %:** se pausan nuevos WhatsApp automaticos hasta el mes siguiente o **upgrade** de plan.

---

## Costo Meta (Bolivia +591)

| Concepto | Valor |
|----------|-------|
| Categoria obligatoria | **Utility** (recordatorio cita, link subida) |
| USD / mensaje entregado | **0,0113** |
| ~BOB / mensaje (×7) | **~0,08 Bs** |
| Marketing (no usar) | 0,074 USD — 6,5× mas caro |

Constante en codigo: `WHATSAPP_UTILITY_USD_PER_MESSAGE` en `packages/types/src/plans.ts`.

---

## Que cuenta como “1 mensaje”

Solo **plantillas automaticas** enviadas por Medfile **al paciente**:

| Evento | Cuenta | Tipico |
|--------|:------:|--------|
| Recordatorio de cita (24h antes) | 1 | 1 por cita |
| Solicitud / recordatorio “sube tu examen” | 1 | 1 por solicitud |
| Confirmacion post-agenda | 1 | opcional |
| Seguimiento “falta tu examen” | 1 | Profesional |
| Copia al medico | **0** | siempre email/app, no WA |
| Boton `wa.me` manual (Gratis) | **0** | abre WhatsApp del medico |

---

## Perfiles de uso — medico independiente

Estimacion mensual de **mensajes automaticos a pacientes**:

| Perfil | Pacientes vistos/mes | Citas con recordatorio | Links subida | Seguimientos | **Total msgs** |
|--------|---------------------|------------------------|--------------|--------------|----------------|
| **Liviano** | ~25 | 25 | 10 | 0 | **35** |
| **Regular** | ~60 | 55 | 25 | 5 | **85** |
| **Activo** | ~120 | 100 | 40 | 15 | **155** |
| **Muy activo** | ~200 | 160 | 60 | 30 | **250** |
| **Intensivo + automatizaciones** | ~300+ | 250 | 100 | 80 | **430+** |

Supuestos:

- ~1 recordatorio WhatsApp por cita agendada (no duplicar email + WA salvo config futura).
- ~40 % de solicitudes de subida disparan recordatorio WA (resto email o manual).
- Profesional con secuencias suma seguimientos.

**Conclusion:** un medico solo **regular** ronda **85 msgs/mes**; **activo** ~155. Un cupo de **100 (Basico)** cubre regular con margen; **600 (Profesional)** cubre intensivo con holgura (~20 msgs/dia).

---

## Cupos incluidos por plan

| Plan | WhatsApp auto / mes | ~msgs / dia | Cubre perfil | Costo Meta max* |
|------|---------------------|-------------|--------------|-----------------|
| **Gratis** | **0** | — | wa.me manual | $0 |
| **Basico** | **100** | ~3 | Liviano → regular | **~$1,13** |
| **Profesional** | **600** | ~20 | Activo → intensivo | **~$6,78** |

\* Si usa el 100 % del cupo. Uso medio real ~50–70 % del cupo.

Profesional no es “infinito” en codigo (riesgo de abuso), pero **600/mes** es **practico ilimitado** para un medico independiente. Copy comercial: *“600 recordatorios incluidos — uso intensivo sin calcular centavos.”*

---

## Precio todo incluido (recalibrado)

WhatsApp integrado → precio sube levemente vs $12/$29:

| Plan | USD/mes | ~BOB/mes | Incluye WhatsApp |
|------|---------|----------|------------------|
| Gratis | 0 | 0 | wa.me |
| **Basico** | **14** | **~98** | 100 msgs + email + resto |
| **Profesional** | **32** | **~224** | 600 msgs + automatizaciones |

### Economia unitaria (worst case 100 % cupo WA)

| Plan | Precio | Infra ~ | WA Meta max | Costo total ~ | Margen bruto ~ |
|------|--------|---------|-------------|---------------|----------------|
| Basico | $14 | $1,00 | $1,13 | $2,13 | **~85 %** |
| Profesional | $32 | $1,90 | $6,78 | $8,68 | **~73 %** |

Con uso medio (60 % cupo): margen **~88 %** Basico, **~80 %** Profesional.

---

## Facturacion anual y WhatsApp

Anual: **paga 10 meses, 12 meses de servicio** (`ANNUAL_BILLING_MONTHS_PAID = 10`). El cupo WhatsApp **sigue siendo mensual** (100 / 600); Medfile paga Meta cada mes del año contratado.

| Plan | Cobro anual | Costo Meta max 12 meses (100 % cupo) | Margen bruto anual ~ |
|------|-------------|--------------------------------------|----------------------|
| Basico | $140 / Bs 980 | ~$13,56 | **~82 %** |
| Profesional | $320 / Bs 2 240 | ~$81,36 | **~67 %** |

Con uso medio (~60 % cupo): **~86 %** Basico, **~78 %** Profesional. El plan anual es viable con WhatsApp incluido.

---

## Comportamiento cuando se acaba el cupo

| % usado | UX |
|---------|-----|
| 0–79 % | Normal |
| **80–99 %** | Banner: *“Has usado X de Y WhatsApp este mes. Si necesitas mas, pasa a Profesional.”* |
| **100 %** | Bloqueo nuevos WA auto; wa.me manual sigue; email sigue si aplica |
| Mes nuevo | Contador `whatsappMessagesUsedThisMonth` → 0 |

Upgrade **Basico → Profesional**: cupo pasa a 600 de inmediato (mes en curso: politica — sumar diferencia o reset; MVP: aplicar nuevo limite al instante).

---

## Por que no “ilimitado” real

| Riesgo | Mitigacion |
|--------|------------|
| Medico spamea pacientes | Cupo + plantillas Utility aprobadas |
| Costo Meta impredecible | 600 tope duro en Pro |
| Abuso de cuenta | Rate limit + auditoria (futuro) |

Si en datos reales muchos medicos topan 600, subir a 800 o add-on **+200 msgs** antes de “ilimitado”.

---

## Implementacion

| Pieza | Estado |
|-------|--------|
| `limits.whatsappMessagesPerMonth` en `plans.ts` | ✅ |
| `usage.whatsappMessages` en API suscripcion | ✅ |
| `whatsappMessagesUsedThisMonth` en schema | ✅ |
| Envio real WA + incremento contador | ⬜ |
| UI aviso 80 % / bloqueo 100 % | ✅ dashboard + `/suscripcion` |
| Reset mensual (lazy `usagePeriodMonth`) | ✅ |
| Enforcement API (pacientes, subidas, storage) | ✅ |

---

## Documentos relacionados

- [24-planes-medico-independiente-bolivia.md](./24-planes-medico-independiente-bolivia.md)
- [20-gratis-vs-pago.md](./20-gratis-vs-pago.md)
- [11-suscripciones-limites.md](./11-suscripciones-limites.md)
