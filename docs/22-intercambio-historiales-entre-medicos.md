# Compartir historial clinico entre medicos (misma plataforma)

Medfile es multi-tenant: **cada medico tiene su cuenta independiente** (`Tenant`). Por defecto **nadie ve pacientes ajenos**. Este documento analiza **todas las formas reales** en que un medico puede **compartir parte del historial** con otro medico en Medfile: temporal o no, solo lectura o con mas permisos, sin perder el rol del **medico titular** del paciente.

> **Estado:** catalogo de posibilidades + **MVP implementado** (Codigo Medfile + compartir solo lectura). Colaborar y transferir: fases siguientes.

**Identificacion entre medicos:** cada consultorio tiene un **Codigo Medfile** (`MF-XXXXXX`) generado al registrarse. Ver [23-codigo-medfile.md](./23-codigo-medfile.md).

**No es un “intercambio libre”** entre consultorios: es un **prestamo controlado de informacion** (o una **transferencia explicita** del paciente) iniciado por el medico que hoy custodia la ficha.

## Comunicacion en producto (landing, registro y planes)

El beneficio de **compartir historiales entre medicos Medfile** debe quedar visible antes del upgrade:

| Superficie | Mensaje clave |
|------------|---------------|
| **`/registro`** | Pilares `AuthShell`: «Colegas · compartes con permiso», «Tu código · Medfile incluido» (texto breve, sin caja en el formulario) |
| **`AuthShell` (registro)** | Cuatro pilares breves: Gratis, Colegas, Tu codigo Medfile, Tus datos |
| **Landing `#planes`** | Callout `plan-share-callout--card` en tarjeta Profesional + bullets del plan |
| **Landing `#planes`** | Feature en Profesional; Gratis menciona Codigo Medfile y preparacion para compartir |
| **`/suscripcion`** | Capability `Compartir historial colega` en comparador de planes |

Copy orientativo: *«Cuando lo requieras, comparte historiales con colegas Medfile bajo permisos y restricciones que tu defines.»*

---

## Roles en la vida real

| Rol | Quien es | En Medfile |
|-----|----------|------------|
| **Medico titular** | El que lleva la ficha del paciente en su consultorio; responsable principal del historial | `Tenant` origen + `Patient` “dueño” |
| **Medico invitado / receptor** | Colega que necesita ver o atender por referencia, cobertura o segunda opinion | `Tenant` destino |
| **Paciente** | Titular de sus datos; debe autorizar compartir o transferir | Consentimiento registrado |
| **Asistente** | Secretaria del titular o del receptor | Solo si el medico lo permite en su tenant — ver [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md) |
| **Colaborador clinico (enfermeria)** | Personal de clinica donde atiende el titular | Captura delegada en tenant del medico; **no** es compartir con colega — doc 29 |

---

## Equipo interno vs compartir con colega

Son **tres modelos distintos** (no intercambiables):

| Modelo | Alcance | Documento |
|--------|---------|-----------|
| Enlace paciente (`/paciente/subir`) | Paciente sube archivos sin cuenta | [09-documentos-solicitudes-subida.md](./09-documentos-solicitudes-subida.md) |
| **Equipo delegado** (asistente / enfermeria) | Mismo tenant del medico titular | [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md) |
| **Compartir con colega** | Otro tenant medico (Codigo Medfile) | Este documento (22) |

- **Compartir con colega** lo inicia **solo el medico titular** (no el asistente por defecto).
- **Asistente** no recibe copia del historial en otro tenant; trabaja **dentro** del consultorio del titular.
- Plan **Profesional** incluye compartir colega; plan **Basico+** incluira asistente (roadmap doc 29).

El **medico titular** siempre puede:

- Decidir **que** se comparte y **con que permisos**.
- **Revocar** el acceso antes de que venza.
- Elegir entre **solo mostrar** o **pasar/transferir** al paciente al otro consultorio.

El medico receptor **nunca** obtiene acceso por estar “en la misma plataforma”; solo por **invitacion aceptada**.

---

## Las tres intenciones reales (elegir al compartir)

Al abrir “Compartir con colega”, el titular elige **una intencion**. Cada una implica permisos y duracion distintos.

```text
                    ┌─────────────────────────────────────┐
                    │     Medico titular (Dr. Rivas)      │
                    │     Paciente: Maria Garcia          │
                    └─────────────────┬───────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
   1. SOLO MOSTRAR            2. COLABORAR              3. PASAR PACIENTE
   (consulta / referencia)    (atencion temporal)       (transferencia)
          │                           │                           │
          ▼                           ▼                           ▼
   Receptor: solo lectura      Receptor: + notas propias    Receptor: nuevo titular
   Titular: sigue dueño       Titular: sigue dueño         Titular: archivo / lectura
   Temporal: siempre          Temporal: casi siempre       Puede ser definitivo
```

