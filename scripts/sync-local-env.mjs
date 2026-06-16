import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  getWorkspaceEnvRoot,
  isEnvPlaceholder,
  mergeWorkspaceEnv,
  parseEnvFile,
} from './merge-workspace-env.mjs'

const root = getWorkspaceEnvRoot()
const envPath = join(root, '.env')
const localPath = join(root, '.env.local')
const examplePath = join(root, '.env.local.example')

if (!existsSync(envPath)) {
  console.error('No existe .env con secretos. Crea .env o completa .env.local manualmente.')
  process.exit(1)
}

const template = existsSync(localPath)
  ? readFileSync(localPath, 'utf8')
  : existsSync(examplePath)
    ? readFileSync(examplePath, 'utf8')
    : readFileSync(envPath, 'utf8')

const base = parseEnvFile(envPath)
const merged = mergeWorkspaceEnv(root)

const localDefaults = {
  NODE_ENV: 'development',
  NUXT_PUBLIC_APP_URL: 'http://localhost:3100',
  NUXT_PUBLIC_API_URL: 'http://localhost:4000',
  API_PORT: '4000',
  WEB_ORIGIN: 'http://localhost:3100,http://127.0.0.1:3100',
  APP_PUBLIC_URL: 'http://localhost:3100',
  PAYMENTS_PROVIDER: 'mock',
}

for (const [key, value] of Object.entries(localDefaults)) {
  merged.set(key, value)
}

const lines = template.split('\n').map((line) => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return line
  const eq = trimmed.indexOf('=')
  if (eq <= 0) return line
  const key = trimmed.slice(0, eq).trim()
  if (!merged.has(key)) return line
  return `${key}=${merged.get(key)}`
})

writeFileSync(localPath, `${lines.join('\n').trimEnd()}\n`, 'utf8')

console.log('Sincronizado .env → .env.local (URLs localhost + secretos de .env)')
console.log('Ejecuta: npm run env:check')
