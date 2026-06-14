# Gratis vs. de pago — referencia rapida

Documento corto para tener **al alcance** que incluye cada grupo. Detalle comercial y costos: [24-planes-medico-independiente-bolivia.md](./24-planes-medico-independiente-bolivia.md).

**Modelo:** **1 medico = 1 cuenta = 1 pago.** No hay planes para grupos en el MVP.

**Regla:** los datos clinicos **nunca** se pierden por no pagar. Lo de pago son capacidad y automatizacion.

**WhatsApp automatico:** **incluido** en planes de pago (cupo mensual). Analisis: [25-whatsapp-incluido-en-planes.md](./25-whatsapp-incluido-en-planes.md).

---

## Planes (medico independiente)

| Plan | USD/mes | ~BOB/mes | WhatsApp auto/mes | Codigo API |
|------|---------|----------|-------------------|------------|
| **Gratis** | $0 | Bs 0 | 0 (wa.me) | `free` |
| **Basico** | **$14** | **~Bs 98** | **100** | `basic` |
| **Profesional** | **$32** | **~Bs 224** | **600** | `professional` |

---

## GRATIS — incluido para siempre

### Clinica y datos
- Hasta **50** pacientes
- Historia clinica, consultas, antecedentes, urgencias
- Timeline, alertas, busqueda, dashboard
- **Codigo Medfile** para identificarte entre colegas
- Lectura y edicion de todo lo ya guardado

### Documentos
- Enlace subida paciente (**30**/mes)
- Bandeja de documentos
- **WhatsApp manual** (`wa.me`) sin limite

### Cuenta
- **1 medico** (tu cuenta)
- **2 GB** storage
- Exportacion limitada

---

## DE PAGO — Basico ($14 / ~Bs 98)

Todo lo **Gratis**, mas:

- Hasta **200** pacientes · **8 GB** · **150** subidas/mes
- **1 medico** (sin asistente en este plan)
- **100 WhatsApp automaticos/mes incluidos**
- Recordatorios **email**
- Logo del consultorio en enlaces

---

## DE PAGO — Profesional ($32 / ~Bs 224)

Todo lo **Basico**, mas:

- Hasta **800** pacientes · **25 GB** · **500** subidas/mes
- **600 WhatsApp automaticos/mes incluidos** (uso intensivo)
- Automatizaciones y **digest semanal**
- **Compartir historial** con colegas Medfile (permisos, alcance, duracion y revocacion por el medico titular)
- Reportes y soporte prioritario

### Compartir historial — que significa en producto

| Aspecto | Comportamiento |
|---------|----------------|
| **Quien inicia** | Solo el medico titular del paciente |
| **Con quien** | Otro medico Medfile identificado por **Codigo Medfile** |
| **Que se comparte** | Bloques del historial elegidos por el titular (consultas, docs, antecedentes, etc.) |
| **Permisos** | Por defecto **solo lectura** en el MVP; colaborar y transferir: fases siguientes |
| **Restricciones** | Sin mezclar tenants; acceso temporal; revocable antes del vencimiento |
| **Plan** | **Profesional** (`clinicalShare: true`) |
| **Registro / Gratis** | Codigo Medfile activo; mensaje en `/registro` y landing `#planes` |

Ver flujos completos: [22-intercambio-historiales-entre-medicos.md](./22-intercambio-historiales-entre-medicos.md).

---

## Cupo WhatsApp — que pasa si se acaba

| % usado | Comportamiento |
|---------|----------------|
| 0–79 % | Normal |
| **80–99 %** | Aviso: considera upgrade a Profesional |
| **100 %** | Pausa WA automatico; wa.me y email siguen |

---

## Add-ons (futuro)

| Add-on | Descripcion |
|--------|-------------|
| + pacientes / storage | Bloques sobre el tope |
| +200 msgs WhatsApp | Solo si datos muestran demanda sobre 600 |
| Asistente / plan Clinica | Producto aparte (no MVP) |

---

## Si deja de pagar (vuelve a Gratis)

| Sigue | Se pausa |
|-------|----------|
| Leer/editar pacientes y documentos | Crear sobre tope Gratis |
| wa.me manual | WhatsApp automatico |
| Codigo Medfile (lectura) | Email auto, share historial, digest |

---

## Documentos relacionados

- [24-planes-medico-independiente-bolivia.md](./24-planes-medico-independiente-bolivia.md)
- [25-whatsapp-incluido-en-planes.md](./25-whatsapp-incluido-en-planes.md)
- [11-suscripciones-limites.md](./11-suscripciones-limites.md)
