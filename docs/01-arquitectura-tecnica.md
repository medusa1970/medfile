# Arquitectura tecnica inicial

## Recomendacion sobre el stack actual

Nuxt, NestJS y MongoDB son adecuados para Medfile si se usan con disciplina:

- Nuxt: buena opcion para web responsive, panel del medico, portal de paciente, landing publica y PWA.
- NestJS: buena opcion para API modular, autenticacion, permisos, subscripciones, webhooks, jobs y separacion de dominio.
- MongoDB: buena opcion para documentos clinicos flexibles, historiales, formularios y datos que evolucionan con el producto.

La recomendacion es mantener este stack para el MVP. El cambio mas importante no es reemplazarlo, sino organizarlo desde el inicio como SaaS multi-tenant con un sistema de diseno y contratos compartidos.

## Donde si haria cambios

- No guardar imagenes o archivos medicos en MongoDB. Usar object storage compatible con S3: AWS S3, Cloudflare R2, DigitalOcean Spaces o similar.
- No mezclar estilos por vista. Crear un paquete UI o una capa de componentes compartidos.
- No crear app movil nativa separada desde el dia uno si el equipo es pequeno. Empezar con Nuxt responsive/PWA y, si se necesita publicar en stores, usar Capacitor con la misma base Vue/Nuxt.
- Considerar PostgreSQL solo si la facturacion, contabilidad o reporteria relacional se vuelve dominante. Para el MVP, MongoDB puede funcionar bien con esquemas estrictos e indices correctos.

## Estructura recomendada de monorepo

```text
apps/
  web/                 # Nuxt: landing, app medico, portal paciente
  api/                 # NestJS: API principal
  mobile/              # Opcional: Capacitor/Ionic Vue o wrapper mobile
packages/
  ui/                  # Componentes y tokens compartidos
  types/               # DTOs, tipos compartidos y contratos
  config/              # ESLint, TypeScript, Tailwind/design tokens
docs/
  ...                  # Documentacion del producto
```

Si se prefiere mantenerlo mas simple al inicio, `apps/mobile` puede esperar. La web debe nacer responsive y PWA-ready.

## Tenancy y aislamiento de datos

Cada medico debe pertenecer a un `workspace` o `tenant`. Aunque al inicio cada tenant tenga un solo medico, modelarlo asi evita rehacer el producto cuando se agreguen asistentes, sucursales o equipos.

Toda coleccion sensible debe incluir `tenantId` y debe consultarse siempre filtrando por ese valor desde el backend. El frontend nunca debe decidir por si solo que datos pertenecen al medico.

Entidades base:

- `Tenant`: cuenta del medico o clinica individual.
- `User`: medico, asistente o administrador.
- `Patient`: paciente perteneciente a un tenant.
- `ClinicalRecord`: historial clinico agregado del paciente.
- `Encounter`: consulta, visita o evento clinico.
- `MedicalDocument`: archivo, foto, examen o adjunto.
- `PatientUploadRequest`: solicitud segura para que el paciente envie archivos.
- `Appointment`: cita o seguimiento.
- `Prescription`: indicacion o receta interna.
- `Subscription`: plan, estado, prueba y limites.
- `AuditLog`: trazabilidad de acciones sensibles.

## Autenticacion y permisos

Requisitos minimos:

- Email/password con verificacion de correo.
- Recuperacion de contrasena.
- Sesiones seguras con refresh token rotativo o cookies httpOnly.
- Roles por tenant: owner, doctor, assistant.
- Guards en NestJS para `tenantId`, rol y estado de suscripcion.
- Auditoria para ver, crear, editar, eliminar, imprimir y descargar historia clinica.

Mas adelante:

- MFA para medicos.
- Login social solo si no debilita el control de identidad.
- Sesiones activas y cierre remoto.

## Suscripciones y prueba gratis

La suscripcion debe manejarse como parte central del dominio, no como un boton aislado.

Flujo recomendado:

1. El medico se registra.
2. Se crea `Tenant`.
3. Se activa una prueba gratuita de 14 o 30 dias.
4. El sistema calcula permisos mediante `Subscription`.
5. Al vencer la prueba, se limita el acceso de forma controlada.
6. El medico puede pagar y reactivar sin perder datos.

Proveedor sugerido:

- Stripe si el mercado objetivo permite su uso.
- Paddle si se quiere resolver merchant of record en mercados internacionales.
- Mercado Pago/Azul/PayPal pueden considerarse segun pais objetivo.

El backend debe recibir webhooks de pago y actualizar `Subscription`. El frontend no debe confiar en el resultado visual del checkout como fuente de verdad.

## Archivos, fotos y examenes

Los archivos medicos deben manejarse con object storage y URLs firmadas.

Flujo de subida desde paciente:

1. El medico crea una solicitud para un paciente.
2. El sistema genera enlace seguro con expiracion.
3. El paciente abre el enlace desde movil.
4. Puede tomar foto con camara o subir archivo.
5. El archivo se sube usando URL firmada.
6. NestJS registra metadatos: tenant, paciente, tipo, fecha, origen y estado.
7. El medico revisa, clasifica y adjunta al historial.

Tipos iniciales:

- Imagen de examen.
- PDF de laboratorio.
- Foto de receta previa.
- Documento de seguro.
- Foto clinica.
- Otro documento.

## Seguridad y privacidad

Medfile manejara datos clinicos sensibles. Desde el inicio se necesita:

- HTTPS obligatorio.
- Cifrado en reposo en base de datos y storage.
- URLs firmadas con expiracion.
- Validacion de tipo y tamano de archivo.
- Antivirus o escaneo de archivos si el presupuesto lo permite.
- Backups automaticos probados.
- Logs de auditoria inmutables o dificilmente alterables.
- Rate limiting para login y enlaces publicos.
- Politica clara de retencion y eliminacion de datos.

## API modular en NestJS

Modulos recomendados:

- `auth`
- `tenants`
- `users`
- `subscriptions`
- `patients`
- `encounters`
- `documents`
- `upload-requests`
- `appointments`
- `prescriptions`
- `audit`
- `notifications`
- `admin`

Cada modulo debe exponer DTOs validados, servicios de dominio y controladores versionados.

