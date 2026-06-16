import { mergeWorkspaceEnv, getWorkspaceEnvRoot, isEnvPlaceholder } from './merge-workspace-env.mjs'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const root = getWorkspaceEnvRoot()
const hasEnv = existsSync(join(root, '.env'))
const hasLocal = existsSync(join(root, '.env.local'))

if (!hasEnv && !hasLocal) {
  console.error('No existe .env ni .env.local')
  console.error('Ejecuta: npm run setup:local')
  process.exit(1)
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

const env = mergeWorkspaceEnv(root)
let failed = false

console.log('Comprobando variables locales (.env + .env.local)...\n')

if (hasEnv && hasLocal) {
  console.log('  [INFO] Se fusionan .env y .env.local (placeholders en .env.local se ignoran)\n')
} else if (hasEnv) {
  console.log('  [INFO] Usando .env\n')
} else {
  console.log('  [INFO] Usando .env.local\n')
}

for (const rule of required) {
  const value = env.get(rule.key) ?? ''
  if (isEnvPlaceholder(value)) {
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
  if (isEnvPlaceholder(value)) {
    console.warn(`  [OPCIONAL] ${rule.key} — ${rule.label} (en dev veras OTP en consola API)`)
  } else {
    console.log(`  [OK] ${rule.key} (${rule.label})`)
  }
}

const hasBrevo = !isEnvPlaceholder(env.get('BREVO_API_KEY') ?? '')
const hasResend = !isEnvPlaceholder(env.get('RESEND_API_KEY') ?? '')
if (hasBrevo && hasResend) {
  console.warn('  [AVISO] Tienes BREVO y Resend; el API usa Brevo si BREVO_API_KEY esta definido.')
}

console.log('')
if (failed) {
  console.error('Completa .env o .env.local y ejecuta npm run env:sync si usas ambos')
  process.exit(1)
}

console.log('Listo para npm run dev:api y npm run dev:web (o tarea Medfile: Dev).')
