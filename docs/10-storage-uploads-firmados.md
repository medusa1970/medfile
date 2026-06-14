# Storage y subidas firmadas

## Objetivo

Medfile debe recibir archivos medicos sin pasar binarios por MongoDB. La API debe generar una URL firmada temporal para que el navegador suba el archivo directamente a un storage compatible con S3/R2.

Este corte prepara la arquitectura de subida real y mantiene modo `mock` si no hay credenciales configuradas.

## Flujo esperado

1. El medico crea una solicitud de subida.
2. El paciente abre `/paciente/subir?token=...`.
3. El portal lee la solicitud.
4. El paciente selecciona foto o PDF.
5. El portal pide una URL firmada al API.
6. El navegador sube el archivo directamente al storage.
7. El portal notifica al API que la solicitud fue completada.
8. El API registra `MedicalDocument` con `storageKey`.

## Endpoints

- `POST /api/documents/upload-requests/:token/upload-url`
- `POST /api/documents/upload-requests/:token/complete`

## Implementacion actual

Backend:

- `StorageModule` y `StorageService` generan keys privadas por tenant/paciente.
- Si hay credenciales S3/R2, se genera URL firmada `PUT`.
- Si faltan credenciales, se devuelve `mode: mock` para desarrollo.
- `CompleteUploadRequestDto` acepta `storageKey`.
- `DocumentsService` registra el documento con el `storageKey` generado.

Frontend:

- `/paciente/subir` captura el archivo seleccionado.
- Pide URL de subida al API.
- Si `mode` es `presigned`, sube el archivo directamente al storage.
- Si `mode` es `mock`, omite la subida binaria y registra metadatos.
- Luego completa la solicitud para que aparezca en la bandeja del medico.

## Variables de entorno

- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_FORCE_PATH_STYLE`

## Modo mock

Si faltan credenciales, el API devuelve una respuesta `mode: mock`. Esto permite desarrollar el flujo visual y de metadatos sin storage real. En produccion, el sistema debe exigir storage configurado.

## Seguridad pendiente

- Limitar tamano de archivo.
- Validar MIME real en backend.
- Escaneo antivirus.
- Expiracion corta de URL firmada.
- Politicas privadas de bucket.
- Auditoria de descarga y vista.

