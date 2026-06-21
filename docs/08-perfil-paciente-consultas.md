# Perfil de paciente y consultas clinicas

## Objetivo

El perfil del paciente debe convertirse en la vista principal de trabajo clinico. Desde ahi el medico revisa datos clave, alertas, documentos y el historial de consultas.

Este corte crea la base de perfil y consultas:

- Detalle de paciente.
- Timeline inicial de consultas.
- Registro rapido de nueva consulta.

## Principios

- Las consultas son eventos clinicos asociados a un paciente y tenant.
- El timeline debe ordenar lo mas reciente primero.
- El perfil no debe depender de una tabla gigante; debe resumir lo importante y abrir detalles progresivamente.
- Toda consulta futura debe poder aceptar documentos, signos vitales, diagnostico, plan y notas.

## Modelo `Encounter`

Campos iniciales:

- `tenantId`
- `patientId`
- `occurredAt`
- `reason`
- `diagnosis`
- `treatmentPlan`
- `notes`
- `vitalSigns`
- `tags`

## Endpoints iniciales

- `GET /api/patients/:id`: detalle de paciente del tenant.
- `GET /api/encounters?patientId=...`: lista consultas del paciente.
- `POST /api/encounters`: crea consulta para un paciente, incluyendo plantilla de emergencia.

Ver `docs/15-historia-clinica-emergencia.md` para el mapeo completo del formulario fisico.

## Pantalla inicial

Jerarquía clínica (uso real en consultorio):

1. **Resumen** — `PatientFiliationCard`: nombre, `StatStrip`, alertas clínicas, `KeyValueGrid` (4 datos clave), aviso de datos faltantes con botón **Completar ahora**, botones **Ver filiación completa** / **Editar datos** (`MfButton` con rutas centralizadas en `utils/patient-routes.ts`).
2. **Acciones** — botones tipo tarjeta (`patient-action`) con icono, título y subtítulo; navegan a vistas dedicadas.
3. **Timeline** — entradas compactas, sin espacio vacío extra.
4. **Documentos** — toolbar con resumen + enlace «Solicitar subida»; filas compactas con badge inline y botones en 2 columnas.

Rutas del paciente:

| Ruta | Uso |
|------|-----|
| `/pacientes/[id]` | Perfil resumido y timeline (`pages/pacientes/[id]/index.vue`) |
| `/pacientes/[id]/filiacion` | Filiación completa en solo lectura + acceso a editar |
| `/pacientes/[id]/editar` | Filiación, domicilio, contacto, seguro |
| `/pacientes/[id]/antecedentes` | Antecedentes médicos (formulario completo) |
| `/pacientes/[id]/nueva-atencion` | Registrar consulta o emergencia |
| `/pacientes/[id]/solicitar-subida` | Enlace seguro para que el paciente suba archivos |
| `/pacientes/[id]/compartir` | Interconsulta con colega Medfile (plan Profesional) |

Compartir con colega: presets **Interconsulta** (3 consultas, sin contacto), **Referencia** (10 consultas) o personalizado; consentimiento obligatorio; solo lectura temporal. Ver [22-intercambio-historiales-entre-medicos.md](./22-intercambio-historiales-entre-medicos.md).

## Implementacion actual

Backend:

- `EncountersModule` agregado al API.
- `EncounterSchema` modela consultas clinicas por tenant y paciente.
- `CreateEncounterDto` valida la creacion.
- `PatientsController` ahora expone `GET /api/patients/:id`.

Frontend:

- `PatientRow` acepta `to` para navegar al perfil.
- `/pacientes` enlaza cada fila hacia `/pacientes/[id]`.
- `/pacientes/[id]` carga detalle, consultas y documentos desde API (`GET /api/documents?patientId=...`).
- Rutas del módulo paciente: helper `patientRoute()` + composable `usePatientPage()`; perfil en `[id]/index.vue` (estructura anidada Nuxt).
- Tras guardar filiación, antecedentes o nueva atención, `invalidatePatientCaches()` (`utils/patient-cache.ts`) refresca las claves `useAsyncData` del paciente para que el perfil muestre datos actualizados al volver.
- Enlaces de filiación y acciones usan `MfButton`/`NuxtLink` con rutas explícitas; `app.vue` fuerza remount con `:page-key="route.fullPath"`.
- La seccion Documentos permite solicitar subida con paciente preseleccionado.
- La pantalla incluye fallback demo si API/MongoDB no estan disponibles.
- El formulario de nueva consulta consume `POST /api/encounters`.

## Siguientes extensiones

- Adjuntar documentos a consulta.
- Signos vitales completos en formulario dedicado.
- Plantillas por especialidad.
- Auditoria de lectura/impresion.
- Alergias estructuradas.
- Exportacion/impresion de historia clinica.

