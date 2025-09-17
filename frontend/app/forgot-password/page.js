"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API}/api/v1/auth/password/reset/`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.success || "Se ha enviado un enlace de restablecimiento a tu correo electrónico.");
        // For testing purposes, if the backend returns the token directly:
        if (data.token) {
          setMessage(prev => prev + ` (Token para pruebas: ${data.token})`);
        }
      } else {
        setError(data.error || "Error al solicitar el restablecimiento de contraseña.");
      }
    } catch (err) {
      setError("Ocurrió un error de red o inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Bootstrap */}
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
      <style jsx>{`
        /* === mismos estilos que login === */
        .login-container { min-height: 100vh; background: linear-gradient(135deg,#f8f9fa 0%,#e9ecef 100%); display: flex; align-items: center; justify-content: center; padding: 20px; position: relative; overflow: hidden;}
        .login-container::before {content:''; position:absolute; top:25%; left:25%; width:300px; height:300px; background:rgba(13,110,253,0.03); border-radius:50%; filter:blur(60px); z-index:1;}
        .login-container::after {content:''; position:absolute; bottom:25%; right:25%; width:400px; height:400px; background:rgba(102,16,242,0.03); border-radius:50%; filter:blur(80px); z-index:1;}
        .login-card { position:relative; z-index:2; background:white; border-radius:25px; box-shadow:0 20px 40px rgba(0,0,0,0.1); border:1px solid rgba(0,0,0,0.05); overflow:hidden;}
        .login-card::before {content:''; position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg,#0d6efd 0%,#6610f2 100%);}
        .form-control-custom {padding:14px 16px; background:#f8f9fa; border:1px solid #dee2e6; border-radius:12px; font-size:14px;}
        .form-control-custom:focus {background:white; border-color:#0d6efd; box-shadow:0 0 0 0.2rem rgba(13,110,253,0.1);}
        .btn-login {padding:14px 24px; background:linear-gradient(135deg,#0d6efd 0%,#6610f2 100%); border:none; border-radius:12px; font-weight:600; font-size:15px;}
        .btn-login:hover:not(:disabled){transform:translateY(-1px); box-shadow:0 8px 20px rgba(13,110,253,0.3);}
        .btn-login:disabled{background:linear-gradient(135deg,#6c757d 0%,#495057 100%);}
        .error-alert {background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:16px; margin-top:20px;}
        .success-alert {background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:16px; margin-top:20px;}
      `}</style>

      <div className="login-container">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-8 col-md-6 col-lg-4">
              <div className="card login-card border-0">
                <div className="card-body p-4 p-sm-5">
                  <h2 className="h4 fw-bold text-center mb-3">¿Olvidaste tu contraseña?</h2>
                  <p className="text-center text-muted mb-4">Ingresa tu correo electrónico para restablecerla.</p>

                  <form onSubmit={handleResetRequest}>
                    <input
                      className="form-control form-control-custom mb-3"
                      type="email"
                      placeholder="Correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-login w-100 text-white" disabled={isLoading}>
                      {isLoading ? "Enviando..." : "Restablecer Contraseña"}
                    </button>
                  </form>

                  {message && <div className="success-alert"><small>{message}</small></div>}
                  {error && <div className="error-alert"><small>{error}</small></div>}

                  <div className="divider"><span>O</span></div>
                  <div className="text-center">
                    <Link href="/login" className="fw-semibold text-primary">Volver al inicio de sesión</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}