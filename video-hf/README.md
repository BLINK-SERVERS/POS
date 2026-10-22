# BLINK · Comercial 30 s · HyperFrames

Video de lanzamiento de BLINK POS: **30 s, 1920×1080, 60 fps, 1800 fotogramas**,
sin voz en off, con música percusiva a **153 BPM** y efectos de sonido de UI.

Este proyecto usa **[HyperFrames](https://github.com/heygen-com/hyperframes)**
(el motor open source de HeyGen: *escribes HTML y se renderiza un MP4*).
No hay build: el vídeo **es** el HTML.

> El proyecto anterior en Remotion sigue vivo en [`../video/`](../video/) y su
> master (`BLINK-COMERCIAL.mp4`) **no se ha tocado**. La versión HyperFrames
> se exporta como `BLINK-COMERCIAL-HF.mp4` (y sus recortes), en archivos nuevos.

---

## 1. Estructura

```
video-hf/
├─ index.html                    raíz: paleta, componentes, escenas montadas, audio
├─ compositions/
│  ├─ s1-hook.html               escena 1 · el gancho (la pregunta y el borrón)
│  ├─ s2-marca.html              escena 2 · la marca y el escritorio en 3D
│  ├─ s3-movil.html              escena 3 · el móvil y el cobro
│  ├─ s4-sync.html               escena 4 · los cuatro dispositivos y el corte a oscuro
│  └─ s5-cierre.html             escena 5 · logotipo, lema, fecha y llamada
├─ assets/
│  ├─ audio/musica.mp3           el bed musical (los primeros 30 s)
│  ├─ audio/{clic,pop,swoosh,ding}.wav   efectos de UI sintetizados
│  └─ fonts/inter-latin.woff2    la tipografía del render
└─ scripts/                      utillaje: SFX, recortes, QA
```

> **Los `.mp3` y los `.wav` no se versionan** (la música tiene derechos y los
> efectos se regeneran). Para reponerlos:
>
> ```bash
> cp "$HOME/Music/BLINK COMERCIAL.mp3" assets/audio/musica.mp3
> node scripts/generar-sfx.mjs
> ```


## 2. Comandos

```bash
npx hyperframes check .                              # lint + layout + contraste + craft
npx hyperframes snapshot --at 8.6,14.4,21.4          # fotogramas para revisar
npx hyperframes render . --fps 60 --quality delivery --output "../BLINK-COMERCIAL-HF.mp4"
node scripts/recortar.mjs                            # los recortes 9:16 y 1:1
node scripts/generar-sfx.mjs                         # regenera los efectos de sonido
```

## 3. La línea de tiempo

Las escenas empiezan **en el beat**: la rejilla son 153 BPM con el primer golpe
en 0,17 s (medido sobre la pista con `hyperframes audio`), es decir un beat cada
`60/153 = 0,392157 s`.

| # | Escena | Global | Fotogramas | Beats | Qué pasa |
|---|---|---|---|---|---|
| 1 | El gancho | 0 → 5,268 s | 0–316 | 0–13 | «Misma venta, mil cuadernos» se escribe y una barra azul lo borra: «Deja de anotar a mano» |
| 2 | La marca | 5,268 → 12,327 s | 316–740 | 13–31 | «Conoce BLINK» → «Tu Punto de Venta. En un parpadeo»; el escritorio real entra en 3D |
| 3 | El móvil | 12,327 → 18,994 s | 740–1140 | 31–48 | Macro del móvil, el cursor pulsa `$ Vender`, la barra corre 0 → 100 % y salta el check verde |
| 4 | La sincronía | 18,994 → 25,268 s | 1140–1516 | 48–64 | Cuatro dispositivos entran en diagonal; corte a `#0A0F1D` y `[ Cero Papeleo. Pura Velocidad. ]` |
| 5 | El cierre | 25,268 → 30 s | 1516–1800 | 64–76 | Isotipo + `BLINK POS`, el lema se escribe, `Disponible el 01/12/27` y `blink.com.ve` |

En cada escena se usa el helper global `window.beat(n)`, que devuelve el
segundo global del beat *n*; cada escena resta su propio `INICIO` para trabajar
en tiempo local.

## 4. El contrato de HyperFrames (lo que no se debe romper)

- `index.html` es la **raíz**: declara el tema, monta las escenas y el audio.
- Cada escena es un archivo con `<template>` (estilos + marcado + script) y su
  raíz es `#root`.
- Todo elemento temporizado lleva `class="clip"`, `data-start` (segundos) y
  `data-duration`.
- Cada composición registra su línea de tiempo **en pausa**:
  `window.__timelines["<id>"] = gsap.timeline({ paused: true })`.
- Nada de `Date.now()`, `Math.random()`, peticiones de red ni temporizadores:
  todo es función del tiempo de la línea de tiempo.
- **Nada se centra con `transform`**: GSAP pisa el `transform` del elemento que
  anima. El centrado se hace con rejilla (`grid` + `place-items: center`) o con
  `margin`/`inset`.
- El desbordamiento intencionado (los recibos sobre el titular, la barra azul
  fuera del lienzo) se marca con `data-layout-allow-overlap`,
  `data-layout-allow-occlusion`, `data-layout-allow-overflow` o
  `data-layout-ignore` **en el bloque concreto**, nunca en la raíz de la escena.

## 5. Decisiones de diseño

- **Sin voz en off**: la narrativa va con tipografía cinética bicolor
  (`#0F172A` + `#0088ff`, peso 700, tracking `-0.04em`) revelada con
  `blur(14px) → blur(0)` y con la selección azul `rgba(0,136,255,0.18)`.
- **Inter** (SIL OFL 1.1) incrustada como `assets/fonts/`. SF Pro solo aparece
  en los mockups de Apple.
- **UI real, nunca wireframes**: el panel de escritorio tiene barra lateral con
  iconos, buscador, estado «En línea», avatar, cuatro tarjetas KPI con
  sparklines e insignias verdes (`+12.4 %`), gráfico de barras y lista de
  ventas. El móvil tiene tarjetas, dock de cristal de cinco accesos y el `$`
  central en `#0088ff`.
- **Liquid Glass**: `rgba(255,255,255,0.75)`, `backdrop-filter: blur(24px)`,
  borde blanco translúcido de 1,5 px, radios de 16–24 px.
- **Contraste AA**: los textos secundarios usan `#6F747C` y el azul de marca
  sobre papel usa su variante oscura `#0075DC` (el `#0088FF` se reserva para
  rellenos y acentos).
- **Presión táctil real**: `scale(0.96)` al pulsar y rebote a `1.02` al soltar.
- **Fondos**: malla blanca con dos esferas `#0088FF` a la deriva (`blur(140px)`,
  opacidad 0,22) en las escenas 1–3; auroras sobre `#0A0F1D` en la 4 y la 5.

## 6. El audio

- La música es el bed: `assets/audio/musica.mp3`, recortada a 30 s, con la
  rejilla de 153 BPM ya presente en la propia pista.
- Los efectos de UI son **sintetizados** por `scripts/generar-sfx.mjs` (WAV de
  16 bits, semilla fija → render reproducible): `clic` (toque seco), `pop`
  (blip ascendente), `swoosh` (barrido de ruido filtrado) y `ding` (confirmación
  de venta). Cada uno está colocado sobre un beat concreto en `index.html`.

## 7. Los recortes

Los recortes se sacan del master con `scripts/recortar.mjs` (ffmpeg): el
lienzo 16:9 **completo** se escala a 1080×608 y se apoya sobre un marco azul
noche `#0A0F1D` con la firma de marca debajo. Así **no se corta nada** (los
titulares anchos y los cuatro dispositivos de la escena 4 entran enteros) y
el marco lleva el rótulo: `BLINK POS`, `blink.com.ve` y
`Disponible el 01/12/27`.

| Archivo | Formato | Tamaño |
|---|---|---|
| `BLINK-COMERCIAL-HF.mp4` | 1920×1080, 60 fps, 30 s | el master |
| `BLINK-COMERCIAL-HF-9x16.mp4` | 1080×1920, 60 fps, 30 s | banda a 520 px, rótulo debajo |
| `BLINK-COMERCIAL-HF-1x1.mp4` | 1080×1080, 60 fps, 30 s | banda a 210 px, rótulo al pie |

## 8. QA

```bash
npx hyperframes check .     # 0 errores, 0 avisos (lint, runtime, layout, motion, contraste, craft)
npx hyperframes snapshot --at 0.2,3.8,6.4,10.6,12.9,14.4,21.4,23.4,26.4,29.1
node scripts/verificar-video.mjs "../BLINK-COMERCIAL-HF.mp4"                  # 1920x1080
node scripts/verificar-video.mjs "../BLINK-COMERCIAL-HF-9x16.mp4" 1080x1920
node scripts/verificar-video.mjs "../BLINK-COMERCIAL-HF-1x1.mp4" 1080x1080
```
