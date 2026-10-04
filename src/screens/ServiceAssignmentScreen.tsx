import React, { useState } from 'react';
import { 
  Briefcase, 
  Users, 
  Boxes, 
  Check, 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  ShieldAlert,
  Info,
  Building2
} from 'lucide-react';
import { Employee } from '../types/employee';
import { Resource } from '../types/resource';
import { ServiceSummary, ServiceAssignment } from '../types/serviceAssignment';

interface ServiceAssignmentScreenProps {
  businessId?: string;
  businessName?: string;
  onSaved?: (assignment: ServiceAssignment) => void;
}

export const ServiceAssignmentScreen: React.FC<ServiceAssignmentScreenProps> = ({
  businessId = 'biz-001',
  businessName = 'Mi Negocio Principal',
  onSaved
}) => {
  // Lista de servicios del negocio
  const [services] = useState<ServiceSummary[]>([
    { id: 'srv-1', businessId, name: 'Corte de Cabello & Barba', category: 'Peluquería', price: 35000, durationMinutes: 45 },
    { id: 'srv-2', businessId, name: 'Asesoría de Imagen Personal', category: 'Consultoría', price: 60000, durationMinutes: 60 },
    { id: 'srv-3', businessId, name: 'Alquiler Cabina de Masajes', category: 'Espacio', price: 45000, durationMinutes: 60 }
  ]);

  // Empleados disponibles registrados en este negocio (HU-060101)
  const [availableEmployees] = useState<Employee[]>([
    { id: 'emp-1', businessId, fullName: 'Carolina Gómez Restrepo', documentId: '1035422890', phone: '3104509876', email: 'carolina@ejemplo.com', isActive: true, createdAt: '2026-10-01' },
    { id: 'emp-2', businessId, fullName: 'Mateo Restrepo Morales', documentId: '1035498123', phone: '3001234567', email: 'mateo@ejemplo.com', isActive: true, createdAt: '2026-10-02' },
    { id: 'emp-3', businessId, fullName: 'Daniela Vélez', documentId: '1020456789', phone: '3119876543', email: 'daniela@ejemplo.com', isActive: true, createdAt: '2026-10-03' }
  ]);

  // Recursos disponibles registrados en este negocio (HU-040101)
  const [availableResources] = useState<Resource[]>([
    { id: 'res-1', businessId, name: 'Silla Barbera Hidráulica #1', type: 'MOBILIARIO', quantity: 2, status: 'DISPONIBLE', createdAt: '2026-10-01' },
    { id: 'res-2', businessId, name: 'Kit Tijeras & Máquina Wahl', type: 'HERRAMIENTA', quantity: 3, status: 'DISPONIBLE', createdAt: '2026-10-01' },
    { id: 'res-3', businessId, name: 'Cabina Spa Ergonómica', type: 'SALA', quantity: 1, status: 'DISPONIBLE', createdAt: '2026-10-02' }
  ]);

  // Servicio activo seleccionado
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');

  // Configuración de asignación para el servicio activo
  const [requiresEmployees, setRequiresEmployees] = useState<boolean>(true);
  const [requiresResources, setRequiresResources] = useState<boolean>(true);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>(['emp-1']);
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>(['res-1']);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeService = services.find(s => s.id === selectedServiceId);

  // Manejador para cambiar de servicio en la lista
  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Ajuste de dependencias según el ejemplo del CA
    if (serviceId === 'srv-2') {
      // Asesoría: Sí Empleados, No Recursos
      setRequiresEmployees(true);
      setRequiresResources(false);
      setSelectedEmployeeIds(['emp-1']);
      setSelectedResourceIds([]);
    } else if (serviceId === 'srv-3') {
      // Uso de cabina/cancha: No Empleados, Sí Recursos
      setRequiresEmployees(false);
      setRequiresResources(true);
      setSelectedEmployeeIds([]);
      setSelectedResourceIds(['res-3']);
    } else {
      // Corte: Sí Empleados, Sí Recursos
      setRequiresEmployees(true);
      setRequiresResources(true);
      setSelectedEmployeeIds(['emp-1', 'emp-2']);
      setSelectedResourceIds(['res-1', 'res-2']);
    }
  };

  // Alternar selección de empleado (sin duplicados gracias a Set o filtrado)
  const toggleEmployee = (empId: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  // Alternar selección de recurso (sin duplicados)
  const toggleResource = (resId: string) => {
    setSelectedResourceIds(prev => 
      prev.includes(resId) ? prev.filter(id => id !== resId) : [...prev, resId]
    );
  };

  // Validación de criterios
  const validate = (): boolean => {
    if (!selectedServiceId) {
      setErrorMessage('Debes seleccionar un servicio.');
      return false;
    }

    if (!requiresEmployees && !requiresResources) {
      setErrorMessage('El servicio debe requerir al menos empleados, recursos o ambos.');
      return false;
    }

    if (requiresEmployees && selectedEmployeeIds.length === 0) {
      setErrorMessage('Marcaste que el servicio requiere empleados, pero no has seleccionado ninguno.');
      return false;
    }

    if (requiresResources && selectedResourceIds.length === 0) {
      setErrorMessage('Marcaste que el servicio requiere recursos, pero no has seleccionado ninguno.');
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validate()) return;

    const assignment: ServiceAssignment = {
      serviceId: selectedServiceId,
      businessId,
      requiresEmployees,
      requiresResources,
      assignedEmployeeIds: requiresEmployees ? selectedEmployeeIds : [],
      assignedResourceIds: requiresResources ? selectedResourceIds : [],
      updatedAt: new Date().toISOString()
    };

    if (onSaved) onSaved(assignment);

    setSuccessMessage(`¡Asignación para "${activeService?.name}" guardada correctamente!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-mimi-pink)]/40 p-4 md:p-8 font-['DM_Sans',sans-serif] text-[var(--color-cacao)]">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Cabecera */}
        <div className="border-b border-[var(--color-dusty-rose)] pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] text-xs font-medium mb-2 shadow-2xs">
            <Building2 size={13} className="text-[var(--color-pompadour)]" />
            <span>{businessName}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-['Fraunces',serif] text-[var(--color-cacao)]">
            Asignar Empleados y Recursos
          </h1>
          <p className="text-sm text-[var(--color-cacao)]/75 mt-1">
            Define la dependencia operativa de cada servicio para habilitar la disponibilidad de reservas.
          </p>
        </div>

        {/* Mensajes de feedback */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Columna Izquierda: Selector de Servicio */}
          <div className="lg:col-span-4 bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--color-dusty-rose)]/60 pb-3">
              <Briefcase size={18} className="text-[var(--color-pompadour)]" />
              <h2 className="font-bold font-['Fraunces',serif] text-base">Servicios Registrados</h2>
            </div>

            <p className="text-xs text-[var(--color-cacao)]/70">
              Selecciona el servicio a configurar:
            </p>

            <div className="space-y-2">
              {services.map((srv) => {
                const isSelected = srv.id === selectedServiceId;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => handleSelectService(srv.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[var(--color-pompadour)] ring-2 ring-[var(--color-pompadour)]/20 shadow-xs'
                        : 'bg-white/60 border-[var(--color-dusty-rose)]/70 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-[var(--color-cacao)]">{srv.name}</div>
                      <div className="text-[11px] text-[var(--color-cacao)]/60 mt-0.5">
                        {srv.category} • {srv.durationMinutes} min • ${srv.price.toLocaleString('es-CO')}
                      </div>
                    </div>
                    <ChevronRight size={16} className={isSelected ? 'text-[var(--color-pompadour)]' : 'text-stone-400'} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Configuración de Dependencias y Asignaciones */}
          <div className="lg:col-span-8 bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-dusty-rose)]/70 gap-2">
              <div>
                <span className="text-xs font-bold text-[var(--color-pompadour)] uppercase tracking-wider">Configurando Servicio</span>
                <h3 className="text-xl font-bold font-['Fraunces',serif] text-[var(--color-cacao)]">
                  {activeService?.name}
                </h3>
              </div>
              <div className="text-xs bg-white px-3 py-1.5 rounded-xl border border-[var(--color-dusty-rose)]">
                Duración: <strong>{activeService?.durationMinutes} min</strong>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6" noValidate>
              
              {/* Dependencias del Servicio (Switches / Toggles) */}
              <div className="p-4 rounded-2xl bg-white border border-[var(--color-dusty-rose)] space-y-3">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-[var(--color-pompadour)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-cacao)]">
                    Dependencia Operativa del Servicio
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  {/* Switch Empleados */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-dusty-rose)]/70 hover:bg-[var(--color-mimi-pink)]/20 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Users size={16} className="text-[var(--color-pompadour)]" />
                      <div>
                        <div className="text-xs font-bold text-[var(--color-cacao)]">¿Requiere Empleados?</div>
                        <div className="text-[10px] text-[var(--color-cacao)]/60">Asignar personal que preste el servicio</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={requiresEmployees}
                      onChange={(e) => {
                        setRequiresEmployees(e.target.checked);
                        if (!e.target.checked) setSelectedEmployeeIds([]);
                      }}
                      className="w-4 h-4 accent-[var(--color-pompadour)] cursor-pointer"
                    />
                  </label>

                  {/* Switch Recursos */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-dusty-rose)]/70 hover:bg-[var(--color-mimi-pink)]/20 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Boxes size={16} className="text-[var(--color-pompadour)]" />
                      <div>
                        <div className="text-xs font-bold text-[var(--color-cacao)]">¿Requiere Recursos?</div>
                        <div className="text-[10px] text-[var(--color-cacao)]/60">Cabinas, sillas, máquinas o kits</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={requiresResources}
                      onChange={(e) => {
                        setRequiresResources(e.target.checked);
                        if (!e.target.checked) setSelectedResourceIds([]);
                      }}
                      className="w-4 h-4 accent-[var(--color-pompadour)] cursor-pointer"
                    />
                  </label>

                </div>
              </div>

              {/* Sección Asignar Empleados */}
              {requiresEmployees && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-[var(--color-pompadour)]" />
                      <h4 className="font-bold text-sm font-['Fraunces',serif]">
                        Empleados Asignados ({selectedEmployeeIds.length})
                      </h4>
                    </div>
                    <span className="text-[11px] text-[var(--color-cacao)]/60">
                      Solo empleados de {businessName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {availableEmployees.map((emp) => {
                      const isAssigned = selectedEmployeeIds.includes(emp.id);
                      return (
                        <div
                          key={emp.id}
                          onClick={() => toggleEmployee(emp.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isAssigned
                              ? 'bg-white border-[var(--color-pompadour)] ring-1 ring-[var(--color-pompadour)] shadow-2xs'
                              : 'bg-white/60 border-[var(--color-dusty-rose)]/80 hover:bg-white'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="text-xs font-bold text-[var(--color-cacao)] truncate">{emp.fullName}</div>
                            <div className="text-[11px] text-[var(--color-cacao)]/60">CC: {emp.documentId}</div>
                          </div>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                            isAssigned
                              ? 'bg-[var(--color-pompadour)] border-[var(--color-pompadour)] text-white'
                              : 'border-[var(--color-dusty-rose)] bg-white text-transparent'
                          }`}>
                            <Check size={12} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sección Asignar Recursos */}
              {requiresResources && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Boxes size={18} className="text-[var(--color-pompadour)]" />
                      <h4 className="font-bold text-sm font-['Fraunces',serif]">
                        Recursos Asignados ({selectedResourceIds.length})
                      </h4>
                    </div>
                    <span className="text-[11px] text-[var(--color-cacao)]/60">
                      Solo recursos de {businessName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {availableResources.map((res) => {
                      const isAssigned = selectedResourceIds.includes(res.id);
                      return (
                        <div
                          key={res.id}
                          onClick={() => toggleResource(res.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isAssigned
                              ? 'bg-white border-[var(--color-pompadour)] ring-1 ring-[var(--color-pompadour)] shadow-2xs'
                              : 'bg-white/60 border-[var(--color-dusty-rose)]/80 hover:bg-white'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="text-xs font-bold text-[var(--color-cacao)] truncate">{res.name}</div>
                            <div className="text-[10px] text-[var(--color-cacao)]/60 font-semibold uppercase">{res.type} • Cant: {res.quantity}</div>
                          </div>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                            isAssigned
                              ? 'bg-[var(--color-pompadour)] border-[var(--color-pompadour)] text-white'
                              : 'border-[var(--color-dusty-rose)] bg-white text-transparent'
                          }`}>
                            <Check size={12} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botón Guardar Asignación */}
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-2xl bg-[var(--color-pompadour)] hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Save size={18} />
                Guardar Asignaciones del Servicio
              </button>
            </form>

          </div>

        </div>
      </div>
    </div>
  );
};