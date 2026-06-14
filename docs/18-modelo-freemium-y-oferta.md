# Modelo freemium y oferta comercial de Medfile

## Resumen ejecutivo

Medfile **no debe usar un trial con vencimiento** que haga pensar al medico que puede perder pacientes, consultas o documentos. Eso destruye confianza en un producto clinico.

El modelo recomendado es **freemium permanente**:

1. **Plan Gratis** — util de verdad para un medico independiente que empieza.
2. **Planes de pago** — mas capacidad, automatizacion y comodidad; **nunca** requisito para acceder a los datos ya registrados.
3. Si deja de pagar → pierde **privilegios premium**, no el historial clinico.

Este documento analiza que ofrecer en cada nivel, como tratar los datos, y prioriza **WhatsApp** y **correo** para recordatorios y enlaces.

---

## Por que eliminar el trial de 14 dias

| Problema del trial | Impacto en el medico |
|--------------------|----------------------|
| Fecha de corte artificial | Ansiedad; pospone registrar pacientes reales |
| Percepcion de perdida de datos | Inaceptable en historia clinica |
| Mezcla “probar” con “usar” | El medico ya esta tratando personas; no es un SaaS de marketing |
| Friccion al dia 15 | Abandono o enojo si no pago a tiempo |

**Alternativa:** al registrarse entra directo al **Plan Gratis** sin fecha de expiracion. El upgrade es por valor (mas pacientes, WhatsApp automatico, equipo), no por miedo a perder lo construido.

---

## Principios de datos y acceso (innegociables)

Estos principios deben reflejarse en backend, frontend, terminos legales y soporte.

1. **Los datos clinicos del medico le pertenecen.** Medfile es custodio, no dueno.
2. **Nunca borrar** pacientes, consultas ni documentos por falta de pago.
3. **Siempre permitir lectura** de todo lo ya registrado (modo lectura si hace falta).
4. **Siempre permitir exportacion** (PDF/CSV/backup) en todos los planes; en Gratis puede ser manual y limitada en frecuencia.
5. **Bloquear solo acciones premium o de creacion** cuando corresponda (ver matriz abajo).
6. **Comunicar con claridad** que bajar de plan no elimina informacion.

### Comportamiento al bajar de plan o dejar de pagar

| Accion | Comportamiento |
|--------|----------------|
| Ver pacientes existentes | ✅ Siempre |
| Ver consultas y documentos | ✅ Siempre |
| Editar datos existentes | ✅ Siempre (recomendado) |
| Exportar | ✅ Siempre (con limites razonables en Gratis) |
| Crear pacientes nuevos | ✅ Hasta tope del plan Gratis; si ya supera tope historico, **no borrar** — avisar y pedir upgrade para **nuevos** altas |
| Enviar WhatsApp / email automaticos | ❌ Se detienen |
| Usuarios extra (asistente) | ❌ Acceso suspendido, no borrar auditoria |
| Subidas paciente sobre cupo mensual | ❌ Pausar nuevas solicitudes hasta el mes siguiente o upgrade |
| Storage sobre tope | ❌ No borrar archivos; bloquear **nuevas** subidas hasta liberar espacio o upgrade |

---

## Mapa de valor: que necesita un medico independiente

Funcionalidades agrupadas por **job to be done** (trabajo que el medico contrata al producto).

### Nucleo clinico (debe estar en Gratis)

| Funcionalidad | Valor para el medico |
|---------------|----------------------|
| Registro de pacientes | Base del consultorio |
| Perfil / resumen clinico | Ver lo esencial antes de consultar |
| Consultas y notas | Documentar encuentros |
| Antecedentes, alergias, medicacion | Seguridad clinica |
| Timeline por paciente | Continuidad de cuidado |
| Busqueda de pacientes | Agilidad diaria |
| Dashboard basico | Citas/hoy, pendientes, alertas simples |

### Documentos (Gratis con limites; diferenciador clave)

