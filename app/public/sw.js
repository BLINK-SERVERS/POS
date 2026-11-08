/* Blink POS — capa offline mínima.
   Hace la app instalable (el navegador exige un service worker con control
   de `fetch` para ofrecer la instalación) y permite abrirla sin conexión.

   Solo se guardan recursos propios del alcance del worker; las llamadas a
   Supabase son de otro origen y nunca pasan por aquí. Al cambiar la lógica,
   subir CACHE para borrar la versión anterior. */
const CACHE = "blink-pos-v1";
const RAIZ = new URL("./", self.location).href;
const ARMAZON = [
  RAIZ,
  RAIZ + "index.html",
  RAIZ + "manifest.json",
  RAIZ + "icons/icon-192.png",
  RAIZ + "favicon.svg",
];

const ESTATICAS = /\.(?:js|mjs|css|woff2?|ttf|otf|png|jpe?g|svg|webp|ico|webmanifest|json)$/i;

function enAlcance(url) {
  return url.origin === self.location.origin && url.href.startsWith(self.registration.scope);
}

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ARMAZON))
      // No hay pantalla de actualización en POS: la versión nueva toma el
      // control en cuanto termina de instalarse.
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves
            .filter((clave) => clave.startsWith("blink-pos-") && clave !== CACHE)
            .map((clave) => caches.delete(clave))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;
  if (peticion.method !== "GET") return;
  const url = new URL(peticion.url);
  if (!enAlcance(url)) return;

  // Navegaciones: red primero para recibir cada despliegue y el armazón
  // guardado como respaldo cuando no hay conexión.
  if (peticion.mode === "navigate") {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          const copia = respuesta.clone();
          void caches.open(CACHE).then((cache) => cache.put(RAIZ + "index.html", copia));
          return respuesta;
        })
        .catch(() => caches.match(RAIZ + "index.html").then((guardada) => guardada ?? caches.match(RAIZ)))
    );
    return;
  }

  if (!ESTATICAS.test(url.pathname)) return;

  // Los recursos de Vite llevan hash en el nombre: caché primero.
  evento.respondWith(
    caches.match(peticion).then(
      (guardada) =>
        guardada ??
        fetch(peticion).then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone();
            void caches.open(CACHE).then((cache) => cache.put(peticion, copia));
          }
          return respuesta;
        })
    )
  );
});
