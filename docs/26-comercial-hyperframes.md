# 26 · Comercial con HyperFrames (HTML → vídeo)

**Estado:** implementado y renderizado · **Motor:** [HyperFrames](https://github.com/heygen-com/hyperframes) (Apache 2.0, HeyGen) · **Proyecto:** [`../video-hf/`](../video-hf/)

El comercial de 30 s de BLINK POS se rehízo con HyperFrames, el motor
open source que renderiza **HTML** a MP4 de forma determinista. Sustituye al
master de Remotion (que sigue en [`../video/`](../video/) y **no se ha
modificado**): el archivo nuevo es `BLINK-COMERCIAL-HF.mp4`.

---

## 1. Por qué HyperFrames

El guion pedía un vídeo de 30 s con typography cinética, Motion UI real,
perspectiva 3D y audio percusivo a 153 BPM, sin voz en off. En HTML todo eso
es CSS y GSAP, sin compilación: el vídeo **es** el código, y el render es
reproducible fotograma a fotograma.

| | Remotion (`../video/`) | HyperFrames (`../video-hf/`) |
|---|---|---|
| Unidad | React + TypeScript | HTML + CSS + GSAP |
| Build | `tsc` + bundle | ninguno |
| Audio | `<Audio>` de Remotion | `<audio>` con `data-start` / `data-duration` |
| Verificación | `remotion stills` | `hyperframes check` (lint, layout, movimiento, contraste, craft) |
| Tamaño de salida | MP4 | MP4, WebM, MOV, GIF, HLS, PNG-seq |

La diferencia práctica: `hyperframes check` encuentra solo, antes de renderizar,
problemas que en Remotion aparecían al ver el MP4 (texto tapado, contraste
AA, tipografía por debajo del suelo de lectura, primer fotograma vacío).

## 2. El contrato que hay que respetar

1. `index.html` es la raíz: declara el tema, monta las escenas y el audio.
2. Cada escena es un archivo con `<template>` (estilos + marcado + script) y su
   raíz es `#root`.
3. Todo elemento temporizado lleva `class="clip"`, `data-start` (segundos) y
   `data-duration`.
4. Cada composición registra su línea de tiempo **en pausa**:
   `window.__timelines["<id>"] = gsap.timeline({ paused: true })`.
5. Prohibido `Date.now()`, `Math.random()`, red y temporizadores: todo depende
   del tiempo de la línea de tiempo.
6. **Nada se centra con `transform`.** GSAP pisa el `transform` del elemento
   que anima, así que el centrado va con rejilla (`grid` + `place-items:
   center`) o con `margin`/`inset`. Este fue el fallo que descuadró las
   escenas 2, 3 y 4 en la primera pasada.
7. El solapamiento intencionado se marca en el bloque concreto
   (`data-layout-allow-overlap`, `data-layout-allow-occlusion`,
   `data-layout-allow-overflow`, `data-layout-ignore`), nunca en la raíz de la
   escena.

## 3. La rejilla de 153 BPM

La música (`assets/audio/musica.mp3`) se midió con `hyperframes audio`: los
primeros onsets caen cada `0,392 s`, es decir **153 BPM**, con el primer golpe
en **0,17 s**. La rejilla vive en el raíz:

```js
window.BPM = 153;
window.FASE = 0.17;
window.beat = (n) => window.FASE + (n * 60) / window.BPM;
```

Cada escena define su `INICIO` y usa `b(n) = window.beat(n) - INICIO`, de modo
que **todos los cortes y todos los acentos caen en un beat**:

| Corte | Beat | Segundo global |
|---|---|---|
| Entra la escena 2 | 13 | 5,268 s |
| Entra la escena 3 | 31 | 12,327 s |
| Entra la escena 4 | 48 | 18,994 s |
| Entra la escena 5 | 64 | 25,268 s |

Con 60 fps, un beat dura `23,53` fotogramas: no es entero, así que el desvío
máximo entre un acento y el beat es de medio fotograma (8 ms), imperceptible.

## 4. El audio

- **Música**: el bed, los primeros 30 s de la pista, con `data-volume="0.9"`.
- **Efectos de UI**: sintetizados por `scripts/generar-sfx.mjs` en WAV de 16
  bits con semilla fija (mismo resultado en cada ejecución):
  `clic` (toque seco), `pop` (blip ascendente), `swoosh` (barrido de ruido
  filtrado) y `ding` (confirmación de venta).
- Cada efecto está colocado sobre un beat concreto en `index.html`:
  el barrido azul en el beat 8, el clic de `$ Vender` en el 33, el `ding` del
  check en el 35, el corte a oscuro en el 56 y el clic de la llamada a la
  acción en el 70.

No hay voz en off: la narrativa va con tipografía cinética bicolor
(`#0F172A` + `#0088FF`), revelado con `blur(14px) → blur(0)` y con la
selección azul `rgba(0,136,255,0.18)`.

## 5. El producto en pantalla

Nada de wireframes: los paneles son la app real.

- **Escritorio**: barra lateral con siete módulos, buscador, estado «En línea ·
  Sincronizado», avatar, cuatro tarjetas KPI con sparklines e insignias verdes
  (`+12.4 %`, `+8.1 %`, `+3.2 %`, `+5.7 %`), gráfico de barras con globo
  («Hoy: $ 1.240,00») y lista de últimas ventas.
- **Móvil**: tarjetas de ventas/órdenes/margen, gráfico de rendimiento, botón
  `$ Vender`, barra «Facturando… 0 % → 100 %», check verde «Venta registrada ·
  $ 45,00» y dock de cristal de cinco accesos con el `$` central en `#0088FF`.
- **Cierre**: isotipo + `BLINK POS`, lema escrito a máquina, distintivo
  **`Disponible el 01/12/27`** y `blink.com.ve`.

## 6. Entregables

| Archivo | Formato | Origen |
|---|---|---|
| `BLINK-COMERCIAL-HF.mp4` | 1920×1080, 60 fps, 30 s | raíz del proyecto |
| `BLINK-COMERCIAL-HF-9x16.mp4` | 1080×1920, 60 fps, 30 s | `scripts/recortar.mjs` |
| `BLINK-COMERCIAL-HF-1x1.mp4` | 1080×1080, 60 fps, 30 s | `scripts/recortar.mjs` |

Los recortes se sacan del master con **ffmpeg** (`scripts/recortar.mjs`): el
lienzo 16:9 **completo** se escala a 1080×608 y se apoya sobre un marco azul
noche `#0A0F1D` con la firma de marca debajo (`BLINK POS`, `blink.com.ve`,
`Disponible el 01/12/27`).

> Se probó primero la vía «otra raíz de composición en HyperFrames», pero el
> motor **ajusta la escena al lienzo de la raíz por su cuenta** y el
> escalado manual se peleaba con ese ajuste: el resultado salia descentrado y
> con los titulares cortados. Con ffmpeg el recorte es exacto, cabe en un
> minuto y no depende de como el motor componga.

## 7. Verificación

```bash
cd video-hf
npx hyperframes check .          # 0 errores, 0 avisos
npx hyperframes snapshot --at 0.2,3.8,6.4,10.6,12.9,14.4,21.4,23.4,26.4,29.1
node scripts/recortar.mjs        # los dos recortes (ffmpeg)
node scripts/verificar-video.mjs "../BLINK-COMERCIAL-HF.mp4"
node scripts/verificar-video.mjs "../BLINK-COMERCIAL-HF-9x16.mp4"
node scripts/verificar-video.mjs "../BLINK-COMERCIAL-HF-1x1.mp4"
```

`verificar-video.mjs` comprueba con `ffprobe` la duración, la resolución, los
fps y el número de fotogramas, y con `astats` de `ffmpeg` que la pista de
audio **no es silencio** (en los tres: pico −4,1 dB, RMS −27,2 dB).

## 8. Estado

- [x] Maqueta de 30 s con las cinco escenas y la rejilla de 153 BPM.
- [x] Audio: música + cuatro efectos de UI sintetizados, sin voz.
- [x] `hyperframes check` en verde (lint, runtime, layout, movimiento,
      contraste WCAG AA y craft).
- [x] Master 16:9 renderizado a 60 fps (8,8 MB, 1800 fotogramas).
- [x] Recortes 9:16 (2,7 MB) y 1:1 (2,7 MB).
- [ ] Publicación en Product Hunt y redes (pendiente de la cuenta y del copy).
