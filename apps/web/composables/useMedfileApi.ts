import { adminLoginRoute, isAdminAppPath } from '~/utils/admin-routes'
import { resolvePublicApiUrl } from '~/utils/public-api-url'

type MedfileFetchOptions = NonNullable<Parameters<typeof $fetch>[1]>;

const ACCESS_TOKEN_KEY = 'medfile_access_token';
const AUTH_FLOW_PATHS = new Set(['/verificar-correo', '/onboarding']);

export function useMedfileApi() {
  const config = useRuntimeConfig();

  async function apiFetch<T>(path: string, options: MedfileFetchOptions = {}) {
    const token = getAccessToken();
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string> | undefined) ?? {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const apiBaseUrl = resolvePublicApiUrl(config.public.apiUrl as string)
      return await $fetch<T>(`${apiBaseUrl}${path}`, {
        ...options,
        headers,
      });
    } catch (error) {
      if (isEmailNotVerified(error)) {
        if (import.meta.client) {
          const route = useRoute()
          const email = readForbiddenEmail(error)
          if (route.path !== '/verificar-correo') {
            await navigateTo({
              path: '/verificar-correo',
              query: email ? { email } : undefined,
            })
          }
        }
      } else if (isUnauthorized(error)) {
        clearSession()

        if (import.meta.client) {
          const route = useRoute()
          const stayOnPage = AUTH_FLOW_PATHS.has(route.path)
          const adminArea = isAdminAppPath(route.path)
          if (!stayOnPage && route.path !== '/login' && route.path !== '/registro') {
            await navigateTo(adminArea ? adminLoginRoute({ expired: '1' }) : '/login?expired=1')
          }
        }
      }

      throw error
    }
  }

  function getAccessToken() {
    if (!import.meta.client) return '';
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? '';
  }

  function storeSession(accessToken: string) {
    if (!import.meta.client || !accessToken.trim()) return false;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken.trim());
    return true;
  }

  function hasSession() {
    return Boolean(getAccessToken());
  }

  function clearSession() {
    if (!import.meta.client) return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  return {
    apiFetch,
    getAccessToken,
    storeSession,
    hasSession,
    clearSession,
  };
}

function isUnauthorized(error: unknown) {
  if (typeof error !== 'object' || !error || !('status' in error)) return false
  return (error as { status?: number }).status === 401
}

function isEmailNotVerified(error: unknown) {
  if (typeof error !== 'object' || !error || !('status' in error)) return false
  if ((error as { status?: number }).status !== 403) return false
  const data = (error as { data?: { code?: string } }).data
  return data?.code === 'EMAIL_NOT_VERIFIED'
}

function readForbiddenEmail(error: unknown) {
  if (typeof error !== 'object' || !error || !('data' in error)) return ''
  return (error as { data?: { email?: string } }).data?.email ?? ''
}
