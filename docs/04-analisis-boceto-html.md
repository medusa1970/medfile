# Analisis del boceto HTML actual

Archivo analizado: `Qwen_html_20260506_k6llk0j3h.html`

## Resumen

El boceto es una maqueta interactiva de historia clinica electronica. Tiene buena cobertura visual para un sistema medico, pero esta construido como archivo unico con HTML, CSS y JavaScript mezclados. Es util como referencia de producto y UI, no como base directa de produccion.

## Lo que conviene conservar

- Estructura general con navegacion lateral y contenido principal.
- Dashboard con resumen de pacientes, citas y alertas.
- Lista de pacientes con busqueda y acciones rapidas.
- Perfil del paciente con datos, signos vitales y timeline.
- Registro de consulta con signos vitales, diagnostico y tratamiento.
- Secciones de alergias, antecedentes, medicamentos y documentos.
- Estados visuales como activo, pendiente, critico y completado.
- Modales para acciones rapidas.
- Estilo limpio, profesional y orientado a consulta medica.

## Lo que debe cambiar

- Cambiar nombre y marca de `MedRecord` a `medfile`.
- Adaptar el producto a SaaS multi-tenant: cada medico debe tener su espacio aislado.
- Agregar onboarding, login, prueba gratis y suscripcion.
- Agregar portal de paciente para envio de fotos, archivos y examenes.
- Separar las pantallas en rutas y componentes Nuxt.
- Reemplazar datos mock por API NestJS.
- Reemplazar CSS unico por sistema de diseno.
- Reemplazar botones decorativos por flujos reales.
- Agregar estados de carga, error, vacio y permisos.
- Mejorar version movil, especialmente tablas y formularios largos.

## Lo que debe descartarse o evitarse

- HTML generado como strings para vistas complejas.
- Estilos inline.
- Logica de datos en el navegador como fuente principal.
- Datos sensibles sin autenticacion.
- Confirmaciones simples para acciones criticas sin auditoria.
- Tablas anchas sin adaptacion movil.
- Filtros visuales que no filtran realmente.
- Botones de funciones no implementadas.

## Problemas funcionales detectados

- La aplicacion no persiste datos; al recargar se pierden pacientes nuevos y consultas.
- No existe autenticacion ni separacion por medico.
- El buscador solo actua con Enter y no muestra resultados sugeridos.
- La tabla de pacientes recientes reutiliza una fila pensada para la tabla completa, lo que puede desalinear columnas.
- La seleccion de pacientes para citas se llena al iniciar, pero puede duplicarse si se repuebla sin limpiar opciones.
- El guardado de paciente completo no actualiza el selector de citas.
- No hay validacion clinica suficiente para fechas, signos vitales o campos obligatorios.
- No hay subida real de archivos.
- No hay manejo de permisos ni auditoria.

## Mejoras clinicas recomendadas

- Resumen clinico superior: alergias, medicamentos activos, condiciones cronicas y ultima consulta.
- Bandeja de documentos recibidos de pacientes.
- Solicitudes de examenes/documentos con enlace seguro.
- Plantillas de consulta por especialidad.
- Etiquetas clinicas configurables.
- Adjuntos por consulta y por paciente.
- Notas privadas del medico.
- Alertas configurables: alergia, seguimiento, examen pendiente, paciente critico.
- Exportacion/impresion controlada con registro de auditoria.

## Mejoras de experiencia movil

- Convertir tablas en tarjetas en pantallas pequenas.
- Usar bottom navigation o drawer compacto.
- Boton flotante para acciones frecuentes: nueva consulta, nuevo paciente, subir archivo.
- Formularios por pasos para registro largo.
- Uploader con camara directa desde movil.
- Vista de paciente optimizada para scroll vertical.

## Nueva estructura visual sugerida

### Medico

- Dashboard.
- Pacientes.
- Bandeja de documentos.
- Citas.
- Consultas.
- Recetas/indicaciones.
- Reportes.
- Configuracion.
- Suscripcion.

### Paciente

- Pantalla de enlace seguro.
- Confirmacion de identidad simple.
- Subida de fotos o archivos.
- Vista de archivos enviados.
- Confirmacion de recepcion.

### Admin Medfile

- Tenants.
- Usuarios.
- Planes.
- Suscripciones.
- Soporte.
- Auditoria.

## Conclusion

El boceto actual es una buena referencia de interfaz, especialmente para el area clinica del medico. La siguiente etapa debe ser convertirlo en especificacion y luego en componentes reutilizables, no copiarlo literalmente. La prioridad debe ser: multi-tenancy, suscripcion, carga segura de archivos, historia clinica util y sistema de diseno centralizado.

