/**
 * Vacía todos los tenants (clientes), usuarios y datos clínicos relacionados.
 * Pensado para desarrollo local / pruebas.
 *
 * Uso:
 *   node scripts/reset-local-clients.mjs --yes
 *   npm run reset:local-clients
 *   npm run reset:remote-clients   # Atlas / produccion (MONGODB_URI)
 *
 * Por defecto solo permite URIs locales (localhost / 127.0.0.1).
 * Para una base remota (peligroso): --remote --yes  o  --confirm-remote --yes
 */
import { MongoClient } from 'mongodb'
import { applyWorkspaceEnv } from './merge-workspace-env.mjs'

const CLIENT_COLLECTIONS = [
  'auditlogs',
  'clinicalshares',
  'clinicsites',
  'dayqueueentries',
  'encounters',
  'medicaldocuments',
  'nursingcaptures',
  'patients',
  'paymentevents',
  'qrpayments',
  'subscriptions',
  'teaminvitations',
  'tenants',
  'uploadrequests',
  'users',
]

const PRESERVED_COLLECTIONS = ['platformsettings']

function resolveMongoUri(options = {}) {
  applyWorkspaceEnv()
  if (options.remote) {
    return process.env.MONGODB_URI || process.env.MONGO_URI || ''
  }

  return (
    process.env.MONGODB_URL ||
    process.env.MONGODB_URI ||
    process.env.LOCAL_MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/medfile_dev'
  )
}

function isLocalMongoUri(uri) {
  return /mongodb(\+srv)?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(uri)
}

function parseArgs(argv) {
  return {
    yes: argv.includes('--yes'),
    remote: argv.includes('--remote'),
    confirmRemote: argv.includes('--confirm-remote') || argv.includes('--remote'),
  }
}

const args = parseArgs(process.argv.slice(2))
const uri = resolveMongoUri({ remote: args.remote })

if (!uri) {
  console.error('No se encontro MONGODB_URI para --remote.')
  process.exit(1)
}

if (!args.yes) {
  console.error('Operacion destructiva. Confirma con: node scripts/reset-local-clients.mjs --yes')
  process.exit(1)
}

if (!isLocalMongoUri(uri) && !args.confirmRemote) {
  console.error('La URI no parece local. Abortado por seguridad.')
  console.error('Si realmente quieres vaciar una base remota, agrega --confirm-remote --yes')
  console.error(`URI detectada: ${uri.replace(/:[^:@/]+@/, ':***@')}`)
  process.exit(1)
}

const client = new MongoClient(uri)

try {
  await client.connect()
  const db = client.db()
  console.log(`Base de datos: ${db.databaseName}`)
  console.log(`URI: ${uri.replace(/:[^:@/]+@/, ':***@')}`)
  console.log('Eliminando datos de clientes...\n')

  let totalDeleted = 0

  for (const name of CLIENT_COLLECTIONS) {
    const collections = await db.listCollections({ name }).toArray()
    if (!collections.length) {
      console.log(`  ${name}: (no existe)`)
      continue
    }

    const result = await db.collection(name).deleteMany({})
    totalDeleted += result.deletedCount
    if (result.deletedCount > 0) {
      console.log(`  ${name}: ${result.deletedCount} documento(s) eliminado(s)`)
    }
  }

  console.log(`\nTotal eliminado: ${totalDeleted} documento(s)`)
  console.log(`Conservado: ${PRESERVED_COLLECTIONS.join(', ')} (config global admin)`)
  console.log('Listo. Puedes registrar clientes nuevos desde cero.')
} catch (error) {
  console.error('Error al vaciar clientes:', error instanceof Error ? error.message : error)
  process.exit(1)
} finally {
  await client.close()
}
