/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del proyecto de Supabase (cliente). */
  readonly VITE_SUPABASE_URL: string;
  /** Clave pública (publishable/anon) de Supabase. Nunca la secret key. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
