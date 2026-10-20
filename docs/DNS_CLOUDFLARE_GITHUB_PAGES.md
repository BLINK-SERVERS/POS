# DNS de blink.com.ve — Cloudflare + GitHub Pages

**Estado: COMPLETADO Y VERIFICADO** (2026-10-20)

## Resumen

| Elemento | Estado | Valor |
|---|---|---|
| Dominio | Registrado | `blink.com.ve` en NIC.VE |
| Nameservers | Activos | `ajay.ns.cloudflare.com`, `molly.ns.cloudflare.com` |
| Zona en Cloudflare | Activa | ID `2234ba7bcd3fe793c8d5f6e04198a19a` |
| Cuenta | Belenodiego0702@gmail.com | ID `ac362a3179159cc339090b25ed9b6183` |
| Plan | Free Website | — |

## Registros DNS (creados vía API de Cloudflare)

| Tipo | Nombre | Contenido | Proxy | TTL |
|---|---|---|---|---|
| CNAME | `blink.com.ve` (raíz) | `blink-servers.github.io` | Proxied (naranja) | Auto |
| CNAME | `www.blink.com.ve` | `blink-servers.github.io` | Proxied (naranja) | Auto |

Ambos resuelven a las IPs de proxy de Cloudflare (`172.67.184.170`, `104.21.43.194`).

## Regla de redirección (Single Redirect)

Ruleset: `62d0778365be4e699f9833ca23ce29c7` — "BLINK - Redireccion apex a www"
Fase: `http_request_dynamic_redirect` · Zona: `2234ba7bcd3fe793c8d5f6e04198a19a`

```json
{
  "action": "redirect",
  "action_parameters": {
    "from_value": {
      "status_code": 301,
      "preserve_query_string": true,
      "target_url": {
        "expression": "concat(\"https://www.blink.com.ve\", http.request.uri.path)"
      }
    }
  },
  "expression": "(http.host eq \"blink.com.ve\")"
}
```

> **Nota técnica:** el destino debe ir en `target_url.expression` (dinámico) y **no** en
> `target_url.value` (estático). Con `value`, Cloudflare emite el texto literal
> `concat(...)` en el header `Location` en lugar de evaluarlo.

### Comportamiento verificado

| Origen | Resultado |
|---|---|
| `https://blink.com.ve` | 301 → `https://www.blink.com.ve/` |
| `https://blink.com.ve/catalogo` | 301 → `https://www.blink.com.ve/catalogo` |
| `https://blink.com.ve/ventas/historial?f=1` | 301 → `https://www.blink.com.ve/ventas/historial?f=1` |
| `http://blink.com.ve` | 301 → `https://www.blink.com.ve/` (HTTP → HTTPS) |
| `https://www.blink.com.ve` | 200 OK (sin redirección) |

## GitHub Pages

- Repositorio: `BLINK-SERVERS/POS` (rama `main` → deployment en rama `gh-pages`)
- Dominio personalizado: `www.blink.com.ve` (declarado en `app/public/CNAME`)
- `base: "/"` en `app/vite.config.ts` — assets y rutas served desde la raíz del dominio
- `app/package.json` → `build:pages` **sin** `--base=/POS/` (sobrescribía la config)
- `404.html` generado como fallback SPA (recarga de rutas profundas funciona)
- GitHub redirige automáticamente `blink-servers.github.io/POS/` → `www.blink.com.ve`

## Automatización con MCP de Cloudflare

El servidor MCP oficial permite gestionar DNS y reglas sin tocar el dashboard.

Configuración global en `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "mcp": {
    "cloudflare": {
      "type": "remote",
      "url": "https://mcp.cloudflare.com/mcp",
      "enabled": true
    },
    "cloudflare-docs": {
      "type": "remote",
      "url": "https://docs.mcp.cloudflare.com/mcp",
      "enabled": true
    }
  }
}
```

Autenticación (OAuth, una sola vez):

```bash
opencode mcp auth cloudflare
```

### Herramientas disponibles

| Tool | Uso |
|---|---|
| `execute` | Ejecuta JS con `cloudflare.request()` contra la API de Cloudflare |
| `search` | Busca endpoints en el spec OpenAPI de Cloudflare |
| `docs` | Busca en la documentación de Cloudflare |
| `whoami` | Identidad de la conexión |

Ejemplo de creación de un registro DNS:

```js
async () => {
  const z = "2234ba7bcd3fe793c8d5f6e04198a19a";
  return cloudflare.request({
    method: "POST",
    path: `/zones/${z}/dns_records`,
    body: {
      type: "CNAME",
      name: "blink.com.ve",
      content: "blink-servers.github.io",
      proxied: true,
      ttl: 1,
    },
  });
}
```

> La respuesta de `cloudflare.request()` expone `result`, `errors` y `status`
> directamente en el objeto (no anidada bajo `body`).
