# Sistema de diseno de Medfile

## Objetivo

Medfile debe tener una interfaz consistente en web escritorio, web movil y app movil. Si se cambia un color, un radio, un boton o un patron de formulario, el cambio debe propagarse a toda la aplicacion sin editar vista por vista.

Los principios de experiencia (moderna, practica, elegante, intuitiva) estan en [16-principios-experiencia.md](./16-principios-experiencia.md). El catalogo de pantallas y funcionalidad en [17-funcionalidad-catalogo.md](./17-funcionalidad-catalogo.md).

## Principio principal

Las pantallas no deben definir estilos propios salvo excepciones justificadas. Deben componerse usando tokens, layouts y componentes compartidos.

## Marca oficial

El logo oficial de Medfile es `logo_medfile.svg`. En la aplicacion web se sirve desde `apps/web/public/brand/logo_medfile.svg` y debe consumirse mediante el componente `BrandLogo`.

No se debe volver a crear el logo con texto, iconos sueltos o monogramas por pantalla. Si cambia el logo, se reemplaza el asset central y se ajusta `BrandLogo` si hace falta.

### Colores de marca (logotipo)

Los tokens en `packages/ui/src/tokens.css` reflejan la paleta oficial:

| Token | Hex | Uso |
|-------|-----|-----|
| `--mf-navy-900` | `#001F5C` | Texto principal, sidebar, fondos oscuros |
| `--mf-navy-800` | `#002855` | Variante navy |
| `--mf-brand-500` | `#0077C8` | Acento medio del logo |
| `--mf-teal-500` | `#00A9CE` | CTAs, acentos activos, gradientes |
| `--mf-teal-400` | `#00B5E2` | Hover y highlights |
| `--mf-neutral-500` | `#75787B` | Texto secundario, slogan |

Los botones primarios usan gradiente `--mf-teal-500` → `--mf-brand-500`.

### Tipografia

| Token | Familia | Uso |
|-------|---------|-----|
| `--mf-font-display` | Plus Jakarta Sans | Titulos (h1–h4), cifras destacadas |
| `--mf-font-sans` | Source Sans 3 | Cuerpo, botones, formularios |

Reglas: peso 600–700 en titulos (no 800–900), `letter-spacing: -0.02em` maximo, line-height 1.12–1.2 en heroes.

Las fuentes se cargan via Google Fonts en `apps/web/nuxt.config.ts`.

Iconografia de landing: componente `MedIcon` (`apps/web/components/ui/MedIcon.vue`) con iconos SVG medicos (calendario, carpeta, subida, escudo, etc.). Evitar numeros solos como unico indicador visual en secciones de marketing.

Layouts compactos en movil: clases `section--compact`, `workflow-grid--compact`, `feature-grid--compact` en `marketing.css`. Preview del producto sin sidebar en landing (`preview-body--compact` con `grid-template-columns: 1fr`; el grid base de `preview-body` reserva 160px para sidebar y deja hueco si no hay columna lateral); metricas en fila de 3; maximo 2 filas de pacientes/documentos.

Nav marketing (`MarketingNav`, clase `marketing-nav`): cabecera fija en landing con layout de tres zonas en escritorio — logo, enlaces centrales en **píldora** (4 secciones) y acciones a la derecha (texto «Iniciar sesión» + CTA). En móvil solo logo + icono inicio (si aplica) + hamburguesa; acciones y secciones van en **drawer lateral** (`Teleport` a `body`). Estado activo por scroll o ancla solo tras hidratación (`navReady`) para evitar mismatch SSR. CSS global en `nuxt.config` con alias `@/assets/css/…`.

Flujos de cuenta (`AuthShell`, clase `auth-page`, `auth.css`): cabecera `MarketingNav` (sin logo duplicado en el panel intro). Pantallas: `/registro`, `/login`, `/verificar-correo`, `/onboarding`. Registro pide **nombre(s) y apellido(s)** por separado; pilares breves en intro (Gratis, Colegas/compartir, Codigo Medfile, Tus datos). Landing: callout `plan-share-callout` en `#gratis-vs-pago`.

Footer marketing (`MarketingFooter`): fondo navy con logo en pastilla blanca, tagline, CTA, columnas de enlaces con áreas táctiles ≥42px, píldoras de confianza y barra legal. Responsive: dos columnas Producto/Cuenta en móvil. Escala tipográfica móvil landing (`--mf-landing-*` en `marketing.css`): títulos 22px, hero 30px, cuerpo 15px, secundario 14px, labels 12px.

Panel medico (`DoctorShell`): en movil el sidebar pasa a drawer lateral; la barra superior fija incluye icono **Inicio** (dashboard), titulo de seccion activa y menu hamburguesa.

