import type { Employee } from './employee';
import type { Resource } from './resource';

export interface ServiceSummary {
  id: string;
  businessId: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
}

export interface ServiceAssignment {
  serviceId: string;
  businessId: string;
  requiresEmployees: boolean;
  requiresResources: boolean;
  assignedEmployeeIds: string[];
  assignedResourceIds: string[];
  updatedAt: string;
}

export interface ServiceAssignmentDTO {
  requiresEmployees: boolean;
  requiresResources: boolean;
  employeeIds: string[];
  resourceIds: string[];
}