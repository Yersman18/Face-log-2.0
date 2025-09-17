"use client";

import { useEffect, useState } from "react";
import { authFetch } from "../../../lib/api";

export default function InstructorDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await authFetch("attendance/dashboard/instructor/summary/");
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (err) {
        console.error("Error cargando dashboard instructor:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (!summary) return <p>No hay datos para mostrar.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard del Instructor</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">Fichas a cargo: {summary.total_fichas}</div>
        <div className="p-4 bg-white rounded shadow">% Asistencia Global: {summary.attendance_percentage}%</div>
        <div className="p-4 bg-white rounded shadow">Excusas pendientes: {summary.pending_excuses}</div>
      </div>
    </div>
  );
}
