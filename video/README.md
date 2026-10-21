# Comercial de BLINK POS · Motion UI con Remotion

Producción del comercial (01:29) al estilo Apple Motion UI: tarjetas de
cristal, tipografía grande, la mascota (el isotipo) animándose en las
esquinas y la interfaz real de BLINK POS.

Este proyecto es **independiente** del bundle de la web: vive en `video/`
y no se despliega con la app.

---

## Puesta en marcha

```bash
cd video
npm install
npm run dev          # Remotion Studio (previsualizar y scrubbar)
```

## Renderizar

```bash
npm run render              # comercial completo -> BLINK-COMERCIAL.mp4
npm run render:preview      # a media resolucion, cada 2 fotogramas (rápido)
npm run still Comercial f.png --frame=1740
```

El render usa el **Chrome del sistema** (no descarga el Chrome Headless
Shell): se declara en `remotion.config.ts`.

---

## Cómo está montado

| Ruta | Qué es |
|---|---|
| `src/kit/tokens.ts` | La paleta oficial de BLINK y las medidas del UI Kit de iOS 27 |
| `src/kit/simbolo.tsx` | Los SF Symbols **de la app** (`app/src/lib/sf-symbols.ts`): el video y la web comparten glifo |
| `src/kit/mascota.tsx` | La mascota: el isotipo con parpadeo, guiño, asintido y sonrisa |
| `src/kit/ui.tsx` | Las piezas: cristal, tarjeta de métrica, maqueta del POS, móvil, barra flotante, logotipo |
| `src/kit/fuentes.ts` | La tipografía del render (Inter, OFL) |
| `src/composiciones/Comercial.tsx` | El comercial: las 9 escenas del guion, con sus marcas de tiempo |
| `src/composiciones/Prueba.tsx` | Banco de pruebas de movimiento |
| `scripts/fotogramas.mjs` | Un fotograma por escena (un solo bundle) |
| `scripts/verificar-tokens.mjs` | Comprueba que la paleta del video no se desincroniza de la de la web |

## Las escenas

El guion marca los tiempos; en `Comercial.tsx` están en `T`:

| Escena | Tiempo | Qué se ve |
|---|---|---|
| Apertura institucional | 0:00 – 0:03 | Destello digital, el logotipo y la mascota que parpadea |
| El problema | 0:03 – 0:13 | Tipografía cinética: las dos preguntas del comerciante |
| La solución | 0:13 – 0:24 | "BLINK" a tamaño gigante y el panel real (las 4 tarjetas) |
| Multimoneda y vuelto | 0:24 – 0:32 | Los tres pagos combinados y el vuelto automatico |
| Conexion BCV | 0:32 – 0:40 | La tasa del dia, contando, con el indicador verde |
| Reportes | 0:40 – 0:48 | El bento con el grafico de barras mensual |
| Escaner | 0:48 – 0:56 | El movil escanea y el articulo entra al inventario |
| Resumen | 0:56 – 1:00 | La frase de cierre y la mascota guiñando |
| Cierre y CTA | 1:00 – 1:29 | La pregunta final y el boton de cristal con el lema |

## Reglas que sigue el proyecto

* El material de cristal solo en la **capa funcional**; los datos (cifras,
  tickets) siempre opacos.
* Una sola familia tipografica, con cifras tabulares.
* Transiciones cortas y con resorte, nunca rebotes.
* La paleta es la oficial: azul `#0088ff`, verde `#34c759`.

## Tipografia

El render usa **Inter** (SIL OFL 1.1), la misma que sirve la web como
respaldo de SF Pro. Es determinista y su licencia permite publicar el
comercial.

> La SF Pro real de Apple solo cubre mockups y prototipos en plataformas de
> Apple. Para un comercial publicado, Inter (OFL) es la opcion segura. Si
> se quiere la de Apple, se copian los ficheros de `app/.fonts-sf-local/` a
> `video/public/fonts/` y se cambia la familia en `src/kit/fuentes.ts`.

## Audio

La pista va en `public/audio/blink-comercial.mp3` (89,3 s) y se monta sobre
la composicion. **No se versiona** (son 2 MB de musica con derechos): se
copia desde el equipo del usuario.

```powershell
Copy-Item "$env:USERPROFILE\Music\BLINK COMERCIAL.mp3" public\audio\blink-comercial.mp3
```

La duracion de la composicion (2670 fotogramas = 89,0 s) coincide con la
pista: si cambia el audio, hay que ajustar `T` en `Comercial.tsx` y
`durationInFrames` en `src/Root.tsx`.
