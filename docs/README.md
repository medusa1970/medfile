# Documentacion de Medfile

Medfile es una aplicacion SaaS **para medicos independientes**. Esta carpeta concentra la vision del producto, las reglas de experiencia, la funcionalidad y la arquitectura tecnica.

## Como leer esta documentacion

| Si necesitas… | Empieza aqui |
|---------------|--------------|
| Entender que es Medfile y para quien | [00-vision-producto.md](./00-vision-producto.md) |
| Saber que debe sentirse la app (moderna, practica, elegante, intuitiva) | [16-principios-experiencia.md](./16-principios-experiencia.md) |
| Ver que pantallas y flujos existen hoy | [17-funcionalidad-catalogo.md](./17-funcionalidad-catalogo.md) |
| **Funcionalidades del medico + roadmap** | [28-medico-funcionalidades-y-roadmap.md](./28-medico-funcionalidades-y-roadmap.md) |
| Ver **gratis vs. de pago** | [20-gratis-vs-pago.md](./20-gratis-vs-pago.md) |
| Ver **Mercado Pago / checkout** | [26-mercadopago-bolivia.md](./26-mercadopago-bolivia.md) |
| **QR Banco Económico (BOB)** | [30-banco-economico-qr-bolivia.md](./30-banco-economico-qr-bolivia.md) |
| **Panel admin plataforma** | [31-panel-admin-plataforma.md](./31-panel-admin-plataforma.md) |
| **Publicar en produccion (Railway + medfile.my)** | [27-despliegue-railway-medfile-my.md](./27-despliegue-railway-medfile-my.md) |
| Ver **planes medico independiente + costos** | [24-planes-medico-independiente-bolivia.md](./24-planes-medico-independiente-bolivia.md) |
| **Compartir historial** entre medicos Medfile | [22-intercambio-historiales-entre-medicos.md](./22-intercambio-historiales-entre-medicos.md) |
| **Equipo del medico** (asistente, enfermeria, vs compartir colega) | [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md) |
| **Codigo Medfile** (identificador del consultorio) | [23-codigo-medfile.md](./23-codigo-medfile.md) |
| Que servicios adicionales podemos ofrecer | [19-servicios-adicionales-catalogo.md](./19-servicios-adicionales-catalogo.md) |
| Colores, tipografia, componentes UI | [03-sistema-diseno.md](./03-sistema-diseno.md) |
| Modulos planeados y flujos del MVP | [02-modulos-y-flujos.md](./02-modulos-y-flujos.md) |
| Arrancar el proyecto en local | [14-desarrollo-local-terminales.md](./14-desarrollo-local-terminales.md) (incl. `.env.local` espejo de Railway) |

## Indice por tema

### Producto y negocio

| Doc | Contenido |
|-----|-----------|
| [00-vision-producto.md](./00-vision-producto.md) | Proposito, usuarios, principios, alcance MVP |
| [02-modulos-y-flujos.md](./02-modulos-y-flujos.md) | Modulos del producto y flujos criticos |
| [11-suscripciones-limites.md](./11-suscripciones-limites.md) | Planes, limites y pagos |
| [18-modelo-freemium-y-oferta.md](./18-modelo-freemium-y-oferta.md) | **Freemium**, matriz de funciones, WhatsApp, sin trial |
| [19-servicios-adicionales-catalogo.md](./19-servicios-adicionales-catalogo.md) | **Catalogo de servicios** add-ons, comunicacion, soporte |
| [20-gratis-vs-pago.md](./20-gratis-vs-pago.md) | **Gratis vs. de pago** — referencia rapida |
| [21-whatsapp-cobro-por-medico-bolivia.md](./21-whatsapp-cobro-por-medico-bolivia.md) | WhatsApp API: **cobro por medico**, tarifas Bolivia (+591) |
| [23-codigo-medfile.md](./23-codigo-medfile.md) | **Codigo Medfile** (`MF-XXXXXX`) |
| [24-planes-medico-independiente-bolivia.md](./24-planes-medico-independiente-bolivia.md) | **Planes 1 medico**, precios USD/BOB y costos |
| [30-banco-economico-qr-bolivia.md](./30-banco-economico-qr-bolivia.md) | **QR Banco Económico**, precios BOB, checkout |
| [31-panel-admin-plataforma.md](./31-panel-admin-plataforma.md) | **Panel admin**: clientes, pagos, estados |
| [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md) | **Asistente**, captura clinica (enfermeria), permisos y planes |

