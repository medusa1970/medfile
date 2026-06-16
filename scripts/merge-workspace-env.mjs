import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

export function isEnvPlaceholder(value) {
  if (!value) return true
  return /pega|genera|USUARIO|PASSWORD|opcional|^\s*$|xkeysib-pega|change-me/i.test(value)
}

export function parseEnvFile(path) {
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

/** .env base + .env.local; valores reales ganan sobre placeholders en .env.local */
export function mergeWorkspaceEnv(envRoot = root) {
  const merged = new Map()

  for (const file of ['.env', '.env.local']) {
    const parsed = parseEnvFile(join(envRoot, file))
    for (const [key, value] of parsed) {
      if (isEnvPlaceholder(value)) continue
      merged.set(key, value)
    }
  }

  return merged
}

export function applyWorkspaceEnv(envRoot = root) {
  const merged = mergeWorkspaceEnv(envRoot)
  for (const [key, value] of merged) {
    process.env[key] = value
  }
  return merged
}

export function getWorkspaceEnvRoot() {
  return root
}
