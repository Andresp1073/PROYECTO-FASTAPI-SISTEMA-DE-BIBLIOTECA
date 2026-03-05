// [MODIFICADO]
import { useEffect, useState } from "react";

/**
 * Props:
 * - mensaje: string | null
 * - type: "danger" | "success" | "warning" | "info" (default: "danger")
 * - dismissible: boolean (default: true)
 */
export default function Alerta({ mensaje, type = "danger", dismissible = true }) {
  const [visible, setVisible] = useState(Boolean(mensaje));

  useEffect(() => {
    setVisible(Boolean(mensaje));
  }, [mensaje]);

  if (!mensaje || !visible) return null;

  return (
    <div
      className={`alert alert-${type} ${dismissible ? "alert-dismissible" : ""}`}
      role="alert"
    >
      <div>{mensaje}</div>

      {dismissible && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={() => setVisible(false)}
        />
      )}
    </div>
  );
}