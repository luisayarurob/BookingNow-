import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, Loader2, MapPin, X } from "lucide-react";
import { cancelarReserva, listarHistorialReservas, listarReservasActivas, type ReservaResumen, ServiceApiError } from "../services/apiService";

interface Props {
  view: "active" | "history";
  onCreateReservation: () => void;
}

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVA: "Activa",
    CONFIRMADA: "Confirmada",
    CANCELADA: "Cancelada",
    CANCELADA_POR_EL_PROVEEDOR: "Cancelada por el proveedor",
  };
  return labels[status] || status;
}

export const ClientReservationsScreen: React.FC<Props> = ({ view, onCreateReservation }) => {
  const [reservations, setReservations] = useState<ReservaResumen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ReservaResumen | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  async function load() {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Tu sesión expiró. Inicia sesión nuevamente.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = view === "active"
        ? await listarReservasActivas(token)
        : await listarHistorialReservas(token);
      setReservations(view === "history"
        ? [...data].sort((a, b) => `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`))
        : data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible consultar las reservas.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [view]);

  useEffect(() => {
    if (!cancelTarget) return;
    confirmRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isCancelling) setCancelTarget(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [cancelTarget, isCancelling]);

  async function confirmCancellation() {
    if (!cancelTarget || isCancelling) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Tu sesión expiró. Inicia sesión nuevamente.");
      setCancelTarget(null);
      return;
    }
    setIsCancelling(true);
    setError(null);
    try {
      await cancelarReserva(cancelTarget.idReserva, undefined, token);
      setCancelTarget(null);
      setSuccess("La reserva fue cancelada.");
      await load();
    } catch (caught) {
      setCancelTarget(null);
      setError(caught instanceof ServiceApiError
        ? caught.message
        : caught instanceof Error ? caught.message : "No fue posible cancelar la reserva.");
    } finally {
      setIsCancelling(false);
    }
  }

  const title = view === "active" ? "Mis reservas activas" : "Historial de reservas";

  return (
    <main className="min-h-screen bg-[var(--color-mimi-pink)]/40 p-4 pb-24 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="border-b border-[var(--color-dusty-rose)] pb-4">
          <h1 className="font-['Fraunces',serif] text-3xl font-bold text-[var(--color-cacao)]">{title}</h1>
        </header>

        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {isLoading ? (
          <div role="status" className="flex items-center gap-2 rounded-2xl border border-[var(--color-dusty-rose)] bg-[var(--color-cream)] p-5 text-sm">
            <Loader2 size={18} className="animate-spin" /> Cargando reservas...
          </div>
        ) : reservations.length === 0 ? (
          <section className="rounded-3xl border border-[var(--color-dusty-rose)] bg-[var(--color-cream)] p-8 text-center">
            <p className="text-sm text-[var(--color-cacao)]">
              {view === "active" ? "No tienes reservas activas en este momento" : "Aún no tienes reservas en tu historial"}
            </p>
            {view === "active" && (
              <button type="button" onClick={onCreateReservation} className="mt-5 rounded-xl bg-[var(--color-pompadour-ink)] px-5 py-3 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-[var(--color-pompadour)]/30">
                Crear nueva reserva
              </button>
            )}
          </section>
        ) : (
          <section aria-label={title} className="grid gap-4">
            {reservations.map((reservation) => (
              <article key={reservation.idReserva} className="rounded-3xl border border-[var(--color-dusty-rose)] bg-[var(--color-cream)] p-5 shadow-xs">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-pompadour-ink)]">Reserva #{reservation.idReserva}</p>
                    <h2 className="font-['Fraunces',serif] text-xl font-bold text-[var(--color-cacao)]">{reservation.nombreServicio}</h2>
                    <p className="flex items-center gap-2 text-sm text-[var(--color-cacao)]/75"><MapPin size={16} /> {reservation.nombreNegocio}</p>
                    <p className="flex items-center gap-2 text-sm text-[var(--color-cacao)]/75"><CalendarDays size={16} /> {formatDate(reservation.fecha)}</p>
                    <p className="flex items-center gap-2 text-sm text-[var(--color-cacao)]/75"><Clock3 size={16} /> {reservation.hora.slice(0, 5)}</p>
                    <p className="inline-flex rounded-full border border-[var(--color-dusty-rose)] bg-white px-3 py-1 text-xs font-bold text-[var(--color-cacao)]">
                      Estado: {statusLabel(reservation.estado)}
                    </p>
                  </div>
                  {view === "active" && (
                    <button type="button" onClick={() => setCancelTarget(reservation)} className="rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-200">
                      Cancelar reserva
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {cancelTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#493333]/40 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="cancel-title" aria-describedby="cancel-description" className="w-full max-w-md rounded-3xl border border-[var(--color-dusty-rose)] bg-[var(--color-cream)] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h2 id="cancel-title" className="font-['Fraunces',serif] text-xl font-bold text-[var(--color-cacao)]">Confirmar cancelación</h2>
              <button ref={cancelRef} type="button" aria-label="Cerrar confirmación" onClick={() => setCancelTarget(null)} disabled={isCancelling} className="rounded-lg p-1 text-[var(--color-cacao)] hover:bg-white">
                <X size={20} />
              </button>
            </div>
            <p id="cancel-description" className="mt-4 text-sm text-[var(--color-cacao)]/80">¿Estás seguro de que deseas cancelar esta reserva?</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setCancelTarget(null)} disabled={isCancelling} className="rounded-xl border border-[var(--color-dusty-rose)] bg-white px-4 py-3 text-sm font-bold text-[var(--color-cacao)]">
                No, mantener
              </button>
              <button ref={confirmRef} type="button" onClick={confirmCancellation} disabled={isCancelling} className="rounded-xl bg-rose-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
                {isCancelling ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
