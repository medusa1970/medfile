# MongoDB local y decision sobre Cloudinary

## MongoDB local

El workspace `FRONT-BACK` se reviso solo como referencia de nombres de variables. Medfile no debe compartir base de datos ni datos con ese workspace.

Para desarrollo local se usara una base propia de Medfile:

```env
MONGODB_URL=mongodb://localhost:27017/medfile_dev
MONGODB_URI=mongodb://localhost:27017/medfile_dev
LOCAL_MONGODB_URI=mongodb://localhost:27017/medfile_dev
```

El API acepta las variables en este orden:

1. `MONGODB_URL`
2. `MONGODB_URI`
3. `LOCAL_MONGODB_URI`
4. `MONGO_URI`
5. fallback `mongodb://localhost:27017/medfile_dev`

Esto mantiene compatibilidad con distintos nombres de variables, pero la base configurada para Medfile es independiente.

## Base de datos para Medfile

Para ambientes de Medfile se recomienda:

- Desarrollo: `medfile_dev`
- Staging: `medfile_staging`
- Produccion: base dedicada administrada

No se debe usar la base `test` de otro workspace salvo una prueba temporal y explicita.

## Cloudinary

Cloudinary no se recomienda como almacenamiento principal de documentos medicos sensibles.

Razones:

- Medfile manejara informacion clinica privada.
- Necesitamos control fuerte de acceso, expiracion, auditoria y politicas privadas.
- El flujo de documentos incluye PDFs, fotos clinicas, laboratorios y posibles archivos no optimizados para CDN publica.
- Object storage privado tipo S3/R2 encaja mejor con URLs firmadas y separacion por tenant.

## Uso posible de Cloudinary mas adelante

Cloudinary podria evaluarse despues para:

- Thumbnails derivados de imagenes.
- Optimizacion de imagenes no sensibles.
- Avatares o logos de consultorios.

Si se usa para documentos clinicos, antes se debe validar cumplimiento legal, contrato, privacidad, region de datos, auditoria y controles de acceso.

Decision actual: usar S3/R2 como storage primario y no Cloudinary para historia clinica.

