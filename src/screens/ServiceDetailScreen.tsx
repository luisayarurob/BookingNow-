import React, { useState } from 'react';
import { 
  Clock, 
  Tag, 
  MapPin, 
  Star, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  CalendarCheck2, 
  ArrowLeft,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ServiceDetail } from '../types/serviceDetail';

interface ServiceDetailScreenProps {
  service?: ServiceDetail;
  onBack?: () => void;
  onStartBooking?: (serviceId: string) => void;
}

// Datos de prueba por defecto alineados a los Criterios de Aceptación
const MOCK_SERVICE: ServiceDetail = {
  id: 'srv-001',
  businessId: 'biz-001',
  name: 'Corte de Cabello Premium & Perfilado de Barba',
  category: 'Barbería y Estilismo',
  durationMinutes: 45,
  price: 45000,
  description: 'Servicio completo que incluye diagnóstico capilar, corte personalizado con tijera o máquina según preferencia, lavado con champú refrescante, perfilado de barba con toalla caliente y aplicación de bálsamo hidratante.',
  images: [
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80'
  ],
  business: {
    id: 'biz-001',
    name: 'Barbería Clásica & Spa',
    category: 'Cuidado Personal',
    rating: 4.9,
    reviewCount: 128,
    address: 'Calle 30 # 25-14',
    city: 'El Carmen de Viboral'
  }
};

export const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
  service = MOCK_SERVICE,
  onBack,
  onStartBooking
}) => {
  // Estado para el control del carrusel de imágenes
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = service.images && service.images.length > 0 
    ? service.images 
    : ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80'];

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleBookClick = () => {
    if (onStartBooking) {
      onStartBooking(service.id);
    } else {
      alert(`Iniciando flujo de reserva para el servicio: ${service.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-mimi-pink)]/40 p-4 md:p-8 font-['DM_Sans',sans-serif] text-[var(--color-cacao)]">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Barra superior de navegación */}
        <div className="flex items-center justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] text-xs font-semibold hover:bg-white transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={16} />
              Volver a la lista
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-xs text-[var(--color-cacao)]/70">
              <span>Servicios</span> / <span className="font-semibold text-[var(--color-cacao)]">{service.category}</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] text-xs font-semibold text-[var(--color-cacao)] shadow-2xs">
            <Tag size={13} className="text-[var(--color-pompadour)]" />
            <span>{service.category}</span>
          </div>
        </div>

        {/* Ficha principal del servicio */}
        <div className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl overflow-hidden shadow-sm">
          
          {/* Carrusel de imágenes */}
          <div className="relative w-full h-72 sm:h-96 bg-stone-900 group">
            <img
              src={images[currentImageIndex]}
              alt={`${service.name} vista ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Controles del Carrusel (si hay más de 1 imagen) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight size={22} />
                </button>

                {/* Indicadores de puntos (Dots) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xs">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        currentImageIndex === idx 
                          ? 'w-6 bg-[var(--color-pompadour)]' 
                          : 'bg-white/60 hover:bg-white'
                      }`}
                      aria-label={`Ir a imagen ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Contenido descriptivo de la ficha */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Título, Identificación del negocio y Precio */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[var(--color-dusty-rose)]/60 pb-5">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-['Fraunces',serif] text-[var(--color-cacao)]">
                  {service.name}
                </h1>

                {/* Información del negocio oferente */}
                <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--color-cacao)]/80">
                  <div className="flex items-center gap-1 font-semibold text-[var(--color-cacao)] bg-white px-2.5 py-1 rounded-lg border border-[var(--color-dusty-rose)]/80">
                    <Building2 size={14} className="text-[var(--color-pompadour)]" />
                    <span>{service.business.name}</span>
                  </div>

                  {service.business.rating && (
                    <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-bold">
                      <Star size={13} fill="currentColor" />
                      <span>{service.business.rating}</span>
                      {service.business.reviewCount && (
                        <span className="font-normal text-amber-700/70">({service.business.reviewCount})</span>
                      )}
                    </div>
                  )}

                  {service.business.city && (
                    <div className="flex items-center gap-1 text-[var(--color-cacao)]/70">
                      <MapPin size={13} />
                      <span>{service.business.city}{service.business.address ? `, ${service.business.address}` : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Precio y Duración destacados */}
              <div className="sm:text-right shrink-0 bg-white sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-[var(--color-dusty-rose)]/70">
                <div className="text-2xl sm:text-3xl font-bold font-['Fraunces',serif] text-[var(--color-pompadour)]">
                  ${service.price.toLocaleString('es-CO')}
                </div>
                <div className="flex sm:justify-end items-center gap-1.5 text-xs text-[var(--color-cacao)]/70 font-medium mt-0.5">
                  <Clock size={13} className="text-[var(--color-pompadour)]" />
                  <span>Duración: {service.durationMinutes} minutos</span>
                </div>
              </div>
            </div>

            {/* Descripción detallada */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-cacao)]/80">
                Descripción del Servicio
              </h2>
              <p className="text-sm leading-relaxed text-[var(--color-cacao)]/85 whitespace-pre-line bg-white/70 p-4 rounded-2xl border border-[var(--color-dusty-rose)]/60">
                {service.description}
              </p>
            </div>

            {/* Garantías y notas breves */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--color-cacao)]/80">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/60 border border-[var(--color-dusty-rose)]/60">
                <Sparkles size={16} className="text-[var(--color-pompadour)] shrink-0" />
                <span>Atención personalizada con materiales e insumos certificados.</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/60 border border-[var(--color-dusty-rose)]/60">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>Confirmación inmediata y recordatorios previos a la cita.</span>
              </div>
            </div>

            {/* Botón de Acción Principal para Reservar */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBookClick}
                className="w-full py-4 px-6 rounded-2xl bg-[var(--color-pompadour)] hover:opacity-90 text-white font-bold text-base tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
              >
                <CalendarCheck2 size={20} />
                Reservar Servicio
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};