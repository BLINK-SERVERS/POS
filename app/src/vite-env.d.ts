/// <reference types="vite/client" />

/** Versión de la app, inyectada por Vite desde `package.json`. */
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  /** URL del proyecto de Supabase (cliente). */
  readonly VITE_SUPABASE_URL: string;
  /** Clave pública (publishable/anon) de Supabase. Nunca la secret key. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
