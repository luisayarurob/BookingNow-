import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Boxes, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ChevronRight,
  ShieldCheck,
  Check,
  Loader2
} from 'lucide-react';
import { Booking } from '../types/booking';
import { ServiceDetail } from '../types/serviceDetail';
import { 
  crearReserva, 
  consultarDisponibilidad, 
  SlotDisponibilidad, 
  ServiceApiError 
} from '../services/apiService';

interface BookingRegisterScreenProps {
  service?: ServiceDetail;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onBookingSuccess?: (booking: Booking) => void;
  onCancel?: () => void;
}

const DEFAULT_SERVICE: ServiceDetail = {
  id: '1',
  businessId: '1',
  name: 'Servicio',
  category: 'General',
  durationMinutes: 60,
  price: 50000,
  description: 'Descripción del servicio.',
  images: [],
  business: {
    id: '1',
    name: 'Mi Negocio',
    category: 'General',
    address: 'Calle Principal',
    city: 'Ciudad'
  }
};

export const BookingRegisterScreen: React.FC<BookingRegisterScreenProps> = ({
  service = DEFAULT_SERVICE,
  customerId = '1',
  customerName = 'Cliente',
  customerEmail = 'cliente@ejemplo.com',
  customerPhone = '3000000000',
  onBookingSuccess,
  onCancel
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');

  const [availableSlots, setAvailableSlots] = useState<SlotDisponibilidad[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // 1. Cargar disponibilidad real cuando cambie la fecha o el servicio
  useEffect(() => {
    const fetchDisponibilidad = async () => {
      if (!selectedDate || !service.id) return;

      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      try {
        setLoadingSlots(true);
        setSelectedTime('');
        const slots = await consultarDisponibilidad(Number(service.id), selectedDate, token);
        setAvailableSlots(slots);
      } catch (err) {
        console.error('Error cargando slots:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchDisponibilidad();
  }, [selectedDate, service.id]);

  // Obtener el slot seleccionado actualmente
  const currentSlot = availableSlots.find(s => s.hora === selectedTime);

  const handleProceedToConfirm = () => {
    setErrorMessage(null);
    if (!selectedDate) {
      setErrorMessage('Por favor selecciona una fecha.');
      return;
    }
    if (!selectedTime) {
      setErrorMessage('Por favor selecciona una hora disponible.');
      return;
    }
    setStep(2);
  };

  // 2. Guardar la reserva en la base de datos
  const handleConfirmBooking = async () => {
    setErrorMessage(null);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
      setErrorMessage('Tu sesión expiró. Inicia sesión para confirmar tu reserva.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        idServicio: Number(service.id),
        idEmpleado: selectedEmployeeId ? Number(selectedEmployeeId) : (currentSlot?.empleadosDisponibles[0] || undefined),
        idRecurso: selectedResourceId ? Number(selectedResourceId) : (currentSlot?.recursosDisponibles[0] || undefined),
        fecha: selectedDate,
        hora: selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime
      };

      const respuestaBackend = (await crearReserva(payload, token)) as any;

      const newBooking = {
        id: respuestaBackend.idReserva?.toString() || `bk-${Date.now()}`,
        serviceId: service.id,
        serviceName: service.name,
        businessId: service.businessId,
        businessName: service.business.name,
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        employeeId: payload.idEmpleado?.toString(),
        resourceId: payload.idRecurso?.toString(),
        date: respuestaBackend.fecha || selectedDate,
        time: respuestaBackend.hora || selectedTime,
        status: respuestaBackend.estado || 'CONFIRMADA',
      };

      setCreatedBooking(newBooking);
      setStep(3);
      if (onBookingSuccess) onBookingSuccess(newBooking as Booking);

    } catch (error: any) {
      if (error instanceof ServiceApiError) {
        setErrorMessage(error.message || 'El horario seleccionado ya no está disponible.');
      } else {
        setErrorMessage(error.message || 'Error al procesar la reserva.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-mimi-pink)]/40 p-4 md:p-8 font-['DM_Sans',sans-serif] text-[var(--color-cacao)]">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-[var(--color-dusty-rose)] pb-4">
          <div className="flex items-center gap-3">
            {onCancel && step !== 3 && (
              <button
                type="button"
                onClick={onCancel}
                className="p-2 rounded-xl bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] text-[var(--color-cacao)] hover:bg-white transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] text-xs font-semibold text-[var(--color-cacao)] mb-1">
                <Building2 size={13} className="text-[var(--color-pompadour)]" />
                <span>{service.business.name}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-['Fraunces',serif] text-[var(--color-cacao)]">
                {step === 3 ? '¡Reserva Exitosa!' : 'Agendar Cita'}
              </h1>
            </div>
          </div>
          <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-[var(--color-dusty-rose)] text-[var(--color-pompadour)]">
            Paso {step} de 3
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm animate-in fade-in">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* PASO 1: SELECCIONAR FECHA Y HORA */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-pompadour)]">Servicio seleccionado</span>
                <h2 className="text-lg font-bold font-['Fraunces',serif] text-[var(--color-cacao)]">{service.name}</h2>
                <div className="flex items-center gap-3 text-xs text-[var(--color-cacao)]/70 mt-1">
                  <span className="flex items-center gap-1"><Clock size={12} /> {service.durationMinutes} min</span>
                </div>
              </div>
              <div className="text-2xl font-bold font-['Fraunces',serif] text-[var(--color-pompadour)] sm:text-right">
                ${service.price.toLocaleString('es-CO')}
              </div>
            </div>

            <div className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              
              {/* Fecha */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-cacao)]">
                  <CalendarIcon size={15} className="text-[var(--color-pompadour)]" /> 
                  Fecha de la cita <span className="text-[var(--color-pompadour)]">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-white border border-[var(--color-dusty-rose)] text-sm font-medium focus:outline-none focus:border-[var(--color-pompadour)] focus:ring-2 focus:ring-[var(--color-pompadour)]/20"
                />
              </div>

              {/* Horas Disponibles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-cacao)]">
                    <Clock size={15} className="text-[var(--color-pompadour)]" /> 
                    Horas disponibles ({selectedDate}) <span className="text-[var(--color-pompadour)]">*</span>
                  </label>
                  {loadingSlots && <Loader2 size={16} className="animate-spin text-[var(--color-pompadour)]" />}
                </div>

                {availableSlots.length === 0 && !loadingSlots ? (
                  <p className="text-xs text-[var(--color-cacao)]/60 italic p-3 bg-white/50 rounded-xl border border-dashed border-[var(--color-dusty-rose)]">
                    No hay cupos disponibles para esta fecha. Intenta seleccionando otro día.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {availableSlots.map(({ hora }) => {
                      const isSelected = selectedTime === hora;
                      return (
                        <button
                          key={hora}
                          type="button"
                          onClick={() => setSelectedTime(hora)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--color-pompadour)] text-white border-[var(--color-pompadour)] shadow-xs scale-[1.02]'
                              : 'bg-white text-[var(--color-cacao)] border-[var(--color-dusty-rose)] hover:bg-[var(--color-mimi-pink)]/30'
                          }`}
                        >
                          {hora.slice(0, 5)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botón Continuar */}
              <button
                type="button"
                onClick={handleProceedToConfirm}
                disabled={!selectedTime}
                className="w-full py-3.5 px-6 rounded-2xl bg-[var(--color-pompadour)] hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                Continuar a Confirmación <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: CONFIRMACIÓN */}
        {step === 2 && (
          <div className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <h2 className="text-xl font-bold font-['Fraunces',serif] text-[var(--color-cacao)] border-b border-[var(--color-dusty-rose)]/60 pb-4">
              Verifica los datos de tu reserva
            </h2>
            
            <div className="bg-white rounded-2xl p-5 border border-[var(--color-dusty-rose)]/80 space-y-3.5 text-xs text-[var(--color-cacao)]">
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-[var(--color-cacao)]/60">Servicio:</span>
                <span className="font-bold text-sm">{service.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-[var(--color-cacao)]/60">Fecha:</span>
                <span className="font-bold">{selectedDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-[var(--color-cacao)]/60">Hora:</span>
                <span className="font-bold text-[var(--color-pompadour)] text-sm">{selectedTime.slice(0, 5)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-[var(--color-cacao)]/60">Cliente:</span>
                <span className="font-bold">{customerName}</span>
              </div>
              <div className="flex justify-between py-2 pt-3 text-base">
                <span className="font-bold">Total a pagar:</span>
                <span className="font-bold font-['Fraunces',serif] text-[var(--color-pompadour)] text-xl">
                  ${service.price.toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="py-3 px-5 rounded-2xl bg-white border border-[var(--color-dusty-rose)] text-[var(--color-cacao)] font-bold text-xs hover:bg-[var(--color-cream)] cursor-pointer"
              >
                Modificar Selección
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="py-3 px-6 rounded-2xl bg-[var(--color-pompadour)] hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: ÉXITO */}
        {step === 3 && createdBooking && (
          <div className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-8 text-center space-y-5 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-['Fraunces',serif] text-[var(--color-cacao)]">
                ¡Tu cita ha sido confirmada!
              </h2>
              <p className="text-xs text-[var(--color-cacao)]/75">
                Código de reserva: <strong className="text-[var(--color-cacao)]">{createdBooking.id}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCancel ? onCancel() : setStep(1)}
              className="py-3 px-8 rounded-2xl bg-[var(--color-pompadour)] text-white text-xs font-bold cursor-pointer hover:opacity-90 shadow-xs"
            >
              Volver al Inicio
            </button>
          </div>
        )}

      </div>
    </div>
  );
};