### 1. Solo mostrar (vista temporal)

**Que pasa en la clinica:** “Te mando la ficha para que la veas y me digas / para la interconsulta; yo sigo siendo su medico.”

| Aspecto | Comportamiento |
|---------|----------------|
| Permisos receptor | **Solo lectura** — ver resumen, consultas y docs compartidos |
| Puede el receptor escribir? | **No** (salvo nota de “informe de interconsulta” opcional en fase avanzada) |
| Dueno del paciente | **Titular** |
| Duracion | **Temporal** (ej. 7, 15, 30 dias); expira sola |
| Casos tipicos | Segunda opinion, interconsulta, especialista que solo revisa labs |

### 2. Colaborar (atencion temporal con permisos limitados)

**Que pasa en la clinica:** “Te cubro el fin de semana / atiendelo en urgencias en mi nombre / hazle esta consulta y anotame.”

| Aspecto | Comportamiento |
|---------|----------------|
| Permisos receptor | Lectura + **agregar consulta/nota** en bloque compartido (marcada como “por Dr. Mendez en cobertura de Dr. Rivas”) |
| Puede el receptor editar historia del titular? | **No** — solo anexos propios en el marco del share |
| Dueno del paciente | **Titular** |
| Duracion | **Temporal**; al vencer, receptor pierde acceso; las notas quedan visibles para el titular |
| Casos tipicos | Vacaciones, guardia, colega en mismo centro, residente bajo supervision |

### 3. Pasar paciente (transferencia de titularidad)

**Que pasa en la clinica:** “Me cambio de ciudad / el paciente se pasa contigo; te entrego la ficha.”

| Aspecto | Comportamiento |
|---------|----------------|
| Permisos receptor | **Titular nuevo** — paciente activo en su listado con historial importado o vinculado |
| Titular anterior | Paciente pasa a **archivado / referido / solo lectura historica** segun politica |
| Duracion | **Definitiva** (con posibilidad de “transferencia revertida” solo por acuerdo + auditoria) |
| Consentimiento | **Obligatorio** y explicito del paciente |
| Casos tipicos | Cambio de medico de cabecera, traslado de consultorio, alta del titular |

---

## Matriz de permisos (granular)

Combinaciones que el producto puede soportar **poco a poco**. No hace falta implementar todas en el MVP.

| Permiso | Codigo sugerido | Solo mostrar | Colaborar | Pasar paciente |
|---------|-----------------|--------------|-----------|----------------|
| Ver resumen (alergias, meds, antecedentes) | `view_summary` | ✅ | ✅ | ✅ |
| Ver consultas seleccionadas | `view_encounters` | ✅ | ✅ | ✅ |
| Ver documentos / imagenes | `view_documents` | ✅ | ✅ | ✅ |
| Descargar PDF / export del paquete | `download` | ⚙️ opcional | ⚙️ opcional | ✅ |
| Ver telefono / email del paciente | `view_contact` | ⚙️ opcional | ⚙️ opcional | ✅ |
| Agregar consulta / nota | `add_encounter` | ❌ | ✅ | ✅ |
| Agregar documento | `add_document` | ❌ | ⚙️ opcional | ✅ |
| Editar datos del titular | `edit_clinical` | ❌ | ❌ | ✅ (solo nuevo titular) |
| Crear solicitud subida al paciente | `create_upload_request` | ❌ | ⚙️ opcional | ✅ |
| Ver alertas criticas | `view_alerts` | ✅ | ✅ | ✅ |

⚙️ = el medico titular marca casillas al crear el share.

---

## Que se puede compartir (alcance del paquete)

El titular **no comparte “todo el tenant”** — elige un **paquete** sobre **un paciente**:

| Bloque | Ejemplos | Default al compartir |
|--------|----------|----------------------|
| **Resumen clinico** | Alergias, medicacion actual, antecedentes, grupo sanguineo | ✅ Recomendado siempre |
| **Ultimas N consultas** | Ultimas 3 / 5 / todas hasta fecha X | Elegir N |
| **Consultas por rango de fechas** | “Desde enero 2024” | Opcional |
| **Documentos marcados** | Labs, Rx, informes, imagenes | Checkbox por documento |
| **Formulario urgencias** | Snapshot del formulario fisico digitalizado | Opcional |
| **Notas internas del titular** | Texto no visible al paciente | ⚠️ Solo si se etiqueta como compartible |
| **Datos administrativos** | CI, telefono, seguro | Opt-in explicito |

**Nunca compartible:** otros pacientes del mismo consultorio, credenciales, datos de facturacion Medfile, usuarios del tenant.

---

## Escenarios clinicos reales (catalogo completo)

