# BLINK POS — aplicación

Punto de venta web de diseño y código originales. **Vite 8.3.4 + React 19 + TypeScript**,
sin frameworks de UI ni librerías de componentes: todo el sistema de diseño es propio.

## Puesta en marcha

```bash
cd "C:\Users\prodz\Desktop\BLINK POS\app"
npm install
npm run dev        # http://localhost:5173
```

Para probar desde el celular (misma red Wi-Fi), el servidor debe escuchar en todas las interfaces:

```bash
npx vite --host 0.0.0.0    # luego abre http://192.168.1.158:5173 desde el teléfono
```

Resto de comandos:

```bash
npm run build      # build de producción -> dist/
npm run preview    # sirve el build de producción
npm run typecheck  # comprobación de tipos (tsc --noEmit)
```

No hay tests ni linter configurados todavía (ver `docs/18`).

## Estructura

```
app/
  index.html
  vite.config.ts          # manualChunks (Rolldown), target es2022
  src/
    main.tsx              arranque + router
    App.tsx               StoreProvider + rutas (React.lazy, 9 internas)
    lib/
      types.ts            modelo de dominio (interfaces del negocio)
      store.tsx           estado global observable + acciones + persistencia + seed
      fiscal.ts           cálculo fiscal: base, IVA, recargos, IGTF
      metrics.ts          métricas: ventas, utilidad, capital, series mensuales
      money.ts            formato USD/Bs y redondeo
      supabase.ts         cliente de Supabase (solo clave pública)
    components/
      Shell.tsx           topbar + sidebar + caja (abrir / cerrar con arqueo)
      ui.tsx              primitivas: PageHead, Card, Field, Modal, Tabs, Badge, Money, DualInline, EmptyState
      Icon.tsx            set de iconos, todos SVG (nada de emoji)
      DataTable.tsx       tabla virtualizada
    pages/
      Login, CrearComercio, Inicio, Vender, Historial,
      Catalogo, Inventario, Contactos, Finanzas, Informes, Ajustes
    styles/
      tokens.css, base.css, components.css
```

## Sistema de diseño

Paleta estricta de **3 colores** (definida en `styles/tokens.css`):

- `#FFFEFB` — fondo de todas las superficies
- `#007AFF` — acentos y el texto "BLINK" de la marca
- `#424242` — resto del texto

Las variaciones (bordes, hovers, estados, *ring* de foco) se derivan del color de texto con
transparencia, para no salir de la paleta. No se usan verdes/ámbar/rojos.

- Marca: `BLINK` en mayúsculas itálica + `POS` en mayúsculas, peso 400 (sin negritas).
- Tipografía: San Francisco (SF) servida localmente en WOFF2. SF es propiedad de Apple y no
  está licenciada para web pública: si el producto se publica fuera del entorno local, hay que
  sustituirla por una licenciada (ver `docs/03`).
- Todo icono es SVG (`components/Icon.tsx`).

## Estado y datos

- Estado global **observable** (`useSyncExternalStore`) con selectores por hook
  (`useStoreSelector`); las acciones viven en un contexto aparte para no provocar renders.
- Persistencia en `localStorage` con clave `blink-pos-state-v2` (migra `blink-pos-state-v1`),
  escritura con *debounce* de 250 ms, volcado al cerrar/ocultar la pestaña y sincronización
  entre pestañas. La sesión de autenticación usa `blink-pos-auth-v1`.
- Moneda dual: los importes se guardan/computan en USD y se muestran también en Bs con la
  tasa de referencia.

## Supabase (cliente)

Base de conexión a Supabase **solo con la clave pública**. La app sigue siendo
*local-first*: el estado vive en `localStorage` y Supabase aún no se usa en ningún
componente (es una base lista para el siguiente paso).

- `src/lib/supabase.ts` — crea el cliente a partir de las variables de entorno.
- `.env.local` — valores reales (ignorados por git; ver `.gitignore`).
- `.env.example` — plantilla con la explicación de seguridad.

Variables de entorno:

```bash
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

⚠️ Regla de seguridad: en el navegador **solo** va la clave pública
(`publishable`/`anon`). Todo lo que empieza por `VITE_` se incluye en el bundle y es
visible para cualquiera. La **secret key** y el `service_role` saltan el RLS y dan
acceso total a la base: se usan únicamente en el servidor, jamás en `VITE_*`.

Verificación: `npm run typecheck` y `npm run build` en verde; la clave pública responde
en `/auth/v1/health` (GoTrue).

## Documentación

La documentación completa del proyecto vive en `../docs` (01–18):

- `01`–`15` · arquitectura, diseño, modelo, API y rendimiento.
- `16` · inventario funcional de Wink POS (relevamiento en vivo, referencia de comportamiento).
- `17` · mapa de brechas Wink → BLINK y plan por fases.
- `18` · **estado del desarrollo y plan de traspaso para continuar el trabajo (empezar aquí)**.
