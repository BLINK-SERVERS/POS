# 07 · Límites, alcance y siguientes pasos

## Lo que este trabajo cubre
Reconocimiento **pasivo y público** de `app.wink-pos.com`:
- Sistema de diseño (tokens), estética, marca, tipografía, layout.
- Arquitectura de front (Angular + `bento-*` + PWA) y mapa de rutas públicas.
- Snapshot estático de la única pantalla pública (login).
- Inventario de assets.

## Lo que NO cubre (y por qué)

### 1. Pantallas internas autenticadas
El cliente aplica un **auth guard**: sin sesión, cualquier ruta redirige a `/entrar`.
Las áreas de negocio (POS, inventario, caja, reportes, etc.) **solo existen tras autenticarse**.
No se puede —ni se debe— acceder a ellas sin credenciales legítimas.

### 2. Lógica de negocio
La lógica de negocio de un POS **vive en el backend** (`api.wink-pos.com`), no en el bundle
minificado. Reconstruirla requiere:
- Credenciales propias + un **entorno de pruebas**.
- Capturar el tráfico de las operaciones reales (venta, cobro, impuestos, descuentos…).
- Idealmente, el **código fuente original** (no una reconstrucción por caja negra).

### 3. Código fuente original
No hay source maps; el JS es minificado y con code-splitting por hash. No se puede
recuperar el TypeScript original desde el bundle público.

### 4. Clonar el producto completo
Reproducir el producto entero "tal cual" (backend + reglas + datos) **no es viable ni
responsable** solo con observación anónima del front. Sería, además, reproducción de
propiedad intelectual de un tercero si no se tiene titularidad.

## Requisitos para continuar (si el sistema es tuyo/autorizado)

1. **Entorno de staging** con datos de prueba (evitar producción y datos de clientes).
2. **Credenciales** (email/password). Si hay **MFA/Turnstile**, prever un flujo de pruebas
   (Turnstile bloquea la automatización headless; se necesitaría un bypass de test o sesión guardada).
3. **Sesión preautenticada**: `capture.mjs` puede reutilizar `storageState` de Playwright
   para entrar a las áreas internas y capturarlas.
4. **El repositorio fuente** (si es tuyo): es infinitamente mejor reconstruir/auditar desde el código
   que desde el bundle minificado.

## Buenas prácticas / advertencias
- **Términos de servicio**: automatizar el login de un servicio puede violar sus ToS.
  Con tu propio sistema, es responsabilidad tuya confirmar el alcance permitido.
- **Datos personales**: no capturar ni almacenar datos de clientes reales; anonimizar.
- **Turnstile / antibot**: el captcha está diseñado para bloquear navegadores automatizados.
  No se debe intentar evadirlo salvo en tu propio entorno de pruebas con permiso.
- **Escrutinio**: el backend está en otro host y protegido por Cloudflare; hacer sondeos
  masivos de API puede parecer abuso. Limitarse a lo necesario.

## Siguiente paso recomendado
Proporcionar credenciales de **staging** (o el código fuente). Con eso puedo:
- Extender `capture.mjs` con `storageState` para recorrer y documentar cada pantalla interna.
- Levantar el **mapa de flujos** (venta → cobro → comprobante, inventario, reportes).
- Capturar y documentar el **contrato de API** de tus propias operaciones (payloads, schemas).
- Generar un **style guide** y, si se desea, un **Storybook** con los componentes `bento-*`.
