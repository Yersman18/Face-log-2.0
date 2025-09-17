"use client";
import { useState } from "react";
import Link from "next/link";
import { saveTokens, authFetch, clearTokens } from "../../lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/auth/token/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Credenciales incorrectas");
      }

      const data = await res.json();
      // guardar tokens (access + refresh)
      saveTokens(data.access, data.refresh);

      // intentar obtener el perfil para conocer el role (ruta común: auth/profile/ o users/me/)
      let profile = null;
      const tryProfile = async (path) => {
        try {
          const r = await authFetch(path, { method: "GET" });
          if (r.ok) return await r.json();
        } catch (err) {
          return null;
        }
        return null;
      };

      profile = (await tryProfile("auth/profile/")) || (await tryProfile("users/me/")) || null;

      // salvar role si viene
      const role = profile?.role || profile?.user?.role || profile?.role_name || null;
      if (role) localStorage.setItem("role", role);

      // redirigir según role; si no hay role, por defecto al dashboard de aprendiz
      if (role && role.toLowerCase().includes("instructor")) {
        window.location.href = "/dashboard/instructor";
      } else {
        // usar ruta que creaste: /dashboard/apprentice
        window.location.href = "/dashboard/apprentice";
      }
    } catch (err) {
      clearTokens();
      setError(err.message || "Error en el login");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      {/* Agregar Bootstrap CSS en el head o _app.js */}
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: '';
          position: absolute;
          top: 25%;
          left: 25%;
          width: 300px;
          height: 300px;
          background: rgba(13, 110, 253, 0.03);
          border-radius: 50%;
          filter: blur(60px);
          z-index: 1;
        }

        .login-container::after {
          content: '';
          position: absolute;
          bottom: 25%;
          right: 25%;
          width: 400px;
          height: 400px;
          background: rgba(102, 16, 242, 0.03);
          border-radius: 50%;
          filter: blur(80px);
          z-index: 1;
        }

        .login-card {
          position: relative;
          z-index: 2;
          background: white;
          border-radius: 25px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #0d6efd 0%, #6610f2 100%);
        }

        .logo-container {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          position: relative;
        }

        .logo-placeholder {
          background: linear-gradient(135deg, #495057 0%, #212529 100%);
          border-radius: 16px;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .form-control-custom {
          padding: 14px 16px 14px 48px;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .form-control-custom:focus {
          background-color: white;
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.1);
        }

        .input-group-custom {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          color: #6c757d;
        }

        .btn-login {
          padding: 14px 24px;
          background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(13, 110, 253, 0.3);
        }

        .btn-login:disabled {
          background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
          cursor: not-allowed;
        }

        .error-alert {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 16px;
          margin-top: 20px;
        }

        .divider {
          position: relative;
          text-align: center;
          margin: 32px 0;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #dee2e6;
        }

        .divider span {
          background: white;
          padding: 0 16px;
          color: #6c757d;
          font-size: 12px;
          font-weight: 500;
        }

        .security-badge {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #f1f3f4;
        }

        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
        }

        @media (max-width: 576px) {
          .login-container {
            padding: 15px;
          }
          
          .login-card {
            border-radius: 20px;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-8 col-md-6 col-lg-4">
              <div className="card login-card border-0">
                <div className="card-body p-4 p-sm-5">
                  
                  {/* Header */}
                  <div className="text-center mb-4">
                    <div className="logo-container">
                      <div className="logo-placeholder">
                        <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                          <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-9-4z"/>
                          <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="rgba(255,255,255,0.9)"/>
                        </svg>
                      </div>
                    </div>
                    
                    <h1 className="h2 fw-bold text-dark mb-2">FACE LOG</h1>
                    <p className="text-muted small fw-medium">Sistema de asistencia de reconocimiento facial</p>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label fw-medium text-dark small">
                        Usuario
                      </label>
                      <div className="input-group-custom">
                        <input
                          id="username"
                          type="text"
                          className="form-control form-control-custom"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Ingresa tu usuario"
                          required
                          disabled={isLoading}
                        />
                        <span className="input-icon">
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                          </svg>
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="password" className="form-label fw-medium text-dark small">
                        Contraseña
                      </label>
                      <div className="input-group-custom">
                        <input
                          id="password"
                          type="password"
                          className="form-control form-control-custom"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Ingresa tu contraseña"
                          required
                          disabled={isLoading}
                        />
                        <span className="input-icon">
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
                          </svg>
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-login w-100 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Ingresando...
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" className="me-2">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"/>
                          </svg>
                          Ingresar
                        </>
                      )}
                    </button>

                    <div className="mb-3 text-end">
                      <Link href="/forgot-password" className="text-decoration-none small text-primary">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    
                  </form>

                  {error && (
                    <div className="error-alert">
                      <div className="d-flex align-items-center">
                        <svg width="20" height="20" fill="#dc3545" viewBox="0 0 20 20" className="me-3 flex-shrink-0">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
                        </svg>
                        <small className="text-danger fw-medium">{error}</small>
                      </div>
                    </div>
                  )}

                  <div className="divider">
                    <span>O</span>
                  </div>

                  <div className="text-center">
                    <small className="text-muted">
                      ¿No tienes cuenta?{" "}
                      <Link href="/register" className="text-primary text-decoration-none fw-semibold">
                        Crear cuenta
                      </Link>
                    </small>
                  </div>

                  <div className="security-badge">
                    <div className="d-flex align-items-center justify-content-center text-muted">
                      <svg width="16" height="16" fill="#198754" viewBox="0 0 20 20" className="me-2">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                      </svg>
                      <small style={{fontSize: '11px'}}>Conexión segura SSL</small>
                    </div>
                    <small className="text-muted d-block mt-2" style={{fontSize: '11px'}}>
                      © 2024 SENA - Servicio Nacional de Aprendizaje
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap JS */}
      <script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
        async
      />
    </>
  );
}