| Funcionalidad | Valor |
|---------------|-------|
| Enlace para que el **paciente suba examenes** (foto/PDF) | Evita WhatsApp desordenado, pierde papeles |
| Bandeja “por revisar” del medico | Un solo lugar para resultados |
| Asociar documento a paciente | Historia completa |
| Vista previa imagen/PDF | Revisar sin descargar |

*El envio de imagenes por parte del paciente debe existir en Gratis con cupo mensual moderado — es argumento de adopcion y utilidad real.*

### Agenda y recordatorios (mayormente de pago)

| Funcionalidad | Valor | Canal |
|---------------|-------|-------|
| Citas simples (crear, estado) | Organizacion | App |
| Recordatorio de cita al **paciente** | Reduce inasistencias | WhatsApp, email, SMS |
| Recordatorio al **medico** | No olvidar seguimientos | Email, push, WhatsApp |
| Recordatorio “sube tu examen” | Cierra el loop documental | WhatsApp, email |
| Enlace de subida por WhatsApp en un clic | Friccion minima | WhatsApp |
| Confirmacion / cancelacion de cita | Menos llamadas | WhatsApp |

### Comunicacion (prioridad WhatsApp)

| Nivel | Implementacion | Plan |
|-------|----------------|------|
| **Fase 1 — Ya** | Enlaces `wa.me` con mensaje prefijado (link de subida, recordatorio manual) | Gratis |
| **Fase 2 — Corto plazo** | Plantillas WhatsApp Business API (cita, subida, recordatorio) | Basico+ |
| **Fase 3** | Respuestas, ventana 24h, opt-in paciente, metricas de entrega | Profesional+ |
| Email transaccional | Verificacion cuenta, copia al medico, recordatorios | Basico+ |
| Email digest semanal al medico | Pendientes, documentos sin revisar | Profesional |

WhatsApp es critico en Latinoamerica: muchos pacientes no revisan email; el medico ya usa WhatsApp hoy de forma informal — Medfile debe **canalizar** eso, no pelear contra ello.

### Equipo y consultorio (de pago)

| Funcionalidad | Plan tipico |
|---------------|-------------|
| Segundo usuario (asistente) | Basico |
| Roles (medico / asistente / solo agenda) | Basico / Profesional |
| Mas usuarios | Profesional |
| Varias sedes o consultorios | Futuro / Enterprise |

### Capacidad e infraestructura (de pago)

| Recurso | Gratis | Basico | Profesional |
|---------|--------|--------|-------------|
| Pacientes activos | 40–75 | 250–500 | 2000+ |
| Usuarios | 1 | 2–3 | 10+ |
| Almacenamiento | 1–2 GB | 10–25 GB | 100 GB+ |
| Solicitudes subida / mes | 20–40 | 250 | 3000+ |
| Historial consultas | Ilimitado en pacientes dentro del tope | Igual | Igual |

Los numeros exactos se calibran con costos de storage y WhatsApp; la logica es: **Gratis suficiente para un medico que atiende decenas de pacientes al mes**, no solo una demo.

### Avanzado (version completa / Profesional+)

| Funcionalidad | Notas |
|---------------|-------|
| Plantillas de consulta personalizadas | Especialidades distintas |
| Formularios por tipo de visita | Urgencias, control, teleconsulta |
| Reportes (actividad, diagnosticos frecuentes) | Solo agregados, sin PHI en email |
| Importacion masiva de pacientes | CSV |
| Logo / nombre consultorio en enlaces paciente | Marca |
| Auditoria y registro de accesos | Compliance |
| Soporte prioritario | SLA |
| API / integraciones | Laboratorios, facturacion — fase posterior |
| Teleconsulta embebida | Futuro |
| Receta electronica regulada | Fuera MVP; pais especifico |

---

## Propuesta de planes (reemplaza trial)

### Plan Gratis — $0 / permanente

**Para quien:** medico independiente que quiere ordenar su consulta sin riesgo.

**Incluye:**

