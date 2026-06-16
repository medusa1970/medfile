import { copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const target = join(root, '.env.local')
const example = join(root, '.env.local.example')

if (existsSync(target)) {
  console.log('.env.local ya existe — no se sobrescribe.')
  console.log('Edita .env.local o borralo y vuelve a ejecutar npm run setup:local')
  process.exit(0)
}

if (!existsSync(example)) {
  console.error('Falta .env.local.example en la raiz del repo.')
  process.exit(1)
}

copyFileSync(example, target)
console.log('Creado .env.local desde .env.local.example')
console.log('')
console.log('Siguiente:')
console.log('  1. Railway → medfile-api → Variables → copia MONGODB_URI, BREVO_API_KEY, JWT_ACCESS_SECRET')
console.log('  2. Pega en .env.local (manten NUXT_PUBLIC_API_URL=http://localhost:4000)')
console.log('  3. npm run env:check')
console.log('  4. Medfile: Dev (API + Web)')
