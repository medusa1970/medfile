# Pacientes e historia clinica inicial

## Objetivo

El modulo de pacientes es el centro operativo de Medfile. Cada medico debe poder registrar pacientes, listarlos por su tenant y abrir posteriormente una historia clinica con consultas, documentos y alertas.

Este corte implementa la base: listado y creacion de pacientes. La historia clinica completa se construira encima de este modelo.

## Principios

- Todo paciente pertenece a un `tenantId`.
- La API siempre filtra por tenant.
- El frontend no debe mostrar ni crear pacientes fuera del tenant activo.
- La informacion clinica crece por eventos: consultas, documentos, alertas y notas.
- Los datos personales deben mantenerse separados de documentos y consultas para poder auditar mejor cada area.

## Campos iniciales del paciente

- `tenantId`
- `fullName`
- `documentId`
- `birthDate`
- `phone`
- `email`
- `status`
- `activeAlerts`
- `emergencyContactName`
- `emergencyContactPhone`
- `insuranceName`
- `policyNumber`

## Estados

- `active`: paciente activo sin alerta especial.
- `follow_up`: requiere seguimiento.
- `critical`: requiere atencion prioritaria.
- `archived`: no aparece en listados operativos.

## Endpoints iniciales

- `GET /api/patients`: lista pacientes del tenant (cada item incluye `id` serializado desde MongoDB).
- `POST /api/patients`: crea paciente en el tenant.
- `PATCH /api/patients/:id`: actualiza filiacion y antecedentes.

Ver plantilla completa en `docs/15-historia-clinica-emergencia.md`.

## Pantallas iniciales

- `/pacientes`: listado medico con busqueda visual y CTA de nuevo paciente.
- `/pacientes/nuevo`: formulario de registro de paciente.

## Implementacion actual

Backend:

- `CreatePatientDto` valida la entrada.
- `PatientsController` expone listado y creacion.
- `PatientsService` filtra y crea por tenant.
- `PatientSchema` incluye datos basicos, contacto de emergencia y seguro.

Frontend:

- `/pacientes` consume `GET /api/patients` y usa fallback visual si el API no esta disponible.
- `/pacientes/nuevo` consume `POST /api/patients`.
- `DoctorShell` ya enlaza la navegacion hacia el listado.

## Siguientes extensiones

- Perfil de paciente `/pacientes/:id`.
- Consultas clinicas por paciente.
- Alertas y alergias.
- Documentos asociados.
- Timeline clinico.
- Auditoria de lectura/edicion.
- Importacion de documentos enviados por paciente.

