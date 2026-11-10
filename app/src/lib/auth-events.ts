// Filtro de eventos de Supabase Auth (BLINK-070).
//
// `TOKEN_REFRESHED` lo emite supabase-js ~cada hora y `USER_UPDATED` tras
// cambiar perfil o clave. Antes, cualquier evento con sesión re-hidratába el
// comercio completo: PageLoader intermitente y pérdida de ventas locales aún
// no confirmadas en la nube. Solo las entradas reales re-hidratan; el resto
// refresca usuario/activación sin tocar el estado del comercio.

const REHYDRATE_EVENTS = new Set(["SIGNED_IN", "SIGNED_UP", "PASSWORD_RECOVERY"]);

/** ¿Este evento debe volver a cargar el comercio desde la nube? */
export function rehidrataComercio(event: string): boolean {
  return REHYDRATE_EVENTS.has(event);
}
