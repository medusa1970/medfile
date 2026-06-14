# Historia clinica de emergencia

## Objetivo

Adaptar Medfile al formulario fisico de historia clinica de emergencia usado en centros medicos (filiacion, anamnesis, antecedentes, signos vitales, diagnostico, destino y observacion).

Este corte agrega el modelo y formularios base. La impresion PDF y firmas legales quedan para una iteracion posterior.

## Mapeo formulario fisico -> Medfile

### Paciente (persistente)

| Seccion papel | Campo Medfile |
|---------------|---------------|
| Apellidos y nombres | `fullName` |
| CI | `documentId` |
| Sexo | `sex` |
| Fecha nacimiento | `birthDate` |
| Padre o tutor | `guardianName` |
| Departamento / provincia / distrito / localidad | `address.*` |
| Direccion | `address.streetAddress` |
| Telefono | `phone` |
| Antecedentes familiares, habitos, cronicos | `medicalBackground.*` |
| Ginecologicos / obstetricos | `medicalBackground.gynecological` / `obstetric` |

### Consulta de emergencia (evento)

| Seccion papel | Campo Medfile |
|---------------|---------------|
| Fecha y hora atencion | `occurredAt` |
| Tipo atencion (particular, SOAT, etc.) | `careType`, `careTypeOther` |
| Servicio | `serviceName` |
| Auxiliado / por quien | `assistedArrival`, `assistedBy` |
| Motivo consulta | `reason` |
| Enfermedad actual | `presentIllness` |
| Signos vitales | `vitalSigns` (incluye FR) |
| Examen fisico | `physicalExamNotes` |
| Impresion diagnostica | `diagnosis` |
| Examenes auxiliares | `auxiliaryExams` |
| Tratamiento | `treatmentPlan` |
| Acompanante | `companionName` |
| Destino paciente | `patientDestination`, `referralFacility` |
| Observacion | `observationAdmissionAt`, `observationRoom`, `evolutionNotes` |
| Alta | `dischargeDiagnosis`, `dischargedAt`, `notesToFamily` |
| Familiar responsable | `responsibleFamilyName`, `responsibleFamilyDocumentId` |

## Endpoints

- `POST /api/patients`: crea paciente con filiacion ampliada.
- `PATCH /api/patients/:id`: actualiza filiacion y antecedentes.
- `POST /api/encounters`: crea consulta con plantilla de emergencia.

## Pantallas

- `/pacientes/nuevo`: filiacion ampliada (sexo, tutor, domicilio).
- `/pacientes/[id]`: antecedentes medicos editables + formulario de consulta de emergencia + timeline enriquecido.

## Pendiente

- Numero correlativo de historia clinica por tenant.
- Impresion/PDF del formato fisico.
- Firmas digitales de medico y familiar.
- Plantillas por especialidad.
