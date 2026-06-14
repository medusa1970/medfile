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
    },
  },
})
