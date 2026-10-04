const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export interface Business {
  id?: number | string;
  idNegocio?: number | string;
  nombre?: string;
  [key: string]: any;
}

export interface BusinessService {
  id?: number | string;
  idServicio?: number | string;
  nombre?: string;
  duracionMinutos?: number;
  precio?: number;
  descripcion?: string;
  [key: string]: any;
}

export interface ServiceRegistration {
  nombre: string;
  duracionMinutos: number;
  precio: number;
  descripcion: string;
  imagenReferencia?: string;
}

interface ApiErrorResponse {
  detail?: string;
  campos?: Record<string, string>;
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
    throw new Error("No fue posible obtener el negocio.");
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