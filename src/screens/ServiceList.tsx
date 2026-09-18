import { useState } from "react";
import { Clock, DollarSign, Plus, Scissors, Star } from "lucide-react";

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  image: string;
  rating: number;
}

interface ServiceListProps {
  businessName: string;
  onAddService: () => void;
}

const DEMO_SERVICES: Service[] = [
  {
    id: 1,
    name: "Manicura semipermanente",
    description: "Esmaltado de larga duración con acabado impecable. Incluye limpieza, forma y gelificación UV.",
    duration: 60,
    price: 75000,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop&auto=format",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Pedicura relajante",
    description: "Baño de pies, exfoliación, hidratación profunda y esmaltado a tu elección.",
    duration: 75,
    price: 65000,
    image: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=600&h=400&fit=crop&auto=format",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Depilación facial con hilo",
    description: "Técnica precisa y suave para cejas perfectas, bigote y zona perimetral.",
    duration: 30,
    price: 35000,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop&auto=format",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Maquillaje social",
    description: "Maquillaje profesional para ocasiones especiales. Incluye base, corrector, sombras y labios.",
    duration: 90,
    price: 120000,
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop&auto=format",
    rating: 5.0,
  },
];

function formatPrice(p: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(p);
}

export default function ServiceList({ businessName, onAddService }: ServiceListProps) {
  const [services] = useState<Service[]>(DEMO_SERVICES);

  return (
    <div className="min-h-screen bg-[#FFDDED]">
      {/* Header */}
      <header className="bg-[#FCF6EF] border-b border-[#E6C1C6] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F7769B]/15 flex items-center justify-center">
              <Scissors className="text-[#F7769B]" size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-[#493333]/50 font-medium">Catálogo de servicios</p>
              <h2 className="font-display text-lg font-semibold text-[#493333] leading-tight">{businessName}</h2>
            </div>
          </div>
          <button
            onClick={onAddService}
            className="flex items-center gap-2 bg-[#F7769B] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#f55d87] active:scale-[0.98] transition-all shadow-md shadow-[#F7769B]/30"
          >
            <Plus size={16} strokeWidth={2.5} />
            Nuevo servicio
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero line */}
        <div className="mb-10">
          <h1 className="font-display text-5xl font-semibold text-[#493333] leading-tight">
            Tus servicios
          </h1>
          <p className="text-[#493333]/60 mt-2">
            {services.length} {services.length === 1 ? "servicio disponible" : "servicios disponibles"}
          </p>
        </div>

        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#FCF6EF] border border-[#E6C1C6] flex items-center justify-center">
              <Scissors className="text-[#8D93CB]" size={36} strokeWidth={1} />
            </div>
            <p className="font-display text-xl text-[#493333]">Aún no tienes servicios</p>
            <p className="text-sm text-[#493333]/50 max-w-xs">Agrega tu primer servicio para que tus clientes puedan reservar contigo.</p>
            <button
              onClick={onAddService}
              className="mt-2 bg-[#F7769B] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#f55d87] transition-colors"
            >
              Agregar servicio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {services.map(s => (
              <ServiceCard key={s.id} service={s} />
            ))}
            {/* Add card */}
            <button
              onClick={onAddService}
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#E6C1C6] min-h-[280px] hover:border-[#F7769B] hover:bg-[#FCF6EF] transition-all text-[#8D93CB] hover:text-[#F7769B]"
            >
              <div className="w-12 h-12 rounded-xl bg-current/10 flex items-center justify-center transition-transform group-hover:scale-110">
                <Plus size={24} strokeWidth={1.5} />
              </div>
              <span className="text-sm font-semibold">Agregar servicio</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="group bg-[#FCF6EF] rounded-2xl border border-[#E6C1C6] overflow-hidden hover:shadow-lg hover:shadow-[#F7769B]/10 hover:-translate-y-1 transition-all duration-200 flex flex-col">
      <div className="relative h-44 bg-[#FFDDED] overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#493333]/20 to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
          <Star size={11} className="text-[#F7769B] fill-[#F7769B]" />
          <span className="text-xs font-semibold text-[#493333]">{service.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-display text-base font-semibold text-[#493333] leading-snug">{service.name}</h3>
        <p className="text-xs text-[#493333]/60 leading-relaxed line-clamp-2">{service.description}</p>

        <div className="mt-auto pt-3 border-t border-[#E6C1C6] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#8D93CB]">
            <Clock size={13} strokeWidth={1.5} />
            <span className="text-xs font-medium text-[#493333]/70">{service.duration} min</span>
          </div>
          <div className="flex items-center gap-1 text-[#F7769B]">
            <DollarSign size={13} strokeWidth={2} />
            <span className="text-sm font-bold text-[#493333]">{formatPrice(service.price)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
