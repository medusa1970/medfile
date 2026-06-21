export const ADMIN_LOGIN_PATH = '/admin/login'

export function isAdminAppPath(path: string) {
  return path.startsWith('/admin') && path !== ADMIN_LOGIN_PATH
}

export function adminLoginRoute(query?: { expired?: string }) {
  if (query?.expired === '1') {
    return { path: ADMIN_LOGIN_PATH, query: { expired: '1' } }
  }

  return ADMIN_LOGIN_PATH
}