Cada fila es un caso que Medfile puede cubrir en alguna fase.

| # | Escenario | Intencion | Duracion tipica | Permisos receptor | Prioridad producto |
|---|-----------|-----------|-----------------|-------------------|-------------------|
| 1 | Referencia a cardiologo “solo revisa mis labs” | Solo mostrar | 15–30 dias | Lectura | **P0** |
| 2 | Segunda opinion entre colegas de confianza | Solo mostrar | 7 dias | Lectura | **P0** |
| 3 | Interconsulta: especialista devuelve opinion por escrito | Solo mostrar + nota respuesta | 30 dias | Lectura + 1 nota cierre | P1 |
| 4 | Medico de viaje; colega atiende urgencias | Colaborar | 3–14 dias | Lectura + add_encounter | **P1** |
| 5 | Residente / medico junior anota bajo supervision | Colaborar | Permanente hasta revocar | Lectura + add_encounter (sin editar) | P2 |
| 6 | Mismo paciente atendido en 2 consultorios (gine + medicina general) | Colaborar o solo mostrar | Meses, renovable | Configurable | P1 |
| 7 | Paciente se cambia de medico de cabecera | Pasar paciente | Definitivo | Titular nuevo | **P1** |
| 8 | Medico se jubila y transfiere cartera | Pasar paciente (lote) | Definitivo | Titular nuevo | P2 |
| 9 | Hospital pide ficha previa al ingreso | Solo mostrar | 48–72 h | Lectura + download PDF | P1 |
| 10 | Laboratorio / imagenologia externo | — | — | **Fuera de scope** (no es medico Medfile) | — |
| 11 | Familiar pide copia | — | — | **Export PDF al paciente**, no share medico-medico | P0 export |
| 12 | Auditoria / demanda legal | — | — | Export + auditoria; no share casual | Legal |
| 13 | Cobertura: receptor solo ve citas del dia | Solo mostrar | 1 dia | Lectura minima | P2 |
| 14 | Share expirado; receptor necesita prorroga | Renovacion | Nueva solicitud | Titular aprueba de nuevo | P1 |
| 15 | Titular revoca por desacuerdo con receptor | Revocacion | Inmediata | Acceso cortado | **P0** |

---

## Tiempo y ciclo de vida

```text
  [Titular crea share] --> pending --> [Receptor acepta] --> active
                                    |                      |
                                    |                      +--> expired (fecha)
                                    |                      |
                                    +--> rejected            +--> revoked (titular/paciente)
```

| Estado | Significado | Quien actua |
|--------|-------------|-------------|
| `draft` | Titular prepara paquete, aun no envia | Titular |
| `pending` | Enviado; espera aceptacion del receptor | Receptor acepta/rechaza |
| `pending_consent` | Falta registrar consentimiento paciente | Titular / paciente |
| `active` | Receptor accede segun permisos | — |
| `expired` | Llego `expiresAt` | Automatico |
| `revoked` | Titular o paciente corto acceso | Titular / paciente |
| `rejected` | Receptor declino | Receptor |
| `completed` | Interconsulta cerrada con nota final (opcional) | Receptor / titular |

**Duraciones predefinidas sugeridas:** 24 h, 72 h, 7 dias, 15 dias, 30 dias, 90 dias, “hasta revocar” (solo en Colaborar con medico de maxima confianza).

---

## Consentimiento del paciente

| Tipo de share | Consentimiento |
|---------------|----------------|
| Solo mostrar (referencia) | **Recomendado siempre**; registrar fecha y medio |
| Colaborar (cobertura) | **Obligatorio** — paciente sabe quien lo atiende |
| Pasar paciente | **Obligatorio** — firma / checkbox / foto formulario |

Campos a registrar:

- `consentAt`, `consentMethod` (`verbal_documented` | `written` | `digital_checkbox` | `form_photo`)
- `consentRecordedByUserId`
- Texto estandar adaptable (Bolivia / LATAM)

Si el paciente **revoca**, el share pasa a `revoked` aunque el titular no quiera (politica a definir con asesoria legal).

---

## Que ve cada uno en la UI (futuro)

### Medico titular — ficha del paciente

- Perfil `/pacientes/[id]`: resumen + timeline + documentos; **barra de acciones** (no formularios largos embebidos).
- Botones abren vistas dedicadas: **Antecedentes**, **Nueva atención**, **Solicitar subida**, **Compartir con colega**, **Editar filiación**.
- Compartir: vista `/pacientes/[id]/compartir` con presets clínicos (interconsulta / referencia), alcance granular y consentimiento.
- Lista **Accesos enviados** (pendientes/activos) en la vista compartir; revocación en `/compartidos`.

### Medico receptor

