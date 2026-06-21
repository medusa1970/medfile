# Funcionalidades del medico: hoy, beneficios y roadmap

Documento de referencia para producto, UX y ventas: que puede hacer un medico en Medfile **hoy**, que valor obtiene y que conviene construir despues.

Relacionado: [17-funcionalidad-catalogo.md](./17-funcionalidad-catalogo.md), [19-servicios-adicionales-catalogo.md](./19-servicios-adicionales-catalogo.md), [02-modulos-y-flujos.md](./02-modulos-y-flujos.md).

---

## Beneficios principales para el medico

| Beneficio | Como lo resuelve Medfile hoy |
|-----------|------------------------------|
| **Consultorio digital sin costo inicial** | Plan Gratis permanente; registro en minutos |
| **Pacientes centralizados** | Listado, busqueda, alta y perfil clinico por tenant aislado |
| **Recibir examenes sin WhatsApp caotico** | Enlace seguro de subida; bandeja de documentos |
| **Historia clinica en un solo lugar** | Antecedentes, consultas de urgencia, documentos asociados al paciente |
| **Compartir con colegas** | Codigo Medfile + historial compartido solo lectura (`/compartidos`) |
| **Canal que el paciente ya usa** | Compartir enlace por WhatsApp manual (`wa.me`) |
| **Control de limites y plan** | Pantalla de suscripcion con uso (pacientes, subidas, storage) |
| **Datos no se pierden al cambiar de plan** | Politica freemium documentada en [18](./18-modelo-freemium-y-oferta.md) |

---

## Funcionalidades implementadas (acceso directo en dashboard)

Estas acciones aparecen como **Accesos rapidos** en `/dashboard` (iconos compactos tipo app movil). La grilla se arma en `utils/doctor-quick-access.ts` segun **rol** y **capabilities** del plan (`assistantUsers`, `clinicalCaptureUsers`, `clinicalShare`). Los accesos no incluidos en el plan se muestran **bloqueados** (candado + badge «Plan Basico» / «Plan Profesional») y enlazan a `/suscripcion?upgrade=basic|professional&returnTo=/dashboard`.

| Acceso rapido | Ruta (desbloqueado) | Plan minimo | Estado |
|---------------|---------------------|-------------|--------|
| Nuevo paciente | `/pacientes/nuevo` | Gratis | ✅ |
| Mis pacientes | `/pacientes` | Gratis | ✅ |
| Documentos | `/documentos` | Gratis | 🟡 |
| Pedir examen | `/documentos` | Gratis | 🟡 |
| Invitar asistente | `/cuenta/equipo` | **Basico** | ✅ (tile bloqueado en Gratis) |
| Enfermeria delegada | `/cuenta/equipo` | **Profesional** | ✅ (tile bloqueado en Gratis/Basico) |
| Cola clinica | `/cola-clinica` | **Profesional** | ✅ (tile bloqueado en Gratis/Basico) |
| Compartir historial | `/compartidos` | **Profesional** | ✅ (tile bloqueado en Gratis/Basico) |
| Mi equipo | `/cuenta/equipo` | **Basico** | ✅ |
| Demo enlace paciente | `/paciente/subir` | Gratis | ✅ |
| Mi plan | `/suscripcion` | Gratis | ✅ |
| Mi perfil | `/cuenta` | Gratis | ✅ |

**Rol asistente:** accesos reducidos (sin compartir, suscripcion ni equipo). **Rol captura clinica:** redirige a `/cola-clinica` (no usa dashboard).

Ademas del dashboard, el medico tiene sidebar: Dashboard, Pacientes, Documentos, Compartidos, Suscripcion, Mi perfil.

---

## Funcionalidades parciales (en evolucion)

| Area | Que funciona | Que falta |
|------|--------------|-----------|
| Perfil de paciente | Datos, antecedentes, consulta urgencia, documentos | Timeline completo, citas, mas tipos de consulta |
| Documentos | Bandeja, solicitud de subida, portal con token | Clasificacion avanzada, preview PDF inline robusto |
| Storage | Metadatos en MongoDB; URLs firmadas si hay S3/R2 | Modo mock sin binario real si faltan credenciales |
| WhatsApp | Enlace manual wa.me | WhatsApp Business API automatico (Basico+) |
| Pagos | Checkout Mercado Pago sandbox/mock | Produccion MP Bolivia end-to-end |

