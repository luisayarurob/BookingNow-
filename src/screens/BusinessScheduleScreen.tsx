import React, { useEffect, useState } from "react";
import { ArrowLeft, Building2, CalendarClock, Save, CheckCircle2, Clock, AlertCircle, Check } from "lucide-react";
import { BusinessSchedule, DEFAULT_WEEK_SCHEDULE, DayOfWeek } from "../types/schedule";
import { guardarHorarios, obtenerMiNegocio, type Business } from "../services/apiService";

interface BusinessScheduleFormProps {
  schedule: BusinessSchedule;
  onChange: (updatedSchedule: BusinessSchedule) => void;
  errors?: Record<string, string>;
}

const BusinessScheduleForm: React.FC<BusinessScheduleFormProps> = ({
  schedule,
  onChange,
  errors = {},
}) => {
  const handleToggleDay = (dayKey: DayOfWeek) => {
    onChange({
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        isOpen: !schedule[dayKey].isOpen,
      },
    });
  };

  const handleTimeChange = (
    dayKey: DayOfWeek,
    field: "openTime" | "closeTime",
    value: string
  ) => {
    onChange({
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        [field]: value,
      },
    });
  };

  const dayKeys: DayOfWeek[] = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-[var(--color-dusty-rose)]/60 pb-3">
        <Clock size={18} className="text-[var(--color-pompadour-ink)]" />
        <div>
          <h3 className="font-bold text-base font-['Fraunces',serif]">Configurar Días y Horas</h3>
          <p className="text-xs text-[var(--color-cacao)]/80">Selecciona los días hábiles del negocio.</p>
        </div>
      </div>

      {errors.general && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      <div className="space-y-2.5">
        {dayKeys.map((dayKey) => {
          const item = schedule[dayKey];
          const hasError = !!errors[dayKey];

          return (
            <div
              key={dayKey}
              className={`p-3.5 rounded-2xl border transition-all ${
                item.isOpen
                  ? "bg-white border-[var(--color-dusty-rose)]"
                  : "bg-[var(--color-cream)]/50 border-dashed border-[var(--color-dusty-rose)]/60 opacity-60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(dayKey)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border cursor-pointer ${
                      item.isOpen
                        ? "bg-[var(--color-pompadour-ink)] border-[var(--color-pompadour-ink)] text-white"
                        : "bg-white border-[var(--color-dusty-rose)] text-transparent"
                    }`}
                  >
                    <Check size={14} className={item.isOpen ? "opacity-100" : "opacity-0"} />
                  </button>
                  <span className="text-sm font-semibold">{item.label}</span>
                  {!item.isOpen && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-200 text-stone-600">
                      Cerrado
                    </span>
                  )}
                </div>

                {item.isOpen && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[var(--color-cacao)]/80">De:</span>
                    <input
                      type="time"
                      value={item.openTime}
                      onChange={(e) => handleTimeChange(dayKey, "openTime", e.target.value)}
                      className="px-2 py-1 rounded-lg border border-[var(--color-dusty-rose)] bg-white text-xs"
                    />
                    <span className="text-[var(--color-cacao)]/80">—</span>
                    <span className="text-[var(--color-cacao)]/80">A:</span>
                    <input
                      type="time"
                      value={item.closeTime}
                      onChange={(e) => handleTimeChange(dayKey, "closeTime", e.target.value)}
                      className="px-2 py-1 rounded-lg border border-[var(--color-dusty-rose)] bg-white text-xs"
                    />
                  </div>
                )}
              </div>

              {hasError && (
                <p className="flex items-center gap-1 text-[11px] text-rose-600 mt-2 font-medium">
                  <AlertCircle size={13} /> {errors[dayKey]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface BusinessScheduleScreenProps {
  businessName?: string;
  businessId: number;
  onBusinessChange?: (businessId: number, businessName: string) => void;
  onBack?: () => void;
  onSaved?: () => void;
}

export const BusinessScheduleScreen: React.FC<BusinessScheduleScreenProps> = ({
  businessName = "Mi Negocio",
  businessId,
  onBusinessChange,
  onBack,
  onSaved,
}) => {
  const [schedule, setSchedule] = useState<BusinessSchedule>(DEFAULT_WEEK_SCHEDULE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoadingBusinesses(false);
      return;
    }

    let isMounted = true;
    obtenerMiNegocio(token)
      .then((result) => {
        if (!isMounted) return;
        const available = result.negocios?.length
          ? result.negocios
          : result.negocio
            ? [result.negocio]
            : [];
        setBusinesses(available);

        if (!businessId && available.length > 0) {
          const first = available[0] as Business;
          onBusinessChange?.(
            Number(first.idNegocio || first.id),
            first.nombre || "Negocio"
          );
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrors({
            general: error instanceof Error ? error.message : "No fue posible cargar los negocios.",
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingBusinesses(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBusinessChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    const selected = businesses.find((business) =>
      Number(business.idNegocio || business.id) === selectedId
    );
    if (!selected) return;

    setSuccessMessage(null);
    setErrors({});
    setSchedule(DEFAULT_WEEK_SCHEDULE);
    onBusinessChange?.(selectedId, selected.nombre || "Negocio");
  };

  const validateSchedule = (): boolean => {
    const newErrors: Record<string, string> = {};
    let atLeastOneOpen = false;

    (Object.keys(schedule) as DayOfWeek[]).forEach((dayKey) => {
      const item = schedule[dayKey];
      if (item.isOpen) {
        atLeastOneOpen = true;
        if (!item.openTime || !item.closeTime) {
          newErrors[dayKey] = "Debes indicar hora de apertura y de cierre.";
          return;
        }
        if (item.closeTime <= item.openTime) {
          newErrors[dayKey] = "La hora de cierre debe ser posterior a la de apertura.";
        }
      }
    });

    if (!atLeastOneOpen) {
      newErrors.general = "El negocio debe atender al menos un día a la semana.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    if (!validateSchedule()) return;

    if (!Number.isInteger(businessId) || businessId <= 0) {
      setErrors({ general: "No se encontró el negocio que estás configurando." });
      return;
    }

    setIsSaving(true);
    try {
      await guardarHorarios(businessId, schedule);
      setSuccessMessage("¡Horario guardado correctamente!");
      onSaved?.();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "No se pudo guardar el horario.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-mimi-pink)]/40 p-4 md:p-8 font-['DM_Sans',sans-serif] text-[var(--color-cacao)]">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-dusty-rose)] pb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 rounded-xl bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] text-[var(--color-cacao)] hover:bg-white cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <label
                htmlFor="business-schedule-selector"
                className="mb-1 inline-flex min-w-52 items-center gap-2 rounded-full border border-[var(--color-dusty-rose)] bg-[var(--color-cream)] px-3 py-1 text-xs font-medium shadow-2xs"
              >
                <Building2 size={13} className="shrink-0 text-[var(--color-pompadour-ink)]" />
                {isLoadingBusinesses ? (
                  <span>Cargando negocios...</span>
                ) : (
                  <select
                    id="business-schedule-selector"
                    value={businessId || ""}
                    onChange={handleBusinessChange}
                    aria-label="Seleccionar negocio para configurar horario"
                    className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent pr-1 text-xs font-medium text-[var(--color-cacao)] outline-none"
                  >
                    {businesses.length === 0 && <option value="">Sin negocios</option>}
                    {businesses.map((business) => {
                      const id = Number(business.idNegocio || business.id);
                      return (
                        <option key={id} value={id}>
                          {business.nombre || `Negocio #${id}`}
                        </option>
                      );
                    })}
                  </select>
                )}
              </label>
              <h1 className="text-2xl md:text-3xl font-bold font-['Fraunces',serif]">
                Horario de Atención
              </h1>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-7 bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-6 shadow-sm">
            <form onSubmit={handleSave} className="space-y-6" noValidate>
              <BusinessScheduleForm
                schedule={schedule}
                onChange={setSchedule}
                errors={errors}
              />
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-6 rounded-2xl bg-[var(--color-pompadour-ink)] hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {isSaving ? "Guardando..." : "Guardar Horario"}
              </button>
            </form>
          </div>

          <div className="md:col-span-5 bg-[var(--color-cream)] border border-[var(--color-dusty-rose)] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-dusty-rose)]/60">
              <CalendarClock size={20} className="text-[var(--color-pompadour-ink)]" />
              <h2 className="font-bold text-base font-['Fraunces',serif]">Resumen Semanal</h2>
            </div>
            <div className="space-y-2">
              {(Object.keys(schedule) as DayOfWeek[]).map((dayKey) => {
                const item = schedule[dayKey];
                return (
                  <div
                    key={dayKey}
                    className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-white/70 border border-[var(--color-dusty-rose)]/40"
                  >
                    <span className="font-medium">{item.label}</span>
                    {item.isOpen ? (
                      <span className="font-bold">{item.openTime} - {item.closeTime}</span>
                    ) : (
                      <span className="text-rose-500 font-medium">Cerrado</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};