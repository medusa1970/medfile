# Catalogo de funcionalidad

Indice **vivo** de lo que Medfile ofrece hoy en web. Se actualiza cuando se agregan pantallas, flujos o cambia el estado de implementacion.

**Leyenda de estado**

| Estado | Significado |
|--------|-------------|
| ✅ Implementado | Pantalla y flujo base operativos (puede usar datos demo si el API no esta) |
| 🟡 Parcial | UI o backend incompletos; limitaciones documentadas |
| ⬜ Pendiente | Definido en producto pero no construido |

**Audiencia**

| Codigo | Quien |
|--------|-------|
| 🩺 Medico | Usuario principal de la app |
| 👤 Paciente | Solo via enlace puntual |
| 🌐 Publico | Sin sesion (landing, registro) |

---

## Mapa de rutas web

Base local: `http://localhost:3100`

### Area publica (🌐)

| Ruta | Estado | Descripcion | Doc |
|------|--------|-------------|-----|
| `/` | ✅ | Landing de conversion: hero, flujo, herramientas, demo de documentos, planes, CTA | [16-principios-experiencia.md](./16-principios-experiencia.md) |
| `/registro` | ✅ | Alta del medico, nombre(s)+apellido(s), tenant, plan Gratis; aviso compartir historiales | [06-auth-onboarding.md](./06-auth-onboarding.md), [22-intercambio-historiales-entre-medicos.md](./22-intercambio-historiales-entre-medicos.md) |
| `/login` | ✅ | Acceso; redirige a verificar / onboarding / dashboard | [06-auth-onboarding.md](./06-auth-onboarding.md) |
| `/olvide-contrasena` | ✅ | Solicitud de restablecimiento de contrasena | [06-auth-onboarding.md](./06-auth-onboarding.md) |
| `/restablecer-contrasena` | ✅ | Nueva contrasena con token de un solo uso | [06-auth-onboarding.md](./06-auth-onboarding.md) |
| `/cuenta` | ✅ | Mi perfil: nombre, telefono, cambio de contrasena | [06-auth-onboarding.md](./06-auth-onboarding.md) |
| `/verificar-correo` | ✅ | Codigo OTP de 6 digitos tras registro | [06-auth-onboarding.md](./06-auth-onboarding.md) |

### Onboarding (🩺)

| Ruta | Estado | Descripcion | Doc |
|------|--------|-------------|-----|
| `/onboarding` | ✅ | Perfil profesional inicial tras registro | [06-auth-onboarding.md](./06-auth-onboarding.md) |

### App del medico (🩺)

