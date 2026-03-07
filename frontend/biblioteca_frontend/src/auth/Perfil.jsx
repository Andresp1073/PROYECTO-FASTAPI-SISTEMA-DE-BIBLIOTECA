// src/auth/Perfil.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { updateUser, resetUserPassword } from "../api/users.js";
import { uploadCover } from "../api/uploads.js";
import { useTheme } from "../context/ThemeContext.jsx";
import Alerta from "../components/Alerta.jsx";

function parseFastApiError(err) {
  const data = err?.response?.data;

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((e) => {
        const loc = Array.isArray(e.loc) ? e.loc.join(".") : "body";
        return `${loc}: ${e.msg}`;
      })
      .join(" | ");
  }

  return (
    data?.detail ||
    data?.message ||
    `Error ${err?.response?.status || ""}`.trim() ||
    "Ocurrió un error."
  );
}

function resolveAvatarUrl(user) {
  if (!user) return "";

  return (
    user.foto_url ||
    user.foto ||
    user.avatar_url ||
    user.profile_url ||
    user.image ||
    ""
  );
}

export default function Perfil() {
  const { user, loadMe } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passError, setPassError] = useState("");
  const [passOk, setPassOk] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setNombre(user.nombre ?? user.name ?? "");
    setEmail(user.email ?? "");
    setDocumento(user.documento ?? "");
    setFotoPreview(resolveAvatarUrl(user));
    setFotoFile(null);

    setNewPassword("");
    setNewPasswordConfirm("");
    setPassError("");
    setPassOk("");
  }, [user]);

  useEffect(() => {
    return () => {
      if (fotoPreview && fotoFile) {
        URL.revokeObjectURL(fotoPreview);
      }
    };
  }, [fotoPreview, fotoFile]);

  const onFotoChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setFotoFile(file);

    if (!file) {
      setFotoPreview(resolveAvatarUrl(user));
      return;
    }

    setFotoPreview(URL.createObjectURL(file));
  };

  const guardarPerfil = async () => {
    setError("");
    setOk("");

    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!email.trim()) {
      setError("El email es obligatorio.");
      return;
    }

    setCargando(true);

    try {
      const payload = {
        nombre: String(nombre).trim(),
        email: String(email).trim(),
        documento: String(documento).trim() || null,
      };

      if (fotoFile) {
        const uploadRes = await uploadCover(fotoFile);
        // El backend puede devolver { url } o {file_url} o {path} o {cover_url} o {ruta}
        const url =
          uploadRes?.url ||
          uploadRes?.file_url ||
          uploadRes?.path ||
          uploadRes?.cover_url ||
          uploadRes?.ruta ||
          uploadRes?.data?.url;
        if (url) {
          payload.foto_url = url;
        }
      }

      await updateUser(user.id, payload);
      await loadMe();

      setOk("Perfil actualizado ✅");
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setCargando(false);
    }
  };

  const cambiarPassword = async () => {
    setPassError("");
    setPassOk("");

    if (!newPassword.trim()) {
      setPassError("La nueva contraseña es obligatoria.");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setPassError("Las contraseñas no coinciden.");
      return;
    }

    setPassLoading(true);

    try {
      await resetUserPassword(user.id, {
        new_password: newPassword.trim(),
        password: newPassword.trim(),
      });

      setPassOk("Contraseña actualizada ✅");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (err) {
      setPassError(parseFastApiError(err));
    } finally {
      setPassLoading(false);
    }
  };

  const goHome = () => navigate("/");

  const avatarSrc = useMemo(() => {
    if (!fotoPreview) return null;
    if (String(fotoPreview).startsWith("http")) return fotoPreview;
    return fotoPreview;
  }, [fotoPreview]);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <button
            className={`btn ${theme === "dark" ? "btn-outline-light" : "btn-outline-dark"} btn-sm`}
            onClick={goHome}
          >
            <i className="bi bi-arrow-left" />
          </button>
          <h3 className="m-0">
            <i className="bi bi-person-circle me-2" />
            Mi perfil
          </h3>
        </div>
      </div>

      <Alerta mensaje={error} />
      <Alerta type="success" mensaje={ok} />

      <div className="p-4 border rounded-3 bg-body-tertiary">
        <div className="row gy-3">
          <div className="col-12 col-md-4">
            <div className="text-center">
              <div
                className="rounded-circle border overflow-hidden mx-auto mb-3"
                style={{ width: 140, height: 140 }}
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 bg-secondary text-white">
                    <i className="bi bi-person" style={{ fontSize: 48 }} />
                  </div>
                )}
              </div>

              <label className="form-label">Foto de perfil</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={onFotoChange}
              />
              <div className="form-text">
                Sube una imagen para que aparezca en tu perfil.
              </div>
            </div>
          </div>

          <div className="col-12 col-md-8">
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Documento</label>
              <input
                className="form-control"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Opcional"
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={guardarPerfil}
              disabled={cargando}
            >
              {cargando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        <hr className="my-4" />

        <h5>Cambiar contraseña</h5>
        <Alerta mensaje={passError} />
        <Alerta type="success" mensaje={passOk} />

        <div className="row gy-3">
          <div className="col-12 col-md-6">
            <label className="form-label">Nueva contraseña</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Confirmar contraseña</label>
            <input
              type="password"
              className="form-control"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
            />
          </div>

          <div className="col-12">
            <button
              className="btn btn-outline-primary"
              onClick={cambiarPassword}
              disabled={passLoading}
            >
              {passLoading ? "Guardando..." : "Actualizar contraseña"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
