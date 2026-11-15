// El código de verificación que llega al correo: única fuente de su forma.
//
// Por qué existe: el enlace del correo solo autentica el dispositivo que lo
// abre. El código escrito por la persona se canjea en el servidor y sí sirve
// en cualquier equipo, así que el POS necesita saber cuántos dígitos pedir,
// validarlos antes de gastar un intento y describirlos en pantalla.
//
// Medido el 2026-11-15 contra `GET /v1/projects/{ref}/config/auth` del proyecto
// vivo: `mailer_otp_length = 8` y `mailer_otp_exp = 3600` (una hora).

export const CODIGO_LARGO = 8;

/** Solo dígitos, y todos: un código incompleto no se envía. */
export function esCodigoValido(valor: string): boolean {
  return new RegExp(`^\\d{${CODIGO_LARGO}}$`).test(valor.trim());
}
