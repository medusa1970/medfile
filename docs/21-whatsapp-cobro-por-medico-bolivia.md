# WhatsApp: cobro por medico individual (Bolivia)

> **⚠️ Modelo superseded (jun 2026):** Los planes de pago ahora **incluyen** cupo WhatsApp mensual. Ver [25-whatsapp-incluido-en-planes.md](./25-whatsapp-incluido-en-planes.md) y [24-planes-medico-independiente-bolivia.md](./24-planes-medico-independiente-bolivia.md).  
> Este documento conserva **tarifas Meta** y **estimaciones de volumen** utiles para calibrar cupos.

Documento de producto y economia unitaria para Medfile en **Bolivia (+591)**. Complementa [18-modelo-freemium-y-oferta.md](./18-modelo-freemium-y-oferta.md) y [20-gratis-vs-pago.md](./20-gratis-vs-pago.md).

## Decision de negocio (historica — ver doc 25)

~~**Cada medico paga sus propios mensajes WhatsApp API.**~~ **Actual:** Medfile incluye cupo mensual en Basico (100) y Profesional (600); el precio de suscripcion absorbe el costo Meta promedio.

Ventajas del modelo **incluido** (vigente):

- Una sola factura para el medico — sin sorpresas de ~Bs 0,08/msg.
- Medfile controla abuso con cupos y avisos al 80 %.
- Margen predecible calibrando precio ($14 / $32) vs cupo.

Ventajas del modelo **pass-through** (descartado para MVP):

- Medfile puede **conocerse** con Plan Gratis generoso (`wa.me` sin costo) sin riesgo de factura Meta impredecible.
- El medico activo paga lo que usa; el margen de Medfile no depende del volumen de WhatsApp de otros.

---

## Tarifas Meta en Bolivia (+591)

