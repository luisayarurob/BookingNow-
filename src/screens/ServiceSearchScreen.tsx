import React, { useEffect, useState } from 'react';
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
  ArrowRight,
  LoaderCircle
} from 'lucide-react';
import { ServiceDetail } from '../types/serviceDetail';
import { buscarServicios, type BusinessService } from '../services/apiService';
import { CATEGORIAS_SERVICIO } from '../config/categorias';

interface ServiceSearchScreenProps {
  onSelectService?: (service: ServiceDetail) => void;
}

const ITEMS_PER_PAGE = 20;

function mapService(service: BusinessService): ServiceDetail {
  const businessId = String(service.idNegocio ?? '');
  const id = String(service.idServicio ?? service.id ?? '');
  const category = service.tipoServicio || 'Servicio';

  return {
    id,
    businessId,
    name: service.nombre || 'Servicio sin nombre',
    category,
    durationMinutes: service.duracionMinutos || 0,
    price: service.precio || 0,
    description: service.descripcion || 'Sin descripción disponible.',
    images: [],
    business: {
      id: businessId,
      name: `Negocio #${businessId || 'sin identificar'}`,
      category,
    },
  };
}

export const ServiceSearchScreen: React.FC<ServiceSearchScreenProps> = ({ onSelectService }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState<ServiceDetail[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    setIsLoading(true);
    setError(null);
    buscarServicios({
      nombre: searchTerm,
      tipo: selectedCategory === 'TODAS' ? undefined : selectedCategory,
      pagina: currentPage - 1,
      tamano: ITEMS_PER_PAGE,
    })
      .then((page) => {
        if (!isCurrentRequest) return;
        setServices((page.contenido || []).map(mapService));
        setTotalElements(page.totalElementos);
        setTotalPages(Math.max(page.totalPaginas, 1));
      })
      .catch((requestError: unknown) => {
        if (!isCurrentRequest) return;
        setServices([]);
        setTotalElements(0);
        setTotalPages(1);
        setError(requestError instanceof Error ? requestError.message : 'No fue posible cargar los servicios.');
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [searchTerm, selectedCategory, currentPage, retryCount]);

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

        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Menú lateral de categorías */}
          <aside className="w-full md:w-56 shrink-0 bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-4 shadow-xs">
            <div className="flex flex-col items-stretch gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-cacao)]/60 mb-1">
                Categoría:
              </span>
              {['TODAS', ...CATEGORIAS_SERVICIO].map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--color-pompadour)] text-white shadow-2xs'
                        : 'bg-white text-[var(--color-cacao)]/80 border border-[var(--color-dusty-rose)] hover:bg-[var(--color-mimi-pink)]/30'
                    }`}
                  >
                    {cat === 'TODAS' ? 'Todas las categorías' : cat}
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="min-w-0 flex-1 w-full space-y-6">
            {/* Contenedor de búsqueda */}
            <div className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-5 md:p-6 shadow-xs">
          
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
              <span>{totalElements} {totalElements === 1 ? 'servicio encontrado' : 'servicios encontrados'}</span>
            </div>
          </div>

            </div>

        {/* Estado: Sin Resultados */}
        {isLoading ? (
          <div className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-12 text-center text-[var(--color-pompadour)]">
            <LoaderCircle size={30} className="mx-auto animate-spin" />
            <p className="text-sm text-[var(--color-cacao)]/70 mt-3">Cargando servicios...</p>
          </div>
        ) : error ? (
          <div className="bg-[var(--color-cream)] border border-dashed border-[var(--color-dusty-rose)] rounded-3xl p-12 text-center space-y-4">
            <h3 className="font-bold text-lg font-['Fraunces',serif] text-[var(--color-cacao)]">No fue posible cargar los servicios</h3>
            <p className="text-xs text-[var(--color-cacao)]/70">{error}</p>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-pompadour)] text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-all shadow-xs">
              Reintentar
            </button>
          </div>
        ) : services.length === 0 ? (
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
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => onSelectService && onSelectService(service)}
                  className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-4.5 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Imagen y badges */}
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-stone-100">
                      {service.images[0] ? (
                        <img
                          src={service.images[0]}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-pompadour)]">
                          <Tag size={42} strokeWidth={1.5} />
                        </div>
                      )}
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
          </main>
        </div>

      </div>
    </div>
  );
};