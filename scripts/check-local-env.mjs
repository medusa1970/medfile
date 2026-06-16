import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = join(root, '.env.local')

function parseEnvFile(path) {
  const values = new Map()
  if (!existsSync(path)) return values

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    values.set(key, value)
  }

  return values
}

function isPlaceholder(value) {
  if (!value) return true
  return /pega|genera|USUARIO|PASSWORD|opcional|^\s*$|xkeysib-pega|change-me/i.test(value)
}

const required = [
  { key: 'NUXT_PUBLIC_API_URL', expected: 'http://localhost:4000' },
  { key: 'MONGODB_URI', hint: 'mongodb+srv://...' },
  { key: 'JWT_ACCESS_SECRET', minLength: 16 },
  { key: 'WEB_ORIGIN', expectedIncludes: 'localhost:3100' },
]

const recommended = [
  { key: 'BREVO_API_KEY', label: 'Correo real (Brevo)' },
  { key: 'EMAIL_FROM', label: 'Remitente Brevo' },
]

if (!existsSync(envPath)) {
  console.error('No existe .env.local')
  console.error('Ejecuta: npm run setup:local')
  process.exit(1)
}

const env = parseEnvFile(envPath)
let failed = false

console.log('Comprobando .env.local para desarrollo local...\n')

for (const rule of required) {
  const value = env.get(rule.key) ?? ''
  if (isPlaceholder(value)) {
    console.error(`  [FALTA] ${rule.key} — ${rule.hint ?? 'valor requerido'}`)
    failed = true
    continue
  }
  if (rule.expected && value !== rule.expected) {
    console.warn(`  [AVISO] ${rule.key}=${value} (esperado ${rule.expected} en local)`)
  }
  if (rule.expectedIncludes && !value.includes(rule.expectedIncludes)) {
    console.warn(`  [AVISO] ${rule.key} deberia incluir ${rule.expectedIncludes}`)
  }
  if (rule.minLength && value.length < rule.minLength) {
    console.error(`  [FALTA] ${rule.key} demasiado corto (min ${rule.minLength})`)
    failed = true
    continue
  }
  console.log(`  [OK] ${rule.key}`)
}

for (const rule of recommended) {
  const value = env.get(rule.key) ?? ''
  if (isPlaceholder(value)) {
    console.warn(`  [OPCIONAL] ${rule.key} — ${rule.label} (en dev veras OTP en consola API)`)
  } else {
    console.log(`  [OK] ${rule.key} (${rule.label})`)
  }
}

const hasBrevo = !isPlaceholder(env.get('BREVO_API_KEY') ?? '')
const hasResend = !isPlaceholder(env.get('RESEND_API_KEY') ?? '')
if (hasBrevo && hasResend) {
  console.warn('  [AVISO] Tienes BREVO y Resend; el API usa Brevo si BREVO_API_KEY esta definido.')
}

console.log('')
if (failed) {
  console.error('Completa .env.local y vuelve a ejecutar npm run env:check')
  process.exit(1)
}

console.log('Listo para npm run dev:api y npm run dev:web (o tarea Medfile: Dev).')
