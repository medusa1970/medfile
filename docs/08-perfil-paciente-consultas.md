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

- `/pacientes/[id]`: perfil con cabecera fija, resumen en chips horizontales, filiacion en linea, documentos del paciente y formulario de emergencia compacto.

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

