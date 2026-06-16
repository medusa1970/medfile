# Desarrollo local y terminales

## Resumen

Medfile necesita **dos procesos** en desarrollo:

- API NestJS en `http://localhost:4000`
- Web Nuxt en `http://localhost:3100`

`npm run dev` solo levanta Nuxt. El API debe correr por separado.

## Variables de entorno (espejo de Railway)

Para probar en local **sin desplegar** (misma base de datos y Brevo que produccion):

### 1. Crear `.env.local`

```bash
npm run setup:local
```

Eso copia [`.env.local.example`](../.env.local.example) → `.env.local` (gitignored).

**Si ya tienes `.env` con secretos** (y `.env.local` sigue con placeholders de plantilla):

```bash
npm run env:sync    # opcional: vuelca secretos de .env en .env.local
npm run env:check   # fusiona .env + .env.local; ignora placeholders
```

El API y Nuxt cargan ambos archivos fusionados (`scripts/merge-workspace-env.mjs`).

### 2. Copiar secretos desde Railway

**Opcion A — panel web (recomendada)**

En [Railway](https://railway.app) → proyecto Medfile → servicio **medfile-api** → **Variables**:

| Variable Railway | Pegar en `.env.local` | Notas |
|------------------|----------------------|--------|
| `MONGODB_URI` | Si | Misma Atlas que produccion (tu eleccion) |
| `JWT_ACCESS_SECRET` | Si | Puede ser el mismo de prod o uno local |
| `BREVO_API_KEY` | Si | Correo real desde local |
| `EMAIL_FROM` | Si | `Medfile <noreply@medfile.my>` |
| `S3_*` | Si subes archivos | Solo si pruebas documentos/storage |
| `MERCADOPAGO_*` | Opcional | Dejar `PAYMENTS_PROVIDER=mock` salvo checkout |

**Opcion B — Railway CLI**

```bash
npm i -g @railway/cli
railway login
railway link          # elige proyecto Medfile → servicio medfile-api
railway variables     # lista vars; copia manualmente a .env.local
```

No sobrescribas `NUXT_PUBLIC_API_URL` ni `WEB_ORIGIN` con valores de produccion.

**Probar enlace de paciente desde el movil (misma WiFi):**

```env
NUXT_PUBLIC_API_URL=http://192.168.x.x:4000
WEB_ORIGIN=http://localhost:3100,http://127.0.0.1:3100,http://192.168.x.x:3100
```

Sustituye `192.168.x.x` por la IP de tu PC. Nuxt ya escucha en `0.0.0.0:3100`; el API en `0.0.0.0:4000`. Si dejas `localhost` en `NUXT_PUBLIC_API_URL`, la pagina `/paciente/subir` intenta reescribir el host automaticamente cuando el paciente abre el enlace por IP LAN.

**Documentos:** sin `S3_*` en `.env.local`, las subidas quedan en modo mock (solo metadatos). Para ver el archivo real, configura R2/S3 y vuelve a subir.

**Valores base en local** (no uses URLs de produccion):

```env
NODE_ENV=development
NUXT_PUBLIC_API_URL=http://localhost:4000
WEB_ORIGIN=http://localhost:3100,http://127.0.0.1:3100
APP_PUBLIC_URL=http://localhost:3100
API_PORT=4000
```

### 3. Validar

```bash
npm run env:check
```

### 4. Arrancar

Tarea del editor **Medfile: Dev (API + Web)** o:

```bash
npm run dev:api   # terminal 1
npm run dev:web   # terminal 2
```

Tras editar `.env.local`, reinicia **ambas** terminales (`Ctrl + C` y volver a ejecutar).

### Comportamiento en `NODE_ENV=development`

| Funcion | Sin Brevo en `.env.local` | Con `BREVO_API_KEY` |
|---------|---------------------------|---------------------|
| OTP registro | Codigo en consola API + `devCode` en JSON | Correo real via Brevo |
| CORS | Acepta `localhost:3100` automaticamente | Igual |
| JWT | Solo valido contra tu API local | Igual |

### Advertencia: misma MongoDB que produccion

Si pegas la URI de Atlas de produccion, **registros, pacientes y borrados en local afectan datos reales**. Usa cuentas de prueba o un cluster aparte cuando experimentes con scripts destructivos.

### Atlas: acceso desde tu IP

Si Atlas rechaza la conexion, en MongoDB Atlas → **Network Access** → **Add IP Address** → tu IP actual o `0.0.0.0/0` (solo dev).

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
- Dashboard (sesion): `http://localhost:3100/dashboard`

Abre la web preferentemente con `http://localhost:3100`. En desarrollo el API tambien acepta `127.0.0.1` e IPs locales de red (`192.168.x.x`) en el puerto `3100`.

Si cambias CORS o `.env.local`, reinicia la terminal del API con `Ctrl + C` y vuelve a ejecutar `npm run dev:api`.

Al arrancar el API deberias ver en logs, si Brevo esta configurado:

`Correo: provider Brevo API (HTTPS, compatible Railway Hobby)`

## Aviso: deteccion automatica de tareas npm

El workspace desactiva `npm.autoDetect` en `.vscode/settings.json`. Las tareas de desarrollo estan definidas en `.vscode/tasks.json` (`Medfile: Dev (API + Web)`, etc.).

Cursor/VS Code a veces muestra `Npm task detection: failed to parse the file .../package.json` aunque el JSON sea valido (falso positivo al leer el archivo durante el escaneo). Si reaparece tras recargar la ventana, ignoralo: los scripts siguen funcionando con `npm run` en terminal.
