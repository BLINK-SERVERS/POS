// Copiar al portapapeles con confirmación breve.
//
// `navigator.clipboard` requiere contexto seguro (https o localhost) y
// permiso del navegador; si falla se usa el método clásico de selección.
// El aviso «Copiado» se muestra junto al botón que copió (se identifica
// con una clave), no en un toast global.
import { useCallback, useEffect, useRef, useState } from "react";

async function escribir(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    /* sin permiso o sin contexto seguro: se intenta el respaldo */
  }
  try {
    const area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export function useCopiar() {
  const [copiado, setCopiado] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => window.clearTimeout(timer.current);
  }, []);

  /** Copia `texto` y marca como copiada la `clave` durante 1,6 s. */
  const copiar = useCallback(async (texto: string, clave = texto): Promise<boolean> => {
    const ok = await escribir(texto);
    if (!ok) return false;
    setCopiado(clave);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopiado(null), 1600);
    return true;
  }, []);

  return { copiar, copiado };
}
