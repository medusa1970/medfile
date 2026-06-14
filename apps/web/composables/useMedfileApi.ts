type MedfileFetchOptions = NonNullable<Parameters<typeof $fetch>[1]>;

const ACCESS_TOKEN_KEY = 'medfile_access_token';

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
      return await $fetch<T>(`${config.public.apiUrl}${path}`, {
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
          if (route.path !== '/login' && route.path !== '/registro') {
            await navigateTo('/login?expired=1')
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
