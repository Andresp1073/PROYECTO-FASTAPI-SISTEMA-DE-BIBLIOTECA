// src/admin/AdminDashboard.jsx
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between gap-2 mb-3 flex-wrap">
        <h3 className="m-0">
          <i className="bi bi-shield-lock me-2" />
          Panel Admin
        </h3>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="p-4 border rounded-3 bg-body-tertiary h-100">
            <div className="h5 mb-2">
              <i className="bi bi-tags me-2" />
              Categorías
            </div>
            <div className="text-secondary mb-3">
              Crear, editar y eliminar categorías.
            </div>
            <Link className="btn btn-light" to="/admin/categorias">
              Administrar
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="p-4 border rounded-3 bg-body-tertiary h-100">
            <div className="h5 mb-2">
              <i className="bi bi-book me-2" />
              Libros
            </div>
            <div className="text-secondary mb-3">
              CRUD completo de libros.
            </div>
            <Link className="btn btn-light" to="/admin/libros">
              Administrar
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="p-4 border rounded-3 bg-body-tertiary h-100">
            <div className="h5 mb-2">
              <i className="bi bi-clipboard-check me-2" />
              Préstamos
            </div>
            <div className="text-secondary mb-3">
              Listado general y devolución.
            </div>
            <Link className="btn btn-light" to="/admin/prestamos">
              Administrar
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="p-4 border rounded-3 bg-body-tertiary h-100">
            <div className="h5 mb-2">
              <i className="bi bi-upload me-2" />
              Carga masiva
            </div>
            <div className="text-secondary mb-3">
              Subir CSV para crear libros en lote.
            </div>
            <Link className="btn btn-light" to="/admin/carga-masiva">
              Ir
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="p-4 border rounded-3 bg-body-tertiary h-100">
            <div className="h5 mb-2">
              <i className="bi bi-people me-2" />
              Usuarios
            </div>
            <div className="text-secondary mb-3">
              (Pendiente endpoints exactos del PDF)
            </div>
            <Link className="btn btn-outline-light" to="/admin/usuarios">
              Ver
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}