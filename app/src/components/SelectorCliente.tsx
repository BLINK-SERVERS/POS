// Selector de cliente para la venta a crédito.
//
// Módulo presentado por el plan de cierre del MVP (§4.1): al marcar «Crédito»
// se abre esta ventana para buscar a un deudor registrado o darlo de alta en
// el mismo momento, sin salir de la venta y sin perder lo que hay en la cuenta.
// Es presentacional (no toca el almacén) y se cierra con su propia tecla Esc en
// fase de captura: así puede vivir encima del modal de cobro sin que el
// teclado global de Vender se crea que todavía tiene que limpiar la búsqueda.
import { useEffect, useMemo, useRef, useState } from "react";
import { Field, Modal, EmptyState } from "./ui";
import { Icon } from "./Icon";
import { formatUsd, round2 } from "../lib/money";
import type { Contact } from "../lib/types";

export interface ClienteNuevo {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
}

const vacio: ClienteNuevo = { nombre: "", apellido: "", cedula: "", telefono: "" };

/** Cómo se llama a un contacto en la lista: sin ruido si no tiene cédula. */
const etiqueta = (c: Contact) => (c.document ? `${c.name} · ${c.docType || "V"} ${c.document}` : c.name);

export function SelectorCliente({
  contacts,
  saldos,
  value,
  onPick,
  onClose,
  onCreate,
}: {
  contacts: Contact[];
  /** contact id → saldo por cobrar en USD. Opcional: sin datos, no se muestra. */
  saldos?: Record<string, number>;
  value: string;
  onPick: (id: string) => void;
  onClose: () => void;
  /** Registra y devuelve el id del cliente nuevo. */
  onCreate: (datos: ClienteNuevo) => string;
}) {
  const [consulta, setConsulta] = useState("");
  const [sel, setSel] = useState(0);
  const [nuevo, setNuevo] = useState<ClienteNuevo | null>(null);
  const [error, setError] = useState("");
  const buscador = useRef<HTMLInputElement>(null);

  const lista = useMemo(() => {
    const q = consulta.trim().toLowerCase();
    const clientes = contacts.filter((c) => c.isClient);
    if (!q) return clientes.slice(0, 50);
    return clientes
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.document.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [contacts, consulta]);

  useEffect(() => setSel(0), [consulta]);

  useEffect(() => {
    buscador.current?.focus();
  }, [nuevo]);

  // Esc: primero atrás (si se está registrando), después afuera. Se captura en
  // la fase de captura de `window` para que el teclado global de la pantalla de
  // venta no reciba la pulsación y cierre también la ventana de cobro.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      e.preventDefault();
      if (nuevo) setNuevo(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [nuevo, onClose]);

  const confirmar = (id: string) => {
    onPick(id);
    onClose();
  };

  const guardar = () => {
    const n = (nuevo?.nombre ?? "").trim();
    const a = (nuevo?.apellido ?? "").trim();
    if (!n || !a) {
      setError("Nombre y apellido son obligatorios.");
      return;
    }
    const id = onCreate({
      nombre: n,
      apellido: a,
      cedula: (nuevo?.cedula ?? "").trim(),
      telefono: (nuevo?.telefono ?? "").trim(),
    });
    setNuevo(null);
    setError("");
    if (id) confirmar(id);
  };

  if (nuevo) {
    return (
      <Modal title="Cliente nuevo" onClose={onClose}>
        <div
          className="row gap-8"
          style={{ flexDirection: "column" }}
          onKeyDown={(e) => {
            // Enter en cualquier campo guarda: es una ficha de cuatro campos,
            // no un formulario largo que navegar.
            if (e.key === "Enter") {
              e.preventDefault();
              guardar();
            }
          }}
        >
          <Field label="Nombre" required>
            <input
              ref={buscador}
              className="input"
              value={nuevo.nombre}
              onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            />
          </Field>
          <Field label="Apellido" required>
            <input
              className="input"
              value={nuevo.apellido}
              onChange={(e) => setNuevo({ ...nuevo, apellido: e.target.value })}
            />
          </Field>
          <Field label="Cédula de identidad" hint="Opcional.">
            <input
              className="input"
              inputMode="numeric"
              value={nuevo.cedula}
              onChange={(e) => setNuevo({ ...nuevo, cedula: e.target.value })}
            />
          </Field>
          <Field label="Teléfono" hint="Opcional.">
            <input
              className="input"
              inputMode="tel"
              value={nuevo.telefono}
              onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })}
            />
          </Field>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="row gap-8" style={{ marginTop: "0.75rem" }}>
          <button type="button" className="btn btn--soft" onClick={() => setNuevo(null)}>
            <Icon name="chevronLeft" />
            Volver
          </button>
          <button type="button" className="btn btn--primary" style={{ flex: 1 }} onClick={guardar}>
            <Icon name="check" />
            Guardar y cobrar
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Cliente con crédito" onClose={onClose}>
      <input
        ref={buscador}
        className="input"
        role="combobox"
        aria-expanded="true"
        aria-label="Buscar cliente"
        placeholder="Buscar por nombre, cédula o teléfono"
        value={consulta}
        onChange={(e) => setConsulta(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSel((s) => (lista.length ? (s + 1) % lista.length : 0));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSel((s) => (lista.length ? (s - 1 + lista.length) % lista.length : 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            const c = lista[sel];
            if (c) confirmar(c.id);
          }
        }}
      />
      {lista.length === 0 ? (
        <div style={{ paddingTop: "0.75rem" }}>
          <EmptyState
            icon="search"
            title="Ningún cliente coincide"
            hint="Regístralo aquí mismo: con el nombre y el apellido alcanza."
          />
        </div>
      ) : (
        <ul className="search-results" role="listbox" aria-label="Clientes" style={{ marginTop: "0.5rem" }}>
          {lista.map((c, i) => {
            const saldo = saldos ? round2(saldos[c.id] ?? 0) : null;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className={`search-results__item${i === sel ? " search-results__item--sel" : ""}`}
                  role="option"
                  aria-selected={i === sel}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => confirmar(c.id)}
                >
                  <span className="search-results__cell">
                    <span className="search-results__name">{etiqueta(c)}</span>
                    {c.phone ? <span className="search-results__extra">{c.phone}</span> : null}
                  </span>
                  {saldo !== null && saldo > 0 && (
                    <span className="search-results__price tabular">debe {formatUsd(saldo)}</span>
                  )}
                  {c.id === value && <Icon name="check" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <button
        type="button"
        className="btn btn--primary btn--block"
        style={{ marginTop: "0.75rem" }}
        onClick={() => setNuevo(vacio)}
      >
        <Icon name="plus" />
        Registrar cliente nuevo
      </button>
    </Modal>
  );
}
