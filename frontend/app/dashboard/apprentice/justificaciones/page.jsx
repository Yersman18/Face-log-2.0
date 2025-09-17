// frontend/app/dashboard/apprentice/justificaciones/page.jsx
"use client";
import { useEffect, useState } from "react";

export default function JustificacionesPage() {
  const [justificaciones, setJustificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

  async function fetchJustificaciones() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${API_BASE}/excuses/excuses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al cargar las justificaciones");

      const data = await res.json();
      setJustificaciones(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJustificaciones();
  }, []);

  return (
    <div>
      <h2 className="h5 mb-3">Mis Justificaciones</h2>

      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border"></div>
          <p className="mt-2">Cargando...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : justificaciones.length === 0 ? (
        <div className="alert alert-info">
          No tienes justificaciones todavía.
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {justificaciones.map((j) => (
                    <tr key={j.id}>
                      <td>{j.fecha || "-"}</td>
                      <td>{j.motivo || "—"}</td>
                      <td>
                        <span
                          className={`badge ${
                            j.estado === "aprobada"
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
          </div>
        </div>
      )}
    </div>
  );
}