Dashboard (`/dashboard`, clase `dashboard-page`): layout compacto alineado con el **preview de la landing** (`product-preview--compact` en `index.vue`). Cabecera tipo tarjeta (`dashboard-topbar`) con plan, saludo breve y busqueda; metricas en `metric-grid metric-grid--dashboard` (4 columnas escritorio, **2x2 en movil**); `MedfileCodeCard` con prop `compact`; paneles con `dashboard-grid--compact` y `UploadZone compact`. Estilos en `main.css`. Reutiliza `MetricCard`, `PanelCard` y `PatientRow`.

Modulo **Pacientes** (`/pacientes`): mismo patron `dashboard-page` + `metric-grid--dashboard`. La clase legacy `clinical-summary` comparte estilos compactos (2x2 movil) en documentos y suscripcion.

Formulario **nuevo paciente** (`/pacientes/nuevo`): campos con etiqueta flotante dentro del control (`FormField` / `FormSelectField` con prop `inset-label` + `icon`; opcionales con `optional` → sufijo «· opcional»). Clases CSS `form-field--inset`, `form-field--date` (fecha sin solapamiento con máscara nativa), `patient-form--inset` en `main.css`. Iconos via `MedIcon` (usuario, documento, calendario, domicilio, telefono, correo, seguro).

## Capas recomendadas

### 1. Tokens

Los tokens son la fuente de verdad visual:

- Colores.
- Tipografia.
- Espaciado.
- Radios.
- Bordes.
- Sombras.
- Breakpoints.
- Estados: success, warning, danger, info, neutral.

Ejemplos:

```ts
export const colors = {
  brand: {
    50: '#eff6ff',
    500: '#2563eb',
    700: '#1d4ed8',
  },
  danger: {
    50: '#fef2f2',
    600: '#dc2626',
  },
}
```

### 2. Componentes base

Componentes que todas las pantallas deben reutilizar:

- `Button`
- `Input`
- `Select`
- `Textarea`
- `Checkbox`
- `DateField`
- `FileUploader`
- `Card`
- `Badge`
- `Alert`
- `Modal`
- `Drawer`
- `Tabs`
- `Table`
- `EmptyState`
- `Toast`
- `Avatar`
- `PageHeader`
- `AppShell`

### 3. Componentes de dominio medico

Componentes propios de Medfile:

- `PatientCard`
- `PatientSearch`
- `PatientTimeline`
- `VitalSignsGrid`
- `AllergyAlert`
- `ClinicalNoteEditor`
- `DocumentPreview`
- `UploadRequestPanel`
- `SubscriptionBanner`
- `AppointmentList`

### 4. Layouts

Layouts recomendados:

- `PublicLayout`: landing, login, registro.
- `DoctorAppLayout`: sidebar en escritorio, bottom navigation o drawer en movil.
- `PatientPortalLayout`: experiencia simplificada para pacientes.
- `AdminLayout`: administracion interna.

## Responsive

Medfile debe ser mobile-first para flujos de paciente y desktop-first para flujos intensivos del medico. Eso implica:

- El portal de paciente debe funcionar perfectamente desde telefono.
- La carga de fotos debe permitir camara y archivos.
- La historia clinica en escritorio debe aprovechar dos columnas cuando sea util.
- Las tablas deben convertirse en listas/tarjetas en movil.
- Las acciones criticas deben estar accesibles con una mano en movil.

## Reglas para evitar duplicacion

- No usar estilos inline en pantallas de produccion.
- No repetir colores hexadecimales en componentes.
- No crear variantes visuales nuevas sin agregarlas al sistema.
- No hacer tablas diferentes para cada modulo si comparten comportamiento.
- No mezclar logica clinica con componentes visuales base.
- No usar emojis como iconografia final; elegir una libreria consistente de iconos.

## Adaptacion del boceto actual

El boceto ya tiene una buena direccion visual: sidebar, topbar, tarjetas, estados, tablas, modales y timeline. Para convertirlo en producto:

- Reemplazar CSS global largo por tokens y componentes.
- Convertir cada seccion en componentes Nuxt/Vue.
- Separar layout de contenido.
- Reemplazar HTML generado por strings por componentes declarativos.
- Crear una estrategia de navegacion real con rutas.
- Sustituir datos mock por API y estados de carga/error.
- Crear variantes mobile reales para tablas, filtros y perfil clinico.

## Componentes prioritarios para construir primero

1. `AppShell`
2. `PageHeader`
3. `Button`
4. `Card`
5. `FormField`
6. `DataTable`
7. `StatusBadge`
8. `PatientSummary`
9. `ClinicalTimeline`
10. `FileUploader`

Construir estos componentes primero evitara rehacer pantallas despues.

## Marketing y planes

La landing incluye una seccion **Gratis vs. de pago** (`#gratis-vs-pago`) con badges `plan-tier-badge--free` y `plan-tier-badge--paid`. La pagina `/suscripcion` repite la comparativa con capabilities por plan. Referencia de producto: [20-gratis-vs-pago.md](./20-gratis-vs-pago.md).

