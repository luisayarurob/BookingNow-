import { API_URL } from "../config/app";

interface LoginResponse {
    accessToken: string;
    expiresIn?: number;
    tokenType?: string;
    cuenta?: {
        rol?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

interface ApiErrorResponse {
    detail?: string;
}

export interface Business {
    idNegocio?: number;
    id?: number;
    nombre?: string;
    correo?: string;
    numContacto?: string;
    direccion?: string | null;
    categoria?: string;
    modalidadVirtual?: boolean;
    fotoPrincipalBase64?: string | null;
    fechaRegistro?: string;
    [key: string]: unknown;
}

export interface MyBusinessResponse {
    puedeRegistrar?: boolean;
    negocio?: Business | null;
    negocios?: Business[];
}

export interface BusinessService {
    idServicio?: number;
    id?: number;
    nombre: string;
    duracionMinutos: number;
    precio: number;
    descripcion: string;
    imagenReferencia?: string;
    rating?: number;
}

async function authorizedRequest(path: string) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No hay una sesión iniciada");

    const response = await fetch(`${API_URL}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || `No fue posible consultar la información (${response.status})`);
    }
    return data;
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

export async function obtenerMiNegocio(): Promise<MyBusinessResponse> {
    return authorizedRequest("/api/negocios/mio") as Promise<MyBusinessResponse>;
}

export async function listarServicios(businessId: number): Promise<BusinessService[]> {
    return authorizedRequest(`/api/negocios/${businessId}/servicios`) as Promise<BusinessService[]>;
}