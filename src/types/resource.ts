export type ResourceStatus = 'DISPONIBLE' | 'NO_DISPONIBLE' | 'MANTENIMIENTO';

export type ResourceType = 'EQUIPO' | 'MOBILIARIO' | 'SALA' | 'HERRAMIENTA' | 'OTRO';

export interface Resource {
  id: string;
  businessId: string;
  name: string;
  type: ResourceType;
  quantity: number;
  status: ResourceStatus;
  description?: string;
  createdAt: string;
}

export interface ResourceFormData {
  name: string;
  type: ResourceType;
  quantity: number | '';
  status: ResourceStatus;
  description: string;
}