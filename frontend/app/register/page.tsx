"use client";
import React from "react";
import { useState } from "react";

export default function RegisterPage() {
    const [form, setForm] = useState({
        username: "",
        password: "",
        password2: "",
        first_name: "",
        last_name: "",
        email: "",
        student_id: "",
        ficha_numero: "",
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/register/student/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                }
            );

            if (!res.ok) {
                const data = await res.json();
                throw new Error(
                    data.detail ||
                    JSON.stringify(data) ||
                    "Error al registrar aprendiz"
                );
            }

            setSuccess("✅ Registro exitoso. Ahora puedes iniciar sesión.");
            setForm({
                username: "",
                password: "",
                password2: "",
                first_name: "",
                last_name: "",
                email: "",
                student_id: "",
                ficha_numero: "",
            });
        } catch (err: any) {
            setError(err.message);
        }
    }

    return (
        <div>
            <h1>Registro de Aprendices</h1>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    name="username"
                    placeholder="Usuario"
                    value={form.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="first_name"
                    placeholder="Nombre"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="last_name"
                    placeholder="Apellido"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Correo"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="student_id"
                    placeholder="ID de Estudiante"
                    value={form.student_id}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="ficha_numero"
                    placeholder="Número de Ficha"
                    value={form.ficha_numero}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password2"
                    placeholder="Repetir Contraseña"
                    value={form.password2}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Registrarse</button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
        </div>
    );
}