- Seccion **“Pacientes compartidos conmigo”** (distinto de “Mis pacientes”)
- Badge visible: *“Lectura de Dr. Rivas — vence 12/07”*
- Si solo lectura: sin botones de editar historia del titular
- Si colaborar: **“Agregar nota de cobertura”** (queda atribuida al receptor)

### Paciente

- *(Fase posterior)* Portal o enlace: ver con quien se compartio su info (transparencia)

---

## Pasar paciente vs solo mostrar — diferencias tecnicas

| | Solo mostrar / Colaborar | Pasar paciente |
|--|--------------------------|----------------|
| Registro en tenant receptor | **No** crea paciente propio (vista vinculada) o ficha espejo read-only | **Si** — `Patient` nuevo o migrado |
| `tenantId` del historial original | Permanece en titular | Copia o movimiento segun politica legal |
| Tras expiracion | Receptor pierde vista | N/A (ya es suyo) |
| Titular anterior | Sigue viendo todo su historial | Ve copia historica / paciente archivado “transferido a Dr. Mendez” |
| Auditoria | Log de cada vista | Log de transferencia + timestamp |

**Recomendacion legal-tecnica:** en **Pasar paciente**, preferir **copia certificada del paquete** en el tenant destino + marca en origen “transferido el …”, en lugar de borrar datos del titular (alineado con “nunca perder datos” de Medfile).

---

## Seguridad (resumen)

- Aislamiento por defecto; share = excepcion auditada.
- JWT cross-tenant scoped: `shareId`, permisos, `expiresAt`.
- Documentos: URL firmada con TTL o replica cifrada en bucket destino.
- Roles: solo `owner`/`doctor` comparten; `assistant` configurable.
- Cada acceso: `ClinicalShareAccessLog` (view, download, add_note).

Detalle: [12-seguridad-tenant-sesion.md](./12-seguridad-tenant-sesion.md).

---

## Modelo de datos sugerido (evolucion)

```text
ClinicalShare
  id
  sourceTenantId, sourcePatientId
  targetTenantId, targetUserId? (medico concreto)
  intention: view_only | collaborate | transfer
  permissions: string[]          # view_summary, add_encounter, ...
  scope: { summary, encounterIds[], documentIds[], dateFrom?, dateTo? }
  status
  expiresAt, revokedAt, revokedBy, revokeReason?
  consent: { at, method, recordedBy }
  createdByUserId, acceptedByUserId?, acceptedAt?

ClinicalShareNote          # notas del receptor en modo colaborar
  shareId, authorUserId, authorTenantId, body, createdAt

PatientTransfer            # cuando intention = transfer
  shareId, fromTenantId, toTenantId, fromPatientId, toPatientId
  transferredAt, packageSnapshotRef
```

---

## Roadmap por fases

Implementar **de a poco**; cada fase entrega valor real sin abrir un agujero de seguridad.

| Fase | Entregable | Cubre escenarios |
|------|------------|------------------|
| **0 — Hoy** | Export PDF / resumen imprimible; wa.me con “te envio adjunto” | #11, parcial #9 |
| **1 — MVP share** | Codigo Medfile + solo mostrar + inbox + revocar | ✅ #1, #2, #15 |
| **2** | Colaborar: receptor agrega nota de cobertura | #4, #6 |
| **3** | Pasar paciente (transferencia con copia de paquete) | #7 |
| **4** | Prorroga, plantillas de duracion, bandeja “referidos” | #14, UX |
| **5** | Interconsulta con nota de cierre | #3 |
| **6** | Transferencia en lote, red de confianza | #8 |
| **7** | Visibilidad al paciente de shares activos | Transparencia |

---

## Fuera de alcance (por ahora)

- Compartir con **quien no tiene cuenta Medfile** (usar PDF / enlace publico con token — otro modulo).
- Acceso **automatico** entre medicos de la misma “clinica” sin accion del titular.
- Edicion cruzada del historial del otro medico.
- IA que “fusione” historiales sin consentimiento.

---

## Copy para medicos (producto)

> **Compartir no es regalar la ficha.** Tu sigues siendo el medico titular hasta que decidas transferir. Puedes dejar que un colega **solo vea** por unos dias, **anote una consulta de cobertura**, o **pasarle el paciente** por completo. Tu paciente debe estar de acuerdo. Tu puedes revocar el acceso cuando quieras.

---

## Documentos relacionados

- [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md) — asistente y enfermeria (**mismo tenant**; distinto de compartir colega)
- [00-vision-producto.md](./00-vision-producto.md)
- [07-pacientes-historia-clinica.md](./07-pacientes-historia-clinica.md)
- [12-seguridad-tenant-sesion.md](./12-seguridad-tenant-sesion.md)
- [23-codigo-medfile.md](./23-codigo-medfile.md)
