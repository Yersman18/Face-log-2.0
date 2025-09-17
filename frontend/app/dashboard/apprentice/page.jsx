// frontend/app/dashboard/apprentice/page.jsx
"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

  useEffect(() => {
    async function fetchSummary() {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await fetch(
          `${API_BASE}/attendance/dashboard/apprentice/summary/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("No se pudo cargar el resumen del dashboard");
        }

        const data = await res.json();
        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center h-100" style={{ minHeight: "70vh" }}>
        <div className="spinner-border text-primary mb-4" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="text-center">
          <h5 className="text-dark mb-2">Cargando tu dashboard...</h5>
          <p className="text-muted">Obteniendo la información más reciente</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column h-100">
        <div className="alert alert-danger border-0 shadow-sm rounded-4 d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-triangle me-3 fs-4"></i>
          <div>
            <h6 className="alert-heading mb-1">Error al cargar el dashboard</h6>
            <p className="mb-0">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="d-flex flex-column h-100">
        <div className="alert alert-warning border-0 shadow-sm rounded-4 d-flex align-items-center" role="alert">
          <i className="fas fa-info-circle me-3 fs-4"></i>
          <div>
            <h6 className="alert-heading mb-1">Sin datos disponibles</h6>
            <p className="mb-0">No hay datos para mostrar en este momento.</p>
          </div>
        </div>
      </div>
    );
  }

  const cardStyles = {
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    border: "none",
    borderRadius: "15px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  };

  return (
    <div className="d-flex flex-column h-100">
      {/* Header del Dashboard */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="display-6 fw-bold text-dark mb-2">
                <i className="fas fa-chart-line me-3 text-primary"></i>
                Dashboard del Aprendiz
              </h1>
              <p className="lead text-muted mb-0">Resumen de tu actividad y asistencias académicas</p>
            </div>
            <div className="text-end">
              <div className="badge bg-primary bg-opacity-10 text-primary fs-6 px-3 py-2 rounded-pill">
                <i className="fas fa-clock me-1"></i>
                Actualizado recientemente
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Estadísticas */}
      <div className="row g-4 flex-grow-1">
        {/* Primera fila - 2 cards principales */}
        <div className="col-lg-6 col-md-6">
          <div 
            className="card shadow-sm h-100" 
            style={cardStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
            }}
          >
            <div className="card-body text-center py-4">
              <div className="mb-3">
                <div 
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                  style={{ 
                    width: "60px", 
                    height: "60px", 
                    background: "linear-gradient(135deg, #28a745, #20c997)" 
                  }}
                >
                  <i className="fas fa-chart-pie text-white fs-4"></i>
                </div>
              </div>
              <h6 className="text-muted text-uppercase fw-bold mb-2">Porcentaje de Asistencia</h6>
              <h2 className="display-5 fw-bold text-success mb-1">{summary.attendance_percentage}%</h2>
              <p className="text-muted small mb-0">Del total de sesiones</p>
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-md-6">
          <div 
            className="card shadow-sm h-100" 
            style={cardStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
            }}
          >
            <div className="card-body text-center py-4">
              <div className="mb-3">
                <div 
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                  style={{ 
                    width: "60px", 
                    height: "60px", 
                    background: "linear-gradient(135deg, #007bff, #6610f2)" 
                  }}
                >
                  <i className="fas fa-calendar-alt text-white fs-4"></i>
                </div>
              </div>
              <h6 className="text-muted text-uppercase fw-bold mb-2">Próximas Sesiones</h6>
              <h2 className="display-5 fw-bold text-primary mb-1">{summary.upcoming_sessions}</h2>
              <p className="text-muted small mb-0">Clases programadas</p>
            </div>
          </div>
        </div>

        {/* Segunda fila - 3 cards secundarios */}
        <div className="col-lg-4 col-md-4">
          <div 
            className="card shadow-sm h-100" 
            style={cardStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
            }}
          >
            <div className="card-body text-center py-3">
              <div className="mb-2">
                <div 
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                  style={{ 
                    width: "50px", 
                    height: "50px", 
                    background: "linear-gradient(135deg, #ffc107, #fd7e14)" 
                  }}
                >
                  <i className="fas fa-hourglass-half text-white"></i>
                </div>
              </div>
              <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: "0.8rem" }}>Excusas Pendientes</h6>
              <h3 className="fw-bold text-warning mb-0">{summary.pending_excuses}</h3>
              <small className="text-muted">Por revisar</small>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-4">
          <div 
            className="card shadow-sm h-100" 
            style={cardStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
            }}
          >
            <div className="card-body text-center py-3">
              <div className="mb-2">
                <div 
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                  style={{ 
                    width: "50px", 
                    height: "50px", 
                    background: "linear-gradient(135deg, #fd7e14, #dc3545)" 
                  }}
                >
                  <i className="fas fa-clock text-white"></i>
                </div>
              </div>
              <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: "0.8rem" }}>Retardos</h6>
              <h3 className="fw-bold text-info mb-0">{summary.late_count}</h3>
              <small className="text-muted">Llegadas tarde</small>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-4">
          <div 
            className="card shadow-sm h-100" 
            style={cardStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
            }}
          >
            <div className="card-body text-center py-3">
              <div className="mb-2">
                <div 
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                  style={{ 
                    width: "50px", 
                    height: "50px", 
                    background: "linear-gradient(135deg, #dc3545, #6f42c1)" 
                  }}
                >
                  <i className="fas fa-times-circle text-white"></i>
                </div>
              </div>
              <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: "0.8rem" }}>Inasistencias</h6>
              <h3 className="fw-bold text-danger mb-0">{summary.absent_count}</h3>
              <small className="text-muted">Faltas registradas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional - se mantiene al final */}
      <div className="row mt-4 mb-2">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: "15px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <div className="card-body text-white text-center py-4">
              <h5 className="fw-bold mb-3">
                <i className="fas fa-lightbulb me-2"></i>
                Mantén un buen registro de asistencia
              </h5>
              <p className="mb-0 opacity-75">
                Recuerda justificar tus ausencias a tiempo y mantener una comunicación constante con tus instructores
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}