---

## Funcionalidades propuestas (roadmap medico)

Priorizadas segun [19-servicios-adicionales-catalogo.md](./19-servicios-adicionales-catalogo.md) y [02-modulos-y-flujos.md](./02-modulos-y-flujos.md).

### P0 — Alto impacto, complementan el nucleo

| Funcionalidad | Descripcion | Beneficio |
|---------------|-------------|-----------|
| **Agenda / citas** | Calendario, estados (confirmada, cancelada, atendida) | Responde "que tengo hoy" en el dashboard |
| **Recordatorios email** | Cita proxima, examen pendiente | Menos inasistencias y olvidos |
| **WhatsApp Business API** | Plantillas automaticas (recordatorio, pide examen) | Menos trabajo manual del medico |
| **Alertas clinicas visibles** | Alergias, critico, seguimiento en dashboard | Priorizar pacientes de riesgo |
| **Clasificar documentos** | Tipo, fecha, asociar a consulta | Bandeja util sin revisar uno por uno |
| **Vista previa PDF/imagen** | En bandeja y perfil | Revisar sin descargar |

### P1 — Productividad y profesionalizacion

| Funcionalidad | Descripcion | Beneficio |
|---------------|-------------|-----------|
| **Plantillas de consulta** | Por especialidad o tipo de visita | Documentar mas rapido |
| **Importacion CSV pacientes** | Migrar desde Excel u otro sistema | Onboarding de consultorios existentes |
| **Exportacion backup** | CSV/PDF por paciente o consultorio | Confianza y portabilidad |
| **Logo en enlaces paciente** | Marca del consultorio en portal subida | Imagen profesional |
| **Notificaciones al medico** | Email/push: nuevo documento, share aceptado | No depender de entrar al dashboard |
| **Busqueda global** | Paciente + documento desde topbar | Acceso rapido real al dato |

### P2 — Escala y colaboracion

| Funcionalidad | Descripcion | Beneficio | Plan |
|---------------|-------------|-----------|------|
| **Asistente administrativo** | Rol recepcion: filiacion, subidas, bandeja, recordatorios | Delegar carga admin | **Basico+** |
| **Colaborador clinico (enfermeria)** | Vitales, triage, adjuntos en cola del dia | Medicos en multiples clinicas | **Profesional** |
| **Modulo Equipo** | Invitar / revocar usuarios delegados | Control del titular | Basico+ |
| **Auditoria por usuario** | Quien cambio que | Compliance antes de captura clinica | **Profesional** |
| **Compartir con colega** (existente) | Solo lectura inter-tenant | Interconsulta | **Profesional** — [22](./22-intercambio-historiales-entre-medicos.md) |
| **Colaborar / transferir paciente** | Fase 2 intercambio entre medicos | Continuidad de cuidado | Profesional |
| **Reportes de actividad** | Consultas, subidas, pacientes nuevos/mes | Gestion del consultorio | Profesional |
| **Digest semanal** | Pendientes: docs sin revisar, seguimientos | Menos cosas olvidadas | Profesional |
| **App movil nativa** | iOS/Android medico | Uso en pasillo y urgencias | P3 |

Especificacion completa equipo vs compartir: [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md).

### P3 — Futuro / por pais o enterprise

Teleconsulta, receta electronica regulada, facturacion de consulta, integracion laboratorios (HL7/FHIR), multi-sede, API publica, firma digital.

---

## Mapa visual: dashboard del medico

```
/dashboard
├── Accesos rapidos (8 iconos, 2 columnas movil)
├── Codigo Medfile (compacto)
├── Avisos de uso del plan (si >= 80 %)
├── Metricas 2x2 (pacientes, documentos, seguimiento, storage)
├── Pacientes que requieren atencion
└── Bandeja de archivos (resumen)
```

Componente UI: `QuickAccessGrid` (`apps/web/components/dashboard/QuickAccessGrid.vue`). Config: `utils/doctor-quick-access.ts`.

---

## Como actualizar

1. Al lanzar una funcion nueva, agregar fila en **implementadas** y un tile en `doctor-quick-access.ts` si merece acceso directo.
2. Al mover de parcial a completo, actualizar [17-funcionalidad-catalogo.md](./17-funcionalidad-catalogo.md).
3. Roadmap: repriorizar aqui y en doc 19 si cambia la oferta comercial.
