"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Mis Asistencias (page.jsx)
 * - Endpoint usado: ${process.env.NEXT_PUBLIC_API_URL}/attendance/attendance-logs/
 * - Requiere: token JWT en localStorage bajo "token"
 */

export default function MisAsistenciasPage() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [count, setCount] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

  useEffect(() => {
    fetchAttendances(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchAttendances(pageOrUrl = 1) {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Si pageOrUrl parece una URL completa, la usamos; si es número, construimos la URL
      const isFullUrl = typeof pageOrUrl === "string" && pageOrUrl.startsWith("http");
      const url = isFullUrl
        ? pageOrUrl
        : `${API_BASE}/attendance/attendance-logs/?page=${pageOrUrl}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        // token inválido/expirado
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text}`);
      }

      const data = await res.json();

      // DRF paginado: {count, next, previous, results: [...]}
      if (Array.isArray(data)) {
        setAttendances(data);
        setNextUrl(null);
        setPrevUrl(null);
        setCount(data.length);
      } else if (data.results) {
        setAttendances(data.results);
        setNextUrl(data.next);
        setPrevUrl(data.previous);
        setCount(data.count);
      } else {
        // Respuesta inesperada: intentar usar como array
        setAttendances(data);
        setNextUrl(null);
        setPrevUrl(null);
        setCount(Array.isArray(data) ? data.length : null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar asistencias");
    } finally {
      setLoading(false);
    }
  }

  function formatDateTime(dt) {
    if (!dt) return "-";
    try {
      const d = new Date(dt);
      return d.toLocaleString();
    } catch {
      return dt;
    }
  }

  function safeGetSessionInfo(att) {
    // att.session puede ser: número (id), o objeto con campos (date, ficha, ...)
    const s = att.session;
    if (!s) return { label: "—", ficha: null, date: null };
    if (typeof s === "object") {
      const ficha = s.ficha?.numero_ficha || s.ficha || null;
      const date = s.date || s.datetime || null;
      return { label: ficha ? `${ficha}` : "Sesión", ficha, date };
    }
    return { label: `Sesión #${s}`, ficha: null, date: null };
  }

  function downloadCSV() {
    if (!attendances || attendances.length === 0) return;
    const rows = attendances.map((a) => {
      const sessionInfo = safeGetSessionInfo(a);
      return {
        id: a.id || "",
        session: sessionInfo.label,
        ficha: sessionInfo.ficha || "",
        session_date: sessionInfo.date || "",
        status: a.status || "",
        check_in_time: a.check_in_time || "",
        verified_by_face: a.verified_by_face ? "Sí" : "No",
      };
    });

    const header = Object.keys(rows[0]);
    const csv = [header.join(",")]
      .concat(rows.map((r) => header.map((h) => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`).join(",")))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mis_asistencias_page_${page || 1}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* Bootstrap (si no lo incluiste globalmente) */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          {/* Logo que redirige al dashboard principal */}
          <Link href="/dashboard/apprentice" className="d-flex align-items-center text-decoration-none">
            <div 
              className="d-flex align-items-center justify-content-center rounded-circle me-2"
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #0d6efd, #6610f2)",
              }}
            >
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-9-4z"/>
              </svg>
            </div>
            <span className="fw-bold text-dark">FACE LOG</span>
          </Link>
          
          <div>
            <h2 className="mb-0">Mis Asistencias</h2>
            <small className="text-muted">Histórico de tus registros de asistencia</small>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => fetchAttendances(1)}>
              Refrescar
            </button>
            <button className="btn btn-outline-primary" onClick={downloadCSV} disabled={!attendances.length}>
              Exportar CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status"></div>
            <div className="mt-2 text-muted">Cargando asistencias...</div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : attendances.length === 0 ? (
          <div className="alert alert-info">No se encontraron registros de asistencia.</div>
        ) : (
          <>
            <div className="table-responsive shadow-sm">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Fecha sesión / Check-in</th>
                    <th>Ficha / Sesión</th>
                    <th>Estado</th>
                    <th>Verificado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((att) => {
                    const sessionInfo = safeGetSessionInfo(att);
                    return (
                      <tr key={att.id || Math.random()}>
                        <td>
                          <div style={{ fontSize: 13 }}>{sessionInfo.date ? sessionInfo.date : "-"}</div>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            {att.check_in_time ? formatDateTime(att.check_in_time) : "Sin check-in"}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{sessionInfo.ficha || sessionInfo.label}</div>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            {typeof att.session === "object" && att.session?.programa_formacion
                              ? att.session.programa_formacion
                              : ""}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              att.status === "present"
                                ? "bg-success"
                                : att.status === "late"
                                ? "bg-warning text-dark"
                                : att.status === "excused"
                                ? "bg-info text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {att.status ?? "—"}
                          </span>
                        </td>
                        <td>{att.verified_by_face ? "Sí" : "No"}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setExpandedId(expandedId === att.id ? null : att.id)}
                            >
                              {expandedId === att.id ? "Ocultar" : "Ver JSON"}
                            </button>

                            {/* Si deseas agregar acciones futuras (descargar justificante, solicitar excusa), agrégalas aquí */}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Detalle expandible (JSON) */}
            {expandedId && (
              <div className="card mt-3">
                <div className="card-body">
                  <h5 className="card-title">Detalle (JSON)</h5>
                  <pre style={{ whiteSpace: "pre-wrap", maxHeight: 300, overflow: "auto" }}>
                    {JSON.stringify(attendances.find((a) => a.id === expandedId), null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Paginación */}
            <div className="d-flex align-items-center justify-content-between mt-3">
              <div className="text-muted">Total: {count ?? "-"}</div>
              <div className="btn-group">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    if (prevUrl) {
                      // Si API devuelve URL absoluta en previous/next, usarla
                      fetchAttendances(prevUrl);
                    } else if (page > 1) {
                      setPage((p) => p - 1);
                    }
                  }}
                  disabled={!prevUrl && page <= 1}
                >
                  ← Anterior
                </button>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    if (nextUrl) {
                      fetchAttendances(nextUrl);
                    } else {
                      setPage((p) => p + 1);
                    }
                  }}
                  disabled={!nextUrl && attendances.length === 0}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        /* pequeños ajustes visuales */
        .table tbody tr td {
          vertical-align: middle;
        }
      `}</style>
    </>
  );
}
