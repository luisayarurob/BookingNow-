import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarCheck2,
  Clock,
  MapPin,
  Search,
  Scissors,
  Sparkles,
  Star,
} from "lucide-react";

type HomeService = {
  id: number;
  businessName: string;
  serviceName: string;
  category: string;
  description: string;
  location: string;
  duration: number;
  price: number;
  rating: number;
  image: string;
};

const CATEGORY_OPTIONS = [
  "Todas",
  "Belleza",
  "Spa",
  "Peluquería",
  "Uñas",
  "Masajes",
  "Depilación",
];

const SERVICES: HomeService[] = [
  {
    id: 1,
    businessName: "Studio Belleza Rosa",
    serviceName: "Manicura semipermanente",
    category: "Belleza",
    description: "Limpieza, cutícula y diseño para lucir uñas impecables con acabados modernos.",
    location: "Centro, Bogotá",
    duration: 60,
    price: 85000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    businessName: "Luna Spa Studio",
    serviceName: "Masaje relajante",
    category: "Spa",
    description: "Tratamiento de cuerpo completo pensado para aliviar tensión y recuperar paz mental.",
    location: "Chapinero, Bogotá",
    duration: 90,
    price: 140000,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    businessName: "Velvet Hair House",
    serviceName: "Corte y peinado premium",
    category: "Peluquería",
    description: "Cambio de look con corte personalizado, lavado y styling profesional para cada rostro.",
    location: "Usaquén, Bogotá",
    duration: 75,
    price: 120000,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    businessName: "Nail Art Atelier",
    serviceName: "Diseño de uñas con gel",
    category: "Uñas",
    description: "Diseños personalizados con gran variedad de tonos, brillo y acabados premium.",
    location: "Suba, Bogotá",
    duration: 50,
    price: 70000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    businessName: "Blush & Glow",
    serviceName: "Maquillaje para eventos",
    category: "Belleza",
    description: "Maquillaje de larga duración ideal para bodas, reuniones, fotos o celebraciones especiales.",
    location: "Teusaquillo, Bogotá",
    duration: 70,
    price: 160000,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    businessName: "Aura Wellness",
    serviceName: "Depilación con cera",
    category: "Depilación",
    description: "Procedimiento cómodo y seguro para piel suave, con cuidado profesional y atención personal.",
    location: "Engativá, Bogotá",
    duration: 45,
    price: 60000,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
  },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");

  const filteredServices = useMemo(() => {
    return SERVICES.filter((service) => {
      const matchesCategory = activeCategory === "Todas" || service.category === activeCategory;
      const matchesSearch =
        service.serviceName.toLowerCase().includes(search.toLowerCase()) ||
        service.businessName.toLowerCase().includes(search.toLowerCase()) ||
        service.location.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <div className="min-h-screen bg-[#FFDDED]">
      <header className="sticky top-0 z-10 border-b border-[#E6C1C6] bg-[#FCF6EF]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F7769B]/15">
              <Scissors className="text-[#F7769B]" size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8D93CB]">BookingNow</p>
              <p className="font-display text-xl font-semibold text-[#493333]">Descubre belleza</p>
            </div>
          </div>

          <button className="rounded-xl bg-[#F7769B] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#F7769B]/30 transition hover:bg-[#f55d87]">
            Mi agenda
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 lg:py-10">
        <section className="overflow-hidden rounded-[32px] border border-[#E6C1C6] bg-[#FCF6EF] shadow-[0_20px_60px_rgba(73,51,51,0.08)]">
          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.3fr_0.7fr] lg:p-10">
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#F7C9D7] bg-[#FFDDED] px-3 py-1.5 text-xs font-semibold text-[#493333]">
                <Sparkles size={13} className="text-[#F7769B]" />
                Servicios de belleza y bienestar
              </div>

              <h1 className="font-display text-4xl leading-tight text-[#493333] md:text-5xl">
                Reserva momentos que te hagan sentir bien.
              </h1>

              <p className="mt-4 max-w-xl text-base text-[#493333]/70">
                Encuentra tratamientos, cortes, masajes y belleza de calidad en negocios cercanos a ti.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8D93CB]" size={18} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Busca un servicio o negocio"
                    className="w-full rounded-2xl border border-[#E6C1C6] bg-white/60 py-3 pl-11 pr-4 text-sm text-[#493333] outline-none placeholder:text-[#8D93CB] focus:border-[#F7769B] focus:ring-2 focus:ring-[#F7769B]/25"
                  />
                </div>
                <button className="flex items-center justify-center gap-2 rounded-2xl bg-[#F7769B] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#F7769B]/30 transition hover:bg-[#f55d87]">
                  Explorar
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      activeCategory === category
                        ? "bg-[#F7769B] text-white shadow-sm"
                        : "border border-[#E6C1C6] bg-white/50 text-[#493333]/70 hover:border-[#F7769B] hover:text-[#F7769B]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-sm rounded-[28px] border border-[#E6C1C6] bg-gradient-to-br from-[#FFDDED] via-[#FCF6EF] to-[#FCE8EE] p-5 shadow-inner">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8D93CB]">Hoy</span>
                  <span className="rounded-full bg-[#F7769B]/10 px-2 py-1 text-[10px] font-semibold text-[#F7769B]">Top picks</span>
                </div>

                <div className="space-y-4">
                  {SERVICES.slice(0, 3).map((service) => (
                    <div key={service.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 shadow-sm">
                      <img src={service.image} alt={service.serviceName} className="h-16 w-16 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#493333]">{service.serviceName}</p>
                        <p className="truncate text-[11px] text-[#493333]/60">{service.businessName}</p>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-[#493333]/70">
                          <span className="flex items-center gap-1">
                            <Star size={10} className="fill-[#F7769B] text-[#F7769B]" />
                            {service.rating}
                          </span>
                          <span>{formatPrice(service.price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-[#493333] p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">Reservas</p>
                      <p className="mt-1 text-2xl font-semibold">2.4k</p>
                    </div>
                    <CalendarCheck2 className="text-[#FFDDED]" size={30} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8D93CB]">Explora</p>
              <h2 className="font-display text-3xl text-[#493333]">Servicios destacados</h2>
            </div>
            <p className="text-sm text-[#493333]/60">{filteredServices.length} opciones disponibles</p>
          </div>

          {filteredServices.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#E6C1C6] bg-[#FCF6EF] px-6 py-12 text-center">
              <p className="font-display text-2xl text-[#493333]">No encontramos coincidencias</p>
              <p className="mt-2 text-sm text-[#493333]/60">Prueba con otro término o cambia la categoría.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredServices.map((service) => (
                <article key={service.id} className="group overflow-hidden rounded-[28px] border border-[#E6C1C6] bg-[#FCF6EF] shadow-[0_16px_40px_rgba(73,51,51,0.05)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(247,118,155,0.12)]">
                  <div className="relative h-52 overflow-hidden">
                    <img src={service.image} alt={service.serviceName} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#493333]/30 via-transparent to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#493333] backdrop-blur-sm">
                      {service.category}
                    </div>
                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-xs font-semibold text-[#493333] backdrop-blur-sm">
                      <Star size={11} className="fill-[#F7769B] text-[#F7769B]" />
                      {service.rating}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold uppercase tracking-[0.15em] text-[#8D93CB]">{service.businessName}</p>
                        <h3 className="mt-1 font-display text-2xl text-[#493333]">{service.serviceName}</h3>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-[#493333]/65">{service.description}</p>

                    <div className="mt-4 flex items-center gap-2 text-sm text-[#493333]/70">
                      <MapPin size={14} className="text-[#F7769B]" />
                      <span>{service.location}</span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#E6C1C6] pt-4">
                      <div className="flex items-center gap-1.5 text-[#493333]/70">
                        <Clock size={14} className="text-[#8D93CB]" />
                        <span className="text-sm">{service.duration} min</span>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#8D93CB]">Desde</p>
                        <p className="text-lg font-bold text-[#493333]">{formatPrice(service.price)}</p>
                      </div>
                    </div>

                    <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F7769B] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#F7769B]/30 transition hover:bg-[#f55d87]">
                      Ver detalles
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
