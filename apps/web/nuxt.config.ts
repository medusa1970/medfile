import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const mergeModule = await import(pathToFileURL(resolve(workspaceRoot, 'scripts/merge-workspace-env.mjs')).href)
mergeModule.applyWorkspaceEnv(workspaceRoot)

export default defineNuxtConfig({
  compatibilityDate: '2026-05-26',
  devtools: { enabled: true },
  components: [{ path: '~/components', pathPrefix: false }],
  build: {
    transpile: ['@medfile/types'],
  },
  nitro: {
    preset: 'node-server',
  },
  routeRules: {
    '/_nuxt/**': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
      },
    },
    '/**': {
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate',
      },
    },
  },
  css: ['@medfile/ui/tokens.css', '@/assets/css/main.css', '@/assets/css/marketing.css', '@/assets/css/auth.css'],
  vite: {
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit'],
    },
    ssr: {
      noExternal: ['@medfile/types'],
    },
  },
  app: {
    head: {
      title: 'medfile | Historia clinica moderna para medicos',
      meta: [
        {
          name: 'description',
          content:
            'Medfile ayuda a medicos independientes a gestionar pacientes, consultas, documentos y suscripciones desde web y movil.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/brand/logo_medfile.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'medfile',
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:4000',
      buildRevision: process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
    },
  },
})
