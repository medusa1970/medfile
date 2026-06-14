import { join } from 'path';

export function getWorkspaceEnvPaths() {
  return [join(__dirname, '../../../.env.local'), join(__dirname, '../../../.env')];
}
