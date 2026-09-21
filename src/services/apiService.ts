import { API_URL } from "../config/app";

interface LoginResponse {
    token: string;
    cuenta?: {
        rol?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

interface ApiErrorResponse {
    detail?: string;
}

export async function iniciarSesion(correo: string, contrasena: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            correo: correo,
            contrasena: contrasena
        })
    });

    const data = (await response.json().catch(() => ({}))) as LoginResponse & ApiErrorResponse;

    if (!response.ok) {
        throw new Error(data.detail || `No fue posible iniciar sesión (${response.status})`);
    }

    return data;
}

export async function registrarNegocio(datos: Record<string, unknown>) {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No hay una sesión iniciada");
    }

    const response = await fetch(`${API_URL}/api/negocios`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    });

    if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || "No se pudo registrar el negocio");
    }

    return await response.json();
}