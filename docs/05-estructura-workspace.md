# Estructura recomendada del workspace

## Recomendacion

La carpeta actual debe convertirse en un monorepo. Es la opcion mas apropiada para Medfile porque el producto tendra frontend web, backend, tipos compartidos, componentes reutilizables, documentacion y posiblemente app movil usando la misma base.

La recomendacion concreta original era usar:

- `pnpm` como package manager.
- `pnpm workspaces` para manejar apps y paquetes.
- `Turborepo` opcional desde el inicio si queremos pipelines rapidos de build, lint y test.
- `Nuxt` para la aplicacion web.
- `NestJS` para la API.
- `MongoDB` para datos principales.
- Object storage compatible con S3 para archivos medicos.

Nota de implementacion actual: en este entorno `pnpm` no estaba disponible y Corepack no pudo activarlo por permisos/firma local, asi que el workspace inicial se creo con `npm workspaces`. La arquitectura no cambia. Si mas adelante se instala `pnpm`, se puede migrar sin reestructurar `apps/` y `packages/`.

## Estructura base

```text
medicenter/
  apps/
    web/
      # Nuxt: landing, app del medico y portal del paciente
    api/
      # NestJS: API, auth, tenants, pacientes, documentos, pagos
  packages/
    ui/
      # Componentes visuales compartidos y sistema de diseno
    types/
      # Tipos compartidos entre web y api
    config/
      # Configuracion compartida de TypeScript, ESLint, Prettier
  docs/
    # Documentacion de producto y arquitectura
  Qwen_html_20260506_k6llk0j3h.html
    # Boceto original de referencia
```

## Por que monorepo

Un monorepo evita que el frontend y backend evolucionen separados sin contrato claro. En Medfile eso importa porque vamos a compartir:

- Tipos de pacientes, consultas, documentos y suscripciones.
- Validaciones y constantes de dominio.
- Sistema de diseno.
- Scripts de desarrollo.
- Versionado coordinado.
- Documentacion junto al codigo.

## Apps iniciales

### `apps/web`

Aplicacion Nuxt.

Debe contener:

- Landing publica de `medfile.my`.
- Registro/login del medico.
- Dashboard del medico.
- Gestion de pacientes.
- Historia clinica.
- Bandeja de documentos.
- Portal de paciente por enlace seguro.
- Pantallas de suscripcion y pago.

La web debe ser responsive desde el inicio. Para el MVP, tambien puede funcionar como PWA.

### `apps/api`

API NestJS.

Debe contener:

- Autenticacion.
- Tenants.
- Usuarios y roles.
- Suscripciones.
- Pacientes.
- Consultas.
- Documentos.
- Solicitudes de subida.
- Citas.
- Auditoria.
- Webhooks de pago.

La API debe ser la unica autoridad para permisos, tenant actual, estado de suscripcion y acceso a datos.

## Paquetes compartidos

### `packages/ui`

Sistema visual compartido.

Debe contener:

- Tokens.
- Botones.
- Inputs.
- Cards.
- Modales.
- Tablas.
- Badges.
- Layouts.
- Componentes medicos reutilizables.

Esto cumple tu requisito de que al modificar un diseno se afecte todo el sistema sin cambiar vista por vista.

### `packages/types`

Tipos y contratos compartidos.

Debe contener:

- DTOs.
- Enums.
- Tipos de dominio.
- Constantes compartidas.
- Respuestas API comunes.

### `packages/config`

Configuracion comun.

Debe contener:

- TypeScript base.
- ESLint.
- Prettier.
- Configuracion de testing.
- Convenciones compartidas.

## App movil

Para el MVP no recomiendo crear una app movil nativa separada desde el primer dia. Recomiendo este orden:

1. Crear `apps/web` responsive y PWA-ready.
2. Asegurar que el portal de paciente funcione excelente en movil.
3. Cuando la web este estable, envolver con Capacitor si se necesita publicar en App Store / Play Store.
4. Crear app nativa separada solo si aparecen necesidades reales que la PWA/Capacitor no resuelven.

Esto reduce costo y evita duplicar pantallas, validaciones y UI.

## Herramientas recomendadas

- `pnpm`: workspaces rapidos y estrictos.
- `TypeScript`: en todo el monorepo.
- `Zod` o `class-validator`: validacion clara de datos.
- `Tailwind CSS` con tokens propios o CSS variables centralizadas.
- `Pinia`: estado frontend si Nuxt composables no alcanzan.
- `Mongoose` o driver MongoDB con repositorios claros.
- `Stripe` o proveedor de pago equivalente segun mercado.
- `S3/R2`: almacenamiento de archivos.

## Decision final recomendada

Convertir esta carpeta en monorepo con `apps/web`, `apps/api` y `packages/*` es la opcion mas apropiada para Medfile. Mantiene el proyecto ordenado, permite crecer a app movil sin rehacer todo, facilita compartir diseno/tipos y prepara el producto para SaaS multi-tenant desde el inicio.

