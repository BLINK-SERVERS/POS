# 25 · Comercial Motion UI (Remotion)

**Fecha:** 2026-10-21 · **Version:** 1.0.0 · **Pieza:** `BLINK-COMERCIAL.mp4`

Comercial de 01:29 (1920 x 1080, 30 fps, 2670 fotogramas) producido con
**Remotion** en la carpeta `video/`. No forma parte del bundle de la web:
vive fuera de `app/` y no se despliega con la app.

---

## 1 · Por que Remotion

La web se construye con React; el comercial tambien. Se comparten:

| Se comparte | Como |
|---|---|
| Los SF Symbols | `video/src/kit/simbolo.tsx` importa `app/src/lib/sf-symbols.ts` |
| La paleta oficial | `video/src/kit/tokens.ts` (verificada contra `app/src/styles/tokens.css`) |
| Las medidas del UI Kit | `docs/ios27-geometry.json` (boton 50, tab 54, area tactil 44…) |
| Los componentes | `video/src/kit/ui.tsx` reproduce el material de cristal, la maqueta del POS, la barra flotante y las tarjetas de metrica de la app |

El comercial se renderiza con el **Chrome del sistema** (no se descarga el
Chrome Headless Shell) y usa el **ffmpeg** que Remotion trae.

---

## 2 · Las nueve escenas

El guion marca los tiempos; en `video/src/composiciones/Comercial.tsx` estan
en el objeto `T`.

| # | Escena | Tiempo | Fotogramas | Que se ve |
|---|---|---|---|---|
| 1 | Apertura institucional | 0:00 - 0:03 | 0 - 90 | Destello digital, el logotipo y la mascota parpadeando |
| 2 | El problema | 0:03 - 0:13 | 90 - 390 | Tipografia cinematica: las dos preguntas del comerciante |
| 3 | La solucion | 0:13 - 0:24 | 390 - 720 | "BLINK" a tamano gigante y el panel real con las 4 tarjetas |
| 4 | Multimoneda y vuelto | 0:24 - 0:32 | 720 - 960 | Los tres pagos combinados y el vuelto automatico en bolivares |
| 5 | Conexion BCV | 0:32 - 0:40 | 960 - 1200 | La tasa del dia contando, con el indicador verde |
| 6 | Reportes | 0:40 - 0:48 | 1200 - 1440 | El bento con el grafico de barras de 12 meses |
| 7 | Escaner | 0:48 - 0:56 | 1440 - 1680 | El movil escanea y la factura entra al inventario |
| 8 | Resumen | 0:56 - 1:00 | 1680 - 1800 | La frase de cierre y la mascota guiñando |
| 9 | Cierre y CTA | 1:00 - 1:29 | 1800 - 2670 | La pregunta final y el boton de cristal con el lema |

La pista (`public/audio/blink-comercial.mp3`, 89,3 s) va montada sobre la
composicion: los cortes coinciden con la musica.

---

## 3 · La mascota

El isotipo de BLINK (el cuadrado azul con la cara que guiña un ojo) es la
mascota. Se reconstruyo **midiendo el original** (radio 80/512, ojo-pildora
150x75 en 55/182, ojo circular r=75 en 381/181, boca de semidisco r=81 en
175/324) y se anima con cuatro gestos:

| Gesto | Como |
|---|---|
| Parpadeo | el ojo-pildora se aplasta en vertical |
| Guiño | el ojo circular se convierte en una linea |
| Asintido | inclinacion breve de la cabeza |
| Sonrisa | la boca crece |

Los gestos corren con su propio ritmo (`gestosMascota`), con un parpadeo
final sincronizado con el corte de la musica.

---

## 4 · Tipografia

El render usa **Inter** (SIL OFL 1.1), la misma que sirve la web como
respaldo de SF Pro, **incrustada en el bundle** (`scripts/generar-fuente.mjs`).

> **Por que no SF Pro:** la licencia de SF Pro de Apple cubre mockups y
> prototipos en plataformas de Apple, no un comercial publicado. Inter es
> la alternativa libre, muy parecida, y su licencia lo permite.

La fuente va incrustada (data URL) y **no** se espera con `delayRender`:
con la fuente en el bundle no hay nada que esperar, y bloquear el
fotograma mientras se cargaba hacia que el render se cayera por timeout
en el equipo de 2 nucleos.

---

## 5 · Reglas de estilo que sigue

* El material de cristal solo en la **capa funcional**; los datos (cifras,
  tickets) siempre opacos.
* Una sola familia tipografica, con cifras tabulares (`font-variant-numeric`).
* Transiciones cortas y con resorte, nunca rebotes.
* La paleta es la oficial: azul `#0088ff`, verde `#34c759`.
* Los simbolos son los de la app: el video y el sitio comparten glifo.

---

## 6 · Comandos

```bash
cd video
npm install
npm run dev            # Remotion Studio
npm run render        # BLINK-COMERCIAL.mp4
npm run render:preview  # a media resolucion (rapido)
npm run fotogramas    # un fotograma por escena
npm run verificar     # la paleta del video vs. la de la web
npm run fuente        # regenera la tipografia incrustada
```

---

## 7 · Bitacora tecnica

| Incidencia | Resolucion |
|---|---|
| `npm run og` fallaba (leia fuentes de Apple que ya no estaban) | El generador usa la SF Pro local de desarrollo, incrustada en el PNG |
| El render se caia a los ~52 fotogramas | El `delayRender` de la fuente (interno de `@remotion/fonts`) no se limpiaba: la fuente se incrusta y no se espera |
| `AbsoluteFill` es `flex` sin direccion | Se declara `flexDirection` en cada escena (columna o fila) |
| La mascota salia inclinada en reposo | El gesto va de 0 a 1 y se aplica con un seno: 0 grados en reposo |
