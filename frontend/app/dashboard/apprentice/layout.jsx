//frontend/app/dashboard/apprentice/layout.jsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar el tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 992; // lg breakpoint
      setIsMobile(mobile);
      
      // Auto-colapsar en pantallas pequeñas
      if (mobile) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    // Verificar al montar
    checkScreenSize();

    // Agregar listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="d-flex min-vh-100 bg-light position-relative">
      {/* Overlay para móvil cuando sidebar está abierto */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="position-fixed w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarCollapsed(true)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} ${isMobile ? 'sidebar-mobile' : ''}`}
        style={{
          width: isMobile ? (sidebarCollapsed ? "0" : "100vw") : (sidebarCollapsed ? "0" : "280px"),
          maxWidth: isMobile ? "320px" : "none",
          transition: "width 0.3s ease",
          overflowY: isMobile ? "auto" : "hidden",
          zIndex: isMobile ? 1050 : 'auto',
          position: isMobile ? 'fixed' : 'relative',
          minHeight: "100vh"
        }}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div 
        className="flex-grow-1 d-flex flex-column" 
        style={{ 
          width: '100%',
          minWidth: 0,
          minHeight: "100vh" // Asegurar que ocupe toda la altura
        }}
      >
        {/* Top Navigation Bar */}
        <nav className="navbar navbar-expand-lg bg-white shadow-sm border-bottom sticky-top">
          <div className="container-fluid px-4">
            {/* Toggle Sidebar Button */}
            <button
              className="btn btn-outline-primary me-3 d-flex align-items-center justify-content-center"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{ 
                width: "45px", 
                height: "45px",
                borderRadius: "12px",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.05)";
                e.target.style.boxShadow = "0 4px 12px rgba(13, 110, 253, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "none";
              }}
            >
              <i className={`fas ${sidebarCollapsed ? 'fa-bars' : 'fa-times'} fs-5`}></i>
            </button>

            {/* Breadcrumb o título de la página */}
            <div className="d-flex align-items-center flex-grow-1">
              <div>
                <h6 className="mb-0 text-muted fw-normal">Panel de Control</h6>
                <small className="text-muted">Sistema de Gestión Académica</small>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main 
          className="flex-grow-1 p-0 d-flex flex-column" 
          style={{ 
            background: "#f8f9fa",
            minHeight: "100vh", // Hacer que el main sea más alto
            paddingBottom: "2rem" // Añadir espacio al final
          }}
        >
          <div className="container-fluid flex-grow-1 d-flex flex-column h-100 p-4">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-top py-3 px-4 mt-auto">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-md-6">
                <p className="mb-0 text-muted small">
                  © 2024 FACE LOG - Sistema de Gestión Académica
                </p>
              </div>
              <div className="col-md-6 text-md-end">
                <p className="mb-0 text-muted small">
                  Desarrollado para instituciones educativas
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
        
        /* Asegurar que html y body ocupen toda la altura */
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
        }
        
        /* Contenedor principal */
        #__next, [data-reactroot] {
          height: 100%;
          min-height: 100vh;
        }
        
        .sidebar-expanded {
          min-width: 280px;
        }
        
        .sidebar-collapsed {
          min-width: 0;
        }
        
        @media (max-width: 991px) {
          .sidebar-mobile {
            position: fixed !important;
            z-index: 1050 !important;
            height: 100vh !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            max-width: 320px !important;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
          }
          
          .sidebar-collapsed {
            width: 0 !important;
          }
          
          .sidebar-expanded {
            width: 100vw !important;
            max-width: 320px !important;
          }
          
          /* Ajustar altura del main en móviles */
          main {
            min-height: calc(100vh - 120px) !important;
          }
        }
        
        @media (min-width: 992px) {
          .sidebar-expanded {
            flex-shrink: 0;
          }
          
          .sidebar-collapsed {
            flex-shrink: 0;
          }
        }
        
        /* Ajustes específicos para portátiles */
        @media (min-width: 992px) and (max-width: 1600px) and (max-height: 900px) {
          main {
            min-height: 120vh !important; /* Hacer el main más alto para que requiera scroll */
            padding-bottom: 3rem !important;
          }
        }
        
        /* Ajustes para pantallas de portátil con poca altura */
        @media (max-height: 768px) and (min-width: 992px) {
          main {
            min-height: 130vh !important; /* Aún más alto para portátiles pequeños */
            padding-bottom: 4rem !important;
          }
        }
        
        .navbar {
          backdrop-filter: blur(10px);
          flex-shrink: 0; /* Evitar que se encoja */
        }
        
        .card {
          backdrop-filter: blur(10px);
        }
        
        .dropdown-menu {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        }
        
        body {
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        /* Footer siempre al fondo sin afectar el cálculo de altura */
        footer {
          flex-shrink: 0;
          margin-top: auto;
        }
        
        /* Asegurar que el contenido principal ocupe todo el espacio disponible */
        main {
          flex: 1 1 auto !important;
          display: flex !important;
          flex-direction: column !important;
        }
      `}</style>
    </div>
  );
}