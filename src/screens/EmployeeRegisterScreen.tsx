import React, { useState } from 'react';
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
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { Employee, EmployeeFormData } from '../types/employee';

interface EmployeeRegisterScreenProps {
  businessId?: string;
  businessName?: string;
  onEmployeeCreated?: (newEmployee: Employee) => void;
}

export const EmployeeRegisterScreen: React.FC<EmployeeRegisterScreenProps> = ({
  businessId = 'biz-001',
  businessName = 'Mi Negocio Principal',
  onEmployeeCreated
}) => {
  // Estado del formulario
  const [formData, setFormData] = useState<EmployeeFormData>({
    fullName: '',
    documentId: '',
    phone: '',
    email: ''
  });

  // Errores de validación
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Lista local de empleados iniciales (simulando base de datos del negocio)
  const [employeesList, setEmployeesList] = useState<Employee[]>([
    {
      id: 'emp-1',
      businessId,
      fullName: 'Carolina Gómez Restrepo',
      documentId: '1035422890',
      phone: '3104509876',
      email: 'carolina.gomez@ejemplo.com',
      isActive: true,
      createdAt: '2026-10-01'
    }
  ]);

  // Validaciones según Criterios de Aceptación
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    // 1. Nombre obligatorio y longitud mínima
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Los nombres y apellidos son obligatorios.';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Ingresa un nombre válido de al menos 3 caracteres.';
    }

    // 2. Documento válido (solo números, entre 6 y 11 dígitos para CC estándar)
    const docRegex = /^[0-9]{6,11}$/;
    if (!formData.documentId.trim()) {
      newErrors.documentId = 'El número de documento de identidad (CC) es obligatorio.';
    } else if (!docRegex.test(formData.documentId.trim())) {
      newErrors.documentId = 'El documento debe contener entre 6 y 11 dígitos numéricos sin puntos ni espacios.';
    } else {
      // CA: No permitir registrar dos empleados con el mismo documento en este negocio
      const documentExists = employeesList.some(
        emp => emp.businessId === businessId && emp.documentId === formData.documentId.trim()
      );
      if (documentExists) {
        newErrors.documentId = 'Ya existe un empleado registrado con este número de documento en este negocio.';
      }
    }

    // 3. Teléfono obligatorio (formato de celular colombiano: 10 dígitos o fijo)
    const phoneRegex = /^[0-9]{7,12}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono de contacto es obligatorio.';
    } else if (!phoneRegex.test(formData.phone.trim().replace(/\s/g, ''))) {
      newErrors.phone = 'Ingresa un número telefónico válido (entre 7 y 10 dígitos).';
    }

    // 4. Correo electrónico con formato válido
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

    if (errors[name as keyof EmployeeFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validate()) return;

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      businessId,
      fullName: formData.fullName.trim(),
      documentId: formData.documentId.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setEmployeesList(prev => [newEmployee, ...prev]);
    if (onEmployeeCreated) onEmployeeCreated(newEmployee);

    setSuccessMessage(`¡Empleado "${newEmployee.fullName}" registrado exitosamente!`);
    setFormData({
      fullName: '',
      documentId: '',
      phone: '',
      email: ''
    });

    setTimeout(() => setSuccessMessage(null), 4000);
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

        {/* Mensaje de éxito */}
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
                className="w-full mt-2 py-3 px-6 rounded-2xl bg-[var(--color-pompadour)] hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <UserPlus size={18} />
                Guardar Empleado
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
              <span className="text-xs font-medium text-[var(--color-cacao)]/70">
                Disponibles para servicios
              </span>
            </div>

            {employeesList.length === 0 ? (
              <div className="bg-[var(--color-cream)] border border-dashed border-[var(--color-dusty-rose)] rounded-3xl p-8 text-center text-[var(--color-cacao)]/60 space-y-2">
                <Users size={36} className="mx-auto text-[var(--color-dusty-rose)]" />
                <p className="font-medium text-sm">No hay empleados registrados aún</p>
                <p className="text-xs">Usa el formulario para añadir colaboradores.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {employeesList.map((emp) => (
                  <div
                    key={emp.id}
                    className="bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-2xl p-4.5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-pompadour)]/20 text-[var(--color-pompadour)] flex items-center justify-center font-bold text-sm shrink-0">
                          {emp.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-[var(--color-cacao)]">
                            {emp.fullName}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-[var(--color-cacao)]/75 mt-0.5">
                            <ShieldCheck size={14} className="text-[var(--color-pompadour)]" />
                            <span>CC: {emp.documentId}</span>
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
                        <span>{emp.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <Mail size={13} className="text-[var(--color-cacao)]/60" />
                        <span className="truncate">{emp.email}</span>
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