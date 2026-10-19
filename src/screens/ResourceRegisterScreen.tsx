import React, { useState, useEffect } from 'react';
import { 
  Package, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Boxes, 
  Layers, 
  Clock,
  Loader2
} from 'lucide-react';
import { registrarRecurso, listarRecursos, Recurso, ServiceApiError } from '../services/apiService';

interface ResourceRegisterProps {
  businessName?: string;
  onResourceCreated?: (newResource: Recurso) => void;
}

export const ResourceRegister: React.FC<ResourceRegisterProps> = ({
  businessName = 'Mi Negocio Principal',
  onResourceCreated
}) => {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState<number | string>(1);
  const [estado, setEstado] = useState('DISPONIBLE');
  const [descripcion, setDescripcion] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingList, setFetchingList] = useState(false);

  const [resourcesList, setResourcesList] = useState<Recurso[]>([]);

  // 1. Cargar recursos reales del backend
  const cargarRecursos = async () => {
    const token = localStorage.getItem('token');
    const businessId = Number(localStorage.getItem('idNegocio'));

    if (!token || !businessId) return;

    try {
      setFetchingList(true);
      const data = await listarRecursos(businessId, token);
      setResourcesList(data);
    } catch (err) {
      console.error('Error al listar recursos:', err);
    } finally {
      setFetchingList(false);
    }
  };

  useEffect(() => {
    cargarRecursos();
  }, []);

  // 2. Validaciones locales de formulario
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre del recurso es obligatorio.';
    } else if (nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres.';
    }

    const qty = Number(cantidad);
    if (cantidad === '' || isNaN(qty)) {
      newErrors.cantidad = 'Ingresa una cantidad válida.';
    } else if (qty <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0 (no se permiten números negativos ni cero).';
    }

    if (!estado) {
      newErrors.estado = 'Selecciona el estado actual del recurso.';
    }

    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 3. Enviar al backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setServerError(null);

    if (!validate()) return;

    const token = localStorage.getItem('token');
    const businessId = Number(localStorage.getItem('idNegocio'));

    if (!token) {
      setServerError('Tu sesión ha expirado o no estás autenticado.');
      return;
    }

    if (!businessId || isNaN(businessId)) {
      setServerError('No se encontró el identificador del negocio.');
      return;
    }

    try {
      setLoading(true);
      const nuevo = await registrarRecurso(
        businessId,
        {
          nombre: nombre.trim(),
          cantidad: Number(cantidad),
          estado,
          descripcion: descripcion.trim(),
        },
        token
      );

      setSuccessMessage(`¡Recurso "${nombre.trim()}" registrado exitosamente!`);
      if (onResourceCreated) onResourceCreated(nuevo as Recurso);

      setNombre('');
      setCantidad(1);
      setEstado('DISPONIBLE');
      setDescripcion('');
      setErrors({});

      await cargarRecursos();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      if (err instanceof ServiceApiError && err.fields) {
        setErrors(err.fields);
      } else {
        setServerError(err.message || 'Error al conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DISPONIBLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Disponible
          </span>
        );
      case 'MANTENIMIENTO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            En Mantenimiento
          </span>
        );
      case 'NO_DISPONIBLE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            No Disponible
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-mimi-pink)]/40 p-4 md:p-8 font-['DM_Sans',sans-serif] text-[var(--color-cacao)]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-dusty-rose)] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] text-xs font-medium text-[var(--color-cacao)] mb-2 shadow-xs">
              <Boxes size={14} className="text-[var(--color-pompadour)]" />
              Negocio: <span className="font-bold">{businessName}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-['Fraunces',serif] text-[var(--color-cacao)]">
              Registrar Recurso
            </h1>
            <p className="text-sm text-[var(--color-cacao)]/75 mt-1">
              Gestiona equipos, salas y materiales requeridos para la ejecución de tus servicios.
            </p>
          </div>
        </div>

        {/* Alerta de error backend */}
        {serverError && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm shadow-sm">
            <AlertCircle size={20} className="text-rose-600 shrink-0" />
            <p className="font-medium">{serverError}</p>
          </div>
        )}

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm shadow-sm">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Formulario */}
          <div className="lg:col-span-6 bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2.5 rounded-xl bg-[var(--color-pompadour)] text-white shadow-xs">
                <Package size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold font-['Fraunces',serif]">Nuevo Recurso</h2>
                <p className="text-xs text-[var(--color-cacao)]/70">Completa todos los campos obligatorios (*)</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              
              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--color-cacao)]">
                  Nombre del recurso <span className="text-[var(--color-pompadour)]">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: '' }));
                  }}
                  placeholder="Ej. Camilla ergonómica, Silla de corte..."
                  className={`w-full px-4 py-2.5 rounded-xl bg-white border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.nombre 
                      ? 'border-rose-400 focus:ring-rose-200' 
                      : 'border-[var(--color-dusty-rose)] focus:border-[var(--color-pompadour)] focus:ring-[var(--color-pompadour)]/20'
                  }`}
                />
                {errors.nombre && (
                  <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                    <AlertCircle size={13} /> {errors.nombre}
                  </p>
                )}
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--color-cacao)]">
                  Cantidad disponible <span className="text-[var(--color-pompadour)]">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => {
                    setCantidad(e.target.value === '' ? '' : Number(e.target.value));
                    if (errors.cantidad) setErrors((prev) => ({ ...prev, cantidad: '' }));
                  }}
                  placeholder="1"
                  className={`w-full px-4 py-2.5 rounded-xl bg-white border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.cantidad 
                      ? 'border-rose-400 focus:ring-rose-200' 
                      : 'border-[var(--color-dusty-rose)] focus:border-[var(--color-pompadour)] focus:ring-[var(--color-pompadour)]/20'
                  }`}
                />
                {errors.cantidad && (
                  <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                    <AlertCircle size={13} /> {errors.cantidad}
                  </p>
                )}
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--color-cacao)]">
                  Estado actual <span className="text-[var(--color-pompadour)]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['DISPONIBLE', 'MANTENIMIENTO', 'NO_DISPONIBLE'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setEstado(item)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                        estado === item
                          ? 'bg-[var(--color-pompadour)] text-white border-[var(--color-pompadour)] shadow-xs scale-[1.02]'
                          : 'bg-white text-[var(--color-cacao)]/80 border-[var(--color-dusty-rose)] hover:bg-[var(--color-mimi-pink)]/30'
                      }`}
                    >
                      {item === 'DISPONIBLE' && 'Disponible'}
                      {item === 'MANTENIMIENTO' && 'Mantenimiento'}
                      {item === 'NO_DISPONIBLE' && 'Inactivo'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--color-cacao)]">
                  Descripción / Observaciones <span className="text-[var(--color-pompadour)]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => {
                    setDescripcion(e.target.value);
                    if (errors.descripcion) setErrors((prev) => ({ ...prev, descripcion: '' }));
                  }}
                  placeholder="Detalles sobre marca, cuidados, ubicación..."
                  className={`w-full px-4 py-2.5 rounded-xl bg-white border text-sm transition-all focus:outline-none focus:ring-2 resize-none ${
                    errors.descripcion 
                      ? 'border-rose-400 focus:ring-rose-200' 
                      : 'border-[var(--color-dusty-rose)] focus:border-[var(--color-pompadour)] focus:ring-[var(--color-pompadour)]/20'
                  }`}
                />
                {errors.descripcion && (
                  <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                    <AlertCircle size={13} /> {errors.descripcion}
                  </p>
                )}
              </div>

              {/* Botón Guardar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-2xl bg-[var(--color-pompadour)] hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                {loading ? 'Guardando...' : 'Guardar Recurso'}
              </button>
            </form>
          </div>

          {/* Listado de Recursos */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={20} className="text-[var(--color-pompadour)]" />
                <h2 className="text-xl font-bold font-['Fraunces',serif]">
                  Recursos del Negocio ({resourcesList.length})
                </h2>
              </div>
              {fetchingList && <Loader2 size={16} className="animate-spin text-[var(--color-pompadour)]" />}
            </div>

            {resourcesList.length === 0 && !fetchingList ? (
              <div className="bg-[var(--color-cream)] border border-dashed border-[var(--color-dusty-rose)] rounded-3xl p-8 text-center text-[var(--color-cacao)]/60 space-y-2">
                <Package size={36} className="mx-auto text-[var(--color-dusty-rose)]" />
                <p className="font-medium text-sm">Aún no hay recursos dados de alta</p>
                <p className="text-xs">Usa el formulario para añadir el primero.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {resourcesList.map((res, index) => (
                  <div
                    key={res.id || res.idRecurso || index}
                    className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-2xl p-4.5 hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-[var(--color-cacao)]">
                          {res.nombre}
                        </h3>
                        {res.descripcion && (
                          <p className="text-xs text-[var(--color-cacao)]/80 line-clamp-2">
                            {res.descripcion}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        {getStatusBadge(res.estado)}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--color-dusty-rose)]/60 flex items-center justify-between text-xs text-[var(--color-cacao)]/75">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Boxes size={14} className="text-[var(--color-pompadour)]" />
                        <span>Cantidad: <strong className="text-[var(--color-cacao)]">{res.cantidad}</strong></span>
                      </div>
                      {res.fechaCreacion && (
                        <div className="flex items-center gap-1 text-[11px] text-[var(--color-cacao)]/60">
                          <Clock size={12} />
                          <span>{res.fechaCreacion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};