Tarifas orientativas **por mensaje de plantilla entregado** (abril 2026). Verificar en [WhatsApp Business Platform Pricing](https://whatsappbusiness.com/es-la/products/platform-pricing/).

| Categoria | USD/msg | ~BOB/msg* | Uso en Medfile |
|-----------|---------|-----------|----------------|
| **Utility** | **0,0113** | **~0,08** | Recordatorio cita, link subida examen, aviso transaccional |
| Marketing | 0,0740 | ~0,52 | **No usar** para clinica |
| Service (ventana 24 h) | Gratis | 0 | Respuesta tras mensaje del paciente |
| Authentication | 0,0113 | ~0,08 | OTP / verificacion (futuro) |

\* Tipo de cambio referencial ~7 BOB/USD (ajustar en producto).

**Regla:** todo mensaje proactivo a paciente o medico debe ser plantilla **Utility** aprobada por Meta.

---

## Modelo tecnico: cada medico con su numero

```text
Medico A (tenant A)  -->  WABA A + numero +591...  -->  Meta factura uso de A
Medico B (tenant B)  -->  WABA B + numero +591...  -->  Meta factura uso de B
Medfile              -->  orquesta envios + plantillas + auditoria (sin absorber Meta)
```

Implementacion recomendada:

1. **Embedded Signup** — el medico conecta su WhatsApp Business desde ajustes de Medfile.
2. **Metodo de pago Meta** asociado al WABA del medico (modelo partner) **o** prepago/recarga en Medfile que se descuenta por mensaje.
3. Medfile **no envia** WhatsApp API en Plan Gratis; solo `wa.me` (costo cero para ambos).

Ver estrategia por fases en [18-modelo-freemium-y-oferta.md](./18-modelo-freemium-y-oferta.md#whatsapp-estrategia-recomendada).

---

## Que paga cada quien

| Concepto | Quien paga | Notas |
|----------|------------|-------|
| Suscripcion Medfile (Basico / Profesional) | Medico → Medfile | Capacidad y automatizacion · **1 medico por cuenta** |
| Mensajes WhatsApp API (Utility) | **Medico → Meta** (directo o via recarga Medfile) | ~Bs 0,08/msg en Bolivia |
| Boton `wa.me` manual | Nadie a Medfile | El medico usa su WhatsApp personal/Business |
| Email recordatorios | Medfile (costo bajo) | Incluido en plan de pago; preferir email al **medico** |
| Infraestructura Medfile | Medfile | MongoDB, storage, hosting |

---

## Calculo por medico individual (Bolivia)

Costo WhatsApp = `mensajes_entregados × 0,0113 USD`.  
Canal al **medico**: preferir **email + app** (casi gratis). Canal al **paciente**: WhatsApp API en planes de pago.

### Medico liviano (consultorio chico)

| Evento | Msgs/mes | USD | ~BOB |
|--------|----------|-----|------|
| Recordatorio cita → paciente | 25 | 0,28 | 2,0 |
| Link subida examen → paciente | 15 | 0,17 | 1,2 |
| Avisos al medico (email, no WA) | 0 WA | 0 | 0 |
| **Total WhatsApp del medico** | **40** | **0,45** | **~3,2** |

### Medico activo (agenda llena)

| Evento | Msgs/mes | USD | ~BOB |
|--------|----------|-----|------|
| Recordatorios cita → paciente | 80 | 0,90 | 6,3 |
| Links subida → paciente | 40 | 0,45 | 3,2 |
| Seguimiento “falta examen” | 20 | 0,23 | 1,6 |
| Alertas criticas → medico (WA) | 5 | 0,06 | 0,4 |
| **Total WhatsApp del medico** | **145** | **1,64** | **~11,5** |

### Medico muy activo (tope alto)

| Evento | Msgs/mes | USD | ~BOB |
|--------|----------|-----|------|
| Automatizaciones + secuencias | 400 | 4,52 | 31,6 |
| **Total WhatsApp del medico** | **400** | **4,52** | **~31,6** |

Incluso en el caso intenso, **~Bs 32/mes** en WhatsApp es razonable si el medico factura consultas normales; el riesgo para Medfile es **cero** si cada uno paga lo suyo.

---

## Planes Medfile vs WhatsApp (como presentarlo)

La suscripcion Medfile **habilita** la funcion; el **consumo WhatsApp lo paga el medico**.

| Plan | Precio plataforma (ref.) | WhatsApp API | Costo Meta para Medfile |
|------|--------------------------|--------------|-------------------------|
| **Gratis** | Bs 0 | Solo `wa.me` manual | **Bs 0** |
| **Basico** | **USD 12** (~Bs 84) | Automatizacion habilitada; **medico paga msgs** | **Bs 0** |
| **Profesional** | **USD 29** (~Bs 203) | + automatizaciones; **medico paga msgs** | **Bs 0** |

Opcional comercial:

- **Recarga prepago** en Medfile: paquetes de 100 msgs ≈ **Bs 17–20** (Meta ~Bs 8 + fee servicio).
- **Saldo visible** en `/suscripcion`: mensajes enviados, costo estimado, saldo restante.
- **Tope configurable** por medico: “no enviar si saldo = 0” (evita deuda).

---

## Estrategia “conocernos sin perder”

1. **Gratis permanente** con `wa.me` — adopcion sin friccion, costo cero Meta.
2. **No incluir** cupo “gratis” de API en Plan Gratis (salvo promo puntual controlada).
3. Al activar Basico: wizard **“Conecta tu WhatsApp”** + explicacion clara: *“Pagas ~Bs 0,08 por cada recordatorio automatico a tu paciente”*.
4. **Email al medico**, WhatsApp al paciente — reduce msgs ~40% sin perder valor.
5. **Cloud API directa Meta** al inicio — sin markup BSP de USD 0,005/msg.
6. Plantillas solo **Utility** — evitar Marketing (6,5× mas caro en Bolivia).

---

## Implementacion pendiente (backend / producto)

| Pieza | Estado |
|-------|--------|
| `wa.me` en solicitudes de subida | ✅ |
| `capabilities.whatsappAutomated` en planes | ✅ definido |
| Embedded Signup por tenant | ⬜ |
| Metodo de pago / saldo WhatsApp por tenant | ⬜ |
| Contador `whatsappMessagesUsedThisMonth` | ⬜ |
| UI saldo y consumo en `/suscripcion` | ⬜ |
| Webhooks entrega Meta | ⬜ |

Campos sugeridos en `Subscription` o `Tenant.settings`:

- `whatsappWabaId`, `whatsappPhoneNumberId`
- `whatsappBillingMode`: `meta_direct` | `medfile_prepaid`
- `whatsappPrepaidBalanceUsd` o `whatsappMessagesCredits`
- `whatsappMessagesUsedThisMonth`

---

## Documentos relacionados

- [20-gratis-vs-pago.md](./20-gratis-vs-pago.md)
- [18-modelo-freemium-y-oferta.md](./18-modelo-freemium-y-oferta.md)
- [11-suscripciones-limites.md](./11-suscripciones-limites.md)
- [19-servicios-adicionales-catalogo.md](./19-servicios-adicionales-catalogo.md) — add-on paquetes WhatsApp
