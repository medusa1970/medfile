export type DocumentAccessResponse =
  | {
      mode: 'mock'
      available: false
      message: string
    }
  | {
      mode: 'presigned'
      available: true
      mimeType: string
      fileName: string
      viewUrl: string
      downloadUrl: string
      expiresInSeconds: number
    }

export function isDocumentAccessible(
  response: DocumentAccessResponse,
): response is Extract<DocumentAccessResponse, { available: true }> {
  return response.mode === 'presigned' && response.available === true
}

export function isImageMimeType(mimeType: string) {
  return mimeType.startsWith('image/')
}

export function isPdfMimeType(mimeType: string) {
  return mimeType === 'application/pdf' || mimeType.endsWith('/pdf')
}
