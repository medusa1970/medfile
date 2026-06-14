# Principios de experiencia de Medfile

## Objetivo

Medfile debe sentirse **moderna, practica, elegante e intuitiva** para medicos que son excelentes en su campo pero no necesariamente expertos en tecnologia. La interfaz debe reducir friccion, no anadirla.

Estos principios aplican a landing, app del medico, formularios clinicos y enlaces del paciente.

## Las cuatro cualidades (referencia rapida)

| Cualidad | Que significa en Medfile | Ejemplo concreto |
|----------|--------------------------|------------------|
| **Moderna** | Visual limpia, tipografia actual, animaciones suaves, responsive real | Menu movil desplegable con backdrop; gradientes de marca en CTAs |
| **Practica** | Pocas acciones para lograr lo importante; densidad util en movil | Metricas en fila de 3; textos cortos; iconos que explican la funcion |
| **Elegante** | Espaciado consistente, sin ruido visual, pesos tipograficos moderados | Titulos Plus Jakarta Sans 600–700, no ultra-bold; paleta navy + teal del logo |
| **Intuitiva** | El medico entiende que es su consultorio; el paciente solo ve lo minimo | Landing habla al medico; `/paciente/subir` sin token es demo para el medico |

## Regla de oro: app del medico

1. **Usuario principal:** medico independiente (y luego asistente).
2. **Paciente:** usa enlaces puntuales, no la app completa.
3. **Copy y navegacion:** orientados al medico (“Recibe exámenes”, “Tu bandeja”, “Genera enlace”).
4. **Demo de paciente:** siempre etiquetada como “Así lo ve tu paciente”, nunca como pantalla principal.

## Principios de contenido y copy

- Escribir en **segunda persona al medico** (“Tus pacientes”, “Tu bandeja”, “Generas un enlace”).
- Evitar jerga tecnica (tenant, SaaS en pantallas clinicas; “espacio privado” en lugar de “multi-tenant”).
- **Una idea por bloque:** titulo claro + una linea de apoyo + icono o accion.
- En movil, **menos scroll para llegar a lo importante**: secciones compactas, listas horizontales de metricas, maximo 2 filas de ejemplo en previews.

## Principios visuales

Detalle tecnico en [03-sistema-diseno.md](./03-sistema-diseno.md). Resumen:

- **Colores:** paleta del logotipo (`#001F5C`, `#00A9CE`, `#0077C8`, `#75787B`).
- **Tipografia:** Plus Jakarta Sans (titulos), Source Sans 3 (cuerpo).
- **Iconos:** componente `MedIcon` (SVG medicos); no emojis en produccion.
- **Botones:** primario con gradiente teal → azul; secundario blanco con borde suave.
- **Tarjetas:** bordes redondeados, sombra ligera, padding proporcional al contenido.

## Principios de interaccion

### Navegacion

- **Escritorio:** sidebar + area principal (`DoctorShell`).
- **Publico (landing):** nav sticky; en movil, **menu desplegable** (panel flotante + backdrop), no expansion que empuje el contenido.
- **Paciente con token:** pantalla unica, sin nav de marketing.

### Formularios clinicos

- Campos agrupados por seccion con titulos claros.
- Acciones principales visibles sin scroll excesivo.
- Mensajes de error en lenguaje plain (“Selecciona un archivo antes de enviar”).

### Feedback

- Estados visibles: badges (Activo, Critico, Pendiente), barras de uso en suscripcion.
- Carga y error: mensajes honestos (“Mostrando datos demo” si el API no responde).

## Responsive

| Dispositivo | Prioridad |
|-------------|-----------|
| **Movil** | Landing y enlace de paciente deben funcionar con una mano; poco scroll |
| **Tablet** | Consulta y perfil de paciente legibles en una o dos columnas |
| **PC** | Dashboard y historia clinica aprovechan ancho; sidebar fijo |

Breakpoints principales: 680px (movil), 980px (tablet), 1100px (hero landing en columna).

## Anti-patrones (evitar)

| Evitar | Por que | Alternativa |
|--------|---------|-------------|
| Titulos gigantes con letter-spacing extremo | Parece plantilla generica, no producto medico serio | `clamp` moderado, peso 600–700 |
| Tarjetas enormes con poco texto en movil | Mucho scroll, sensacion de app vacia | Filas compactas con icono + texto |
| Paginas que hablan al paciente en la nav principal | Confunde al medico sobre que producto es | Demo etiquetada; copy al medico |
| Menu movil inline que crece el header | Rompe el flujo de lectura | Dropdown anclado al boton |
| Estilos hex duplicados en componentes | Inconsistencia al cambiar marca | Tokens en `packages/ui/src/tokens.css` |

## Checklist antes de publicar una pantalla

- [ ] ¿Esta claro que es para el **medico** (salvo enlace de paciente con token)?
- [ ] ¿Se entiende la accion principal en **3 segundos**?
- [ ] ¿Funciona bien en **movil** sin scroll excesivo?
- [ ] ¿Usa **tokens y componentes** compartidos?
- [ ] ¿Hay **icono o jerarquia visual** que ayude a quien no domina la tecnologia?
- [ ] ¿Se actualizo [17-funcionalidad-catalogo.md](./17-funcionalidad-catalogo.md) si es funcionalidad nueva?

## Relacion con otros documentos

- Sistema visual detallado: [03-sistema-diseno.md](./03-sistema-diseno.md)
- Catalogo de pantallas: [17-funcionalidad-catalogo.md](./17-funcionalidad-catalogo.md)
- Vision de producto: [00-vision-producto.md](./00-vision-producto.md)
