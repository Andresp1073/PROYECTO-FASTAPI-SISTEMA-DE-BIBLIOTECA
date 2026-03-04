// [MODIFICADO]
import { Link } from "react-router-dom";

function CardLink({ to, icon, title, desc, variant = "outline-light" }) {
  return (
    <Link
      to={to}
      className={`text-decoration-none`}
      style={{ display: "block" }}
    >
      <div className={`p-4 border rounded-3 bg-body-tertiary h-100`}>
        <div className="d-flex align-items-start gap-3">
          <div className={`btn btn-sm btn-${variant} disabled`}>
            <i className={`bi ${icon}`}></i>
          </div>
          <div>
            <div className="fw-semibold">{title}</div>
            <div className="text-secondary small">{desc}</div>
          </div>
        </div>
        <div className="mt-3 text-secondary small">
          Ir a <span className="text-body">{to}</span>{" "}
          <i className="bi bi-arrow-right ms-1"></i>
        </div>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between gap-2 mb-3 flex-wrap">
        <h1 className="h4 mb-0">
          <i className="bi bi-shield-lock me-2"></i>
          Panel Admin
        </h1>

        <Link to="/" className="btn btn-sm btn-light">
          <i className="bi bi-house me-1"></i>
          Home
        </Link>
      </div>

      <div className="p-4 border rounded-3 bg-body-tertiary mb-4">
        <div className="fw-semibold">Acciones administrativas</div>
        <div className="text-secondary small">
          Desde aquí gestionarás categorías, libros, usuarios, préstamos y carga
          masiva.
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-4">
          <CardLink
            to="/admin/categorias"
            icon="bi-tags"
            title="Categorías"
            desc="CRUD de categorías (admin)."
          />
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <CardLink
            to="/admin/libros"
            icon="bi-book-half"
            title="Libros"
            desc="CRUD de libros (admin)."
          />
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <CardLink
            to="/admin/usuarios"
            icon="bi-people"
            title="Usuarios"
            desc="Gestión de usuarios y roles."
          />
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <CardLink
            to="/admin/prestamos"
            icon="bi-journal-check"
            title="Préstamos"
            desc="Gestión y devoluciones."
          />
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <CardLink
            to="/admin/carga-masiva"
            icon="bi-upload"
            title="Carga masiva"
            desc="Importar libros desde CSV."
          />
        </div>
      </div>
    </div>
  );
}