# Integración Figma · OpenCode

**Fecha:** 2026-10-20 · **Estado:** ✅ conectado y verificado

## Resumen

Figma quedó conectado a OpenCode v1.17.13 mediante un **puente propio** porque
el cliente nativo no puede hablar con el servidor remoto de Figma.

## Por qué fue necesario el puente

Tres obstáculos, encontrados uno por uno:

| # | Obstáculo | Evidencia | Solución en el puente |
|---|---|---|---|
| 1 | Figma rechaza el registro dinámico de clientes no listados | `mcp-remote` → `403 Forbidden` (se registra como "MCP CLI Proxy") | El puente se registra con `client_name: "OpenCode"`, que Figma **sí acepta** (`200 OK`) |
| 2 | Figma exige `redirect_uri` con forma `http://127.0.0.1:PUERTO/callback` | `/mcp/oauth/callback` → `400 invalid_redirect_uri` | El puente usa un callback local propio en el puerto 19876 con ruta `/callback` |
| 3 | Figma exige cliente **confidencial** (`client_secret_post`) | `token_endpoint_auth_method: "none"` → rechazado | El puente guarda `client_id` + `client_secret` y los envía en el intercambio del token |
| 4 | OpenCode v1 solo habla transporte **SSE**; Figma solo acepta **Streamable HTTP** (POST) | `SSE error: Non-200 status code (405)` | El puente traduce **stdio ↔ Streamable HTTP** |

## Archivos

| Ruta | Rol |
|---|---|
| `~/.config/opencode/figma-mcp-bridge.mjs` | El puente (registro, OAuth, refresco, traducción de transporte) |
| `~/.config/opencode/opencode.jsonc` | Configuración del servidor `figma` |
| `~/.figma-mcp/tokens.json` | Tokens OAuth (client_id, client_secret, access, refresh) |
| `~/.agents/skills/figma-*` | 10 skills oficiales de Figma |

### Configuración

```jsonc
"figma": {
  "type": "local",
  "command": ["node", "C:/Users/prodz/.config/opencode/figma-mcp-bridge.mjs"],
  "enabled": true
}
```

## Autenticación

```bash
node ~/.config/opencode/figma-mcp-bridge.mjs --auth
```

Imprime la URL de autorización, la abre en el navegador y guarda el token.
El puente **renueva el access token automáticamente** cuando expira
(usa el `refresh_token`).

## Verificación

```
opencode mcp list
  ✓ figma  connected
      node C:/Users/prodz/.config/opencode/figma-mcp-bridge.mjs
```

- **43 herramientas** expuestas por el MCP de Figma
- Identidad confirmada: `Diego Beleño` · `belenodiego0702@gmail.com`
- Plan: *El equipo de Diego Beleño* · seat **View** · tier `starter` · role `admin`

## Herramientas disponibles (43)

### Lectura de diseño
`get_design_context` · `get_screenshot` · `get_metadata` · `get_variable_defs` ·
`get_motion_context` · `get_figjam` · `get_code_connect_map` ·
`get_context_for_code_connect` · `list_file_components_for_code_connect` ·
`get_libraries` · `search_design_system`

### Escritura en Figma
`use_figma` · `create_new_file` · `send_code_to_figma` · `html_to_figma` ·
`generate_figma_design` · `generate_image` · `generate_diagram` ·
`upload_assets` · `download_assets` · `add_code_connect_map` ·
`get_code_connect_suggestions` · `send_code_connect_mappings`

### Weave (IA en Figma)
`weave_list_tools` · `weave_get_tool_inputs` · `weave_run_tool` ·
`weave_get_tool_run_output` · `weave_cancel_tool_run` · `weave_upload_asset` ·
`weave_find_model` · `weave_run_model` · `weave_get_model_run_output`

### Shaders y plugins generativos
`list_shaders` · `get_shader` · `list_file_shaders` · `create_shader` ·
`update_shader` · `list_generative_plugins` · `get_generative_plugin` ·
`create_generative_plugin` · `update_generative_plugin`

### Otros
`whoami` · `export_video`

## Skills instalados

En `~/.agents/skills/`:

`figma-design-to-code` · `figma-generate-design` · `figma-generate-library` ·
`figma-use` · `figma-code-connect` · `figma-create-new-file` ·
`figma-generate-diagram` · `figma-implement-motion` · `figma-swiftui` ·
`figma-use-figjam`

## Limitación del plan actual

El seat es **View** en tier `starter`, así que:

- `code_layers_enabled: false` → **escribir fuera de tus borradores** requiere un
  seat Full. Durante la beta se permite sin costo.
- `specs_enabled: false` → **Figma Specs** (lectura/escritura de specs del equipo)
  no está habilitado.

La **lectura de diseño** (que es lo que se usa para convertir Figma → código) funciona
sin restricciones.

## Nota importante

Las herramientas MCP se cargan al **iniciar la sesión**. Como `figma` se conectó
después de que abrieras esta sesión, **reinicia OpenCode** (o abre una sesión nueva)
para que las 43 herramientas aparezcan en el catálogo.
