// src/admin/AdminDashboard.jsx
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="container py-4">
      <h3 className="mb-3">
        <i className="bi bi-speedometer2 me-2" />
        Panel Admin
      </h3>

      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-4">
          <Link to="/admin/libros" className="text-decoration-none">
            <div className="p-4 border rounded-3 bg-body-tertiary h-100">
              <div className="h5 mb-1">
                <i className="bi bi-book me-2" />
                Libros
              </div>
              <div className="text-secondary small">CRUD + portada</div>
            </div>
          </Link>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <Link to="/admin/categorias" className="text-decoration-none">
            <div className="p-4 border rounded-3 bg-body-tertiary h-100">
              <div className="h5 mb-1">
                <i className="bi bi-tags me-2" />
                Categorías
              </div>
              <div className="text-secondary small">CRUD categorías</div>
            </div>
          </Link>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <Link to="/admin/prestamos" className="text-decoration-none">
            <div className="p-4 border rounded-3 bg-body-tertiary h-100">
              <div className="h5 mb-1">
                <i className="bi bi-clipboard-check me-2" />
                Préstamos
              </div>
              <div className="text-secondary small">Listar/filtrar/devolver</div>
            </div>
          </Link>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <Link to="/admin/usuarios" className="text-decoration-none">
            <div className="p-4 border rounded-3 bg-body-tertiary h-100">
              <div className="h5 mb-1">
                <i className="bi bi-people me-2" />
                Usuarios
              </div>
              <div className="text-secondary small">Listar/editar/reset</div>
            </div>
          </Link>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <Link to="/admin/carga-masiva" className="text-decoration-none">
            <div className="p-4 border rounded-3 bg-body-tertiary h-100">
              <div className="h5 mb-1">
                <i className="bi bi-upload me-2" />
                Carga Masiva
              </div>
              <div className="text-secondary small">Importación CSV</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}