| Ruta | Estado | Descripcion | Doc |
|------|--------|-------------|-----|
| `/dashboard` | ✅ | Resumen compacto: accesos rápidos **según plan y rol** (tiles bloqueados → `/suscripcion?upgrade=`), métricas, pacientes prioritarios, bandeja | [28-medico-funcionalidades-y-roadmap.md](./28-medico-funcionalidades-y-roadmap.md) |
| `/pacientes` | ✅ | Listado y busqueda de pacientes | [07-pacientes-historia-clinica.md](./07-pacientes-historia-clinica.md) |
| `/pacientes/nuevo` | ✅ | Registro de paciente | [07-pacientes-historia-clinica.md](./07-pacientes-historia-clinica.md) |
| `/pacientes/[id]` | 🟡 | Perfil resumido: alertas, timeline, documentos, vitales enfermería (Pro), agregar a cola | [08-perfil-paciente-consultas.md](./08-perfil-paciente-consultas.md) |
| `/pacientes/[id]/editar` | ✅ | Editar filiacion y contacto del paciente | [07-pacientes-historia-clinica.md](./07-pacientes-historia-clinica.md) |
| `/pacientes/[id]/antecedentes` | ✅ | Antecedentes medicos del paciente | [08-perfil-paciente-consultas.md](./08-perfil-paciente-consultas.md) |
| `/pacientes/[id]/nueva-atencion` | ✅ | Registrar consulta o emergencia | [15-historia-clinica-emergencia.md](./15-historia-clinica-emergencia.md) |
| `/pacientes/[id]/solicitar-subida` | ✅ | Crear enlace de subida para el paciente | [09-documentos-subida.md](./09-documentos-subida.md) |
| `/pacientes/[id]/compartir` | ✅ | Compartir historial con colega Medfile (Profesional) | [22-intercambio-historiales-entre-medicos.md](./22-intercambio-historiales-entre-medicos.md) |
| `/compartidos` | ✅ | Historial compartido **entre medicos** (inter-tenant) | [22-intercambio-historiales-entre-medicos.md](./22-intercambio-historiales-entre-medicos.md) |
| `/cuenta/equipo` | ✅ | Invitar asistente o captura clínica; clínicas; auditoría (Pro) | [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md) |
| `/cola-clinica` | ✅ | Cola del día y captura de signos vitales (rol `clinical_capture` o titular) | [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md) |
| `/equipo/aceptar` | ✅ | Aceptar invitacion con token (publico) | [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md) |
| `/documentos` | 🟡 | Bandeja de documentos recibidos; crear enlace de subida | [09-documentos-solicitudes-subida.md](./09-documentos-solicitudes-subida.md) |
| `/suscripcion` | ✅ | Plan actual, uso, comparativa gratis vs. pago; precios en **BOB**; Mercado Pago + QR Banco Económico | [11-suscripciones-limites.md](./11-suscripciones-limites.md), [30-banco-economico-qr-bolivia.md](./30-banco-economico-qr-bolivia.md) |

### Panel admin plataforma (🔧 solo `MEDFILE_ADMIN_EMAILS`)

| Ruta | Estado | Descripcion | Doc |
|------|--------|-------------|-----|
| `/admin/login` | ✅ | Acceso restringido equipo Medfile | [31-panel-admin-plataforma.md](./31-panel-admin-plataforma.md) |
| `/admin` | ✅ | Resumen: consultorios, usuarios, suscripciones | [31-panel-admin-plataforma.md](./31-panel-admin-plataforma.md) |
| `/admin/clientes` | ✅ | Listado médicos/tenants, plan, estado, proveedor pago | [31-panel-admin-plataforma.md](./31-panel-admin-plataforma.md) |
| `/admin/configuracion` | ✅ | Toggles Mercado Pago / QR Banco Económico | [30-banco-economico-qr-bolivia.md](./30-banco-economico-qr-bolivia.md), [31-panel-admin-plataforma.md](./31-panel-admin-plataforma.md) |

### Enlace del paciente (👤)

| Ruta | Estado | Descripcion | Doc |
|------|--------|-------------|-----|
| `/paciente/subir` | 🟡 | **Sin token:** demo para el medico (como funciona el enlace). **Con `?token=`:** subida real del paciente | [09-documentos-solicitudes-subida.md](./09-documentos-solicitudes-subida.md) |

---

## Funcionalidades por dominio

### 1. Cuenta y acceso 🩺

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Registro medico + tenant | ✅ | API `POST /api/auth/register` |
| Login JWT | ✅ | Sesion en frontend; ver [12-seguridad-tenant-sesion.md](./12-seguridad-tenant-sesion.md) |
| Onboarding perfil | ✅ | Pantalla `/onboarding` |
| Verificacion de email | ✅ | Codigo 6 digitos; API clinica bloqueada hasta verificar |
| Recuperacion de contrasena | ✅ | forgot + reset (dev: token en consola) |
| Cambio de contrasena en perfil | ✅ | Requiere contrasena actual |
| Recuperar contrasena | ⬜ | Pendiente |
| **Usuario asistente** (tenant interno) | ✅ | Plan Basico+ — [29](./29-equipo-colaboradores-y-acceso-delegado.md) |
| **Colaborador clinico** (enfermeria delegada) | ✅ | Plan Profesional; cola + vitales — doc 29 |
| **Auditoria de equipo** | ✅ | Plan Profesional; `GET /api/team/audit` |
| Compartir historial **entre medicos** | ✅ | Distinto de equipo — [22](./22-intercambio-historiales-entre-medicos.md) + doc 29 |

