import { API_URL } from "../config/app";
import type { BusinessSchedule } from "../types/schedule";

export interface Business {
  id?: number | string;
  idNegocio?: number | string;
  nombre?: string;
  categoria?: string;
  [key: string]: any;
}

export interface BusinessService {
  id?: number | string;
  idServicio?: number | string;
  nombre?: string;
  duracionMinutos?: number;
  precio?: number;
  descripcion?: string;
  tipoServicio?: string;
  imagenReferenciaBase64?: string;
  imagenesBase64?: string[];
  [key: string]: any;
}

export interface ServicePage {
  contenido: BusinessService[];
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface ServiceRegistration {
  nombre: string;
  duracionMinutos: number;
  precio: number;
  descripcion: string;
  tipoServicio?: string;
  imagenReferenciaBase64?: string;
  imagenesBase64?: string[];
}

export interface LoginResponse {
  accessToken?: string;
  token?: string;
  cuenta?: {
    rol?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface BusinessRegistration {
  nombre: string;
  correo: string;
  numContacto: string;
  direccion: string;
  categoria: string;
  modalidadVirtual: boolean;
  fotoPrincipalBase64: string;
  galeria: Array<{
    base64: string;
    tipo: string;
  }>;
}

interface ApiErrorResponse {
  detail?: string;
  campos?: Record<string, string>;
}

function getApiErrorMessage(data: ApiErrorResponse, fallback: string): string {
  const fields = data.campos
    ? Object.entries(data.campos).map(([field, message]) => `${field}: ${message}`).join("; ")
    : "";
  return [data.detail || fallback, fields].filter(Boolean).join(" ");
}

export async function iniciarSesion(correo: string, contrasena: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
  });

  const data = (await response.json().catch(() => ({}))) as LoginResponse & ApiErrorResponse;
  if (!response.ok) {
    throw new Error(data.detail || `No fue posible iniciar sesión (${response.status}).`);
  }

  return data;
}

export async function registrarNegocio(datos: BusinessRegistration): Promise<Business> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No hay una sesión iniciada como proveedor.");
  }

  const response = await fetch(`${API_URL}/api/negocios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });

  const data = (await response.json().catch(() => ({}))) as Business & ApiErrorResponse;
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("app_screen");
      throw new Error("Tu sesión expiró. Inicia sesión nuevamente para registrar el negocio.");
    }
    throw new Error(getApiErrorMessage(data, `No se pudo registrar el negocio (${response.status}).`));
  }

  return data;
}

const API_DAY_NAMES: Record<string, string> = {
  LUNES: "MONDAY",
  MARTES: "TUESDAY",
  MIERCOLES: "WEDNESDAY",
  JUEVES: "THURSDAY",
  VIERNES: "FRIDAY",
  SABADO: "SATURDAY",
  DOMINGO: "SUNDAY",
};

export async function guardarHorarios(idNegocio: number, schedule: BusinessSchedule) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No hay una sesión iniciada como proveedor.");
  }

  const horarios = Object.values(schedule)
    .filter((day) => day.isOpen)
    .map((day) => ({
      dia: API_DAY_NAMES[day.day],
      horaApertura: day.openTime,
      horaCierre: day.closeTime,
    }));

  const response = await fetch(`${API_URL}/api/negocios/${idNegocio}/horarios`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(horarios),
  });

  const data = (await response.json().catch(() => ({}))) as ApiErrorResponse;
  if (!response.ok) {
    throw new Error(data.detail || `No se pudo guardar el horario (${response.status}).`);
  }

  return data;
}

export class ServiceApiError extends Error {
  status: number;
  fields: Record<string, string>;

  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.name = "ServiceApiError";
    this.status = status;
    this.fields = fields;
  }
}

export async function createService(
  businessId: number,
  payload: ServiceRegistration,
  token: string
) {
  const response = await fetch(`${API_URL}/api/negocios/${businessId}/servicios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as ApiErrorResponse;
  if (!response.ok) {
    throw new ServiceApiError(
      data.detail || "No fue posible crear el servicio.",
      response.status,
      data.campos
    );
  }

  return data;
}

export async function obtenerMiNegocio(token: string): Promise<any> {
  const response = await fetch(`${API_URL}/api/negocios/mio`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("app_screen");
    }
    throw new Error(`No fue posible obtener el negocio (${response.status}).`);
  }
  return response.json();
}

export async function listarServicios(idNegocio: number, token: string): Promise<BusinessService[]> {
  const response = await fetch(`${API_URL}/api/negocios/${idNegocio}/servicios`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function buscarServicios(params: {
  nombre?: string;
  tipo?: string;
  pagina?: number;
  tamano?: number;
}): Promise<ServicePage> {
  const query = new URLSearchParams();

  if (params.nombre?.trim()) query.set("nombre", params.nombre.trim());
  if (params.tipo?.trim()) query.set("tipo", params.tipo.trim());
  query.set("pagina", String(params.pagina ?? 0));
  query.set("tamano", String(params.tamano ?? 20));

  const response = await fetch(`${API_URL}/api/servicios?${query.toString()}`, {
    headers: { Accept: "application/json" },
  });
  const data = (await response.json().catch(() => ({}))) as ServicePage & ApiErrorResponse;

  if (!response.ok) {
    throw new Error(data.detail || `No fue posible listar los servicios (${response.status}).`);
  }

  return data;
}