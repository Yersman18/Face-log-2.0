"use client";
import { useState, useEffect } from "react";

export default function DashboardApprentice() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize(); // Ejecutar al cargar
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Aquí van tus llamadas a la API
      // const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/stats/`, {
      //   headers: { "Authorization": `Bearer ${token}` }
      // });
      // const stats = await statsResponse.json();
      // setUserStats(stats);

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);
  

  return (
    <>
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      <style jsx>{`
        .dashboard-wrapper {
          min-height: 100vh;
          display: flex;
          background: #fafbfc;
        }

        .sidebar {
          width: 260px;
          background: #1a1d29;
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
          z-index: 1050;
          transform: translateX(${sidebarCollapsed ? '-100%' : '0'});
          transition: transform 0.3s ease;
          box-shadow: 2px 0 12px rgba(26, 29, 41, 0.08);
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #2a2d3a;
          display: flex;
          align-items: center;
          gap: 14px;
          min-height: 80px;
        }

        .brand-logo {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .brand-name {
          color: #ffffff;
          font-weight: 600;
          font-size: 16px;
          margin: 0;
        }

        .brand-desc {
          color: #9ca3af;
          font-size: 11px;
          margin: 0;
        }

        .nav-menu {
          padding: 16px 0;
        }

        .nav-group {
          margin-bottom: 24px;
        }

        .nav-group-label {
          padding: 0 20px 8px 20px;
          font-size: 11px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .nav-item {
          margin: 2px 12px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          color: #9ca3af;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.15s ease;
          gap: 12px;
          position: relative;
        }

        .nav-link:hover {
          background: #374151;
          color: #f3f4f6;
        }

        .nav-link.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
        }

        .nav-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .nav-label {
          font-weight: 500;
          font-size: 13px;
        }

        .sidebar-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px 12px;
          border-top: 1px solid #2a2d3a;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          color: #ef4444;
          background: transparent;
          border: none;
          border-radius: 8px;
          transition: all 0.15s ease;
          gap: 12px;
          width: 100%;
          cursor: pointer;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        .main-content {
          flex: 1;
          margin-left: ${sidebarCollapsed ? '0' : '260px'};
          padding: 24px;
          transition: margin-left 0.3s ease;
          position: relative;
        }

        .navbar-mobile {
          display: none;
          background: #ffffff;
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          margin: -24px -24px 24px -24px;
          align-items: center;
          justify-content: space-between;
        }

        .menu-toggle {
          background: transparent;
          border: none;
          padding: 8px;
          border-radius: 6px;
          color: #374151;
        }

        .menu-toggle:hover {
          background: #f3f4f6;
        }

        .page-header {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .page-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .metric-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          transition: all 0.2s ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .metric-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .metric-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-icon.primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: #ffffff;
        }

        .metric-icon.success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
        }

        .metric-icon.warning {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
        }

        .metric-title {
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
          margin: 0 0 8px 0;
        }

        .metric-value {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin: 0;
          line-height: 1;
          min-height: 32px;
          display: flex;
          align-items: center;
        }

        .metric-change {
          font-size: 12px;
          font-weight: 500;
          margin-top: 8px;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .content-section {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 16px 0;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1040;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 991.98px) {
          .main-content {
            margin-left: 0;
            padding: 16px;
          }
          
          .navbar-mobile {
            display: flex;
          }
          
          .sidebar-overlay {
            display: ${!sidebarCollapsed ? 'block' : 'none'};
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .page-header {
            padding: 20px;
            margin-bottom: 20px;
          }
          
          .page-title {
            font-size: 20px;
          }
          
          .content-section {
            padding: 20px;
            margin-bottom: 20px;
          }
        }

        @media (max-width: 575.98px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          
          .metric-card {
            padding: 20px;
          }
        }
      `}</style>

      <div className="dashboard-wrapper">
        {/* Overlay para móviles */}
        <div className="sidebar-overlay" onClick={() => setSidebarCollapsed(true)}></div>

        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="brand-logo">
              <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-9-4z"/>
              </svg>
            </div>
            <div>
              <h3 className="brand-name">FACE LOG</h3>
              <div className="brand-desc">Control de Asistencia</div>
            </div>
          </div>

          <nav className="nav-menu">
            <div className="nav-group">
              <div className="nav-group-label">Principal</div>
              <div className="nav-item">
                <a href="#" className="nav-link active">
                  <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  <span className="nav-label">Dashboard</span>
                </a>
              </div>
            </div>

            <div className="nav-group">
              <div className="nav-group-label">Asistencias</div>
              <div className="nav-item">
                <a href="/dashboard/apprentice/mis-asistencias" className="nav-link">
                  <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="nav-label">Mis Asistencias</span>
                </a>
              </div>
              <div className="nav-item">
                <a href="/dashboard/apprentice/justificaciones" className="nav-link">
                  <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                  </svg>
                  <span className="nav-label">Justificaciones</span>
                </a>
              </div>
            </div>

            <div className="nav-group">
              <div className="nav-group-label">Cuenta</div>
              <div className="nav-item">
                <a href="/dashboard/apprentice/perfil" className="nav-link">
                  <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                  </svg>
                  <span className="nav-label">Mi Perfil</span>
                </a>
              </div>
              <div className="nav-item">
                <a href="#" className="nav-link">
                  <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4z"/>
                  </svg>
                  <span className="nav-label">Registrar Rostro</span>
                </a>
              </div>
            </div>
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"/>
              </svg>
              <span className="nav-label">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Mobile Navbar */}
          <div className="navbar-mobile">
            <button className="menu-toggle" onClick={toggleSidebar}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 12h18m-9 9l9-9-9-9"/>
              </svg>
            </button>
            <div className="d-flex align-items-center">
              <div className="brand-logo me-2" style={{width: '28px', height: '28px'}}>
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-9-4z"/>
                </svg>
              </div>
              <span className="fw-bold">FACE LOG</span>
            </div>
          </div>

          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
            <div className="page-subtitle">Resumen de tu actividad y asistencias</div>
          </div>

          {/* Metrics Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <h3 className="metric-title">Asistencias Totales</h3>
                  <div className="metric-value">
                    {loading ? <div className="spinner"></div> : (userStats?.attendance_count || 0)}
                  </div>
                </div>
                <div className="metric-icon success">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                </div>
              </div>
              {!loading && userStats?.attendance_trend && (
                <div className="metric-change" style={{color: userStats.attendance_trend > 0 ? '#10b981' : '#ef4444'}}>
                  {userStats.attendance_trend > 0 ? '↗' : '↘'} {Math.abs(userStats.attendance_trend)}% vs mes anterior
                </div>
              )}
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <h3 className="metric-title">Próximas Clases</h3>
                  <div className="metric-value">
                    {loading ? <div className="spinner"></div> : (upcomingSessions?.length || 0)}
                  </div>
                </div>
                <div className="metric-icon warning">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                  </svg>
                </div>
              </div>
              <div className="metric-change" style={{color: '#6b7280'}}>
                Esta semana
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <h3 className="metric-title">Porcentaje de Asistencia</h3>
                  <div className="metric-value">
                    {loading ? <div className="spinner"></div> : `${userStats?.attendance_percentage || 0}%`}
                  </div>
                </div>
                <div className="metric-icon primary">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                  </svg>
                </div>
              </div>
              {!loading && userStats?.attendance_percentage && (
                <div className="metric-change" style={{color: userStats.attendance_percentage >= 80 ? '#10b981' : '#ef4444'}}>
                  {userStats.attendance_percentage >= 80 ? 'Excelente' : 'Necesita mejorar'}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="content-section">
            <h2 className="section-title">Actividad Reciente</h2>
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <span style={{marginLeft: '8px'}}>Cargando actividades...</span>
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  {activity.description} - {activity.date}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <svg width="48" height="48" fill="#d1d5db" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v8h12V6H4z"/>
                </svg>
                <div style={{marginTop: '16px', fontSize: '14px'}}>No hay actividades recientes</div>
              </div>
            )}
          </div>

          {/* Upcoming Sessions Section */}
          <div className="content-section">
            <h2 className="section-title">Próximas Sesiones</h2>
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <span style={{marginLeft: '8px'}}>Cargando sesiones...</span>
              </div>
            ) : upcomingSessions.length > 0 ? (
              upcomingSessions.map((session, index) => (
                <div key={index} className="session-item">
                  {session.subject} - {session.datetime}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <svg width="48" height="48" fill="#d1d5db" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                </svg>
                <div style={{marginTop: '16px', fontSize: '14px'}}>No hay sesiones programadas</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
        async
      />
    </>
  );
}