const API_URL = import.meta.env.VITE_API_URL || "http://3.136.161.165:8080";

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
	token: string,
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
			data.campos,
		);
	}

	return data;
}
