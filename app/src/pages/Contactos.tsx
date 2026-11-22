// Contactos · Clientes y proveedores.
import { memo, useState, useCallback } from "react";
import { useStoreActions, useStoreState } from "../lib/store";
import { Icon } from "../components/Icon";
import {
  EmptyState,
  Field,
  FieldRow,
  FormSection,
  Modal,
  PageHead,
  Badge,
  useConfirm,
} from "../components/ui";
import type { Contact } from "../lib/types";

/** Fila memoizada: escribir en el formulario no re-renderiza la tabla. */
const ContactRow = memo(function ContactRow({
  contact,
  onRemove,
}: {
  contact: Contact;
  onRemove: (id: string) => void;
}) {
  return (
    <tr>
      <td data-label="Nombre" style={{ fontWeight: 600 }}>{contact.name}</td>
      <td data-label="Documento" className="mono">{contact.document}</td>
      <td data-label="Teléfono">{contact.phone}</td>
      <td data-label="Es">
        <Badge tone="accent">
          {contact.isClient && contact.isProvider
            ? "Ambos"
            : contact.isClient
              ? "Cliente"
              : contact.isProvider
                ? "Proveedor"
                : "—"}
        </Badge>
      </td>
      <td data-label="Crédito">{contact.creditDays ? `${contact.creditDays} días` : "—"}</td>
      <td data-label="Acciones">
        <button className="btn btn--danger btn--sm" onClick={() => onRemove(contact.id)}><Icon name="trash" /> 
          Eliminar
        </button>
      </td>
    </tr>
  );
});

export function Contactos() {
  const { state } = useStoreState();
  const { addContact, removeContact } = useStoreActions();
  const confirm = useConfirm();
  const removeContactConfirmado = useCallback(
    async (id: string) => {
      const ok = await confirm({
        title: "¿Eliminar el contacto?",
        message: "Se borraran sus cuentas y movimientos asociados.",
        confirmText: "Eliminar",
        destructive: true,
      });
      if (ok) removeContact(id);
    },
    [confirm, removeContact]
  );
  const [open, setOpen] = useState(false);
  const [errorNombre, setErrorNombre] = useState<string | undefined>();
  const [form, setForm] = useState({
    name: "",
    document: "",
    docType: "" as "" | "V" | "E" | "J" | "RIF",
    phone: "",
    email: "",
    address: "",
    notes: "",
    kind: "cliente" as "cliente" | "proveedor" | "ambos",
    creditDays: "0",
  });

  function save() {
    if (!form.name.trim()) {
      setErrorNombre("Escribe un nombre para guardar el contacto.");
      return;
    }
    addContact({
      name: form.name.trim(),
      document: form.document.trim() || "—",
      docType: form.docType,
      phone: form.phone.trim() || "—",
      email: form.email.trim(),
      address: form.address.trim(),
      notes: form.notes.trim(),
      isClient: form.kind === "cliente" || form.kind === "ambos",
      isProvider: form.kind === "proveedor" || form.kind === "ambos",
      // Días de crédito: entero no negativo (un crédito negativo no tiene sentido).
      creditDays: Math.max(0, Math.floor(Number(form.creditDays) || 0)),
    });
    setOpen(false);
    setForm({
      name: "", document: "", docType: "", phone: "", email: "",
      address: "", notes: "", kind: "cliente", creditDays: "0",
    });
  }

  return (
    <div className="stack gap-16">
      <PageHead
        title="Contactos"
        subtitle="Clientes y proveedores en un solo lugar."
        actions={
          <button className="btn btn--primary" onClick={() => setOpen(true)}><Icon name="plus" /> 
            Nuevo contacto
          </button>
        }
      />

      {state.contacts.length === 0 ? (
        <EmptyState
          icon="users"
            title="Sin contactos"
          hint="Añade clientes y proveedores para llevar sus cuentas."
          action={
            <button className="btn btn--soft btn--sm" onClick={() => setOpen(true)}><Icon name="plus" /> 
              Nuevo contacto
            </button>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Es</th>
                <th data-tour="contactos-credito">Crédito</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {state.contacts.map((c) => (
                <ContactRow key={c.id} contact={c} onRemove={removeContactConfirmado} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal
          title="Nuevo contacto"
          onClose={() => setOpen(false)}
          footer={
            <button className="btn btn--primary btn--block" onClick={save}>
              <Icon name="check" /> Guardar contacto
            </button>
          }
        >
          <FormSection title="Quién es">
            <Field label="Nombre" required error={errorNombre}>
              <input
                className="input"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  setErrorNombre(undefined);
                }}
              />
            </Field>
            <FieldRow>
              <Field label="Tipo de documento">
                <select
                  className="select"
                  value={form.docType}
                  onChange={(e) => setForm({ ...form, docType: e.target.value as typeof form.docType })}
                >
                  <option value="">Sin documento</option>
                  <option value="V">V</option>
                  <option value="E">E</option>
                  <option value="J">J</option>
                  <option value="RIF">RIF</option>
                </select>
              </Field>
              <Field label="Cédula o RIF">
                <input
                  className="input"
                  value={form.document}
                  onChange={(e) => setForm({ ...form, document: e.target.value })}
                />
              </Field>
            </FieldRow>
          </FormSection>

          <FormSection title="Cómo contactarlo">
            <FieldRow>
              <Field label="Teléfono">
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label="Correo">
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
            </FieldRow>
            <Field label="Dirección">
              <input
                className="input"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
          </FormSection>

          <FormSection title="Relación comercial">
            <FieldRow>
              <Field label="Tipo">
                <select
                  className="select"
                  value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value as typeof form.kind })}
                >
                  <option value="cliente">Cliente</option>
                  <option value="proveedor">Proveedor</option>
                  <option value="ambos">Ambos</option>
                </select>
              </Field>
              <Field label="Días de crédito" hint="Plazo para pagar una venta a crédito.">
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={form.creditDays}
                  onChange={(e) => setForm({ ...form, creditDays: e.target.value })}
                />
              </Field>
            </FieldRow>
            <Field label="Notas">
              <textarea
                className="input"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
          </FormSection>
        </Modal>
      )}
    </div>
  );
}