### Experiencia e interfaz

| Doc | Contenido |
|-----|-----------|
| [16-principios-experiencia.md](./16-principios-experiencia.md) | Principios UX: moderna, practica, elegante, intuitiva |
| [03-sistema-diseno.md](./03-sistema-diseno.md) | Tokens, marca, componentes, responsive |
| [04-analisis-boceto-html.md](./04-analisis-boceto-html.md) | Referencia del boceto HTML inicial |

### Funcionalidad (por dominio)

| Doc | Contenido |
|-----|-----------|
| [17-funcionalidad-catalogo.md](./17-funcionalidad-catalogo.md) | **Indice vivo** de rutas, estado y enlaces |
| [28-medico-funcionalidades-y-roadmap.md](./28-medico-funcionalidades-y-roadmap.md) | Beneficios medico, accesos rapidos y roadmap |
| [06-auth-onboarding.md](./06-auth-onboarding.md) | Registro, login, tenant, onboarding |
| [07-pacientes-historia-clinica.md](./07-pacientes-historia-clinica.md) | Pacientes e historia clinica base |
| [08-perfil-paciente-consultas.md](./08-perfil-paciente-consultas.md) | Perfil clinico y consultas |
| [09-documentos-solicitudes-subida.md](./09-documentos-solicitudes-subida.md) | Documentos y enlaces para pacientes |
| [15-historia-clinica-emergencia.md](./15-historia-clinica-emergencia.md) | Formulario de urgencias |
| [22-intercambio-historiales-entre-medicos.md](./22-intercambio-historiales-entre-medicos.md) | Compartir historial entre medicos |
| [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md) | Equipo delegado vs compartir colega |
| [30-banco-economico-qr-bolivia.md](./30-banco-economico-qr-bolivia.md) | Pago QR Banco Económico |
| [31-panel-admin-plataforma.md](./31-panel-admin-plataforma.md) | Admin interno Medfile |

### Tecnico y operacion

| Doc | Contenido |
|-----|-----------|
| [01-arquitectura-tecnica.md](./01-arquitectura-tecnica.md) | Nuxt, Nest, MongoDB, storage, mobile |
| [05-estructura-workspace.md](./05-estructura-workspace.md) | Monorepo y carpetas |
| [10-storage-uploads-firmados.md](./10-storage-uploads-firmados.md) | S3/R2 y URLs firmadas |
| [12-seguridad-tenant-sesion.md](./12-seguridad-tenant-sesion.md) | JWT, tenant, seguridad |
| [13-mongodb-local-cloudinary.md](./13-mongodb-local-cloudinary.md) | MongoDB local y storage |
| [14-desarrollo-local-terminales.md](./14-desarrollo-local-terminales.md) | Terminales, `.env.local`, espejo Railway |
| [27-despliegue-railway-medfile-my.md](./27-despliegue-railway-medfile-my.md) | Produccion: Railway, GitHub, DNS, email, pagos |

## Regla para mantener la documentacion al dia

Cada cambio significativo de producto, UI o backend debe dejar rastro:

1. **Nueva pantalla o flujo** → actualizar [17-funcionalidad-catalogo.md](./17-funcionalidad-catalogo.md) y el doc de dominio correspondiente (06–09, 11, 15).
2. **Cambio visual o de patron UI** → actualizar [03-sistema-diseno.md](./03-sistema-diseno.md) y, si afecta principios, [16-principios-experiencia.md](./16-principios-experiencia.md).
3. **Nuevo modulo o decision de arquitectura** → crear o ampliar doc en `docs/` y enlazarlo desde este README.

## Usuario principal vs. paciente

Medfile es la **app del medico**. El paciente solo interactua por **enlaces puntuales** (por ejemplo, subir un examen). Toda la documentacion de marketing, dashboard y navegacion debe hablarle al medico; las vistas de paciente deben ser minimas y claramente separadas. Ver [16-principios-experiencia.md](./16-principios-experiencia.md).