- 1 usuario (medico)
- Hasta **50 pacientes** activos (ajustable)
- Historia clinica basica: pacientes, consultas, antecedentes, urgencias
- **Enlace de subida para pacientes** (ej. 30 solicitudes/mes)
- **1–2 GB** almacenamiento
- Bandeja de documentos
- Dashboard basico
- Compartir enlace de subida via **copiar link** y **abrir WhatsApp** (`wa.me` con texto)
- Exportacion manual de datos (limitada ej. 1 vez/mes)

**No incluye:**

- Recordatorios automaticos por email/WhatsApp
- Usuarios adicionales
- Plantillas WhatsApp Business API
- Reportes avanzados

### Plan Basico — pago mensual / trimestral / anual

**Para quien:** medico **independiente** con consulta regular que quiere recordatorios automaticos.

**Precio ref.:** **USD 14/mes (~Bs 98)** — ver [24-planes-medico-independiente-bolivia.md](./24-planes-medico-independiente-bolivia.md).

**Todo Gratis, mas:**

- Hasta **200** pacientes
- **1 medico** (cuenta individual)
- **8 GB** storage
- **150** solicitudes subida/mes
- **100 WhatsApp automaticos/mes incluidos**
- **Recordatorios por email**
- Logo / nombre consultorio en enlaces

### Plan Profesional — pago

**Para quien:** el **mismo medico independiente** con **alto volumen** — no es plan multi-medico.

**Precio ref.:** **USD 32/mes (~Bs 224)**.

**Todo Basico, mas:**

- Hasta **800** pacientes
- **25 GB** storage
- **500** solicitudes/mes
- **600 WhatsApp automaticos/mes incluidos**
- Automatizaciones, digest semanal
- Compartir historial con colegas (Codigo Medfile)
- Reportes, soporte prioritario

### Plan Clinica / Enterprise — futuro

Varios usuarios (asistente, recepcion), multi-consultorio — **fuera del MVP**. Ver [24-planes-medico-independiente-bolivia.md](./24-planes-medico-independiente-bolivia.md).

---

## Matriz funcionalidad × plan

| Funcionalidad | Gratis | Basico | Profesional |
|---------------|:------:|:------:|:-----------:|
| Pacientes, consultas, antecedentes | ✅ | ✅ | ✅ |
| Leer todo lo existente aunque baje plan | ✅ | ✅ | ✅ |
| Exportar datos | ✅ limitado | ✅ | ✅ |
| Enlace subida examenes paciente | ✅ cupo | ✅ | ✅ |
| Bandeja documentos | ✅ | ✅ | ✅ |
| Agenda / citas | ✅ manual | ✅ + alertas | ✅ |
| Copiar link / wa.me manual | ✅ | ✅ | ✅ |
| Email recordatorios automaticos | ❌ | ✅ | ✅ |
| WhatsApp plantillas API | ❌ | ✅ **100/mes incl.** | ✅ **600/mes incl.** |
| Compartir historial colega Medfile | ❌ | ❌ | ✅ |
| Asistente / multi-usuario | ❌ | ❌ | ❌ |
| Reportes / auditoria avanzada | ❌ | ❌ | ✅ |
| Automatizaciones multi-paso | ❌ | ❌ | ✅ |

> **1 medico** en todos los planes. Asistente = futuro plan Clinica ([24](./24-planes-medico-independiente-bolivia.md)).

---

## WhatsApp: estrategia recomendada

### Fase 1 — Inmediata (sin API)

- Boton **“Enviar por WhatsApp”** en solicitud de subida y citas.
- Genera URL `https://wa.me/{telefono}?text={mensaje codificado}` con link Medfile incluido.
- Funciona en Gratis; el medico envia desde su WhatsApp.
- Mensajes tipo: “Hola {nombre}, tu medico te pide subir tu examen aqui: {url}”.

### Fase 2 — WhatsApp Business Cloud API

- Cuenta WABA del consultorio o numero Medfile proxy (decision legal/comercial).
- Plantillas aprobadas: recordatorio cita, solicitud documento, confirmacion.
- Webhooks de entrega/leido.
- Requiere opt-in del paciente y politica de privacidad clara.
- **Plan Basico** en adelante — **cupo mensual incluido** en suscripcion ([25](./25-whatsapp-incluido-en-planes.md)).
- Aviso al **80 %** del cupo; upgrade a Profesional si necesita mas.

