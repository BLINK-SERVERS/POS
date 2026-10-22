# 25 · Launch video de BLINK POS (Remotion)

**Fecha:** 2026-10-22 · **Version:** 1.0.0 · **Pieza:** `BLINK-COMERCIAL.mp4`

Video de lanzamiento **30,0 s · 1920 x 1080 · 60 fps · 1800 fotogramas**,
producido con **Remotion** en la carpeta `video/`. Vive fuera de `app/`: no entra en el
bundle de la web.

**Sin voz en off**: todo el relato son cortes de tipografia cinematica
bicolor. El ritmo lo marcan los movimientos, no una locucion.

---

## 1 · Las entregas

| Formato | Archivo | Lienzo |
|---|---|---|
| Master 16:9 | `BLINK-COMERCIAL.mp4` | 1920 x 1080 |
| Recorte 1:1 | `BLINK-COMERCIAL-1x1.mp4` | 1080 x 1080 |
| Recorte 9:16 | `BLINK-COMERCIAL-9x16.mp4` | 1080 x 1920 |

Los tres salen de la **misma** composicion: las escenas se dibujan en un
espacio de 1920 x 1080 y el lienzo recorta (en 1:1, con escala 0,80, para
que el grupo entero entre en el cuadrado).

---

## 2 · La linea de tiempo

| # | Escena | Tiempo | Fotogramas | Fondo | Que se ve |
|---|---|---|---|---|---|
| 1 | El problema | 0:00 - 0:05 | 0 - 299 | claro | Tipografia cinematica: "¿Cansado de registrar tus ventas a mano?" y "¿Cansado de calcular precios y tasas cada dia?" |
| 2 | Los tres pasos | 0:05 - 0:11 | 300 - 659 | claro | Macro-zoom con profundidad de campo: el dashboard desenfocado y, delante, las tarjetas 1-2-3 y la barra de progreso |
| 3 | Vender | 0:11 - 0:17 | 660 - 1019 | claro | El boton `$ Vender` en primer plano, con su onda de choque, y el aviso de la venta sincronizada |
| 4 | Tu tienda en cualquier pantalla | 0:17 - 0:24 | 1020 - 1439 | claro → **oscuro** | Cuatro dispositivos entran en diagonal desde las esquinas; en la segunda mitad, corte a oscuro con los corchetes enmarcando "Cero papeleo. Pura velocidad." |
| 5 | Cierre | 0:24 - 0:30 | 1440 - 1799 | oscuro | El isotipo, el logotipo, el lema oficial y la llamada a la accion |

El corte a **modo oscuro** ocurre en la segunda mitad de la escena 4
(fotograma 1220): el fondo pasa de la malla clara a `#050914` con
auroras azules.

---

## 3 · Anti-wireframe: la interfaz esta llena

Regla critica de las directivas: **ninguna caja vacia, ningun rectangulo de
relleno**.

**Escritorio** (`src/kit/panel-desktop.tsx`): barra lateral con los
ocho modulos y sus iconos SVG, buscador superior, insignia de estado, avatar
con las iniciales, las cuatro tarjetas KPI con su chispa de ocho barras y
su insignia verde, el grafico de doce meses con el globo de cristal y las
tres ultimas ventas.

**Movil** (`src/kit/panel-movil.tsx`): barra con "General" y avatar,
tres tarjetas con las cifras reales, su chispa en vivo y el dock de cristal
con los cinco accesos, siendo el central el circulo azul con el "$".

El contenedor va en **perspectiva 3D** (perspective 1200 px, rotateX 12,
rotateY -10, rotateZ 2) con sombras multicapa
(`0 30px 60px rgba(0,136,255,0.15)`).

---

## 4 · Motion

* **Camara con plataforma 3D**: la rotacion isometrica se interpola a lo
  largo de la escena y siempre con ease-in-out.
* **Macro-zooms de 200 - 250 %** en las escenas de accion, con el fondo
  desenfocado (`blur(10px)`, opacidad 0,35) y los componentes
  flotando delante al 70 % del ancho, en cristal (blur 24 px, borde blanco
  de 1,5 px).
* **Tipografia cinematica**: 72 - 110 px, peso 700, tracking -0,04 em, con
  revelacion por desenfoque (blur 14 → 0 en 15 fotogramas) y el efecto de
  "seleccion azul" (`rgba(0,136,255,0.18)`) en las palabras clave.
* **Bicolor**: negro profundo `#0F172A` + azul electrico `#0088ff`.
* **Cursor en arcos** (Bezier cuadratica, control al 15 %) y pulsaciones con
  escala 0,96 → 1.
* **Nada se queda quieto**: la camara empuja y lo que se mantiene deriva.

---

## 5 · Fondos

| Modo | Fondo |
|---|---|
| Claro (escenas 1-3) | Blanco luminoso con dos esferas radiales `#0088ff` difuminadas (blur 140 px, opacidad 0,22) que se desplazan por las esquinas |
| Oscuro (escena 4-2ª mitad y 5) | `#050914` con auroras azules brillantes y los corchetes `[ ]` que enmarcan el texto |

---

## 6 · Lo que se comparte con la app

| Se comparte | Como |
|---|---|
| Los SF Symbols | `video/src/kit/simbolo.tsx` importa `app/src/lib/sf-symbols.ts` |
| La paleta oficial | `video/src/kit/tema.ts`, verificada contra `app/src/styles/tokens.css` |
| Las medidas del UI Kit | `docs/ios27-geometry.json` |

`npm run verificar` comprueba que la paleta del video no se desincronice
de la de la web (12 grupos + 5 semanticos + la fuente).

---

## 7 · Tipografia del render

**Inter** (SIL OFL 1.1), incrustada en el bundle (`npm run fuente`).
Determinista y con licencia para publicar el comercial: la SF Pro de Apple
solo cubre mockups y prototipos en plataformas de Apple.

---

## 8 · Bitacora tecnica

| Incidencia | Resolucion |
|---|---|
| El render se caia a los ~140 fotogramas con "un delayRender() no se limpio" | Es el **audio**: Remotion bloquea el hilo mientras decodifica la pista. Quitado el `delayRender` de la fuente (va incrustada en el `<head>`: ya esta lista cuando empieza a pintar) |
| La tipografia no se revelaba | El calculo de la revelacion usaba el fotograma de **inicio** en vez del actual |
| El degradado del lema salia como un bloque azul | React **no aplica** `background-clip: text` desde el objeto `style`: el degradado va en una **clase CSS** |
| El directorio `src/composiciones` dejo de resolver | La entrada de nombre largo del directorio se corrompio (solo resolvia el nombre corto 8.3). Se reconstruyo con un nombre corto (`src/comp`) |
| El `<Audio>` con los cinco tramos no se montaba | Un replacement anterior no habia aplicado y se quedo el audio suelto de la pista entera. Ademas `<Audio>` no admite `durationInFrames`: el recorte lo hace el `<Sequence>` |
| El encoder se quedaba bloqueado | Un render anterior dejo un `ffmpeg` colgado con el fichero abierto |

---

## 9 · Comandos

```bash
cd video
npm install
npm run dev              # Remotion Studio
npm run render           # el master 16:9
npm run render:1x1       # el recorte cuadrado
npm run render:9x16     # el recorte vertical
npm run fotogramas       # un fotograma por escena
npm run verificar        # la paleta del video vs. la de la web
npm run verificar:video  # streams, duracion y formato del MP4
npm run fuente           # regenera la tipografia incrustada
```