### 2. Pacientes e historia clinica 🩺

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| CRUD pacientes (listado, alta) | ✅ | |
| Perfil con resumen y datos | 🟡 | Timeline y secciones en evolucion |
| Antecedentes medicos (formulario) | 🟡 | `PatientBackgroundForm` |
| Consulta / encuentro de urgencia | 🟡 | `EmergencyEncounterForm`; ver [15-historia-clinica-emergencia.md](./15-historia-clinica-emergencia.md) |
| Citas | ⬜ | Definido en [02-modulos-y-flujos.md](./02-modulos-y-flujos.md) |

### 3. Documentos y subida 👤 / 🩺

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Bandeja de documentos del medico | 🟡 | `/documentos`; fallback demo |
| Crear solicitud de subida (enlace) | 🟡 | Desde documentos o perfil de paciente |
| Portal paciente con token | 🟡 | Subida; storage real S3/R2 pendiente |
| Demo del enlace (sin token) | ✅ | Explicacion al medico en `/paciente/subir` |
| Clasificar / previsualizar PDF | ⬜ | Pendiente |

### 4. Suscripcion y limites 🩺

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Plan Gratis permanente | ✅ | `free` en backend; registro sin trial |
| WhatsApp wa.me (compartir enlace) | ✅ | Plan Gratis; `UploadRequestForm` |
| Planes Basico / Profesional (1 medico) | ✅ | Precios comerciales en **BOB** (ref. USD) — [24](./24-planes-medico-independiente-bolivia.md) |
| Pantalla de uso y limites | ✅ | `/suscripcion` comparativa gratis vs pago; montos en Bs |
| **Enforcement limites en API** | ✅ | Pacientes, subidas, storage — `PlanLimitsService` |
| Avisos uso >= 80 % | ✅ | Dashboard + `/suscripcion` |
| Reset contadores mensuales | ✅ | Lazy por `usagePeriodMonth` |
| WhatsApp Business API | ⬜ | Basico+; cupo incluido — [25](./25-whatsapp-incluido-en-planes.md) |
| Recordatorios email | ⬜ | Basico+ |
| Codigo Medfile por consultorio | ✅ | Generado al registro; [23](./23-codigo-medfile.md) |
| Compartir historial (solo lectura) | ✅ | `ClinicalShare` + `/compartidos` |
| Colaborar / transferir paciente | ⬜ | Fase 2–3 — [22](./22-intercambio-historiales-entre-medicos.md) |
| Checkout Mercado Pago | ✅ | Sandbox + mock; [26](./26-mercadopago-bolivia.md) |
| Checkout QR Banco Económico | ✅ | Live + mock; polling; webhook — [30](./30-banco-economico-qr-bolivia.md) |
| Webhooks MP | ✅ | `POST /api/webhooks/mercadopago` |
| Panel admin plataforma | ✅ | `/admin/*`; allowlist email — [31](./31-panel-admin-plataforma.md) |

Detalle comercial: [18-modelo-freemium-y-oferta.md](./18-modelo-freemium-y-oferta.md)

### 5. Marketing y conversion 🌐

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Landing responsive | ✅ | `index.vue`, `marketing.css` |
| Planes mensual / trimestral / anual en landing | ✅ | Toggle de precios; montos principales en **BOB** |
| Nav movil desplegable | ✅ | `MarketingNav` |
| Footer y CTAs a registro | ✅ | |

---

## Flujos end-to-end documentados

### Flujo A: Medico nuevo → primer paciente

1. 🌐 Landing `/` → **Empezar gratis**
2. 🩺 `/registro` → cuenta + tenant + plan `free`
3. 🩺 `/onboarding` → perfil profesional
4. 🩺 `/dashboard` → vista inicial
5. 🩺 `/pacientes/nuevo` → alta de paciente
6. 🩺 `/pacientes/[id]` → perfil clinico

