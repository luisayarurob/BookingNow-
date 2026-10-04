import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Tag, 
  Clock, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  X,
  Frown,
  ArrowRight
} from 'lucide-react';
import { ServiceDetail } from '../types/serviceDetail';

interface ServiceSearchScreenProps {
  onSelectService?: (service: ServiceDetail) => void;
}

// Catálogo de prueba para búsqueda y paginación
const MOCK_SERVICES_CATALOG: ServiceDetail[] = [
  {
    id: 'srv-001',
    businessId: 'biz-001',
    name: 'Masaje Relajante con Aceites Esenciales',
    category: 'Spa y Bienestar',
    durationMinutes: 60,
    price: 85000,
    description: 'Terapia corporal completa con aromaterapia para liberar tensión muscular acumulada.',
    images: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80'],
    business: { id: 'biz-001', name: 'Spa Serenity', category: 'Bienestar', rating: 4.9, city: 'El Carmen de Viboral' }
  },
  {
    id: 'srv-002',
    businessId: 'biz-002',
    name: 'Corte de Cabello Clásico y Peinado',
    category: 'Peluquería',
    durationMinutes: 40,
    price: 35000,
    description: 'Corte estilizado adaptado a la forma del rostro con productos de acabado profesional.',
    images: ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'],
    business: { id: 'biz-002', name: 'Barbería Moderna', category: 'Barbería', rating: 4.8, city: 'Marinilla' }
  },
  {
    id: 'srv-003',
    businessId: 'biz-001',
    name: 'Masaje Descontracturante Profundo',
    category: 'Spa y Bienestar',
    durationMinutes: 50,
    price: 95000,
    description: 'Enfocado en espalda, cuello y hombros para contracturas severas.',
    images: ['https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80'],
    business: { id: 'biz-001', name: 'Spa Serenity', category: 'Bienestar', rating: 4.9, city: 'El Carmen de Viboral' }
  },
  {
    id: 'srv-004',
    businessId: 'biz-003',
    name: 'Limpieza Facial Profunda con Hidratación',
    category: 'Cuidado Facial',
    durationMinutes: 75,
    price: 110000,
    description: 'Extracción de impurezas, vapor de ozono, mascarilla de arcilla y velo de colágeno.',
    images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'],
    business: { id: 'biz-003', name: 'Estética Piel de Seda', category: 'Estética', rating: 4.7, city: 'Rionegro' }
  },
  {
    id: 'srv-005',
    businessId: 'biz-002',
    name: 'Perfilado de Barba con Toalla Caliente',
    category: 'Peluquería',
    durationMinutes: 30,
    price: 25000,
    description: 'Delineado preciso con navaja tradicional, tratamiento térmico y loción calmante.',
    images: ['https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80'],
    business: { id: 'biz-002', name: 'Barbería Moderna', category: 'Barbería', rating: 4.8, city: 'Marinilla' }
  },
  {
    id: 'srv-006',
    businessId: 'biz-004',
    name: 'Clase Personalizada de Entrenamiento Funcional',
    category: 'Fitness',
    durationMinutes: 60,
    price: 40000,
    description: 'Sesión uno a uno adaptada a objetivos de fuerza, movilidad y resistencia cardiovascular.',
    images: ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80'],
    business: { id: 'biz-004', name: 'Studio Movimiento Activo', category: 'Fitness', rating: 5.0, city: 'El Carmen de Viboral' }
  },
  {
    id: 'srv-007',
    businessId: 'biz-003',
    name: 'Microdermoabrasión Punta de Diamante',
    category: 'Cuidado Facial',
    durationMinutes: 45,
    price: 130000,
    description: 'Exfoliación mecánica que atenúa manchas superficiales y promueve regeneración celular.',
    images: ['https://images.unsplash.com/photo-1512290900672-1f5be57d5918?auto=format&fit=crop&w=600&q=80'],
    business: { id: 'biz-003', name: 'Estética Piel de Seda', category: 'Estética', rating: 4.7, city: 'Rionegro' }
  }
];

const CATEGORIES = ['TODAS', 'Spa y Bienestar', 'Peluquería', 'Cuidado Facial', 'Fitness'];
const ITEMS_PER_PAGE = 4;

