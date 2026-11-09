// Guarda previa al despliegue (BLINK-065).
//
// El 2026-11-09 el sitio se publicó desde un `git worktree` parado en el commit
// inmediatamente anterior al que encerró el bypass de autenticación, y el fix
// quedó anulado en producción. Este script aborta el `deploy` si el árbol de
// trabajo no es, ni más ni menos, `main` sincronizada con `BLINK-SERVERS/POS`.
//
// Comprueba cuatro cosas y ninguna requiere red salvo la tercera:
//   1. Que el remoto `origin` es el repositorio público autorizado.
//   2. Que la rama actual es `main` (no `gh-pages`, ni detached, ni una rama suelta).
//   3. Que `HEAD` coincide con `origin/main` recién traído de la nave.
//   4. Que no hay cambios sin commitear en `src/` ni ficheros nuevos sin seguir.
//
// Sale con código 1 y un mensaje en español si algo falla; `npm run deploy`
// se corta en ese momento y no toca `gh-pages`.

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const REMOTO_AUTORIZADO = "BLINK-SERVERS/POS";
// Se evalúa el árbol de trabajo desde el que se lanza el comando, no la carpeta
// del script: así la guarda se puede copiar a otro checkout y probar contra él.
const app = resolve(process.cwd());

function git(args) {
  const r = spawnSync("git", ["-C", app, ...args], { encoding: "utf8" });
  return { ok: r.status === 0, out: (r.stdout || "").trim(), err: (r.stderr || "").trim() };
}

function fracaso(motivo, detalle) {
  console.error(`✗ Despliegue bloqueado — ${motivo}`);
  if (detalle) console.error(`  ${detalle}`);
  console.error(
    "  Si hay varias carpetas de BLINK POS en la máquina, la que publica es únicamente\n" +
      "  /home/prodz/BLINK_POS_Canonico (remoto BLINK-SERVERS/POS, rama main). Consulta\n" +
      "  AGENTS.md §9 antes de intentarlo otra vez."
  );
  process.exit(1);
}

// 0) Que estamos dentro de un repositorio (el comando se lanza desde app/, que
//    es subdirectorio: hay que preguntar por el toplevel, no buscar .git aquí).
const raiz = git(["rev-parse", "--show-toplevel"]);
if (!raiz.ok || raiz.out === "") fracaso("no hay repositorio git", `Desde ${app}: ${raiz.err || "sin respuesta"}`);

// 1) Remoto correcto.
const remoto = git(["remote", "get-url", "origin"]);
if (!remoto.ok) fracaso("no tiene remoto origin", remoto.err);
if (!remoto.out.includes(REMOTO_AUTORIZADO))
  fracaso(
    `el remoto no es ${REMOTO_AUTORIZADO}`,
    `origin apunta a ${remoto.out.replace(/https:\/\/[^@]*@/, "https://")} (los token de la URL se ocultan)`
  );

// 2) Rama main.
const rama = git(["rev-parse", "--abbrev-ref", "HEAD"]);
if (!rama.ok) fracaso("no se puede leer HEAD", rama.err);
if (rama.out !== "main")
  fracaso(`la rama actual es «${rama.out}», no main`, "Un `detached HEAD` (típico de un worktree o de un checkout de gh-pages) tampoco vale.");

// 3) Sincronizada con la nave.
const fetch = git(["fetch", "-q", "origin", "main"]);
if (!fetch.ok) fracaso("no se pudo traer origin/main", fetch.err);
const local = git(["rev-parse", "HEAD"]);
const remotoMain = git(["rev-parse", "origin/main"]);
if (!local.ok || !remotoMain.ok) fracaso("no se pudieron resolver los commits", `${local.out} / ${remotoMain.out}`);
if (local.out !== remotoMain.out)
  fracaso(
    "HEAD no coincide con origin/main",
    `local ${local.out.slice(0, 7)} ≠ remoto ${remotoMain.out.slice(0, 7)}. ` +
      "Publicar desde aquí sobrescribiría el último fix (eso es BLINK-065)."
  );

// 4) Sin código fuente sin commitear.
const sucio = git(["diff", "--quiet", "HEAD"]);
if (!sucio.ok) fracaso("hay cambios sin commitear", "Commitéalos o descártalos; el deploy publica lo que está en HEAD.");

const sinSeguir = git(["ls-files", "--others", "--exclude-standard", "src"]);
if (sinSeguir.ok && sinSeguir.out !== "")
  fracaso("hay ficheros nuevos en src/ sin seguir", sinSeguir.out.split("\n").slice(0, 5).join("\n  "));

console.log(`✓ Prechequeo de despliegue: ${REMOTO_AUTORIZADO} · main@${local.out.slice(0, 7)} · árbol limpio`);
