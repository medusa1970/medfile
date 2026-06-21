/** Copia texto al portapapeles; funciona en HTTP/LAN donde `navigator.clipboard` suele fallar. */
export async function copyTextToClipboard(text: string, source?: HTMLInputElement | HTMLTextAreaElement) {
  const value = text.trim()
  if (!value || !import.meta.client) return false

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      // Continuar con fallback (contexto no seguro, p. ej. http://192.168.x.x)
    }
  }

  if (source) {
    try {
      source.focus()
      source.select()
      source.setSelectionRange(0, value.length)
      if (document.execCommand('copy')) return true
    } catch {
      // fallback abajo
    }
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.setAttribute('readonly', 'true')
    textarea.style.position = 'fixed'
    textarea.style.top = '0'
    textarea.style.left = '0'
    textarea.style.width = '1px'
    textarea.style.height = '1px'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    return copied
  } catch {
    return false
  }
}