export const ServiceSearchScreen: React.FC<ServiceSearchScreenProps> = ({ onSelectService }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [currentPage, setCurrentPage] = useState(1);

  // Normalizador para ignorar tildes y mayúsculas
  const normalize = (text: string) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // Filtrado reactivo combinado: Nombre Y Tipo
  const filteredServices = useMemo(() => {
    return MOCK_SERVICES_CATALOG.filter((srv) => {
      const matchesName = normalize(srv.name).includes(normalize(searchTerm.trim()));
      const matchesCategory = selectedCategory === 'TODAS' || srv.category === selectedCategory;
      return matchesName && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Cálculos de Paginación
  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1); // Reiniciar a la página 1 en cada búsqueda
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('TODAS');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[var(--color-mimi-pink)]/40 p-4 md:p-8 font-['DM_Sans',sans-serif] text-[var(--color-cacao)]">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Encabezado */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-['Fraunces',serif] text-[var(--color-cacao)]">
            Explorar Servicios
          </h1>
          <p className="text-sm text-[var(--color-cacao)]/75 mt-1">
            Encuentra y agenda citas en los mejores negocios y profesionales de tu zona.
          </p>
        </div>

        {/* Contenedor de Búsqueda y Filtros */}
        <div className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
          
          <div className="flex flex-col md:flex-row gap-3">
            {/* Input de Búsqueda por Nombre */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-cacao)]/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder='Buscar por nombre (ej. "masaje", "corte", "limpieza")...'
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-[var(--color-dusty-rose)] text-sm focus:outline-none focus:border-[var(--color-pompadour)] focus:ring-2 focus:ring-[var(--color-pompadour)]/20 transition-all placeholder:text-[var(--color-cacao)]/40"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-cacao)]/50 hover:text-[var(--color-cacao)] cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Contador de resultados */}
            <div className="flex items-center justify-between md:justify-end gap-2 px-3 py-2 text-xs font-semibold text-[var(--color-cacao)]/80">
              <SlidersHorizontal size={14} className="text-[var(--color-pompadour)]" />
              <span>{filteredServices.length} {filteredServices.length === 1 ? 'servicio encontrado' : 'servicios encontrados'}</span>
            </div>
          </div>

          {/* Chips de Categorías (Búsqueda por tipo) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-cacao)]/60 shrink-0 mr-1">
              Categoría:
            </span>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--color-pompadour)] text-white shadow-2xs scale-[1.02]'
                      : 'bg-white text-[var(--color-cacao)]/80 border border-[var(--color-dusty-rose)] hover:bg-[var(--color-mimi-pink)]/30'
                  }`}
                >
                  {cat === 'TODAS' ? 'Todas las categorías' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Estado: Sin Resultados */}
        {filteredServices.length === 0 ? (
          <div className="bg-[var(--color-cream)] border border-dashed border-[var(--color-dusty-rose)] rounded-3xl p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[var(--color-mimi-pink)]/60 flex items-center justify-center mx-auto text-[var(--color-pompadour)]">
              <Frown size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg font-['Fraunces',serif] text-[var(--color-cacao)]">
                No se encontraron servicios
              </h3>
              <p className="text-xs text-[var(--color-cacao)]/70 max-w-md mx-auto">
                No encontramos coincidencias para "{searchTerm}" {selectedCategory !== 'TODAS' ? `en la categoría ${selectedCategory}` : ''}. Intenta con otras palabras o limpia los filtros.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-pompadour)] text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-all shadow-xs"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          /* Grid de Resultados */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {paginatedServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => onSelectService && onSelectService(service)}
                  className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-4.5 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Imagen y badges */}
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-stone-100">
                      <img
                        src={service.images[0]}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold bg-white/90 text-[var(--color-cacao)] backdrop-blur-xs shadow-2xs uppercase tracking-wider">
                        {service.category}
                      </span>
                    </div>

                    {/* Información del servicio */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-cacao)]/70 font-medium">
                        <Building2 size={13} className="text-[var(--color-pompadour)]" />
                        <span>{service.business.name}</span>
                        {service.business.city && <span>• {service.business.city}</span>}
                      </div>

                      <h3 className="font-bold text-lg font-['Fraunces',serif] text-[var(--color-cacao)] group-hover:text-[var(--color-pompadour)] transition-colors leading-snug">
                        {service.name}
                      </h3>

                      <p className="text-xs text-[var(--color-cacao)]/75 line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Pie de tarjeta: Precio, Duración y Botón */}
                  <div className="mt-4 pt-3.5 border-t border-[var(--color-dusty-rose)]/60 flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold font-['Fraunces',serif] text-[var(--color-pompadour)]">
                        ${service.price.toLocaleString('es-CO')}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[var(--color-cacao)]/70 font-medium">
                        <Clock size={11} />
                        <span>{service.durationMinutes} min</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-pompadour)] group-hover:translate-x-1 transition-transform">
                      Ver detalle <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] text-[var(--color-cacao)] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] text-xs font-bold text-[var(--color-cacao)]">
                  <span>Página {currentPage} de {totalPages}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] text-[var(--color-cacao)] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};