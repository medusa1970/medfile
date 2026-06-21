# Vision de producto: Medfile

## Proposito

Medfile sera una plataforma SaaS para medicos independientes que necesitan manejar su consulta privada desde web y movil sin instalar infraestructura propia. Cada medico se registra, usa el **Plan Gratis permanente** y, cuando lo necesite, activa un plan de pago. **Cada medico paga por separado** su suscripcion de plataforma y sus mensajes WhatsApp automaticos (ver [21-whatsapp-cobro-por-medico-bolivia.md](./21-whatsapp-cobro-por-medico-bolivia.md)).

El producto debe sentirse simple para consulta diaria, pero suficientemente serio para manejar informacion clinica sensible.

## Usuarios principales

- Medico independiente: propietario de su cuenta, responsable de pacientes, historias clinicas, documentos y suscripcion.
- Asistente o secretaria: **plan Basico+** (1 usuario delegado administrativo). Especificacion: [29-equipo-colaboradores-y-acceso-delegado.md](./29-equipo-colaboradores-y-acceso-delegado.md).
- Colaborador clinico (enfermeria en clinicas donde atiende el medico): **plan Profesional** (captura delegada, no EMR de clinica). Mismo doc 29.
- Paciente: usuario externo o invitado por enlace seguro para enviar fotos, examenes, documentos y datos solicitados por su medico.
- Administrador de Medfile: equipo interno que gestiona planes, soporte, facturacion, incidencias y configuracion global.

## Principios del producto

- Cada medico es un tenant independiente. Sus pacientes, archivos, historiales y configuracion no deben mezclarse con otros medicos **salvo un intercambio explicito autorizado** entre colegas en la misma plataforma (ver [22-intercambio-historiales-entre-medicos.md](./22-intercambio-historiales-entre-medicos.md)).
- La aplicacion debe funcionar bien en escritorio, tablet, movil web y app movil.
- La interfaz debe estar basada en un sistema de diseno centralizado, no en estilos duplicados por pantalla.
- La experiencia debe ser **moderna, practica, elegante e intuitiva** para medicos no expertos en tecnologia. Ver [16-principios-experiencia.md](./16-principios-experiencia.md).
- Medfile es la **app del medico**; el paciente solo usa enlaces puntuales (subir examenes), no la aplicacion completa.
- La historia clinica debe priorizar rapidez de uso durante consulta: ver lo importante, registrar hallazgos y encontrar antecedentes sin friccion.
- Los pacientes deben poder enviar documentos desde movil usando camara o archivo, sin obligarlos a instalar una app desde el primer dia.
- La suscripcion debe ser parte del nucleo del producto: **plan Gratis permanente util**, planes de pago **por medico independiente** (ver [24-planes-medico-independiente-bolivia.md](./24-planes-medico-independiente-bolivia.md)), sin poner en riesgo los datos del medico.
- La seguridad, auditoria y privacidad no son extras; deben estar presentes desde la primera arquitectura.

## Alcance MVP recomendado

El MVP debe enfocarse en que un medico pueda:

1. Registrarse y verificar su cuenta.
2. Crear su perfil profesional y configuracion basica.
3. Usar el **Plan Gratis** permanente (no trial con vencimiento).
4. Registrar pacientes.
5. Crear consultas clinicas.
6. Adjuntar archivos, examenes e imagenes a un paciente.
7. Recibir archivos enviados por pacientes mediante enlace seguro.
8. Buscar pacientes y revisar historial.
9. Gestionar citas simples.
10. Activar un plan de pago cuando necesite mas capacidad o automatizacion.
11. *(Futuro)* Compartir historial con otro medico Medfile (solo ver, colaborar temporalmente o transferir paciente). Ver [22-intercambio-historiales-entre-medicos.md](./22-intercambio-historiales-entre-medicos.md).

## Fuera del MVP inicial

- Receta electronica legalmente certificada.
- Integraciones con laboratorios externos.
- Firma digital avanzada.
- Facturacion fiscal completa.
- Inteligencia artificial clinica automatica.
- App movil nativa separada si todavia no hay traccion.

Estas capacidades pueden llegar despues, pero no deben bloquear el primer producto util.

## Posicionamiento

Medfile no debe venderse solo como "un sistema de historia clinica". Debe posicionarse como el archivo medico privado del doctor: pacientes, consultas, examenes, fotos, documentos y seguimiento, todo en un lugar y accesible desde cualquier dispositivo.

