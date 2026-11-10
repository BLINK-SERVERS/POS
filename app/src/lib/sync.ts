// Regla de reconciliación entre la caché local y la fila de la nube.
//
// Al entrar, la app carga el comercio desde `businesses.data` y lo toma como
// autoridad. Pero el guardado remoto va con *debounce*: si la pestaña se
// recarga (o se cierra, o se trabaja sin red) entre la escritura local y la
// confirmación de la nube, la fila remota está más vieja que la caché. Sin
// esta regla, esa diferencia se convierte en datos perdidos: ventas y
// productos que el cajero ya veía guardados desaparecen al volver a entrar.
//
// La marca «pendiente» la escribe el store en cada caché local y la borra
// cuando la nube confirma, así que solo puede existir si queda algo por subir.

/**
 * Devuelve `true` cuando la caché local debe ganar a la fila remota.
 *
 * @param pendiente  milisegundos de la última escritura local sin confirmar (o `null`)
 * @param updatedAt  milisegundos de `businesses.updated_at` (o `null` si no hay fila)
 * @param tieneContenido  la caché trae algo propio (no es un borrador vacío)
 */
export function cacheAdelantada({
  pendiente,
  updatedAt,
  tieneContenido,
}: {
  pendiente: number | null;
  updatedAt: number | null;
  tieneContenido: boolean;
}): boolean {
  if (pendiente === null || !tieneContenido) return false;
  // Sin fila todavía no hay nada que pisar: la caché es lo único que existe.
  return updatedAt === null || pendiente > updatedAt;
}
