# Modulos y flujos del producto

> **Estado de implementacion:** ver [17-funcionalidad-catalogo.md](./17-funcionalidad-catalogo.md) para saber que rutas y flujos existen hoy en codigo.

## Modulos principales

### 1. Onboarding del medico

El medico debe poder registrarse, verificar su correo, configurar su perfil profesional y comenzar la prueba gratis. Este flujo tambien debe crear su tenant y dejar preparada la suscripcion.

Datos iniciales:

- Nombre profesional.
- Especialidad.
- Pais y zona horaria.
- Nombre visible de consulta.
- Telefono opcional.
- Logo o marca opcional.

### 2. Dashboard

El dashboard debe ayudar al medico a responder rapido: que tengo hoy, que esta pendiente y que pacientes requieren atencion.

Contenido recomendado:

- Citas de hoy.
- Pacientes recientes.
- Documentos recibidos sin revisar.
- Consultas pendientes de completar.
- Alertas clinicas simples.
- Estado de suscripcion o prueba.

### 3. Pacientes

Debe ser el nucleo operativo. La lista necesita busqueda rapida, filtros y acciones directas.

Campos minimos:

- Nombre.
- Documento o identificador opcional.
- Fecha de nacimiento.
- Sexo/genero.
- Telefono.
- Email opcional.
- Contacto de emergencia.
- Seguro opcional.
- Estado: activo, seguimiento, critico, archivado.

### 4. Historia clinica

La historia debe organizarse alrededor de eventos clinicos y documentos.

Secciones recomendadas:

- Resumen del paciente.
- Alertas y alergias.
- Antecedentes.
- Medicacion actual.
- Consultas.
- Signos vitales.
- Diagnosticos.
- Tratamientos.
- Archivos y examenes.
- Notas privadas del medico.

### 5. Consulta clinica

La consulta debe ser rapida y reutilizable. No todos los medicos documentan igual, por eso el sistema debe permitir una estructura base y campos flexibles.

Campos MVP:

- Motivo.
- Historia de enfermedad actual.
- Signos vitales.
- Examen fisico.
- Diagnostico.
- Plan/tratamiento.
- Indicaciones.
- Proxima cita.
- Adjuntos.

### 6. Documentos y fotos medicas

El medico debe poder subir archivos y tambien recibirlos del paciente.

Estados recomendados:

- Recibido.
- Pendiente de revisar.
- Clasificado.
- Asociado a consulta.
- Archivado.

Metadatos:

- Paciente.
- Tipo de documento.
- Fecha del documento.
- Fecha de subida.
- Origen: medico, asistente, paciente.
- Notas.

### 7. Portal de paciente por enlace seguro

Para el MVP, el paciente no necesita cuenta completa. Puede recibir un enlace seguro para subir fotos o archivos.

Flujo:

1. El medico selecciona paciente.
2. Crea solicitud: "Enviar examenes", "Enviar foto", "Enviar documento".
3. Medfile genera enlace con expiracion.
4. El paciente abre desde movil.
5. Sube fotos o archivos.
6. El medico recibe notificacion.
7. El medico revisa y clasifica.

### 8. Citas

El modulo de citas debe ser simple al inicio.

MVP:

- Crear cita.
- Asociar paciente.
- Fecha, hora y motivo.
- Estado: programada, confirmada, cancelada, completada.
- Convertir cita en consulta.

### 9. Suscripcion y limites

Cada tenant debe tener plan, estado y limites.

Estados:

- Trial activo.
- Trial vencido.
- Activa.
- Pago fallido.
- Cancelada.
- Suspendida.

Limites posibles:

- Cantidad de pacientes.
- Almacenamiento.
- Usuarios internos.
- Solicitudes de subida al paciente.
- Funciones avanzadas.

### 10. Administracion interna

Modulo solo para Medfile.

Funciones:

- Ver tenants.
- Ver estado de suscripcion.
- Revisar errores de pago.
- Dar soporte.
- Bloquear cuentas por abuso.
- Configurar planes.

## Flujos criticos del MVP

### Registro y prueba

1. Visitante entra a `medfile.my`.
2. Crea cuenta.
3. Verifica correo.
4. Se crea tenant.
5. Entra a prueba gratis.
6. Ve dashboard inicial con guia de primeros pasos.

### Crear paciente y consulta

1. Medico crea paciente.
2. Abre perfil.
3. Inicia nueva consulta.
4. Registra signos, diagnostico y plan.
5. Guarda.
6. La consulta aparece en timeline del paciente.

### Paciente envia examen desde movil

1. Medico solicita documento.
2. Sistema genera enlace seguro.
3. Paciente abre enlace.
4. Toma foto o selecciona archivo.
5. Sube archivo.
6. Medico recibe documento en bandeja.
7. Medico clasifica y lo adjunta al historial.

### Vencimiento de prueba

1. Sistema avisa antes de vencer.
2. Al vencer, el medico conserva datos.
3. Se limita creacion de nuevos registros o acceso avanzado.
4. Puede pagar para reactivar.

