"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function JustificacionesPage() {
  const [justificaciones, setJustificaciones] = useState([]);
  const [motivo, setMotivo] = useState("");
  const [fecha, setFecha] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

  // Cargar justificaciones del aprendiz
  async function fetchJustificaciones() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${API_BASE}/excuses/excuses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al cargar las justificaciones");

      const data = await res.json();
      setJustificaciones(data.results || data); // DRF puede devolver results[]
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJustificaciones();
  }, []);

  // Enviar nueva justificación
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const formData = new FormData();
      formData.append("motivo", motivo);
      formData.append("fecha", fecha);
      if (archivo) {
        formData.append("archivo", archivo);
      }

      const res = await fetch(`${API_BASE}/excuses/excuses/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error al enviar: ${text}`);
      }

      setMotivo("");
      setFecha("");
      setArchivo(null);
      fetchJustificaciones(); // refrescar lista
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      {/* Bootstrap */}
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

        {/* Formulario */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <h2 className="h5 mb-3">Nueva Justificación</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Motivo</label>
                <textarea
                  className="form-control"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Fecha de la inasistencia</label>
                <input
                  type="date"
                  className="form-control"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Adjuntar archivo (opcional)</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setArchivo(e.target.files[0])}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Enviar Justificación
              </button>
            </form>
          </div>
        </div>

        {/* Listado de justificaciones */}
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h2 className="h5 mb-3">Mis Justificaciones</h2>

            {loading ? (
              <div className="text-center py-3">
                <div className="spinner-border"></div>
                <p className="mt-2">Cargando...</p>
              </div>
            ) : justificaciones.length === 0 ? (
              <div className="alert alert-info">
                No has enviado justificaciones todavía.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Motivo</th>
                      <th>Archivo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {justificaciones.map((j) => (
                      <tr key={j.id}>
                        <td>{j.fecha || "-"}</td>
                        <td style={{ maxWidth: "250px" }}>{j.motivo}</td>
                        <td>
                          {j.archivo ? (
                            <a
                              href={j.archivo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-secondary"
                            >
                              Ver
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              j.estado === "aceptada"
                                ? "bg-success"
                                : j.estado === "rechazada"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {j.estado || "pendiente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
