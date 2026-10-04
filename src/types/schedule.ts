export type DayOfWeek = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

export interface DaySchedule {
  day: DayOfWeek;
  label: string;
  isOpen: boolean;
  openTime: string;  // formato "HH:mm" ej. "08:00"
  closeTime: string; // formato "HH:mm" ej. "18:00"
}

export type BusinessSchedule = Record<DayOfWeek, DaySchedule>;

export const DEFAULT_WEEK_SCHEDULE: BusinessSchedule = {
  LUNES: { day: 'LUNES', label: 'Lunes', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  MARTES: { day: 'MARTES', label: 'Martes', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  MIERCOLES: { day: 'MIERCOLES', label: 'Miércoles', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  JUEVES: { day: 'JUEVES', label: 'Jueves', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  VIERNES: { day: 'VIERNES', label: 'Viernes', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  SABADO: { day: 'SABADO', label: 'Sábado', isOpen: true, openTime: '09:00', closeTime: '15:00' },
  DOMINGO: { day: 'DOMINGO', label: 'Domingo', isOpen: false, openTime: '09:00', closeTime: '13:00' }
};