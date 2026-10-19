// Comprobante de venta (ticket térmico 58mm / 80mm / carta)
import { round2, formatBsDirect, formatRate, formatUsd } from "../lib/money";
import { saleTotal } from "../lib/metrics";
import { Icon } from "./Icon";
import type { Business, Sale } from "../lib/types";

export interface ReceiptProps {
  sale: Sale;
  business: Business;
  rate?: number;
  onClose?: () => void;
  showPrintButton?: boolean;
}

export function Receipt({
  sale,
  business,
  rate = 0,
  onClose,
  showPrintButton = true,
}: ReceiptProps) {
  const fields = business.receiptFields ?? {
    legalName: true,
    rif: true,
    address: true,
    phone: true,
    customer: true,
    sku: true,
    totalBs: true,
    rate: true,
    notes: true,
  };

  const format = business.printFormat ?? "80mm";
  // Tasa real del ticket: la de la venta o la vigente del comercio. Si no hay
  // ninguna (comercio nuevo sin tasa), no se inventa un "Bs 1:1" engañoso.
  const hasRate = (sale.rate ?? 0) > 0 || (rate ?? 0) > 0;
  const effectiveRate = sale.rate || rate || 0;
  const total = round2(saleTotal(sale));
  const totalBs = round2(total * effectiveRate);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-view">
      {showPrintButton && (
        <div className="receipt-actions no-print">
          <button className="btn btn--primary" type="button" onClick={handlePrint}>
            <Icon name="printer" />
            Imprimir ticket
          </button>
          {onClose && (
            <button className="btn btn--ghost" type="button" onClick={onClose}>
              Cerrar
            </button>
          )}
        </div>
      )}

      <div
        id="printable-receipt"
        className={`receipt receipt--${format}`}
        aria-label="Ticket de venta"
      >
        <div className="receipt__header">
          <h2 className="receipt__title">
            {business.receiptTitle?.trim() || business.name || "BLINK POS"}
          </h2>
          {sale.status === "cotizacion" && (
            <p className="receipt__sub" style={{ fontWeight: 700, letterSpacing: "0.08em" }}>
              COTIZACIÓN
            </p>
          )}
          {fields.legalName && business.legalName && (
            <p className="receipt__sub">{business.legalName}</p>
          )}
          {fields.rif && business.rif && (
            <p className="receipt__sub">RIF: {business.rif}</p>
          )}
          {fields.address && business.address && (
            <p className="receipt__sub">{business.address}</p>
          )}
          {fields.phone && business.phone && (
            <p className="receipt__sub">Tel: {business.phone}</p>
          )}
        </div>

        <div className="receipt__divider" />

        <div className="receipt__meta">
          <div className="receipt__row">
            <span>Comprobante:</span>
            <strong className="mono">{sale.code}</strong>
          </div>
          <div className="receipt__row">
            <span>Fecha:</span>
            <span>{new Date(sale.at).toLocaleString("es-VE")}</span>
          </div>
          {sale.userId && (
            <div className="receipt__row">
              <span>Cajero:</span>
              <span>{sale.userId}</span>
            </div>
          )}
          {fields.customer && sale.customerName && (
            <div className="receipt__row">
              <span>Cliente:</span>
              <span>{sale.customerName}</span>
            </div>
          )}
          {sale.status === "anulada" && (
            <div className="receipt__row receipt__row--alert">
              <span>ESTADO:</span>
              <strong>*** ANULADA ***</strong>
            </div>
          )}
          {sale.status === "cotizacion" && (
            <div className="receipt__row receipt__row--alert">
              <span>DOCUMENTO:</span>
              <strong>SIN VALOR FISCAL</strong>
            </div>
          )}
        </div>

        <div className="receipt__divider" />

        <div className="receipt__items">
          <div className="receipt__items-head receipt__row">
            <span style={{ flex: 1 }}>Cant · Descripción</span>
            <span style={{ textAlign: "right" }}>Total</span>
          </div>
          {sale.lines.map((l, i) => {
            const lineTotal = round2(l.price * l.qty);
            return (
              <div key={i} className="receipt__item">
                <div className="receipt__row">
                  <span className="receipt__item-name" style={{ flex: 1 }}>
                    {l.qty} x {l.name}
                    {l.presentation && l.qty === 1 ? <> {l.presentation}</> : null}
                  </span>
                  <span className="receipt__item-price mono" style={{ textAlign: "right" }}>
                    {formatUsd(lineTotal)}
                  </span>
                </div>
                <div className="receipt__item-unit dim">
                  @ {formatUsd(l.price)} c/u
                  {fields.sku && l.productId && (
                    <span style={{ marginLeft: 6 }}>({l.productId.slice(0, 8)})</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="receipt__divider" />

        <div className="receipt__totals">
          <div className="receipt__row">
            <span>Subtotal:</span>
            <span className="mono">{formatUsd(round2(sale.lines.reduce((a, l) => a + l.price * l.qty, 0)))}</span>
          </div>
          {sale.discount > 0 && (
            <div className="receipt__row">
              <span>Descuento{sale.discountCode ? ` (${sale.discountCode})` : ""}:</span>
              <span className="mono">− {formatUsd(sale.discount)}</span>
            </div>
          )}
          {sale.surcharge > 0 && (
            <div className="receipt__row">
              <span>Recargos:</span>
              <span className="mono">+ {formatUsd(sale.surcharge)}</span>
            </div>
          )}
          {sale.tax > 0 && (
            <div className="receipt__row">
              <span>IVA:</span>
              <span className="mono">+ {formatUsd(sale.tax)}</span>
            </div>
          )}
          {sale.igtf > 0 && (
            <div className="receipt__row">
              <span>IGTF (3%):</span>
              <span className="mono">+ {formatUsd(sale.igtf)}</span>
            </div>
          )}
          <div className="receipt__row receipt__row--total">
            <strong>TOTAL USD:</strong>
            <strong className="mono">{formatUsd(total)}</strong>
          </div>
          {fields.totalBs && hasRate && (
            <div className="receipt__row receipt__row--bs">
              <span>TOTAL BS:</span>
              <strong className="mono">{formatBsDirect(totalBs)}</strong>
            </div>
          )}
          {fields.rate && effectiveRate > 0 && (
            <div className="receipt__row receipt__row--rate dim">
              <span>Tasa BCV:</span>
              <span>{formatRate(effectiveRate)}</span>
            </div>
          )}
        </div>

        {sale.payments && sale.payments.length > 0 && (
          <>
            <div className="receipt__divider" />
            <div className="receipt__payments">
              <div className="receipt__sub-heading">Formas de pago:</div>
              {sale.payments.map((p, idx) => (
                <div key={idx} className="receipt__row">
                  <span>
                    {p.method}
                    {p.reference ? ` (ref ${p.reference})` : ""}
                  </span>
                  <span className="mono">
                    {p.currency === "VES" && p.amountInput
                      ? formatBsDirect(p.amountInput)
                      : formatUsd(p.amountUsd)}
                  </span>
                </div>
              ))}
              {sale.amountReceived != null && sale.amountReceived > total && (
                <div className="receipt__row dim">
                  <span>Monto recibido:</span>
                  <span className="mono">{formatUsd(sale.amountReceived)}</span>
                </div>
              )}
              {sale.changeUsd != null && sale.changeUsd > 0 && (
                <div className="receipt__row receipt__row--change">
                  <strong>VUELTO:</strong>
                  <strong className="mono">
                    {formatUsd(sale.changeUsd)}
                    {sale.changeBs != null && sale.changeBs > 0 && (
                      <span className="receipt__change-bs"> · {formatBsDirect(sale.changeBs)}</span>
                    )}
                  </strong>
                </div>
              )}
            </div>
          </>
        )}

        {fields.notes && sale.notes && (
          <>
            <div className="receipt__divider" />
            <div className="receipt__notes">
              <strong>Nota:</strong> {sale.notes}
            </div>
          </>
        )}

        <div className="receipt__divider" />

        <div className="receipt__footer">
          <p>{business.receiptFooter?.trim() || "¡Gracias por su compra!"}</p>
          <p className="dim" style={{ fontSize: "0.7rem", marginTop: 4 }}>
            Sistema BLINK POS · blink.com.ve
          </p>
        </div>
      </div>
    </div>
  );
}
