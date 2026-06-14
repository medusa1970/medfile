# Desarrollo local y terminales

## Resumen

Medfile necesita **dos procesos** en desarrollo:

- API NestJS en `http://localhost:4000`
- Web Nuxt en `http://localhost:3100`

`npm run dev` solo levanta Nuxt. El API debe correr por separado.

## Forma recomendada: tarea del editor

1. Abrir la paleta: `Ctrl + Shift + P`
2. Elegir `Tasks: Run Task`
3. Seleccionar `Medfile: Dev (API + Web)`

Eso abre **dos terminales dedicadas** en paralelo: una para el backend y otra para Nuxt.

Tambien puedes usar `Terminal > Run Build Task` (`Ctrl + Shift + B`) porque esa tarea quedo como build por defecto.

## Forma manual con split

1. Abrir terminal: `` Ctrl + ` ``
2. Clic en el icono **Split terminal** (dos rectangulos) arriba a la derecha del panel
3. En cada panel, elegir el perfil desde el dropdown:
   - `Medfile Backend (API)` → `npm run dev:api`
   - `Medfile Frontend (Nuxt)` → `npm run dev:web`

## Como cerrar servidores

1. Clic en la terminal activa
2. `Ctrl + C`
3. Repetir en la otra terminal

Si aparece `EADDRINUSE`, el puerto ya esta ocupado por otra instancia previa.

## Verificacion rapida

- API: `http://localhost:4000/api/health`
- Web: `http://localhost:3100`
- Registro: `http://localhost:3100/registro`

Abre la web preferentemente con `http://localhost:3100`. En desarrollo el API tambien acepta `127.0.0.1` e IPs locales de red (`192.168.x.x`) en el puerto `3100`.

Si cambias CORS o `.env`, reinicia la terminal del API con `Ctrl + C` y vuelve a ejecutar `npm run dev:api`.
