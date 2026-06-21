import { resolvePublicApiUrl } from '~/utils/public-api-url'

export function usePublicApiBaseUrl() {
  const config = useRuntimeConfig()
  return resolvePublicApiUrl(config.public.apiUrl as string)
}