Detalle: [06-auth-onboarding.md](./06-auth-onboarding.md), [07-pacientes-historia-clinica.md](./07-pacientes-historia-clinica.md)

### Flujo B: Medico recibe examen del paciente

1. 🩺 Desde `/pacientes/[id]` o `/documentos` → crear solicitud de subida
2. Sistema genera enlace `/paciente/subir?token=...`
3. 👤 Paciente abre enlace en movil → sube foto o PDF
4. 🩺 Documento aparece en bandeja `/documentos`
5. 🩺 Medico revisa y asocia al historial *(clasificacion avanzada pendiente)*

Detalle: [09-documentos-solicitudes-subida.md](./09-documentos-solicitudes-subida.md)

### Flujo C: Medico gestiona suscripcion

1. 🩺 `/suscripcion` → ve plan, uso (pacientes, storage) y comparativa gratis vs. pago
2. Compara planes en pantalla
3. ⬜ Pago real pendiente de integracion

Detalle: [11-suscripciones-limites.md](./11-suscripciones-limites.md)

---

## Componentes UI reutilizables (referencia)

| Componente | Uso |
|------------|-----|
| `BrandLogo` | Logo oficial en nav y auth |
| `MfButton` | Botones primario / secundario / ghost |
| `DoctorShell` | Layout app medico (sidebar) |
| `MarketingNav` / `MarketingFooter` | Landing y demos publicas |
| `MedIcon` | Iconografia medica SVG |
| `PanelCard`, `MetricCard`, `StatStrip`, `KeyValueGrid`, `InfoCard` | Tarjetas y resúmenes compactos |
| `QuickAccessGrid` | Accesos rapidos del dashboard (iconos compactos, 3 cols movil) |
| `SearchInput` | Campo busqueda con icono lupa |
| `PatientRow`, `DocumentList` | Listas clinicas |
| `UploadZone`, `UploadRequestForm` | Subida y solicitudes |

Lista completa de diseno: [03-sistema-diseno.md](./03-sistema-diseno.md)

---

## API backend (resumen)

Base local: `http://localhost:4000`

| Area | Endpoints principales | Doc |
|------|----------------------|-----|
| Auth | `register`, `login`, `verify-email`, `resend-verification`, `forgot-password`, `reset-password`, `change-password`, `profile`, `onboarding`, `me` | [06-auth-onboarding.md](./06-auth-onboarding.md) |
| Pacientes | CRUD bajo `/api/patients` | [07-pacientes-historia-clinica.md](./07-pacientes-historia-clinica.md) |
| Documentos | `/api/documents/*`, upload-requests | [09-documentos-solicitudes-subida.md](./09-documentos-solicitudes-subida.md) |
| Suscripciones | `/api/subscriptions/*` | [11-suscripciones-limites.md](./11-suscripciones-limites.md) |
| Pagos | `/api/payments/options`, `/api/payments/checkout`, `/api/payments/checkout/qr`, `/api/payments/checkout/:id/status`, `/api/webhooks/economico` | [26](./26-mercadopago-bolivia.md), [30](./30-banco-economico-qr-bolivia.md) |
| Equipo / invitaciones | `/api/team/*` (incl. `GET /api/team/audit`) | [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md) |
| Captura clínica | `/api/clinical-capture/*` (clínicas, cola, vitales) | [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md) |
| Admin plataforma | `/api/auth/admin/login`, `/api/admin/overview`, `/api/admin/clients`, `/api/admin/settings/payments` | [31-panel-admin-plataforma.md](./31-panel-admin-plataforma.md) |

---

## Como actualizar este catalogo

Al implementar o cambiar una funcionalidad:

1. Actualizar la fila correspondiente en **Mapa de rutas** o **Funcionalidades por dominio**.
2. Cambiar estado (✅ / 🟡 / ⬜) y notas breves.
3. Enlazar al doc de dominio si el comportamiento merece mas detalle.
4. Si el cambio afecta UX global, revisar [16-principios-experiencia.md](./16-principios-experiencia.md).
