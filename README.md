# Medfile

Medfile es una aplicacion SaaS para medicos independientes. El objetivo es que cada medico pueda registrarse con el **Plan Gratis permanente**, pagar una suscripcion cuando lo necesite y gestionar de forma aislada sus pacientes, historias clinicas, consultas, archivos medicos, citas y documentos.

Dominio: `medfile.my` (Hostinger). Despliegue previsto: **Railway** — ver [docs/27-despliegue-railway-medfile-my.md](docs/27-despliegue-railway-medfile-my.md).

Nombre comercial: `medfile`

## Estado actual

El repositorio ya esta organizado como workspace inicial para producto:

- `apps/web`: aplicacion Nuxt para landing, dashboard medico y portal paciente.
- `apps/api`: API NestJS preparada para MongoDB, autenticacion, tenants, pacientes, documentos y suscripciones.
- `packages/ui`: tokens visuales compartidos.
- `packages/types`: tipos de dominio compartidos.
- `packages/config`: espacio para configuracion comun.
- `Qwen_html_20260506_k6llk0j3h.html`

El HTML original queda como referencia visual y funcional inicial.

## Documentacion

**Indice central:** [`docs/README.md`](docs/README.md)

Documentos clave:

| Doc | Para que sirve |
|-----|----------------|
| [`docs/16-principios-experiencia.md`](docs/16-principios-experiencia.md) | App moderna, practica, elegante e intuitiva (principios UX) |
| [`docs/17-funcionalidad-catalogo.md`](docs/17-funcionalidad-catalogo.md) | Catalogo vivo de rutas, flujos y estado de implementacion |
| [`docs/18-modelo-freemium-y-oferta.md`](docs/18-modelo-freemium-y-oferta.md) | Plan Gratis, planes de pago, WhatsApp, datos nunca perdidos |
| [`docs/19-servicios-adicionales-catalogo.md`](docs/19-servicios-adicionales-catalogo.md) | **Catalogo de servicios adicionales** para ofrecer al medico |
| [`docs/03-sistema-diseno.md`](docs/03-sistema-diseno.md) | Marca, tokens, componentes UI |

## Documentacion completa (indice numerado)

- `docs/00-vision-producto.md`: vision del producto, usuarios, alcance y principios.
- `docs/01-arquitectura-tecnica.md`: arquitectura recomendada con Nuxt, Nest, MongoDB, mobile y archivos.
- `docs/02-modulos-y-flujos.md`: modulos principales y flujos del MVP.
- `docs/03-sistema-diseno.md`: reglas para estandarizar UI y evitar estilos duplicados vista por vista.
- `docs/04-analisis-boceto-html.md`: que conservar, mejorar o descartar del boceto actual.
- `docs/05-estructura-workspace.md`: estructura recomendada para convertir esta carpeta en monorepo.
- `docs/06-auth-onboarding.md`: flujo de registro, login, Plan Gratis y onboarding.
- `docs/07-pacientes-historia-clinica.md`: base de pacientes e historia clinica inicial.
- `docs/08-perfil-paciente-consultas.md`: perfil clinico de paciente y consultas.
- `docs/09-documentos-solicitudes-subida.md`: documentos medicos y solicitudes de subida.
- `docs/10-storage-uploads-firmados.md`: storage S3/R2 y URLs firmadas.
- `docs/11-suscripciones-limites.md`: planes, limites y base de pagos.
- `docs/12-seguridad-tenant-sesion.md`: JWT, tenant context y proteccion de endpoints privados.
- `docs/13-mongodb-local-cloudinary.md`: MongoDB local y decision de storage frente a Cloudinary.
- `docs/14-desarrollo-local-terminales.md`: terminales, tareas y arranque local de API + Nuxt.
- `docs/15-historia-clinica-emergencia.md`: plantilla de historia clinica de emergencia y campos del formulario fisico.
- `docs/16-principios-experiencia.md`: principios UX (moderna, practica, elegante, intuitiva).
- `docs/17-funcionalidad-catalogo.md`: catalogo de funcionalidad implementada y pendiente.
- `docs/18-modelo-freemium-y-oferta.md`: modelo freemium, oferta por plan, WhatsApp y politica de datos.
- `docs/19-servicios-adicionales-catalogo.md`: catalogo de servicios adicionales (comunicacion, add-ons, soporte).
- `docs/20-gratis-vs-pago.md`: referencia rapida gratis vs. de pago.
- `docs/21-whatsapp-cobro-por-medico-bolivia.md`: WhatsApp API — cobro por medico, tarifas Bolivia.
- `docs/23-codigo-medfile.md`: Codigo Medfile del consultorio.
- `docs/24-planes-medico-independiente-bolivia.md`: planes 1 medico, precios y costos Bolivia.

## Decision tecnica inicial

Nuxt, NestJS y MongoDB son una base razonable para este producto, siempre que se estructuren como una aplicacion multi-tenant desde el inicio. Para archivos medicos e imagenes no se recomienda guardar binarios en MongoDB; se debe usar object storage compatible con S3 y guardar solo metadatos en la base de datos.

## Comandos

```bash
npm install
npm run setup:local    # primera vez: crea .env.local (pegar vars de Railway)
npm run env:check      # valida .env.local
npm run dev:web
npm run dev:api
```

Necesitas **dos terminales** en desarrollo: una para la web y otra para el API. Variables en `.env.local` en la raiz del repo — ver [docs/14-desarrollo-local-terminales.md](docs/14-desarrollo-local-terminales.md).

Forma mas comoda en Cursor/VS Code:

1. `Ctrl + Shift + P`
2. `Tasks: Run Task`
3. `Medfile: Dev (API + Web)`

Tambien puedes usar `Ctrl + Shift + B`.

Perfiles de terminal disponibles: `Medfile Backend (API)` y `Medfile Frontend (Nuxt)`. Ver `docs/14-desarrollo-local-terminales.md`.

En desarrollo local, la web Nuxt corre en `http://localhost:3100` y el API NestJS en `http://localhost:4000`.

El navegador puede advertir sobre campos de password en HTTP durante desarrollo local. En produccion Medfile debe correr siempre con HTTPS.

Rutas web iniciales:

- `/`: landing publica.
- `/registro`: registro del medico y Plan Gratis.
- `/login`: acceso del medico.
- `/onboarding`: configuracion inicial del perfil profesional.
- `/dashboard`: dashboard medico.
- `/pacientes`: listado de pacientes.
- `/pacientes/nuevo`: registro de paciente.
- `/pacientes/[id]`: perfil clinico y timeline de consultas.
- `/documentos`: bandeja de documentos y creacion de enlaces de subida.
- `/paciente/subir`: demo del enlace para el medico (sin token) o subida del paciente (con token).
- `/suscripcion`: estado de plan, uso, comparativa gratis vs. pago y planes disponibles.

