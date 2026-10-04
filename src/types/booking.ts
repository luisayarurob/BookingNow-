export interface TimeSlot {
  time: string; // formato "HH:mm" ej. "10:00"
  available: boolean;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  businessId: string;
  businessName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  employeeId?: string;
  employeeName?: string;
  resourceId?: string;
  resourceName?: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  durationMinutes: number;
  totalPrice: number;
  status: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';
  createdAt: string;
}

// Payload para Swagger: POST /api/v1/bookings
export interface CreateBookingDTO {
  serviceId: string;
  businessId: string;
  customerId: string;
  employeeId?: string;
  resourceId?: string;
  date: string;
  time: string;
}