import React, { useState, useMemo } from 'react';
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
  Check
} from 'lucide-react';
import { Booking } from '../types/booking';
import { ServiceDetail } from '../types/serviceDetail';

interface BookingRegisterScreenProps {
  service?: ServiceDetail;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onBookingSuccess?: (booking: Booking) => void;
  onCancel?: () => void;
}

// Datos de prueba para el servicio seleccionado y sus dependencias
const DEFAULT_SERVICE: ServiceDetail = {
  id: 'srv-001',
  businessId: 'biz-001',
  name: 'Masaje Relajante con Aceites Esenciales',
  category: 'Spa y Bienestar',
  durationMinutes: 60,
  price: 85000,
  description: 'Terapia corporal completa con aromaterapia para liberar tensión muscular.',
  images: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80'],
  business: {
    id: 'biz-001',
    name: 'Spa Serenity',
    category: 'Bienestar',
    address: 'Calle 30 # 25-14',
    city: 'El Carmen de Viboral'
  }
};

export const BookingRegisterScreen: React.FC<BookingRegisterScreenProps> = ({
  service = DEFAULT_SERVICE,
  customerId = 'usr-789',
  customerName = 'Jhoan Sebastián Daza',
  customerEmail = 'jhoan@ejemplo.com',
  customerPhone = '3104509876',
  onBookingSuccess,
  onCancel
}) => {
  // Configuración de dependencias del servicio (obtenidas del backend / asignación previa)
  const requiresEmployee = true;
  const requiresResource = true;

  // Empleados disponibles para este servicio
  const availableEmployees = [
    { id: 'emp-1', name: 'Ana Sofía Restrepo', role: 'Terapeuta Spa' },
    { id: 'emp-2', name: 'Carlos Mario Henao', role: 'Masoterapeuta' }
  ];

  // Recursos disponibles para este servicio
  const availableResources = [
    { id: 'res-1', name: 'Cabina Zen #1', type: 'SALA' },
    { id: 'res-2', name: 'Cabina Aromaterapia #2', type: 'SALA' }
  ];

  // Horarios base del negocio simulando franjas disponibles vs ocupadas
  const mockBookedSlots: Record<string, string[]> = {
    '2026-10-15': ['11:00', '14:00'],
    '2026-10-16': ['09:00', '10:00', '15:00']
  };

  // Estados de selección del flujo
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(requiresEmployee ? 'emp-1' : '');
  const [selectedResourceId, setSelectedResourceId] = useState<string>(requiresResource ? 'res-1' : '');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-15');
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  
  // Paso del proceso: 1 = Selección | 2 = Confirmación | 3 = Éxito
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Generación de slots respetando disponibilidad y horario comercial (08:00 a 17:00)
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    
    const allSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    const booked = mockBookedSlots[selectedDate] || [];

    return allSlots.map(time => ({
      time,
      available: !booked.includes(time)
    }));
  }, [selectedDate]);

  const selectedEmployee = availableEmployees.find(e => e.id === selectedEmployeeId);
  const selectedResource = availableResources.find(r => r.id === selectedResourceId);

  // Validación previa al paso de confirmación
  const handleProceedToConfirm = () => {
    setErrorMessage(null);

    if (requiresEmployee && !selectedEmployeeId) {
      setErrorMessage('Por favor selecciona un profesional disponible.');
      return;
    }

    if (requiresResource && !selectedResourceId) {
      setErrorMessage('Por favor selecciona un espacio o recurso disponible.');
      return;
    }

    if (!selectedDate) {
      setErrorMessage('Debes seleccionar una fecha para tu reserva.');
      return;
    }

    if (!selectedTime) {
      setErrorMessage('Debes seleccionar una hora disponible.');
      return;
    }

    // Verificar si la hora elegida sigue disponible
    const currentSlot = availableSlots.find(s => s.time === selectedTime);
    if (!currentSlot || !currentSlot.available) {
      setErrorMessage('El horario seleccionado ya no se encuentra disponible. Por favor elige otro.');
      return;
    }

    setStep(2);
  };

  // Guardado de la reserva
  const handleConfirmBooking = () => {
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      serviceId: service.id,
      serviceName: service.name,
      businessId: service.businessId,
      businessName: service.business.name,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      employeeId: selectedEmployee?.id,
      employeeName: selectedEmployee?.name,
      resourceId: selectedResource?.id,
      resourceName: selectedResource?.name,
      date: selectedDate,
      time: selectedTime,
      durationMinutes: service.durationMinutes,
      totalPrice: service.price,
      status: 'CONFIRMADA',
      createdAt: new Date().toISOString()
    };

    setCreatedBooking(newBooking);
    setStep(3);
    if (onBookingSuccess) onBookingSuccess(newBooking);
  };

  return (
    <div className="min-h-screen bg-[var(--color-mimi-pink)]/40 p-4 md:p-8 font-['DM_Sans',sans-serif] text-[var(--color-cacao)]">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Barra superior */}
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

          {/* Indicador de pasos */}
          <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-[var(--color-dusty-rose)] text-[var(--color-pompadour)]">
            Paso {step} de 3
          </div>
        </div>

        {/* Mensaje de error si la disponibilidad falló */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm animate-in fade-in">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* PASO 1: SELECCIÓN DE PROFESIONAL, RECURSO, FECHA Y HORA        */}
        {/* ============================================================== */}
        {step === 1 && (
          <div className="space-y-6">
            
            {/* Tarjeta resumen del servicio */}
            <div className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-pompadour)]">Servicio seleccionado</span>
                <h2 className="text-lg font-bold font-['Fraunces',serif] text-[var(--color-cacao)]">{service.name}</h2>
                <div className="flex items-center gap-3 text-xs text-[var(--color-cacao)]/70 mt-1">
                  <span className="flex items-center gap-1"><Clock size={12} /> {service.durationMinutes} min</span>
                  <span>•</span>
                  <span>{service.category}</span>
                </div>
              </div>
              <div className="text-2xl font-bold font-['Fraunces',serif] text-[var(--color-pompadour)] sm:text-right">
                ${service.price.toLocaleString('es-CO')}
              </div>
            </div>

            <div className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">

              {/* 1. Selección de Empleado (si el servicio lo requiere) */}
              {requiresEmployee && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-cacao)]">
                    <User size={15} className="text-[var(--color-pompadour)]" />
                    Selecciona Profesional Disponible <span className="text-[var(--color-pompadour)]">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableEmployees.map((emp) => {
                      const isSelected = selectedEmployeeId === emp.id;
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => setSelectedEmployeeId(emp.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-white border-[var(--color-pompadour)] ring-2 ring-[var(--color-pompadour)]/20 shadow-xs'
                              : 'bg-white/60 border-[var(--color-dusty-rose)]/80 hover:bg-white'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-[var(--color-cacao)]">{emp.name}</div>
                            <div className="text-[11px] text-[var(--color-cacao)]/60">{emp.role}</div>
                          </div>
                          {isSelected && <Check size={16} className="text-[var(--color-pompadour)]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Selección de Recurso (si el servicio lo requiere) */}
              {requiresResource && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-cacao)]">
                    <Boxes size={15} className="text-[var(--color-pompadour)]" />
                    Selecciona Espacio o Recurso <span className="text-[var(--color-pompadour)]">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableResources.map((res) => {
                      const isSelected = selectedResourceId === res.id;
                      return (
                        <button
                          key={res.id}
                          type="button"
                          onClick={() => setSelectedResourceId(res.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-white border-[var(--color-pompadour)] ring-2 ring-[var(--color-pompadour)]/20 shadow-xs'
                              : 'bg-white/60 border-[var(--color-dusty-rose)]/80 hover:bg-white'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-[var(--color-cacao)]">{res.name}</div>
                            <div className="text-[10px] text-[var(--color-cacao)]/60 uppercase font-semibold">{res.type}</div>
                          </div>
                          {isSelected && <Check size={16} className="text-[var(--color-pompadour)]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Selección de Fecha */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-cacao)]">
                  <CalendarIcon size={15} className="text-[var(--color-pompadour)]" />
                  Fecha de la cita <span className="text-[var(--color-pompadour)]">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                  }}
                  className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-white border border-[var(--color-dusty-rose)] text-sm font-medium focus:outline-none focus:border-[var(--color-pompadour)] focus:ring-2 focus:ring-[var(--color-pompadour)]/20"
                />
              </div>

              {/* 4. Selección de Hora */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-cacao)]">
                    <Clock size={15} className="text-[var(--color-pompadour)]" />
                    Horas disponibles ({selectedDate}) <span className="text-[var(--color-pompadour)]">*</span>
                  </label>
                  <span className="text-[11px] text-[var(--color-cacao)]/60">
                    Duración: {service.durationMinutes} min
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availableSlots.map(({ time, available }) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={!available}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                          !available
                            ? 'bg-stone-100 text-stone-400 border-dashed border-stone-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-[var(--color-pompadour)] text-white border-[var(--color-pompadour)] shadow-xs scale-[1.02] cursor-pointer'
                            : 'bg-white text-[var(--color-cacao)] border-[var(--color-dusty-rose)] hover:bg-[var(--color-mimi-pink)]/30 cursor-pointer'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botón Siguiente */}
              <button
                type="button"
                onClick={handleProceedToConfirm}
                className="w-full py-3.5 px-6 rounded-2xl bg-[var(--color-pompadour)] hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                Continuar a Confirmación
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PASO 2: CONFIRMACIÓN DE LA RESERVA (Previsualización antes de guardar) */}
        {/* ============================================================== */}
        {step === 2 && (
          <div className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            
            <div className="border-b border-[var(--color-dusty-rose)]/60 pb-4">
              <h2 className="text-xl font-bold font-['Fraunces',serif] text-[var(--color-cacao)]">
                Verifica los datos de tu reserva
              </h2>
              <p className="text-xs text-[var(--color-cacao)]/70 mt-1">
                Revisa que la información sea correcta antes de confirmar tu cupo.
              </p>
            </div>

            {/* Ficha Resumen (Cumple ejemplo del CA) */}
            <div className="bg-white rounded-2xl p-5 border border-[var(--color-dusty-rose)]/80 space-y-3.5 text-xs text-[var(--color-cacao)]">
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-[var(--color-cacao)]/60">Servicio:</span>
                <span className="font-bold text-sm">{service.name}</span>
              </div>

              {requiresEmployee && (
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-[var(--color-cacao)]/60">Profesional:</span>
                  <span className="font-bold">{selectedEmployee?.name || 'Asignado automáticamente'}</span>
                </div>
              )}

              {requiresResource && (
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-[var(--color-cacao)]/60">Espacio / Recurso:</span>
                  <span className="font-bold">{selectedResource?.name || 'Cabina general'}</span>
                </div>
              )}

              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-[var(--color-cacao)]/60">Fecha:</span>
                <span className="font-bold">{selectedDate}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-[var(--color-cacao)]/60">Hora:</span>
                <span className="font-bold text-[var(--color-pompadour)] text-sm">{selectedTime}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-[var(--color-cacao)]/60">Cliente:</span>
                <span className="font-bold">{customerName} ({customerPhone})</span>
              </div>

              <div className="flex justify-between py-2 pt-3 text-base">
                <span className="font-bold">Total a pagar:</span>
                <span className="font-bold font-['Fraunces',serif] text-[var(--color-pompadour)] text-xl">
                  ${service.price.toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--color-cacao)]/70 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <ShieldCheck size={16} className="text-amber-600 shrink-0" />
              <span>Al confirmar, el horario quedará reservado exclusivamente para ti.</span>
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-2xl bg-white border border-[var(--color-dusty-rose)] text-[var(--color-cacao)] font-bold text-xs hover:bg-[var(--color-cream)] cursor-pointer"
              >
                Modificar Selección
              </button>

              <button
                type="button"
                onClick={handleConfirmBooking}
                className="py-3 px-6 rounded-2xl bg-[var(--color-pompadour)] hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <CheckCircle2 size={18} />
                Confirmar Reserva
              </button>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* PASO 3: REGISTRO EXITOSO                                       */}
        {/* ============================================================== */}
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

            <div className="max-w-md mx-auto bg-white p-4 rounded-2xl border border-[var(--color-dusty-rose)]/70 text-xs space-y-2 text-left">
              <div><strong>Negocio:</strong> {createdBooking.businessName}</div>
              <div><strong>Servicio:</strong> {createdBooking.serviceName}</div>
              <div><strong>Fecha y hora:</strong> {createdBooking.date} a las {createdBooking.time}</div>
              {createdBooking.employeeName && <div><strong>Especialista:</strong> {createdBooking.employeeName}</div>}
              {createdBooking.resourceName && <div><strong>Ubicación:</strong> {createdBooking.resourceName}</div>}
            </div>

            <p className="text-[11px] text-[var(--color-cacao)]/60">
              Hemos enviado los detalles de la reserva a tu correo <strong>{createdBooking.customerEmail}</strong>.
            </p>

            <button
              type="button"
              onClick={() => {
                if (onCancel) onCancel();
                else setStep(1);
              }}
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