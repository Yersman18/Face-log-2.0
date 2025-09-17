// frontend/app/dashboard/apprentice/components/Sidebar.jsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    // Eliminar tokens guardados
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");

    // Redirigir al login
    router.push("/login");
  };

  return (
    <div 
      className="d-flex flex-column bg-light border-end shadow-sm" 
      style={{ 
        width: "280px", 
        minHeight: "900px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}
    >
      {/* Header del Sidebar */}
      <div className="p-4 border-bottom border-light border-opacity-25">
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center me-3"
            style={{ 
              width: "45px", 
              height: "45px", 
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)"
            }}
          >
            <i className="fas fa-graduation-cap text-white fs-5"></i>
          </div>
          <div>
            <h4 className="mb-0 text-white fw-bold">FACE LOG</h4>
            <small className="text-white-50">Sistema de Asistencia</small>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-grow-1 p-3">
        <div className="nav flex-column gap-1">
          <Link 
            href="/dashboard/apprentice" 
            className="nav-link text-white rounded-3 py-3 px-4 d-flex align-items-center position-relative overflow-hidden"
            style={{ 
              transition: "all 0.3s ease",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.1)";
              e.target.style.transform = "translateX(0)";
            }}
          >
            <i className="fas fa-chart-line me-3 fs-5"></i>
            <span className="fw-medium">Dashboard</span>
          </Link>
          
          <Link 
            href="/dashboard/apprentice/mis-asistencias" 
            className="nav-link text-white rounded-3 py-3 px-4 d-flex align-items-center position-relative overflow-hidden"
            style={{ 
              transition: "all 0.3s ease",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.1)";
              e.target.style.transform = "translateX(0)";
            }}
          >
            <i className="fas fa-calendar-check me-3 fs-5"></i>
            <span className="fw-medium">Mis Asistencias</span>
          </Link>
          
          <Link 
            href="/dashboard/apprentice/justificaciones" 
            className="nav-link text-white rounded-3 py-3 px-4 d-flex align-items-center position-relative overflow-hidden"
            style={{ 
              transition: "all 0.3s ease",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.1)";
              e.target.style.transform = "translateX(0)";
            }}
          >
            <i className="fas fa-file-alt me-3 fs-5"></i>
            <span className="fw-medium">Justificaciones</span>
          </Link>
          
          <Link 
            href="/dashboard/apprentice/perfil" 
            className="nav-link text-white rounded-3 py-3 px-4 d-flex align-items-center position-relative overflow-hidden"
            style={{ 
              transition: "all 0.3s ease",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.1)";
              e.target.style.transform = "translateX(0)";
            }}
          >
            <i className="fas fa-user me-3 fs-5"></i>
            <span className="fw-medium">Mi Perfil</span>
          </Link>
        </div>
      </nav>

      {/* Footer con botón de logout */}
      <div className="p-4 border-top border-light border-opacity-25">
        <button 
          className="btn w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center"
          onClick={handleLogout}
          style={{ 
            background: "rgba(220, 53, 69, 0.9)",
            border: "1px solid rgba(220, 53, 69, 0.3)",
            color: "white",
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(220, 53, 69, 1)";
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(220, 53, 69, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(220, 53, 69, 0.9)";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          <i className="fas fa-sign-out-alt me-2"></i>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}