export interface AuthContext {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}

export interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  auth?: AuthContext;
}
