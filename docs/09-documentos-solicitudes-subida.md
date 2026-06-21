# Documentos medicos y solicitudes de subida

## Objetivo

Medfile debe permitir que el medico reciba examenes, fotos y archivos de pacientes desde movil. El flujo debe ser simple para el paciente y controlado para el medico.

Este corte crea la base funcional sin integrar aun object storage real:

- Bandeja de documentos recibidos.
- Solicitudes de subida con token.
- Portal de paciente que puede leer una solicitud por token.
- Registro simulado de documento recibido.

## Principios

- Los archivos binarios no deben guardarse en MongoDB.
- MongoDB guarda metadatos: paciente, tenant, nombre, tipo, origen, estado y storage key.
- Las subidas reales deben usar object storage compatible con S3/R2 y URLs firmadas.
- El enlace de paciente debe tener token y expiracion.
- El medico debe revisar y clasificar antes de asociar definitivamente a la historia.

## Modelos

### MedicalDocument

- `tenantId`
- `patientId`
- `name`
- `mimeType`
- `storageKey`
- `source`
- `status`
- `documentType`
- `notes`
- `uploadRequestId`

### UploadRequest

- `tenantId`
- `patientId`
- `token`
- `title`
- `instructions`
- `status`
- `expiresAt`

## Endpoints iniciales

- `GET /api/documents/inbox`
- `GET /api/documents?patientId=...`
- `POST /api/documents/upload-requests`
- `GET /api/documents/upload-requests/:token`
- `POST /api/documents/upload-requests/:token/complete`

## Pantallas iniciales

- `/documentos`: bandeja operativa del medico con documentos pendientes de revision, selector de paciente y creacion de solicitudes.
- `/pacientes/[id]`: seccion de documentos del paciente con listado completo y solicitud de subida con paciente preseleccionado.
- `/paciente/subir`: dos modos segun contexto:
  - **Sin token** (demo/marketing): pagina para el **medico** que explica la funcion, los 3 pasos del flujo y muestra una vista previa de lo que ve el paciente.
  - **`?token=...`** (enlace real): portal **minimalista del paciente** solo para subir el archivo; sin copy de marketing.

## Implementacion actual

Backend:

- `MedicalDocumentSchema` ahora incluye tipo, notas y `uploadRequestId`.
- `UploadRequestSchema` modela enlaces seguros con token y expiracion.
- `DocumentsController` expone bandeja, listado por paciente, creacion, lectura y completado de solicitudes.
- `DocumentsService` registra documentos simulados con `storageKey` temporal bajo `pending/`.

Frontend:

- `/documentos` muestra bandeja, fallback demo y formulario para crear enlace seguro.
- `DocumentList` y `UploadRequestForm` reutilizan listado y creacion de solicitudes.
- `/documentos` enlaza cada documento al perfil del paciente (`/pacientes/:id`).
- `/pacientes/[id]` lista documentos del paciente y permite solicitar subida sin pedir ID manual.
- `DoctorShell` enlaza hacia `/documentos`.
- `/paciente/subir` sin token: demo orientada al medico (nav + footer + CTA registro).
- `/paciente/subir?token=...`: UI minima del paciente; titulo de pagina "Subir documento".
- Enlaces en nav y documentos usan etiquetas del medico ("Enlace pacientes", "Vista demo del enlace"), no "Portal paciente".
- **`UploadRequestForm`**: flujo en 2 pasos (configurar → compartir). Tras crear el enlace muestra **URL absoluta** con **Copiar** (util `copy-to-clipboard.ts` con fallback `execCommand` en HTTP/LAN), **WhatsApp** y **Probar enlace**. `MfButton` reenvía listeners (`@click`) aunque renderice enlace o botón.
- `/paciente/subir?token=…`: portal del paciente con botones **Tomar foto** (`capture=environment`) y **Elegir archivo** (galeria + PDF), vista previa de imagen y validacion de enlace expirado/usado en backend.

Limitacion en desarrollo local:

- Si `NUXT_PUBLIC_API_URL` apunta a `localhost` y el paciente abre el enlace desde el movil (IP LAN), la subida fallaba: la web reescribe el host al de la pagina (`utils/public-api-url.ts`).
- Sin variables `S3_*`, el modo **mock** guarda solo metadatos en MongoDB; el binario no se almacena y **Ver archivo** avisa que falta storage.

## Ver / descargar documento

- `GET /api/documents/:id/download-url` (medico autenticado): devuelve `viewUrl` (inline) y `downloadUrl` (attachment) firmadas en R2/S2, o mensaje en modo mock.
- `DocumentList`: botones **Ver pantalla completa** y **Descargar**.
- `DocumentViewerModal`: visor a pantalla completa para imagenes y PDF; acciones Descargar y Nueva pestaña.
- En local, `useMedfileApi` y `/paciente/subir` reescriben `localhost` en la URL del API al host LAN de la pagina (evita bloqueo de acceso a red local del navegador).

## Siguientes extensiones

- Previsualizacion embebida imagen/PDF en modal (sin abrir pestaña).
- Clasificacion por tipo de documento.
- Asociar documento a consulta.
- Antivirus/escaneo.
- Auditoria de descarga, vista y eliminacion.

