import { Clock, DollarSign, Plus, Scissors, Star } from "lucide-react";
import type { BusinessWithServices } from "../App";
import type { BusinessService } from "../services/apiService.ts";

interface ServiceListProps {
  businesses: BusinessWithServices[];
  onAddService: (businessId: number, businessName: string) => void;
}

function formatPrice(p: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(p);
}

export default function ServiceList({ businesses, onAddService }: ServiceListProps) {
  const serviceCount = businesses.reduce((total, business) => total + business.services.length, 0);

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
              <h2 className="font-display text-lg font-semibold text-[#493333] leading-tight">Mis negocios</h2>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="font-display text-5xl font-semibold text-[#493333] leading-tight">
            Mis negocios
          </h1>
          <p className="text-[#493333]/60 mt-2">
            {businesses.length} {businesses.length === 1 ? "negocio" : "negocios"} · {serviceCount} {serviceCount === 1 ? "servicio" : "servicios"}
          </p>
        </div>

        {businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#FCF6EF] border border-[#E6C1C6] flex items-center justify-center">
              <Scissors className="text-[#8D93CB]" size={36} strokeWidth={1} />
            </div>
            <p className="font-display text-xl text-[#493333]">Aún no tienes negocios</p>
            <p className="text-sm text-[#493333]/50 max-w-xs">Registra un negocio para comenzar a ofrecer tus servicios.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {businesses.map((business, index) => {
              const businessId = business.idNegocio || business.id;
              if (!businessId) return null;

              return (
                <section key={businessId}>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8D93CB]">Negocio {index + 1}</p>
                      <h2 className="font-display text-2xl font-semibold text-[#493333]">{business.nombre || "Sin nombre"}</h2>
                    </div>
                    <button
                      onClick={() => onAddService(businessId, business.nombre || "Mi negocio")}
                      className="flex shrink-0 items-center gap-2 rounded-xl bg-[#F7769B] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#F7769B]/30 transition-all hover:bg-[#f55d87]"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                      Nuevo servicio
                    </button>
                  </div>

                  {business.services.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#E6C1C6] bg-[#FCF6EF]/60 px-6 py-10 text-center">
                      <p className="text-sm text-[#493333]/55">Este negocio aún no tiene servicios.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {business.services.map(service => (
                        <ServiceCard key={service.idServicio || service.id} service={service} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
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