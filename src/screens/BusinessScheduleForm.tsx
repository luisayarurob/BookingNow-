import React from 'react';
import { Clock, AlertCircle, Check, X } from 'lucide-react';
import { BusinessSchedule, DayOfWeek } from '../types/schedule';

interface BusinessScheduleFormProps {
  schedule: BusinessSchedule;
  onChange: (updatedSchedule: BusinessSchedule) => void;
  errors?: Record<string, string>;
}

export const BusinessScheduleForm: React.FC<BusinessScheduleFormProps> = ({
  schedule,
  onChange,
  errors = {}
}) => {
  const handleToggleDay = (dayKey: DayOfWeek) => {
    onChange({
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        isOpen: !schedule[dayKey].isOpen
      }
    });
  };

  const handleTimeChange = (
    dayKey: DayOfWeek,
    field: 'openTime' | 'closeTime',
    value: string
  ) => {
    onChange({
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        [field]: value
      }
    });
  };

  const dayKeys: DayOfWeek[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-[var(--color-dusty-rose)]/60 pb-3">
        <Clock size={18} className="text-[var(--color-pompadour)]" />
        <div>
          <h3 className="font-bold text-base font-['Fraunces',serif] text-[var(--color-cacao)]">
            Horario de Atención
          </h3>
          <p className="text-xs text-[var(--color-cacao)]/70">
            Habilita los días laborables e indica las horas de apertura y cierre.
          </p>
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
                  ? 'bg-white border-[var(--color-dusty-rose)] shadow-2xs'
                  : 'bg-[var(--color-cream)]/50 border-dashed border-[var(--color-dusty-rose)]/60 opacity-65'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Switch de activación del día */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(dayKey)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                      item.isOpen
                        ? 'bg-[var(--color-pompadour)] border-[var(--color-pompadour)] text-white shadow-2xs'
                        : 'bg-white border-[var(--color-dusty-rose)] text-transparent hover:border-[var(--color-pompadour)]'
                    }`}
                  >
                    <Check size={14} className={item.isOpen ? 'opacity-100' : 'opacity-0'} />
                  </button>

                  <span className={`text-sm font-semibold ${item.isOpen ? 'text-[var(--color-cacao)]' : 'text-[var(--color-cacao)]/60'}`}>
                    {item.label}
                  </span>

                  {!item.isOpen && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-600">
                      Cerrado
                    </span>
                  )}
                </div>

                {/* Selectores de apertura y cierre */}
                {item.isOpen && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--color-cacao)]/70">De:</span>
                      <input
                        type="time"
                        value={item.openTime}
                        onChange={(e) => handleTimeChange(dayKey, 'openTime', e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-[var(--color-dusty-rose)] bg-white text-xs font-medium text-[var(--color-cacao)] focus:outline-none focus:border-[var(--color-pompadour)] focus:ring-1 focus:ring-[var(--color-pompadour)]"
                      />
                    </div>

                    <span className="text-[var(--color-cacao)]/50">—</span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--color-cacao)]/70">A:</span>
                      <input
                        type="time"
                        value={item.closeTime}
                        onChange={(e) => handleTimeChange(dayKey, 'closeTime', e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-[var(--color-dusty-rose)] bg-white text-xs font-medium text-[var(--color-cacao)] focus:outline-none focus:border-[var(--color-pompadour)] focus:ring-1 focus:ring-[var(--color-pompadour)]"
                      />
                    </div>
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