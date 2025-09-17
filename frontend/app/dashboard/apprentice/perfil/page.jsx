 "use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PerfilPage() {
  const [perfil, setPerfil] = useState(null);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

  // Traer datos del perfil
  async function fetchPerfil() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${API_BASE}/auth/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al cargar perfil");

      const data = await res.json();
      setPerfil(data);
      setNombre(data.first_name || "");
      setCorreo(data.email || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPerfil();
  }, []);

  // Actualizar perfil
  async function handleUpdate(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/auth/users/profile/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: nombre,
          email: correo,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error al actualizar: ${text}`);
      }

      setSuccess("Perfil actualizado correctamente ✅");
      fetchPerfil(); // refrescar datos
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <div className="container py-4">
        {/* Header con logo */}
        <div className="d-flex align-items-center mb-4">
          <Link
            href="/dashboard/apprentice"
            className="d-flex align-items-center text-decoration-none"
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle me-2"
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #0d6efd, #6610f2)",
              }}
            >
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-9-4z" />
              </svg>
            </div>
            <span className="fw-bold text-dark">FACE LOG</span>
          </Link>
        </div>

        {/* Datos de perfil */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <h2 className="h5 mb-3">Mi Perfil</h2>
            {loading ? (
              <div className="text-center py-3">
                <div className="spinner-border"></div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <>
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Correo</label>
                    <input
                      type="email"
                      className="form-control"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Guardar Cambios
                  </button>
                </form>

                {success && (
                  <div className="alert alert-success mt-3">{success}</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Info adicional (solo lectura) */}
        {perfil && (
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="h6 mb-3">Información adicional</h2>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <strong>Usuario:</strong> {perfil.username}
                </li>
                <li className="list-group-item">
                  <strong>Rol:</strong> {perfil.role || "Aprendiz"}
                </li>
                <li className="list-group-item">
                  <strong>Último acceso:</strong> {perfil.last_login || "—"}
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
