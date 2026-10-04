export interface Employee {
  id: string;
  businessId: string;
  fullName: string;
  documentId: string; // Cédula de ciudadanía u otro documento
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface EmployeeFormData {
  fullName: string;
  documentId: string;
  phone: string;
  email: string;
}