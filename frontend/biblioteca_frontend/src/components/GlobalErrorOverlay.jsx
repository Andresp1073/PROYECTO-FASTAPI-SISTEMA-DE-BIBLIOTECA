import { useEffect, useState } from "react";

export default function GlobalErrorOverlay() {
  const [error, setError] = useState("");

  useEffect(() => {
    const onError = (event) => {
      const msg = event?.error?.stack || event?.message || String(event);
      setError(msg);
    };

    const onRejection = (event) => {
      const reason = event?.reason;
      const msg =
        reason?.stack ||
        reason?.message ||
        (typeof reason === "string" ? reason : JSON.stringify(reason));
      setError(msg);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  if (!error) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.92)",
        color: "white",
        zIndex: 99999,
        padding: "16px",
        overflow: "auto",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 8 }}>❌ Error JavaScript (capturado)</h2>
        <p style={{ opacity: 0.85, marginTop: 0 }}>
          Copia y pégame este error para corregirlo exacto.
        </p>

        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            background: "rgba(255,255,255,0.08)",
            padding: 12,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {error}
        </pre>

        <button
          className="btn btn-light mt-3"
          onClick={() => setError("")}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}