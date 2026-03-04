export default function Alerta({ type = "danger", mensaje }) {
  if (!mensaje) return null;

  return (
    <div className={`alert alert-${type} mb-3`} role="alert">
      {mensaje}
    </div>
  );
}