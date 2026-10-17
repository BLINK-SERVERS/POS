# 15 · Rendimiento y escalabilidad

Auditoría del código de `app/` con las optimizaciones aplicadas. El objetivo fue
hacer la app **más rápida de renderizar** y **más sólida para crecer** (más datos,
más pantallas, más usuarios), sin cambiar el comportamiento ni el diseño.

---

## 1. Diagnóstico (antes)

| Punto caliente | Problema |
| --- | --- |
| `lib/store.tsx` | Un único contexto estado+acciones: **cualquier** cambio re-renderizaba a **todos** los consumidores, incluso a los que solo despachan acciones. |
| Persistencia | `JSON.stringify(state)` + `localStorage.setItem` en **cada** cambio (síncrono y bloqueante). |
| `App.tsx` | Todas las páginas se importaban **eagerly**: un solo bundle con todo. |
| Métricas | `metrics()`, `capital()` y la serie de 6 meses se recalculaban en **cada render**; la serie recorría las ventas **6 veces**. |
| Tablas / POS | Las filas y las tarjetas de producto se re-renderizaban al escribir en un modal o pulsar un botón del ticket. |
| Búsqueda POS | Filtraba con el valor inmediato: en catálogos grandes, cada tecla bloqueaba. |
| Iconos | Componente sin `memo` con muchas instancias. |
| Config | Sin *code splitting* ni separación de *vendor*. |

---

## 2. Cambios aplicados

### 2.1 Estado global (`src/lib/store.tsx`)
- **Contextos separados**:
  - `useStoreState()` → se suscribe al estado.
  - `useStoreActions()` → **identidad estable**: los componentes que solo actúan
    (Login, CrearComercio…) no se re-renderizan cuando cambia el estado.
  - `useAuth()` → solo el flag de sesión; las guardas de ruta no re-renderizan
    con cada cambio de datos.
  - `useStore()` → API combinada, se mantiene por compatibilidad.
- **Persistencia con *debounce*** (250 ms): una sola escritura por ráfaga de
  cambios, en lugar de una por clic/tecla.
- **Volcado garantizado** en `beforeunload`, `pagehide` y
  `visibilitychange → hidden`, para no perder el último cambio.
- **Sincronización entre pestañas** con el evento `storage` (con guarda de
  igualdad para evitar bucles).
- `try/catch` en lectura/escritura (datos corruptos o cuota superada no rompen la app).

### 2.2 Código por demanda (`src/App.tsx`)
- Las 9 páginas internas se cargan con `React.lazy` + `Suspense`.
- El *fallback* (`.page-loader`) se renderiza **dentro** del `Shell`, así la
  barra lateral no parpadea al cambiar de ruta.

### 2.3 Cálculos (`src/lib/metrics.ts`)
- Helpers compartidos `saleNet()`, `saleCost()`, `isCountable()` (una sola
  definición del "neto" en todo el proyecto).
- `monthlySeries(sales, 6)`: **un solo recorrido** O(n) sobre las ventas
  (antes: 6 recorridos con 6 objetos `Date` por render).
- `lowStock()` ahora excluye **servicios** e inactivos (antes marcaba servicios
  con stock 0 como "stock bajo").

### 2.4 Páginas
- `Inicio`, `Informes`, `Historial`, `Finanzas`, `Inventario`: derivaciones con
  `useMemo` ligadas a las dependencias reales (`sales`, `expenses`, `products`,
  `accounts`), no al objeto de estado completo.
- **Componentes de fila/tarjeta memoizados** (`React.memo`): `ProductCard`
  (POS), `ProductRow` (Catálogo), `StockRow` (Inventario), `ContactRow`,
  `AccountRow`, `ExpenseRow`. Escribir en un modal o tocar el ticket ya **no**
  re-renderiza la tabla.
- POS (`Vender`): búsqueda con `useDeferredValue` (tipeo fluido) y totales con
  `useMemo`.
- `Ajustes`: temporizador del aviso "Guardado" con limpieza al desmontar
  (antes se podían acumular varios `setTimeout`).

### 2.5 Iconos (`src/components/Icon.tsx`)
- `Icon` envuelto en `memo` (muchas instancias, puramente presentacional).

### 2.6 Build e index
- `vite.config.ts`: `target: es2022`, `cssCodeSplit`, y `manualChunks` (función,
  requerida por Rolldown/Vite 8) que aparta `node_modules` en `vendor-*.js`.
- `index.html`: `preload` de la fuente regular (mejora el primer texto) y
  `meta description`.

