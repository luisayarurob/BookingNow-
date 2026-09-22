import { Clock, DollarSign, LogOut, Plus, Scissors, Star } from "lucide-react";
import type { BusinessService } from "../services/apiService.ts";

interface ServiceListProps {
  businessName: string;
  services: BusinessService[];
  onAddService: () => void;
  onLogout?: () => void;
}

function formatPrice(p: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(p);
}

export default function ServiceList({ businessName, services, onAddService, onLogout }: ServiceListProps) {
  return (
    <div className="min-h-screen bg-[#FFDDED]">
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
          <div className="flex items-center gap-3">
            <button
              onClick={onAddService}
              className="flex items-center gap-2 bg-[#F7769B] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#f55d87] active:scale-[0.98] transition-all shadow-md shadow-[#F7769B]/30"
            >
              <Plus size={16} strokeWidth={2.5} />
              Nuevo servicio
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200"
              >
                <LogOut size={16} />
                <span>Cerrar sesión</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
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
              <ServiceCard key={s.idServicio || s.id} service={s} />
            ))}
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

function ServiceCard({ service }: { service: BusinessService }) {
  return (
    <div className="group bg-[#FCF6EF] rounded-2xl border border-[#E6C1C6] overflow-hidden hover:shadow-lg hover:shadow-[#F7769B]/10 hover:-translate-y-1 transition-all duration-200 flex flex-col">
      <div className="relative h-44 bg-[#FFDDED] overflow-hidden">
        {service.imagenReferencia && (
          <img
            src={service.imagenReferencia}
            alt={service.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#493333]/20 to-transparent" />
        {typeof service.rating === "number" && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Star size={11} className="text-[#F7769B] fill-[#F7769B]" />
            <span className="text-xs font-semibold text-[#493333]">{service.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-display text-base font-semibold text-[#493333] leading-snug">{service.nombre}</h3>
        <p className="text-xs text-[#493333]/60 leading-relaxed line-clamp-2">{service.descripcion}</p>

        <div className="mt-auto pt-3 border-t border-[#E6C1C6] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#8D93CB]">
            <Clock size={13} strokeWidth={1.5} />
            <span className="text-xs font-medium text-[#493333]/70">{service.duracionMinutos} min</span>
          </div>
          <div className="flex items-center gap-1 text-[#F7769B]">
            <DollarSign size={13} strokeWidth={2} />
            <span className="text-sm font-bold text-[#493333]">{formatPrice(service.precio)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}