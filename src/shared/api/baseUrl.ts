const DEFAULT_HEROKU_URL = 'https://bakcenderp-c6bdf019f05d.herokuapp.com';

type MetaEnv = {
  readonly DEV?: boolean;
  readonly MODE?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_BACKEND_URL?: string;
};

const env = (import.meta as { env: MetaEnv }).env;
const isDev = env.DEV || env.MODE === 'development';
const envApiUrl = env.VITE_API_URL || env.VITE_BACKEND_URL;

export const API_BASE_URL = envApiUrl || (isDev ? '/api' : DEFAULT_HEROKU_URL);
