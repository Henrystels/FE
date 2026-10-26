interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SENTRY_ENABLED: string;
  readonly VITE_PUBLIC_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
