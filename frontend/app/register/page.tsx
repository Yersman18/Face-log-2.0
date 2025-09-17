"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        password2: "", // Added password2
        first_name: "",
        last_name: "",
        role: "student",
        ficha_numero: "", // Added ficha_numero
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [captured, setCaptured] = useState(false);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        });
    }, []);

    function capturePhoto() {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const ctx = canvas.getContext("2d");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setCaptured(true);
            // apagar la cámara
            // streamRef.current?.getTracks().forEach((track) => track.stop()); // Moved to handleRegister
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            const API = process.env.NEXT_PUBLIC_API_URL;

            // Crear usuario
            const res = await fetch(`${API}/api/v1/auth/register/student/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                // Check for specific error messages from the backend
                if (errorData.password) {
                    throw new Error(errorData.password[0]);
                } else if (errorData.ficha_numero) {
                    throw new Error(errorData.ficha_numero[0]);
                } else if (errorData.face_image) {
                    throw new Error(errorData.face_image[0]);
                } else if (errorData.email) {
                    throw new Error(errorData.email[0]);
                } else if (errorData.username) {
                    throw new Error(errorData.username[0]);
                } else if (errorData.detail) {
                    throw new Error(errorData.detail);
                } else {
                    throw new Error("Error al registrar usuario.");
                }
            }
            await res.json(); // Consume the response body

            // Login para obtener token
            const loginRes = await fetch(`${API}/auth/token/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                }),
            });
            if (!loginRes.ok) throw new Error("Cuenta creada, pero no se pudo iniciar sesión");
            const loginData = await loginRes.json();
            localStorage.setItem("token", loginData.access);

            // Enviar rostro capturado
            if (captured && canvasRef.current) {
                const blob = await new Promise<Blob>((r) =>
                    canvasRef.current.toBlob(r, "image/jpeg")
                );
                const fd = new FormData();
                fd.append("profile_image", blob, "face.jpg");

                const faceRes = await fetch(`${API}/face/register/`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${loginData.access}` },
                    body: fd,
                });

                if (!faceRes.ok) {
                    const faceErrorData = await faceRes.json();
                    if (faceErrorData.error) {
                        throw new Error(faceErrorData.error);
                    } else {
                        throw new Error("Error al registrar el rostro.");
                    }
                }
                // Apagar la cámara después de enviar el rostro
                streamRef.current?.getTracks().forEach((track) => track.stop());
            }

            setSuccess("Registro exitoso ✅");
            setTimeout(() => (window.location.href = "/login"), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

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
                                    <h2 className="h4 fw-bold text-center mb-3">Crear cuenta</h2>

                                    <form onSubmit={handleRegister}>
                                        <input className="form-control form-control-custom mb-2" placeholder="Usuario"
                                            value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                                        <input className="form-control form-control-custom mb-2" type="email" placeholder="Correo"
                                            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                                        <input className="form-control form-control-custom mb-2" type="password" placeholder="Contraseña"
                                            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                                        <input className="form-control form-control-custom mb-2" type="password" placeholder="Confirmar Contraseña"
                                            value={formData.password2} onChange={(e) => setFormData({ ...formData, password2: e.target.value })} required />
                                        <input className="form-control form-control-custom mb-3" placeholder="Número de Ficha"
                                            value={formData.ficha_numero} onChange={(e) => setFormData({ ...formData, ficha_numero: e.target.value })} required />

                                        {/* Cámara */}
                                        {!captured && (
                                            <video ref={videoRef} autoPlay playsInline className="w-100 rounded mb-2" style={{ maxHeight: "200px" }}></video>
                                        )}
                                        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                                        {!captured ? (
                                            <button type="button" onClick={capturePhoto} className="btn btn-outline-primary w-100 mb-3">
                                                📸 Capturar rostro
                                            </button>
                                        ) : (
                                            <p className="text-success small">Foto capturada ✅</p>
                                        )}

                                        <button type="submit" className="btn btn-login w-100 text-white" disabled={isLoading}>
                                            {isLoading ? "Registrando..." : "Registrarse"}
                                        </button>
                                    </form>

                                    {error && <div className="error-alert"><small>{error}</small></div>}
                                    {success && <div className="success-alert"><small>{success}</small></div>}

                                    <div className="divider"><span>O</span></div>
                                    <div className="text-center">
                                        <Link href="/login" className="fw-semibold text-primary">¿Ya tienes cuenta? Ingresar</Link>
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