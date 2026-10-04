import React, { useState } from 'react';
import { 
  Package, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Boxes, 
  Layers, 
  Activity, 
  FileText,
  Clock
} from 'lucide-react';
import { Resource, ResourceFormData, ResourceStatus, ResourceType } from '../types/resource';

interface ResourceRegisterProps {
  businessId?: string;
  businessName?: string;
  onResourceCreated?: (newResource: Resource) => void;
}

export const ResourceRegister: React.FC<ResourceRegisterProps> = ({
  businessId = 'biz-001',
  businessName = 'Mi Negocio Principal',
  onResourceCreated
}) => {
  // Estado del formulario
  const [formData, setFormData] = useState<ResourceFormData>({
    name: '',
    type: 'EQUIPO',
    quantity: 1,
    status: 'DISPONIBLE',
    description: ''
  });

  // Errores de validación
  const [errors, setErrors] = useState<Partial<Record<keyof ResourceFormData, string>>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Lista local para visualización inmediata (mockeada/estado local)
  const [resourcesList, setResourcesList] = useState<Resource[]>([
    {
      id: 'res-1',
      businessId,
      name: 'Camilla Masajes Ergonómica',
      type: 'MOBILIARIO',
      quantity: 2,
      status: 'DISPONIBLE',
      description: 'Camilla hidráulica para cabina 1',
      createdAt: '2026-10-04'
    }
  ]);

  // Validaciones según Criterios de Aceptación
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ResourceFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del recurso es obligatorio.';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!formData.type) {
      newErrors.type = 'Selecciona el tipo de recurso.';
    }

    if (formData.quantity === '' || isNaN(Number(formData.quantity))) {
      newErrors.quantity = 'Ingresa una cantidad válida.';
    } else if (Number(formData.quantity) <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0 (no se permiten números negativos ni cero).';
    }

    if (!formData.status) {
      newErrors.status = 'Selecciona el estado actual del recurso.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? (value === '' ? '' : Number(value)) : value
    }));

    // Limpia error al tipear
    if (errors[name as keyof ResourceFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validate()) return;

    const newResource: Resource = {
      id: `res-${Date.now()}`,
      businessId,
      name: formData.name.trim(),
      type: formData.type,
      quantity: Number(formData.quantity),
      status: formData.status,
      description: formData.description.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Actualiza lista en Front-End y notifica padre
    setResourcesList(prev => [newResource, ...prev]);
    if (onResourceCreated) onResourceCreated(newResource);

    // Feedback y reset
    setSuccessMessage(`¡Recurso "${newResource.name}" registrado exitosamente!`);
    setFormData({
      name: '',
      type: 'EQUIPO',
      quantity: 1,
      status: 'DISPONIBLE',
      description: ''
    });

    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const getStatusBadge = (status: ResourceStatus) => {
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

        {/* Mensaje de éxito global */}
        {successMessage && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm shadow-sm animate-in fade-in slide-in-from-top-2">
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
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej. Silla de corte ergonómica, Camilla #2"
                    className={`w-full px-4 py-2.5 rounded-xl bg-white border text-sm transition-all focus:outline-none focus:ring-2 ${
                      errors.name 
                        ? 'border-rose-400 focus:ring-rose-200' 
                        : 'border-[var(--color-dusty-rose)] focus:border-[var(--color-pompadour)] focus:ring-[var(--color-pompadour)]/20'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                    <AlertCircle size={13} /> {errors.name}
                  </p>
                )}
              </div>

              {/* Tipo y Cantidad (Grid 2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Tipo de recurso */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--color-cacao)]">
                    Tipo de recurso <span className="text-[var(--color-pompadour)]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[var(--color-dusty-rose)] text-sm focus:outline-none focus:border-[var(--color-pompadour)] focus:ring-2 focus:ring-[var(--color-pompadour)]/20"
                    >
                      <option value="EQUIPO">Equipo / Máquina</option>
                      <option value="MOBILIARIO">Mobiliario / Camilla / Silla</option>
                      <option value="SALA">Sala / Cabina privada</option>
                      <option value="HERRAMIENTA">Kit / Herramientas</option>
                      <option value="OTRO">Otro insumo</option>
                    </select>
                  </div>
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--color-cacao)]">
                    Cantidad disponible <span className="text-[var(--color-pompadour)]">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="1"
                    className={`w-full px-4 py-2.5 rounded-xl bg-white border text-sm transition-all focus:outline-none focus:ring-2 ${
                      errors.quantity 
                        ? 'border-rose-400 focus:ring-rose-200' 
                        : 'border-[var(--color-dusty-rose)] focus:border-[var(--color-pompadour)] focus:ring-[var(--color-pompadour)]/20'
                    }`}
                  />
                  {errors.quantity && (
                    <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                      <AlertCircle size={13} /> {errors.quantity}
                    </p>
                  )}
                </div>
              </div>

              {/* Estado del recurso */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--color-cacao)]">
                  Estado actual <span className="text-[var(--color-pompadour)]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['DISPONIBLE', 'MANTENIMIENTO', 'NO_DISPONIBLE'] as ResourceStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status }))}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                        formData.status === status
                          ? 'bg-[var(--color-pompadour)] text-white border-[var(--color-pompadour)] shadow-xs scale-[1.02]'
                          : 'bg-white text-[var(--color-cacao)]/80 border-[var(--color-dusty-rose)] hover:bg-[var(--color-mimi-pink)]/30'
                      }`}
                    >
                      {status === 'DISPONIBLE' && 'Disponible'}
                      {status === 'MANTENIMIENTO' && 'Mantenimiento'}
                      {status === 'NO_DISPONIBLE' && 'Inactivo'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--color-cacao)]">
                  Descripción / Observaciones <span className="text-xs font-normal lowercase text-[var(--color-cacao)]/60">(opcional)</span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detalles sobre ubicación, marca, cuidados o especificaciones técnicas..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[var(--color-dusty-rose)] text-sm focus:outline-none focus:border-[var(--color-pompadour)] focus:ring-2 focus:ring-[var(--color-pompadour)]/20 resize-none"
                />
              </div>

              {/* Botón Guardar */}
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-2xl bg-[var(--color-pompadour)] hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <PlusCircle size={18} />
                Guardar Recurso
              </button>
            </form>
          </div>

          {/* Listado de Recursos Existentes */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={20} className="text-[var(--color-pompadour)]" />
                <h2 className="text-xl font-bold font-['Fraunces',serif]">
                  Recursos del Negocio ({resourcesList.length})
                </h2>
              </div>
              <span className="text-xs font-medium text-[var(--color-cacao)]/70">
                Disponibles para asignar a servicios
              </span>
            </div>

            {resourcesList.length === 0 ? (
              <div className="bg-[var(--color-cream)] border border-dashed border-[var(--color-dusty-rose)] rounded-3xl p-8 text-center text-[var(--color-cacao)]/60 space-y-2">
                <Package size={36} className="mx-auto text-[var(--color-dusty-rose)]" />
                <p className="font-medium text-sm">Aún no hay recursos dados de alta</p>
                <p className="text-xs">Usa el formulario para añadir el primero.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resourcesList.map((res) => (
                  <div
                    key={res.id}
                    className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-2xl p-4.5 hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-[var(--color-cacao)]">
                            {res.name}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-mimi-pink)] text-[var(--color-cacao)] uppercase">
                            {res.type}
                          </span>
                        </div>
                        {res.description && (
                          <p className="text-xs text-[var(--color-cacao)]/80 line-clamp-2">
                            {res.description}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        {getStatusBadge(res.status)}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--color-dusty-rose)]/60 flex items-center justify-between text-xs text-[var(--color-cacao)]/75">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Boxes size={14} className="text-[var(--color-pompadour)]" />
                        <span>Cantidad: <strong className="text-[var(--color-cacao)]">{res.quantity}</strong></span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[var(--color-cacao)]/60">
                        <Clock size={12} />
                        <span>Registrado: {res.createdAt}</span>
                      </div>
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