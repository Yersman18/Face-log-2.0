// frontend/app/dashboard/apprentice/mis-asistencias/page.jsx
"use client";
import { useEffect, useState } from "react";

export default function MisAsistenciasPage() {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

  async function fetchAsistencias() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${API_BASE}/attendance/attendance-logs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al cargar las asistencias");

      const data = await res.json();
      setAsistencias(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAsistencias();
  }, []);

  return (
    <div>
      <h2 className="h5 mb-3">Mis Asistencias</h2>

      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border"></div>
          <p className="mt-2 text-dark">Cargando...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : asistencias.length === 0 ? (
        <div className="alert alert-info">
          No tienes registros de asistencia todavía.
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Fecha y hora</th>
                    <th>Ficha / Sesión</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {asistencias.map((a) => (
                    <tr key={a.id}>
                      <td>{a.timestamp ? new Date(a.timestamp).toLocaleString() : "—"}</td>
                      <td>{a.session || "—"}</td>
                      <td>
                        <span
                          className={`badge ${
                            a.status === "present"
                              ? "bg-success"
                              : a.status === "absent"
                              ? "bg-danger"
                              : a.status === "late"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {a.status || "pendiente"}
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