### Fase 3 — Integracion profunda

- Respuestas estructuradas (“Confirmo” / “Cancelo”).
- Enlace acortado con tracking.
- Registro en timeline del paciente: “Recordatorio WhatsApp enviado”.

Prioridad de producto: **Fase 1 en el proximo sprint de documentos/citas**; disenar backend pensando en Fase 2.

---

## Email: que enviar y a quien

| Evento | Destinatario paciente | Destinatario medico |
|--------|----------------------|---------------------|
| Cita en 24 h | ✅ (Basico+) | ✅ copia opcional |
| Documento recibido | ❌ | ✅ |
| Solicitud subida enviada | ✅ si tiene email | ✅ |
| Resumen semanal pendientes | ❌ | ✅ (Profesional) |
| Verificacion / seguridad cuenta | ❌ | ✅ |
| Pago fallido / plan | ❌ | ✅ |

Emails al paciente solo si hay email registrado; WhatsApp suele ser el canal principal en LA.

---

## Cambios respecto al modelo actual en codigo

Hoy el backend usa plan `trial` con 14 dias ([`subscription-plans.ts`](../apps/api/src/modules/subscriptions/subscription-plans.ts)). Migracion conceptual:

| Actual | Propuesto |
|--------|-----------|
| `trial` | `free` (sin `trialEndsAt` obligatorio) |
| Alta → trialing | Alta → `active` en plan `free` |
| UI “14 dias prueba” | UI “Plan Gratis” + beneficios upgrade |
| Bloqueo por trial vencido | Solo bloqueo de features premium y topes de creacion |

Estados de suscripcion sugeridos:

- `active` — plan free o pagado vigente
- `past_due` — pago fallido; mantener lectura; pausar premium
- `canceled` — vuelta a free explicita
- `suspended` — abuso / legal (excepcion)

Eliminar o deprecar `trialing` como estado de “cuenta nueva”.

---

## Roadmap sugerido de producto comercial

### Ola 1 — Confianza y utilidad gratis (actual + corto plazo)

- Plan Gratis documentado e implementado
- Subida paciente estable
- Boton WhatsApp wa.me
- Exportacion basica
- Mensajeria clara: “tus datos no se pierden”

### Ola 2 — Monetizacion suave

- Checkout Basico / Profesional
- Email recordatorios
- Agenda con alertas
- 2do usuario

### Ola 3 — Automatizacion

- WhatsApp Business API
- Secuencias y digest medico
- Reportes

### Ola 4 — Escala

- Clinica multi-medico
- Integraciones
- Mercados por pais (receta, facturacion)

---

## Mensaje comercial (landing)

**Antes:** “Prueba gratis 14 dias”  
**Despues:** “Empieza gratis — tu consultorio ordenado desde el dia uno. Paga solo cuando necesites mas pacientes, recordatorios por WhatsApp o tu asistente en el sistema.”

---

## Documentos relacionados

- [11-suscripciones-limites.md](./11-suscripciones-limites.md) — limites tecnicos y API (actualizar segun este modelo)
- [19-servicios-adicionales-catalogo.md](./19-servicios-adicionales-catalogo.md) — catalogo completo de servicios y add-ons
- [00-vision-producto.md](./00-vision-producto.md) — vision y usuarios
- [02-modulos-y-flujos.md](./02-modulos-y-flujos.md) — modulos y flujos
- [09-documentos-solicitudes-subida.md](./09-documentos-solicitudes-subida.md) — subida paciente
- [17-funcionalidad-catalogo.md](./17-funcionalidad-catalogo.md) — estado de implementacion

## Decisiones pendientes de negocio

- Numeros exactos de tope Gratis (pacientes, GB, subidas/mes)
- Precio Basico / Profesional por mercado (USD vs moneda local)
- WhatsApp: numero del medico vs numero Medfile
- SMS como fallback opcional
- Politica de retencion si cuenta inactiva anos (aviso, no borrado silencioso)
