import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const LOCAL_DEV_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/;

function parseAllowedOrigins(raw?: string) {
  return (raw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function buildCorsOptions(config: {
  get: (key: string, defaultValue?: string) => string | undefined;
}): CorsOptions {
  const configuredOrigins = parseAllowedOrigins(config.get('WEB_ORIGIN'));
  const nodeEnv = config.get('NODE_ENV', 'development');

  return {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (configuredOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      if (nodeEnv !== 'production' && LOCAL_DEV_ORIGIN.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`), false);
    },
    credentials: true,
  };
}
