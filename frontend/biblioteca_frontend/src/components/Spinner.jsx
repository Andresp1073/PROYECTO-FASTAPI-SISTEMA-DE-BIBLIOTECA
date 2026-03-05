// [MODIFICADO]

/**
 * Props:
 * - texto?: string
 * - size?: "sm" | "md" | "lg" (default: "md")
 */
export default function Spinner({ texto = "Cargando...", size = "md" }) {
  const sizeClass = size === "sm" ? "spinner-border-sm" : "";
  const fs = size === "lg" ? "fs-5" : "fs-6";

  return (
    <div className="d-flex align-items-center justify-content-center py-4">
      <div className="text-center">
        <div className={`spinner-border ${sizeClass}`} role="status" />
        {texto && <div className={`mt-2 text-secondary ${fs}`}>{texto}</div>}
      </div>
    </div>
  );
}