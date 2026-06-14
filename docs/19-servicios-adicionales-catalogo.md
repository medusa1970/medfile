# Catalogo de servicios adicionales para medicos

Documento de **referencia rapida** para el equipo: que mas puede ofrecer Medfile ademas del nucleo (pacientes, consultas, documentos). Sirve para ventas, producto, soporte y roadmap.

**Relacion con planes:** lo incluido en Gratis / Basico / Profesional esta en [18-modelo-freemium-y-oferta.md](./18-modelo-freemium-y-oferta.md). Este catalogo cubre **todo el universo de valor** — incluido en suscripcion, add-ons de pago o servicios profesionales.

---

## Como leer este catalogo

| Columna | Significado |
|---------|-------------|
| **Tipo** | `Plan` = incluido en suscripcion · `Add-on` = extra mensual o por uso · `Servicio` = one-shot o recurrente con intervencion humana |
| **Prioridad** | P0 urgente · P1 alto · P2 medio · P3 futuro |
| **Estado** | Idea · Planificado · En desarrollo · Disponible |

---

## Vista rapida — todos los servicios

| # | Servicio | Tipo | Plan tipico | Prioridad |
|---|----------|------|-------------|-----------|
| 1 | Enlace paciente sube examenes (foto/PDF) | Plan | Gratis (cupo) | P0 |
| 2 | Bandeja documentos del medico | Plan | Gratis | P0 |
| 3 | Compartir enlace via WhatsApp manual (`wa.me`) | Plan | Gratis | P0 |
| 4 | Recordatorios email (cita, subida) | Plan | Basico+ | P0 |
| 5 | WhatsApp Business API (plantillas automaticas) | Plan / Add-on | Basico+ | P0 |
| 6 | Recordatorios al medico (email / push) | Plan | Basico+ | P0 |
| 7 | SMS recordatorios | Add-on | Opcional | P1 |
| 8 | Agenda / citas con estados | Plan | Gratis manual / Basico+ alertas | P0 |
| 9 | Segundo usuario (asistente) | Plan / Add-on | **Futuro plan Clinica** | P2 |
| 10 | Roles y permisos (medico / asistente) | Plan | **Futuro plan Clinica** | P2 |
| 11 | Mas pacientes / storage / subidas | Plan | Basico / Profesional | P0 |
| 12 | Exportacion backup (CSV/PDF) | Plan | Gratis limitado / pago ampliado | P0 |
| 13 | Importacion pacientes CSV | Plan | Profesional / Add-on | P1 |
| 14 | Migracion desde otro sistema | Servicio | Pago unico | P1 |
| 15 | Plantillas consulta por especialidad | Plan | Basico / Profesional | P1 |
| 16 | Formulario urgencias / tipos de visita | Plan | Gratis basico / mas en pago | P1 |
| 17 | Vista previa PDF/imagen en bandeja | Plan | Basico+ | P1 |
| 18 | Clasificacion documentos (tipo, consulta) | Plan | Basico+ | P1 |
| 19 | Alertas clinicas (alergias, critico) | Plan | Gratis | P0 |
| 20 | Digest semanal al medico (pendientes) | Plan | Profesional | P2 |
| 21 | Reportes actividad consultorio | Plan | Profesional | P2 |
| 22 | Auditoria accesos (quien vio que) | Plan | Profesional / Add-on | P2 |
| 23 | Logo / nombre consultorio en enlaces paciente | Plan | Basico+ | P1 |
| 24 | Dominio propio (`historial.drgarcia.com`) | Add-on | Profesional | P2 |
| 25 | Multi-consultorio / multi-sede | Plan | Clinica | P3 |
| 26 | API para integraciones | Add-on | Profesional / Enterprise | P3 |
| 27 | Integracion laboratorios (HL7/FHIR) | Add-on / Servicio | Enterprise | P3 |
| 28 | Facturacion / cobros consulta | Add-on | Futuro | P3 |
| 29 | Receta electronica regulada | Add-on | Por pais | P3 |
| 30 | Teleconsulta (video) | Add-on | Futuro | P3 |
| 31 | Firma digital documentos | Add-on | Profesional+ | P3 |
| 32 | Onboarding asistido 1:1 | Servicio | Pago unico | P1 |
| 33 | Capacitacion equipo consultorio | Servicio | Pago unico / paquete | P2 |
| 34 | Soporte prioritario / SLA | Plan | Profesional | P1 |
| 35 | Paquete mensajes WhatsApp prepago | Add-on | Medico paga ~Bs 0,08/msg; ver [21](./21-whatsapp-cobro-por-medico-bolivia.md) | P1 |
| 36 | Almacenamiento extra (GB) | Add-on | Por GB/mes | P1 |
| 37 | Pacientes extra (sobre tope plan) | Add-on | Por bloque | P2 |
| 38 | Cumplimiento / DPA / BAA (si aplica) | Servicio | Enterprise | P3 |
| 39 | Anonimizacion datos para investigacion | Servicio | Bajo demanda | P3 |
| 40 | App movil nativa (iOS/Android) | Plan | Profesional+ | P2 |

