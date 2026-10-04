import { API_URL } from "../config/app";

interface ClientRegistration {
  correo: string;
  nombreUsuario: string;
  contrasena: string;
}

interface ProviderRegistration extends ClientRegistration {
  razonSocial: string;
  nit: string;
}

interface ApiErrorResponse {
  detail?: string;
  campos?: Record<string, string>;
}

export class RegisterApiError extends Error {
  status: number;
  fields: Record<string, string>;

  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.name = "RegisterApiError";
    this.status = status;
    this.fields = fields;
  }
}

async function register(path: string, payload: ClientRegistration | ProviderRegistration) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as ApiErrorResponse;
  if (!response.ok) {
    throw new RegisterApiError(
      data.detail || "No fue posible crear la cuenta.",
      response.status,
      data.campos,
    );
  }

  return data;
}

export function registerClient(payload: ClientRegistration) {
  return register("/api/clientes", payload);
}

export function registerProvider(payload: ProviderRegistration) {
  return register("/api/proveedores", payload);
}