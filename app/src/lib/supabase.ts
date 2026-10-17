// Cliente de Supabase — SOLO con la clave pública (publishable/anon).
//
// Regla de seguridad: en el navegador nunca va la secret key ni el
// service_role, porque saltan el RLS y permitirían leer/escribir toda la
// base de datos. Esas claves se usan únicamente en el backend.
//
// Las variables se definen en `.env.local` (ver `.env.example`) y Vite las
// inyecta en tiempo de build. Todo lo que empieza por `VITE_` es público.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    "[supabase] Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_PUBLISHABLE_KEY. " +
      "Copia .env.example a .env.local y completa los valores."
  );
}

export const supabase: SupabaseClient = createClient(url, publishableKey);
