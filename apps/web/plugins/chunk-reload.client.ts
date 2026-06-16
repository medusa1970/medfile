const RELOAD_FLAG = 'medfile_chunk_reload_attempted'

export default defineNuxtPlugin(() => {
  if (import.meta.dev) return

  window.addEventListener(
    'error',
    (event) => {
      const target = event.target
      if (!(target instanceof HTMLScriptElement)) return
      if (!target.src.includes('/_nuxt/')) return

      if (sessionStorage.getItem(RELOAD_FLAG)) return

      sessionStorage.setItem(RELOAD_FLAG, '1')
      window.location.reload()
    },
    true,
  )

  window.addEventListener('load', () => {
    sessionStorage.removeItem(RELOAD_FLAG)
  })
})
