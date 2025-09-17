// frontend/app/dashboard/apprentice/perfil/page.jsx
"use client";
import { useEffect, useState } from "react";

export default function MiPerfilPage() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

  async function fetchPerfil() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${API_BASE}/auth/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al cargar el perfil");

      const data = await res.json();
      setPerfil(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPerfil();
  }, []);

  return (
    <div>
      <h2 className="h5 mb-3">Mi Perfil</h2>

      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border"></div>
          <p className="mt-2">Cargando...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : !perfil ? (
        <div className="alert alert-info">No se pudo cargar tu perfil.</div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <p><strong>Nombre:</strong> {perfil.first_name} {perfil.last_name}</p>
            <p><strong>Email:</strong> {perfil.email}</p>
            <p><strong>Usuario:</strong> {perfil.username}</p>
          </div>
        </div>
      )}
    </div>
  );
}