---

## 1. Comunicacion con pacientes y medico

Servicios que reducen inasistencias, olvidos y llamadas telefonicas.

### 1.1 WhatsApp

| Servicio | Que hace | Beneficio medico | Tipo | Prioridad |
|----------|----------|------------------|------|-----------|
| **Enlace wa.me manual** | Boton genera chat con texto + URL de subida o cita | Usa el canal que el paciente ya tiene | Plan Gratis | P0 |
| **Plantillas WhatsApp Business** | Envio automatico: recordatorio cita, pide examen, confirmacion | Menos no-shows; menos persecucion manual | Plan Basico+ | P0 |
| **Copia al medico** | Notificacion cuando se envia WhatsApp al paciente | Trazabilidad | Plan Basico+ | P1 |
| **Opt-in paciente** | Registro de consentimiento para mensajes | Cumplimiento Meta / privacidad | Plan Basico+ | P0 |
| **Paquete mensajes extra** | Mas envios sobre cupo del plan | Monetizar alto volumen | Add-on | P1 |
| **Respuestas estructuradas** | Paciente confirma/cancela cita por WhatsApp | Menos llamadas | Plan Profesional | P2 |

Detalle tecnico: [18-modelo-freemium-y-oferta.md](./18-modelo-freemium-y-oferta.md#whatsapp-estrategia-recomendada)

### 1.2 Correo electronico

| Servicio | Que hace | Beneficio | Tipo | Prioridad |
|----------|----------|-----------|------|-----------|
| **Recordatorio cita (24h / 48h)** | Email al paciente con fecha y lugar | Reduce inasistencias | Plan Basico+ | P0 |
| **Solicitud de examen por email** | Enlace de subida si el paciente tiene email | Alternativa a WhatsApp | Plan Basico+ | P1 |
| **Aviso al medico: documento nuevo** | Email cuando paciente sube archivo | Reaccion rapida | Plan Basico+ | P0 |
| **Aviso al medico: cita manana** | Resumen agenda del dia | Organizacion matutina | Plan Basico+ | P1 |
| **Digest semanal** | Pendientes, sin revisar, citas proximas | Vision global | Plan Profesional | P2 |
| **Emails transaccionales cuenta** | Verificacion, seguridad, facturacion | Confianza | Plan todos | P0 |

### 1.3 SMS (opcional)

| Servicio | Que hace | Beneficio | Tipo | Prioridad |
|----------|----------|-----------|------|-----------|
| **SMS recordatorio cita** | Texto corto con fecha/hora | Pacientes sin WhatsApp | Add-on | P1 |
| **SMS enlace subida** | Link acortado | Backup canal | Add-on | P2 |

---

## 2. Documentos y colaboracion con pacientes

| Servicio | Que hace | Beneficio | Tipo | Prioridad |
|----------|----------|-----------|------|-----------|
| **Enlace seguro subida** | Paciente sube foto/PDF sin cuenta | Fin del “mandame por WhatsApp” desordenado | Plan Gratis (cupo) | P0 |
| **Bandeja por revisar** | Lista centralizada para el medico | Un solo lugar de trabajo | Plan Gratis | P0 |
| **Asociar doc a paciente/consulta** | Clasificacion en historial | Continuidad clinica | Plan Gratis / Basico | P0 |
| **Vista previa imagen/PDF** | Ver sin descargar | Agilidad | Plan Basico+ | P1 |
| **OCR / extraccion texto** | Buscar dentro de PDF escaneado | Ahorro tiempo | Add-on / Profesional | P3 |
| **Almacenamiento extra** | Mas GB sobre plan | Archivos grandes, imagenes | Add-on | P1 |
| **Subidas extra / mes** | Mas solicitudes de enlace | Consultorios activos | Add-on | P1 |
| **Enlace con expiracion configurable** | Seguridad del enlace | Control medico | Plan Basico+ | P1 |
| **Multiples archivos por solicitud** | Varios examenes en un envio | UX paciente | Plan Basico+ | P2 |

Detalle: [09-documentos-solicitudes-subida.md](./09-documentos-solicitudes-subida.md)

---

## 3. Historia clinica y consulta

| Servicio | Que hace | Beneficio | Tipo | Prioridad |
|----------|----------|-----------|------|-----------|
| **Expediente por paciente** | Datos, antecedentes, timeline | Nucleo consultorio | Plan Gratis | P0 |
| **Consultas y notas** | Motivo, diagnostico, plan | Registro legal y clinico | Plan Gratis | P0 |
| **Signos vitales** | TA, FC, peso, etc. | Seguimiento | Plan Gratis | P0 |
| **Plantilla urgencias** | Formulario estructurado | Rapidez en guardia | Plan Gratis | P1 |
| **Plantillas por especialidad** | Pediatria, gine, etc. | Menos clics | Plan Basico+ | P1 |
| **Plantillas personalizadas** | El medico define campos | Adaptacion | Plan Profesional | P2 |
| **Notas privadas medico** | No visibles en export paciente | Privacidad | Plan Basico+ | P2 |
| **Timeline unificado** | Consultas + docs + eventos | Vista 360 | Plan Basico+ | P1 |
| **Alertas alergias / critico** | Destacado en perfil y dashboard | Seguridad paciente | Plan Gratis | P0 |
| **Receta / indicaciones PDF** | Generar PDF para paciente | Entrega clara | Plan Basico+ | P2 |
| **Receta electronica legal** | Normativa pais | Compliance | Add-on pais | P3 |

Detalle: [07-pacientes-historia-clinica.md](./07-pacientes-historia-clinica.md), [08-perfil-paciente-consultas.md](./08-perfil-paciente-consultas.md), [15-historia-clinica-emergencia.md](./15-historia-clinica-emergencia.md)

---

## 4. Agenda y operacion del consultorio

| Servicio | Que hace | Beneficio | Tipo | Prioridad |
|----------|----------|-----------|------|-----------|
| **Citas manuales** | Crear, editar, estados | Organizacion basica | Plan Gratis | P0 |
| **Citas + recordatorios** | Automaticos WA/email | Menos inasistencias | Plan Basico+ | P0 |
| **Convertir cita en consulta** | Un clic post-visita | Flujo continuo | Plan Basico+ | P1 |
| **Bloques / disponibilidad** | Horarios del medico | Base agenda publica futura | Plan Profesional | P2 |
| **Agenda del dia en dashboard** | Vista “hoy” | Rutina matutina | Plan Gratis | P0 |
| **Lista espera** | Paciente espera turno | Consultorios saturados | Plan Profesional | P3 |

---

## 5. Equipo y multi-usuario

| Servicio | Que hace | Beneficio | Tipo | Prioridad |
|----------|----------|-----------|------|-----------|
| **1 usuario (medico)** | Cuenta propietaria | Plan Gratis | Plan Gratis | P0 |
| **Asistente / secretaria** | 2–3 usuarios | Delegar carga admin | Plan Basico+ | P1 |
| **Roles** | Medico vs asistente vs solo lectura | Seguridad | Plan Basico+ | P1 |
| **Equipo grande (10+)** | Clinica pequena | Escala | Plan Profesional | P2 |
| **Multi-consultorio** | Varios medicos, un admin | Clinica | Plan Clinica | P3 |
| **Auditoria por usuario** | Quien cambio que | Compliance | Plan Profesional | P2 |

---

## 6. Datos, exportacion e integraciones

| Servicio | Que hace | Beneficio | Tipo | Prioridad |
|----------|----------|-----------|------|-----------|
| **Export CSV pacientes** | Backup / portabilidad | Confianza; nunca rehenes | Plan Gratis (limitado) | P0 |
| **Export PDF expediente** | Resumen clinico imprimible | Referencias, paciente | Plan Basico+ | P1 |
| **Backup completo programado** | Automatico a email/S3 medico | Tranquilidad | Plan Profesional | P2 |
| **Import CSV pacientes** | Alta masiva | Arranque rapido | Plan Profesional / Add-on | P1 |
| **Migracion asistida** | Servicio humano desde Excel/otro EMR | Onboarding premium | Servicio pago unico | P1 |
| **API REST documentada** | Integraciones propias | Clinicas tech | Add-on | P3 |
| **Webhook eventos** | doc.received, appointment.created | Automatizacion externa | Add-on | P3 |
| **Integracion laboratorio** | Resultados entran solos | Menos carga manual | Servicio / Enterprise | P3 |

**Politica:** exportacion siempre disponible; ver [18-modelo-freemium-y-oferta.md](./18-modelo-freemium-y-oferta.md).

---

## 7. Marca, confianza y experiencia del paciente

| Servicio | Que hace | Beneficio | Tipo | Prioridad |
|----------|----------|-----------|------|-----------|
| **Logo consultorio en enlaces** | Marca del medico, no solo Medfile | Profesionalismo | Plan Basico+ | P1 |
| **Nombre consultorio en mensajes** | “Dr. Garcia le solicita…” | Confianza paciente | Plan Basico+ | P1 |
| **Dominio personalizado** | Subdominio propio | Marca fuerte | Add-on Profesional | P2 |
| **Pagina publica consultorio** | Horarios, contacto (futuro) | Captacion pacientes | Add-on | P3 |
| **White label** | Sin marca Medfile visible | Enterprise | Plan Clinica | P3 |

---

## 8. Soporte, capacitacion y servicios humanos

Servicios **no software** que Medfile puede vender o incluir en planes altos.

| Servicio | Descripcion | Modelo cobro | Prioridad |
|----------|-------------|--------------|-----------|
| **Onboarding guiado** | Llamada 30–60 min: primer paciente, primer enlace | Incluido Profesional o $49 one-shot | P1 |
| **Migracion de datos** | Import desde Excel, otro EMR, carpetas | Cotizacion por volumen | P1 |
| **Capacitacion asistente** | Sesion para secretaria: agenda + subidas | $39–79 / sesion | P2 |
| **Soporte email** | Gratis: 48h · Basico: 24h · Pro: 4h | Incluido en plan | P1 |
| **Soporte WhatsApp comercial** | Canal ventas/soporte Medfile→medico | Operacion interna | P1 |
| **Consultoria flujo consultorio** | Optimizar como usa Medfile en su rutina | Servicio premium | P3 |
| **Setup WhatsApp Business** | Ayuda a conectar WABA del consultorio | One-shot | P1 |
| **Compartir historial con colega Medfile** | Solo ver / colaborar temporal / pasar paciente; medico titular controla | Plan Profesional+ | P2 |

Detalle: [22-intercambio-historiales-entre-medicos.md](./22-intercambio-historiales-entre-medicos.md) — catalogo de 15 escenarios reales y matriz de permisos.

---

## 9. Seguridad, cumplimiento y legal

| Servicio | Que hace | Tipo | Prioridad |
|----------|----------|------|-----------|
| **Aislamiento tenant** | Datos por medico separados | Plan todos | P0 |
| **HTTPS / cifrado transito** | Baseline | Plan todos | P0 |
| **Sesion JWT / logout** | Acceso controlado | Plan todos | P0 |
| **2FA medico** | Segunda factor login | Plan Basico+ | P2 |
| **Registro auditoria** | Accesos y cambios | Plan Profesional | P2 |
| **DPA / acuerdo tratamiento datos** | Legal B2B | Servicio Enterprise | P3 |
| **Retencion configurable** | Politicas por pais | Enterprise | P3 |
| **Baja cuenta con export** | Export obligatorio antes de cerrar | Plan todos | P1 |

Detalle: [12-seguridad-tenant-sesion.md](./12-seguridad-tenant-sesion.md)

---

## 10. Monetizacion sugerida (add-ons)

Complementos que **no reemplazan** el plan sino que amplian ingresos.

| Add-on | Unidad | Cliente ideal |
|--------|--------|---------------|
| Paquete +500 pacientes | /mes o anual | Medico con lista grande |
| +10 GB almacenamiento | /mes | Muchas imagenes/ecografias |
| +500 mensajes WhatsApp | prepago | Medico recarga; costo Meta + fee servicio |
| +1000 emails transaccionales | /mes | Consultorio muy activo |
| Importacion asistida | one-shot | Arranque desde Excel |
| Dominio personalizado | /mes | Marca premium |
| API access | /mes | Integrador / clinica |
| Usuario extra | /usuario/mes | Mas asistentes |

---

## 11. Que vender en la conversacion (pitch por dolor)

| El medico dice… | Servicio Medfile que responde |
|-----------------|-------------------------------|
| “Me mandan examenes por WhatsApp y se pierden” | Enlace subida + bandeja |
| “Olvidan la cita” | Recordatorio WhatsApp/email |
| “No tengo tiempo para otra app complicada” | Plan Gratis util, UI simple |
| “Mi asistente necesita acceso” | Usuario asistente (Basico) |
| “Tengo miedo de perder mis datos” | Export + politica sin borrado |
| “Quiero que el paciente use WhatsApp” | wa.me hoy; API manana |
| “Vengo de Excel / otro programa” | Import / migracion asistida |
| “Necesito verse profesional” | Logo en enlaces + dominio |

---

## 12. Roadmap sugerido por olas

| Ola | Servicios a activar |
|-----|---------------------|
| **Ola 1** | Gratis util, subida paciente, wa.me, export basico, alertas clinicas |
| **Ola 2** | Email recordatorios, WhatsApp API, agenda alertas, asistente, vista previa docs |
| **Ola 3** | Plantillas, reportes, digest, import CSV, add-ons storage/mensajes |
| **Ola 4** | Multi-consultorio, API, integraciones, teleconsulta, receta legal |

Alineado con [18-modelo-freemium-y-oferta.md](./18-modelo-freemium-y-oferta.md#roadmap-sugerido-de-producto-comercial).

---

## 13. Estado de implementacion (resumen)

| Estado | Servicios |
|--------|-----------|
| **Disponible hoy** | Pacientes, consultas parcial, subida paciente parcial, bandeja docs parcial, dashboard, registro/login |
| **Planificado doc** | Plan Gratis, wa.me, email, WhatsApp API, export ampliado |
| **Idea / futuro** | SMS, teleconsulta, receta legal, laboratorios, facturacion, app nativa |

Detalle tecnico por pantalla: [17-funcionalidad-catalogo.md](./17-funcionalidad-catalogo.md)

---

## Como mantener este catalogo

1. Nuevo servicio comercial → agregar fila en **Vista rapida** y seccion tematica.
2. Si pasa a desarrollo → actualizar **Estado** y [17-funcionalidad-catalogo.md](./17-funcionalidad-catalogo.md).
3. Si cambia inclusion en plan → sincronizar con [18-modelo-freemium-y-oferta.md](./18-modelo-freemium-y-oferta.md) y [11-suscripciones-limites.md](./11-suscripciones-limites.md).

---

## Documentos relacionados

- [18-modelo-freemium-y-oferta.md](./18-modelo-freemium-y-oferta.md) — planes Gratis / Basico / Profesional
- [11-suscripciones-limites.md](./11-suscripciones-limites.md) — limites tecnicos
- [02-modulos-y-flujos.md](./02-modulos-y-flujos.md) — modulos del MVP
- [00-vision-producto.md](./00-vision-producto.md) — vision y usuarios
