import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Users, 
  IdCard, 
  Phone, 
  Mail, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Building2,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { registrarEmpleado, listarEmpleados, Empleado, ServiceApiError } from '../services/apiService';

interface EmployeeRegisterScreenProps {
  businessName?: string;
  onEmployeeCreated?: (newEmployee: Empleado) => void;
}

export const EmployeeRegisterScreen: React.FC<EmployeeRegisterScreenProps> = ({
  businessName = 'Mi Negocio Principal',
  onEmployeeCreated
}) => {
  // Estado del formulario (Mantenemos los nombres en inglés para la UI local)
  const [formData, setFormData] = useState({
    fullName: '',
    documentId: '',
    phone: '',
    email: ''
  });

  // Estados de interfaz y validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingList, setFetchingList] = useState(false);

  // Lista de empleados del backend
  const [employeesList, setEmployeesList] = useState<Empleado[]>([]);

  // 1. Cargar empleados desde el backend
  const cargarEmpleados = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const businessId = Number(localStorage.getItem('idNegocio') || sessionStorage.getItem('idNegocio'));

    if (!token || !businessId) return;

    try {
      setFetchingList(true);
      const data = await listarEmpleados(businessId, token);
      setEmployeesList(data);
    } catch (err) {
      console.error('Error al cargar empleados:', err);
    } finally {
      setFetchingList(false);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  // 2. Validaciones locales
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Los nombres y apellidos son obligatorios.';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Ingresa un nombre válido de al menos 3 caracteres.';
    }

    const docRegex = /^[0-9]{6,11}$/;
    if (!formData.documentId.trim()) {
      newErrors.documentId = 'El número de documento de identidad (CC) es obligatorio.';
    } else if (!docRegex.test(formData.documentId.trim())) {
      newErrors.documentId = 'El documento debe contener entre 6 y 11 dígitos numéricos.';
    } else {
      // Validación local para mitigar la HU (evitar ir al back si ya sabemos que existe)
      const documentExists = employeesList.some(
        emp => emp.documento === formData.documentId.trim()
      );
      if (documentExists) {
        newErrors.documentId = 'Ya existe un empleado registrado con este número de documento en este negocio.';
      }
    }

    const phoneRegex = /^[0-9]{7,12}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono de contacto es obligatorio.';
    } else if (!phoneRegex.test(formData.phone.trim().replace(/\s/g, ''))) {
      newErrors.phone = 'Ingresa un número telefónico válido (entre 7 y 10 dígitos).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'El formato de correo no es válido (ej. nombre@correo.com).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 3. Enviar al backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setServerError(null);

    if (!validate()) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const businessId = Number(localStorage.getItem('idNegocio') || sessionStorage.getItem('idNegocio'));

    if (!token || !businessId || isNaN(businessId)) {
      setServerError('Tu sesión ha expirado o no tienes un negocio asociado.');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        nombres: formData.fullName.trim(),
        documento: formData.documentId.trim(),
        telefono: formData.phone.trim(),
        correo: formData.email.trim().toLowerCase()
      };

      const nuevoEmpleado = await registrarEmpleado(businessId, payload, token);

      setSuccessMessage(`¡Empleado "${payload.nombres}" registrado exitosamente!`);
      if (onEmployeeCreated) onEmployeeCreated(nuevoEmpleado as Empleado);

      setFormData({
        fullName: '',
        documentId: '',
        phone: '',
        email: ''
      });
      setErrors({});

      // Recargamos la lista desde el servidor
      await cargarEmpleados();
      
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      if (err instanceof ServiceApiError && err.fields) {
        // Mapear los errores del backend a los campos del frontend
        const mappedErrors: Record<string, string> = {};
        if (err.fields.nombres) mappedErrors.fullName = err.fields.nombres;
        if (err.fields.documento) mappedErrors.documentId = err.fields.documento;
        if (err.fields.telefono) mappedErrors.phone = err.fields.telefono;
        if (err.fields.correo) mappedErrors.email = err.fields.correo;
        setErrors(mappedErrors);
      } else {
        setServerError(err.message || 'Ocurrió un error al intentar registrar el empleado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-mimi-pink)]/40 p-4 md:p-8 font-['DM_Sans',sans-serif] text-[var(--color-cacao)]">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Encabezado */}
        <div className="border-b border-[var(--color-dusty-rose)] pb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] text-xs font-medium text-[var(--color-cacao)] mb-2 shadow-xs">
            <Building2 size={14} className="text-[var(--color-pompadour)]" />
            Negocio asociado: <span className="font-bold">{businessName}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-['Fraunces',serif] text-[var(--color-cacao)]">
            Registrar Empleado
          </h1>
          <p className="text-sm text-[var(--color-cacao)]/75 mt-1">
            Da de alta al personal que prestará los servicios de tu negocio y asignará reservas.
          </p>
        </div>

        {/* Mensajes Globales */}
        {serverError && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm shadow-sm">
            <AlertCircle size={20} className="text-rose-600 shrink-0" />
            <p className="font-medium">{serverError}</p>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm shadow-sm">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Formulario de Registro */}
          <div className="lg:col-span-6 bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2.5 rounded-xl bg-[var(--color-pompadour)] text-white shadow-xs">
                <UserPlus size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold font-['Fraunces',serif]">Datos del Empleado</h2>
                <p className="text-xs text-[var(--color-cacao)]/70">Todos los campos marcados con (*) son obligatorios</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* Nombres y Apellidos */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--color-cacao)]">
                  Nombres y apellidos completos <span className="text-[var(--color-pompadour)]">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-cacao)]/50" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Ej. Mateo Restrepo Morales"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border text-sm transition-all focus:outline-none focus:ring-2 ${
                      errors.fullName 
                        ? 'border-rose-400 focus:ring-rose-200' 
                        : 'border-[var(--color-dusty-rose)] focus:border-[var(--color-pompadour)] focus:ring-[var(--color-pompadour)]/20'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                    <AlertCircle size={13} /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Documento de Identidad (CC) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--color-cacao)]">
                  Documento de Identidad (CC) <span className="text-[var(--color-pompadour)]">*</span>
                </label>
                <div className="relative">
                  <IdCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-cacao)]/50" />
                  <input
                    type="text"
                    name="documentId"
                    value={formData.documentId}
                    onChange={handleChange}
                    placeholder="Ej. 1035498123"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border text-sm transition-all focus:outline-none focus:ring-2 ${
                      errors.documentId 
                        ? 'border-rose-400 focus:ring-rose-200' 
                        : 'border-[var(--color-dusty-rose)] focus:border-[var(--color-pompadour)] focus:ring-[var(--color-pompadour)]/20'
                    }`}
                  />
                </div>
                {errors.documentId && (
                  <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                    <AlertCircle size={13} /> {errors.documentId}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--color-cacao)]">
                  Teléfono de contacto <span className="text-[var(--color-pompadour)]">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-cacao)]/50" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ej. 3001234567"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border text-sm transition-all focus:outline-none focus:ring-2 ${
                      errors.phone 
                        ? 'border-rose-400 focus:ring-rose-200' 
                        : 'border-[var(--color-dusty-rose)] focus:border-[var(--color-pompadour)] focus:ring-[var(--color-pompadour)]/20'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                    <AlertCircle size={13} /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--color-cacao)]">
                  Correo electrónico <span className="text-[var(--color-pompadour)]">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-cacao)]/50" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@negocio.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border text-sm transition-all focus:outline-none focus:ring-2 ${
                      errors.email 
                        ? 'border-rose-400 focus:ring-rose-200' 
                        : 'border-[var(--color-dusty-rose)] focus:border-[var(--color-pompadour)] focus:ring-[var(--color-pompadour)]/20'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
                    <AlertCircle size={13} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Botón Guardar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-6 rounded-2xl bg-[var(--color-pompadour)] hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                {loading ? 'Guardando...' : 'Guardar Empleado'}
              </button>
            </form>
          </div>

          {/* Listado de Empleados del Negocio */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-[var(--color-pompadour)]" />
                <h2 className="text-xl font-bold font-['Fraunces',serif]">
                  Equipo de Trabajo ({employeesList.length})
                </h2>
              </div>
              {fetchingList && <Loader2 size={16} className="animate-spin text-[var(--color-pompadour)]" />}
            </div>

            {employeesList.length === 0 && !fetchingList ? (
              <div className="bg-[var(--color-cream)] border border-dashed border-[var(--color-dusty-rose)] rounded-3xl p-8 text-center text-[var(--color-cacao)]/60 space-y-2">
                <Users size={36} className="mx-auto text-[var(--color-dusty-rose)]" />
                <p className="font-medium text-sm">No hay empleados registrados aún</p>
                <p className="text-xs">Usa el formulario para añadir colaboradores.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {employeesList.map((emp, index) => (
                  <div
                    key={emp.idEmpleado || index}
                    className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-2xl p-4.5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-pompadour)]/20 text-[var(--color-pompadour)] flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                          {emp.nombres ? emp.nombres.slice(0, 2) : 'EM'}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-[var(--color-cacao)]">
                            {emp.nombres}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-[var(--color-cacao)]/75 mt-0.5">
                            <ShieldCheck size={14} className="text-[var(--color-pompadour)]" />
                            <span>CC: {emp.documento}</span>
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Activo
                      </span>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-[var(--color-dusty-rose)]/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--color-cacao)]/80">
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-[var(--color-cacao)]/60" />
                        <span>{emp.telefono}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <Mail size={13} className="text-[var(--color-cacao)]/60" />
                        <span className="truncate" title={emp.correo}>{emp.correo}</span>
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