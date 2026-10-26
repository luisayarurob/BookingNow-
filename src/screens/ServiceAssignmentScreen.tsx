import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Users, 
  Boxes, 
  Check, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Info,
  Building2
} from 'lucide-react';
import { listarEmpleados, listarRecursos, listarServicios, obtenerMiNegocio } from '../services/apiService';
import { Employee } from '../types/employee';
import { Resource } from '../types/resource';
import { ServiceSummary, ServiceAssignment } from '../types/serviceAssignment';

interface ServiceAssignmentScreenProps {
  businessId?: string;
  businessName?: string;
  onSaved?: (assignment: ServiceAssignment) => void;
}

const getAssignmentDefaults = (serviceName: string = '') => {
  const normalized = serviceName.toLowerCase();

  if (
    normalized.includes('asesor') ||
    normalized.includes('consult') ||
    normalized.includes('imagen')
  ) {
    return { requiresEmployees: true, requiresResources: false };
  }

  if (
    normalized.includes('cabina') ||
    normalized.includes('spa') ||
    normalized.includes('cancha') ||
    normalized.includes('sala')
  ) {
    return { requiresEmployees: false, requiresResources: true };
  }

  return { requiresEmployees: true, requiresResources: true };
};

export const ServiceAssignmentScreen: React.FC<ServiceAssignmentScreenProps> = ({
  businessId,
  businessName = 'Mi Negocio Principal',
  onSaved
}) => {
  const [businesses, setBusinesses] = useState<{id: string, name: string}[]>([]);
  const [currentBusinessId, setCurrentBusinessId] = useState<string>('');
  const [currentBusinessName, setCurrentBusinessName] = useState<string>(businessName);

  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [availableResources, setAvailableResources] = useState<Resource[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [requiresEmployees, setRequiresEmployees] = useState<boolean>(true);
  const [requiresResources, setRequiresResources] = useState<boolean>(true);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Cargar la lista de negocios del usuario
  useEffect(() => {
    let isMounted = true;
    const loadBusinesses = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await obtenerMiNegocio(token);
        const bizArray = res.negocios?.length ? res.negocios : (res.negocio ? [res.negocio] : []);
        const mapped = bizArray.map((b: any) => ({
          id: String(b.idNegocio || b.id),
          name: b.nombre || 'Negocio'
        }));
        
        if (isMounted && mapped.length > 0) {
          setBusinesses(mapped);
          
          // Definir negocio activo por defecto
          const storedId = localStorage.getItem('idNegocio');
          const activeBiz = mapped.find(m => m.id === storedId) || mapped[0];
          
          setCurrentBusinessId(activeBiz.id);
          setCurrentBusinessName(activeBiz.name);
          localStorage.setItem('idNegocio', activeBiz.id);
          localStorage.setItem('nombreNegocio', activeBiz.name);
        }
      } catch (error) {
        console.error("Error cargando negocios:", error);
      }
    };
    loadBusinesses();
    return () => { isMounted = false; };
  }, []);

  // 2. Cargar servicios, empleados y recursos cada vez que cambie currentBusinessId
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token || !currentBusinessId) {
        if (isMounted && currentBusinessId === '') {
          setIsLoading(true); // Esperando a que cargue el negocio primero
        }
        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
          setLoadError(null);
        }

        const activeBizNum = Number(currentBusinessId);
        const [serviceRows, employeeRows, resourceRows] = await Promise.all([
          listarServicios(activeBizNum, token),
          listarEmpleados(activeBizNum, token),
          listarRecursos(activeBizNum, token)
        ]);

        if (!isMounted) return;

        const mappedServices: ServiceSummary[] = serviceRows.map((service) => ({
          id: String(service.id ?? service.idServicio ?? ''),
          businessId: String(activeBizNum),
          name: service.nombre ?? 'Servicio sin nombre',
          category: service.categoria ?? service.descripcion ?? 'General',
          price: Number(service.precio ?? 0),
          durationMinutes: Number(service.duracionMinutos ?? 0)
        }));

        const mappedEmployees: Employee[] = employeeRows.map((employee) => ({
          id: String(employee.id ?? employee.idEmpleado ?? ''),
          businessId: String(activeBizNum),
          fullName: employee.nombres ?? employee.nombre ?? 'Empleado sin nombre',
          documentId: employee.documento ?? '',
          phone: employee.telefono ?? '',
          email: employee.correo ?? '',
          isActive: true,
          createdAt: employee.fechaCreacion ?? new Date().toISOString()
        }));

        const mappedResources: Resource[] = resourceRows.map((resource) => ({
          id: String(resource.id ?? resource.idRecurso ?? ''),
          businessId: String(activeBizNum),
          name: resource.nombre ?? 'Recurso sin nombre',
          type: 'OTRO',
          quantity: Number(resource.cantidad ?? 1),
          status: (resource.estado ?? 'DISPONIBLE') as Resource['status'],
          description: resource.descripcion ?? '',
          createdAt: resource.fechaCreacion ?? new Date().toISOString()
        }));

        setServices(mappedServices);
        setAvailableEmployees(mappedEmployees);
        setAvailableResources(mappedResources);
        setSelectedServiceId(mappedServices[0]?.id ?? '');
      } catch (error) {
        if (isMounted) {
          setServices([]);
          setAvailableEmployees([]);
          setAvailableResources([]);
          setSelectedServiceId('');
          setLoadError(error instanceof Error ? error.message : 'No fue posible cargar la información del negocio.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [currentBusinessId]);

  const activeService = services.find((service) => service.id === selectedServiceId);

  useEffect(() => {
    if (!selectedServiceId && services.length > 0) {
      const firstService = services[0];
      setSelectedServiceId(firstService.id);
      const defaults = getAssignmentDefaults(firstService.name);
      setRequiresEmployees(defaults.requiresEmployees);
      setRequiresResources(defaults.requiresResources);
      setSelectedEmployeeIds([]);
      setSelectedResourceIds([]);
      return;
    }

    if (!selectedServiceId || services.length === 0) {
      setRequiresEmployees(true);
      setRequiresResources(true);
      setSelectedEmployeeIds([]);
      setSelectedResourceIds([]);
      return;
    }

    const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0];
    const defaults = getAssignmentDefaults(selectedService.name);

    setRequiresEmployees(defaults.requiresEmployees);
    setRequiresResources(defaults.requiresResources);
    setSelectedEmployeeIds([]);
    setSelectedResourceIds([]);
  }, [selectedServiceId, services]);

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setErrorMessage(null);
    setSuccessMessage(null);

    const service = services.find((item) => item.id === serviceId);
    const defaults = getAssignmentDefaults(service?.name ?? '');

    setRequiresEmployees(defaults.requiresEmployees);
    setRequiresResources(defaults.requiresResources);
    setSelectedEmployeeIds([]);
    setSelectedResourceIds([]);
  };

  const toggleEmployee = (empId: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const toggleResource = (resId: string) => {
    setSelectedResourceIds(prev => 
      prev.includes(resId) ? prev.filter(id => id !== resId) : [...prev, resId]
    );
  };

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
      businessId: currentBusinessId,
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

  // Manejador del cambio de empresa
  const handleBusinessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    const biz = businesses.find(b => b.id === newId);
    if (biz) {
      setCurrentBusinessId(newId);
      setCurrentBusinessName(biz.name);
      localStorage.setItem('idNegocio', newId);
      localStorage.setItem('nombreNegocio', biz.name);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-mimi-pink)]/40 p-4 md:p-8 font-['DM_Sans',sans-serif] text-[var(--color-cacao)]">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Cabecera */}
        <div className="border-b border-[var(--color-dusty-rose)] pb-4">
          <div className="inline-flex items-center gap-2 mb-2">
            {businesses.length > 1 ? (
              <div className="relative flex items-center bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-full px-3 py-1 shadow-2xs">
                <Building2 size={13} className="text-[var(--color-pompadour)]" />
                <select 
                  className="bg-transparent text-xs font-medium outline-none ml-1 cursor-pointer text-[var(--color-cacao)] pr-2"
                  value={currentBusinessId}
                  onChange={handleBusinessChange}
                >
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] text-xs font-medium shadow-2xs">
                <Building2 size={13} className="text-[var(--color-pompadour)]" />
                <span>{currentBusinessName}</span>
              </div>
            )}
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

            {isLoading && (
              <div className="rounded-2xl border border-[var(--color-dusty-rose)] bg-white/60 p-3 text-sm text-[var(--color-cacao)]/70">
                Cargando servicios del negocio...
              </div>
            )}

            {!isLoading && loadError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {loadError}
              </div>
            )}

            {!isLoading && !loadError && services.length === 0 && (
              <div className="rounded-2xl border border-[var(--color-dusty-rose)] bg-white/60 p-3 text-sm text-[var(--color-cacao)]/70">
                No hay servicios registrados para este negocio.
              </div>
            )}

            {!isLoading && !loadError && services.length > 0 && (
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
                          {srv.category} | {srv.durationMinutes} min • ${srv.price.toLocaleString('es-CO')}
                        </div>
                      </div>
                      <ChevronRight size={16} className={isSelected ? 'text-[var(--color-pompadour)]' : 'text-stone-400'} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Columna Derecha: Configuración de Dependencias y Asignaciones */}
          <div className="lg:col-span-8 bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-dusty-rose)]/70 gap-2">
              <div>
                <span className="text-xs font-bold text-[var(--color-pompadour)] uppercase tracking-wider">Configurando Servicio</span>
                <h3 className="text-xl font-bold font-['Fraunces',serif] text-[var(--color-cacao)]">
                  {activeService?.name || 'Selecciona un servicio'}
                </h3>
              </div>
              {activeService && (
                <div className="text-xs bg-white px-3 py-1.5 rounded-xl border border-[var(--color-dusty-rose)]">
                  Duración: <strong>{activeService.durationMinutes} min</strong>
                </div>
              )}
            </div>

            {activeService ? (
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
                        Solo empleados de {currentBusinessName}
                      </span>
                    </div>

                    {availableEmployees.length === 0 ? (
                      <div className="text-xs text-[var(--color-cacao)]/70 italic py-2">No hay empleados registrados en este negocio.</div>
                    ) : (
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
                    )}
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
                        Solo recursos de {currentBusinessName}
                      </span>
                    </div>

                    {availableResources.length === 0 ? (
                      <div className="text-xs text-[var(--color-cacao)]/70 italic py-2">No hay recursos registrados en este negocio.</div>
                    ) : (
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
                                <div className="text-[10px] text-[var(--color-cacao)]/60 font-semibold uppercase">{res.type} | Cant: {res.quantity}</div>
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
                    )}
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
            ) : (
              <div className="flex items-center justify-center h-48 text-[var(--color-cacao)]/50 text-sm">
                Selecciona un servicio de la lista para configurarlo.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};