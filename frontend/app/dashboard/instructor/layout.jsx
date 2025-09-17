"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function InstructorLayout({ children }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/instructor", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/instructor/fichas", label: "Mis Fichas", icon: "📁" },
    { href: "/dashboard/instructor/attendances", label: "Asistencias", icon: "📝" },
    { href: "/dashboard/instructor/justifications", label: "Justificaciones", icon: "📄" },
    { href: "/dashboard/instructor/profile", label: "Mi Perfil", icon: "👤" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 font-bold text-lg border-b border-gray-700">
          FACE LOG <br />
          <span className="text-sm font-normal">Panel Instructor</span>
        </div>

        <nav className="flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-2 hover:bg-gray-800 ${
                pathname === link.href ? "bg-gray-800 font-semibold" : ""
              }`}
            >
              <span className="mr-2">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="w-full text-left text-red-400 hover:text-red-300"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
