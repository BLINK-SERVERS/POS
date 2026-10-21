# 10 · API observada (`api.wink-pos.com`)

> ⚠️ **Documento de referencia de WINK POS — no describe BLINK.**
>
> Este archivo forma parte del **reconocimiento pasivo de `app.wink-pos.com`**
> (proyecto previo del que BLINK nació como alternativa). Describe la
> arquitectura, el diseño y el comportamiento de **WINK**, no los de BLINK.
>
> Se conserva como **material de estudio**: fue la fuente del comparativo
> funcional y de buena parte de las decisiones de BLINK. Para el estado real
> de BLINK, ver el [índice](../INDEX.md).
>
> **No tomar como referencia de la implementación actual.**

Endpoints registrados durante la navegación autenticada (394 llamadas en total,
muchas repetidas). Las peticiones **GET** de lectura se registraron explícitamente;
las mutaciones (POST/PUT/PATCH/DELETE) se infieren por el recurso y por las acciones de UI.

- **Base:** `https://api.wink-pos.com`
- **CORS:** las peticiones llevan `Origin: https://app.wink-pos.com` y hay preflight **OPTIONS**
  en cada recurso.
- **Auth:** cookie/sesión contra `api.wink-pos.com` + `POST /auth/refresh` (renovación de token).

## Autenticación y sesión
| Método | Ruta | Notas |
|---|---|---|
| POST | `/auth/refresh` | Renueva la sesión (llamado al arrancar) |
| GET | `/auth/me` | Usuario/perfil actual |
| GET | `/auth/google/enabled` | ¿Login con Google habilitado? → `{"enabled":true}` |
| GET | `/auth/turnstile` | Config de captcha → `{"siteKey":null}` |

## Comercio y configuración
| Método | Ruta | Recurso |
|---|---|---|
| GET | `/business` | Datos del comercio (nombre, RIF, dirección…) |
| GET | `/onboarding` | Pasos de puesta en marcha (6 de 7) |
| GET | `/locations` | Ubicaciones/sucursales |
| GET | `/channels` | Canales de venta |
| GET | `/taxes` | Impuestos |
| GET | `/units` | Unidades de medida |
| GET | `/roles` | Roles |
| GET | `/users` | Usuarios |
| GET | `/users/options` | Opciones para selectores de usuario |
| GET | `/invitations` | Invitaciones de equipo |

## Catálogo
| Método | Ruta | Recurso |
|---|---|---|
| GET | `/products` | Productos (nombre, SKU, costo, margen, categoría, tipo, precio, estado) |
| GET | `/categories` | Categorías |
| GET | `/catalog/costs` | Costos de catálogo |
| GET | `/discounts` | Descuentos |
| GET | `/surcharges` | Recargos |

## Ventas (POS)
| Método | Ruta | Recurso |
|---|---|---|
| GET | `/sales` | Ventas |
| GET | `/sales/summary` | KPIs de ventas (vendido, nº, ticket promedio, crédito) |
| GET | `/sales/open-tabs` | **Cuentas abiertas** (tabs del POS) |
| GET | `/cash-sessions/current` | Sesión de caja actual ("Abrir caja") |

## Inventario
| Método | Ruta | Recurso |
|---|---|---|
| GET | `/stock-balances` | Existencias por producto/ubicación |
| GET | `/stock-alerts` | Alertas (stock bajo) |
| GET | `/stock-alerts/expiring-variants` | Variantes por vencer |
| GET | `/imports` | Importaciones (Excel/CSV) |

## Contactos
| Método | Ruta | Recurso |
|---|---|---|
| GET | `/contacts` | Clientes y proveedores (documento, teléfono, tipo, crédito) |

## Finanzas
| Método | Ruta | Recurso |
|---|---|---|
| GET | `/accounts` | Cuentas (efectivo, banco, pago móvil) |
| GET | `/accounts/exposure` | Exposición cambiaria (Bs vs USD) |
| GET | `/expenses` | Gastos |
| GET | `/recurring-expenses` | Gastos recurrentes |
| GET | `/pendings` | Pendientes (por cobrar / por pagar) |
| GET | `/exchange-rates/current` | Tasa actual (BCV, p. ej. `877,9023 Bs/USD`) |

## Informes
| Método | Ruta | Recurso |
|---|---|---|
| GET | `/reports/summary` | Resumen general |
| GET | `/reports/results` | Resultados del período |
| GET | `/reports/results/monthly` | Resultados mensuales (últimos 12 meses) |
| GET | `/reports/sales` | Informe de ventas |

---

## Patrones arquitectónicos inferidos

- **REST por recurso en plural** (`/products`, `/sales`, `/contacts`, `/accounts`…).
- Convención de **sub-recurso de agregados**: `/sales/summary`, `/reports/results/monthly`,
  `/stock-alerts/expiring-variants`, `/accounts/exposure`.
- **Sesión de caja** explícita (`/cash-sessions/current`) → el POS exige abrir caja antes de vender.
- **Cuentas abiertas / tabs** (`/sales/open-tabs`) → soporta múltiples ventas simultáneas (típico POS).
- **Multi-moneda nativo**: USD (principal) + VES, con `exchange-rates/current` y exposición cambiaria.
- **Importaciones** (`/imports`) → carga masiva de catálogo, contactos y existencias.
- El front es **Angular** y consume estas rutas vía `fetch` con cookies; **sin tokens en localStorage**
  (la sesión va en cookies de `api.wink-pos.com` / `.wink-pos.com`).

> Mutaciones (crear/editar/borrar) no se ejecutaron (no queremos modificar datos). Se deducen
> de las acciones de UI: `Nuevo producto`, `Nueva cuenta`, `Nuevo contacto`, `Nueva cuenta` (finanzas),
> `Registrar una compra`, `Guardar` (ajustes), `Eliminar`, `Transferir/Ingresar/Retirar`, etc.