### 2.7 Store externo con selectores (`src/lib/store.tsx`)
- El estado vive ahora en un **store externo observable** (fuera de React) y se
  consume con `useSyncExternalStore`. El provider sigue montado y se encarga de
  la **persistencia** y del **sync entre pestañas** (estado **y** sesión).
- Nuevo hook **`useStoreSelector(selector, isEqual?)`**: cada componente se
  suscribe solo a la porción que usa. P. ej. `Vender` escucha `products`,
  `rate`, `cashSession` y `contacts`; si cambia `expenses`, **no** se re-renderiza.
  El snapshot se cachea por identidad de estado, cumpliendo el contrato de
  `getSnapshot` (referencias estables).
- API retrocompatible: `useStore()`, `useStoreState()`, `useStoreActions()`,
  `useAuth()` siguen existiendo.
- `Vender`, `Catálogo`, `Inventario` e `Historial` ya usan selectores.

### 2.8 Virtualización de tablas (`src/components/DataTable.tsx`)
- Componente `DataTable` con **windowing**: por debajo de `threshold` (150 filas)
  renderiza igual que antes (sin cambios de UX); al superarlo recorta las filas a
  la **ventana visible** y las rellena con filas espaciadoras que conservan la
  altura de scroll.
- Cabecera **sticky** con fondo opaco en modo scroll.
- Medido con 800 productos: **26 `<tr>` en el DOM** en lugar de 800+.

### 2.9 Fuentes WOFF2
- SF convertidas a **WOFF2** (`fonttools`+`brotli`): **884 KB → 276 KB** (−69 %),
  con el `.otf` como respaldo en el `src` y `font-display: swap`.
- `preload` actualizado a `sf-regular.woff2` y `sf-italic.woff2` (la marca
  "BLINK" va en cursiva).

---

## 3. Resultado (build de producción)

```
dist/index.html                           1.00 kB │ gzip:  0.48 kB
dist/assets/index-*.css                  15.72 kB │ gzip:  3.48 kB
dist/assets/DataTable-*.js                1.01 kB │ gzip:  0.63 kB
dist/assets/Inicio-*.js                   4.00 kB │ gzip:  1.25 kB
dist/assets/Vender-*.js                   6.57 kB │ gzip:  2.18 kB
dist/assets/Finanzas-*.js                 7.20 kB │ gzip:  2.14 kB
dist/assets/index-*.js                   23.10 kB │ gzip:  7.06 kB   ← app base
dist/assets/vendor-*.js                 258.37 kB │ gzip: 81.98 kB   ← React + router (cacheable)
```

- La **carga inicial** ya no incluye las páginas internas.
- `DataTable` se separó en su propio chunk (lo comparten Catálogo/Inventario/Historial).
- Fuentes: **884 KB de `.otf` → 276 KB en `.woff2`** servidos de forma prioritaria.
- `vendor` es estable entre despliegues → mejor caché del navegador.
- Verificación: `tsc --noEmit` y `npm run build` sin errores; **9 rutas con 0
  errores de consola**; POS operativo (añadir al ticket → total → Cobrar);
  virtualización comprobada con 800 productos (26 filas en DOM).

---

## 4. Cómo seguir escalando (roadmap)

Ordenado por impacto:

1. ~~**Virtualización de listas**~~ ✅ Hecha (`DataTable`) en Catálogo, Inventario e Historial. Pendiente: virtualizar la rejilla de POS (`Vender`) para catálogos muy grandes.
2. ~~**Store con selectores finos**~~ ✅ Hecho (`useStoreSelector` + `useSyncExternalStore`). Restantes opcionales: migrar páginas restantes a selectores para reducir aún más re-renders.
3. ~~**Fuente en WOFF2**~~ ✅ Hecho (884 KB → 276 KB). Pendiente: *subsetting*. *(SF es de Apple y no está licenciada para web pública: reemplazar por una fuente licenciada antes de desplegar.)*
4. **Capa de datos real**: mover de `localStorage` a IndexedDB (local) o a un
   backend (REST/GraphQL + Postgres) con paginación, actualizaciones optimistas y
   **multiusuario/roles**.
5. **PWA + offline** (service worker) e impresión de tickets 58/80 mm.
6. **Observabilidad**: medir Core Web Vitals (Lighthouse) en CI y *presupuesto*
   de bundle.

> Nota: mientras el estado viva entero en un único objeto persistido, el coste
> de escritura crece con el tamaño de los datos. Los puntos 1 y 4 son los que
> desbloquean catálogos y volúmenes de ventas realmente grandes.
