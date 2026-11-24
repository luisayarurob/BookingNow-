import React, { useEffect, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, Download, Loader2 } from "lucide-react";
import {
  generarReporte,
  listarRecursos,
  listarServicios,
  obtenerMiNegocio,
  type Business,
  type Recurso,
  type BusinessService,
  type ReporteCommand,
} from "../services/apiService";

export const ReportsScreen: React.FC = () => {
  const role = (localStorage.getItem("app_role") || "").toLowerCase();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [services, setServices] = useState<BusinessService[]>([]);
  const [resources, setResources] = useState<Recurso[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
  const [reportType, setReportType] = useState<"RESERVAS" | "USO_SERVICIOS_RECURSOS">("RESERVAS");
  const [format, setFormat] = useState<"PDF" | "EXCEL">("PDF");
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(role === "proveedor");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || role !== "proveedor") return;
    let mounted = true;
    async function loadCatalog() {
      try {
        const result = await obtenerMiNegocio(token);
        const catalog = result.negocios?.length ? result.negocios : result.negocio ? [result.negocio] : [];
        if (!mounted) return;
        setBusinesses(catalog);
        const selected = catalog.find((item: Business) => String(item.idNegocio || item.id) === localStorage.getItem("idNegocio")) || catalog[0];
        if (selected) setBusinessId(String(selected.idNegocio || selected.id));
      } catch (caught) {
        if (mounted) setError(caught instanceof Error ? caught.message : "No fue posible cargar los catálogos.");
      } finally {
        if (mounted) setIsLoadingCatalog(false);
      }
    }
    void loadCatalog();
    return () => { mounted = false; };
  }, [role]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !businessId) {
      setServices([]);
      setResources([]);
      return;
    }
    let mounted = true;
    setServiceId("");
    setResourceId("");
    async function loadOptions() {
      try {
        const [serviceRows, resourceRows] = await Promise.all([
          listarServicios(Number(businessId), token),
          listarRecursos(Number(businessId), token),
        ]);
        if (!mounted) return;
        setServices(serviceRows);
        setResources(resourceRows);
      } catch (caught) {
        if (mounted) setError(caught instanceof Error ? caught.message : "No fue posible cargar servicios y recursos.");
      }
    }
    void loadOptions();
    return () => { mounted = false; };
  }, [businessId]);

  function validate(): string | null {
    if (dateFrom || dateTo) {
      if (!dateFrom || !dateTo) return "Debes indicar fecha desde y fecha hasta juntas.";
      if (dateFrom > dateTo) return "La fecha desde no puede ser posterior a la fecha hasta.";
    }
    return null;
  }

  async function handleGenerate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Tu sesión expiró. Inicia sesión nuevamente.");
      return;
    }
    const payload: ReporteCommand = {
      tipoReporte: reportType,
      formato: format,
    };
    if (dateFrom && dateTo) {
      payload.fechaDesde = dateFrom;
      payload.fechaHasta = dateTo;
    }
    if (role === "proveedor" && businessId) payload.idNegocio = Number(businessId);
    if (serviceId) payload.idServicio = Number(serviceId);
    if (resourceId) payload.idRecurso = Number(resourceId);
    if (status) payload.estado = status;

    setIsGenerating(true);
    try {
      const file = await generarReporte(payload, token);
      const url = URL.createObjectURL(file.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setSuccess(`Descarga iniciada: ${file.filename}. El archivo puede indicar que no existen registros.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible generar el reporte.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-mimi-pink)]/40 p-4 pb-24 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="border-b border-[var(--color-dusty-rose)] pb-4">
          <h1 className="font-['Fraunces',serif] text-3xl font-bold text-[var(--color-cacao)]">Reportes</h1>
          <p className="mt-1 text-sm text-[var(--color-cacao)]/80">Genera y descarga reportes directamente desde el servidor.</p>
        </header>

        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle size={18} /> <span>{error}</span>
          </div>
        )}
        {success && (
          <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <CheckCircle2 size={18} /> <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleGenerate} noValidate className="space-y-5 rounded-3xl border border-[var(--color-dusty-rose)] bg-[var(--color-cream)] p-5 md:p-7">
          <fieldset className="space-y-3">
            <legend className="text-xs font-bold uppercase tracking-wider text-[var(--color-cacao)]">Tipo de reporte</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ["RESERVAS", "Reservas"],
                ["USO_SERVICIOS_RECURSOS", "Uso de servicios y recursos"],
              ] as const).map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-dusty-rose)] bg-white p-3 text-sm font-semibold">
                  <input type="radio" name="reportType" value={value} checked={reportType === value} onChange={() => setReportType(value)} className="accent-[var(--color-pompadour)]" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="dateFrom" className="text-xs font-bold text-[var(--color-cacao)]">Fecha desde</label>
              <input id="dateFrom" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="w-full rounded-xl border border-[var(--color-dusty-rose)] bg-white px-3 py-2.5 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="dateTo" className="text-xs font-bold text-[var(--color-cacao)]">Fecha hasta</label>
              <input id="dateTo" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-describedby={dateFrom !== dateTo && (dateFrom || dateTo) ? "date-error" : undefined} aria-invalid={Boolean(validate())} className="w-full rounded-xl border border-[var(--color-dusty-rose)] bg-white px-3 py-2.5 text-sm" />
            </div>
          </div>

          {role === "proveedor" && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="business" className="text-xs font-bold text-[var(--color-cacao)]">Negocio</label>
                {isLoadingCatalog ? (
                  <p className="text-xs">Cargando negocios...</p>
                ) : (
                  <select id="business" value={businessId} onChange={(event) => setBusinessId(event.target.value)} className="w-full rounded-xl border border-[var(--color-dusty-rose)] bg-white px-3 py-2.5 text-sm">
                    {businesses.map((business) => (
                      <option key={String(business.idNegocio || business.id)} value={String(business.idNegocio || business.id)}>{business.nombre || "Negocio"}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="service" className="text-xs font-bold text-[var(--color-cacao)]">Servicio</label>
                <select id="service" value={serviceId} onChange={(event) => setServiceId(event.target.value)} className="w-full rounded-xl border border-[var(--color-dusty-rose)] bg-white px-3 py-2.5 text-sm">
                  <option value="">Todos los servicios</option>
                  {services.map((service) => (
                    <option key={String(service.idServicio || service.id)} value={String(service.idServicio || service.id)}>{service.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="resource" className="text-xs font-bold text-[var(--color-cacao)]">Recurso</label>
                <select id="resource" value={resourceId} onChange={(event) => setResourceId(event.target.value)} className="w-full rounded-xl border border-[var(--color-dusty-rose)] bg-white px-3 py-2.5 text-sm">
                  <option value="">Todos los recursos</option>
                  {resources.map((resource) => (
                    <option key={String(resource.idRecurso || resource.id)} value={String(resource.idRecurso || resource.id)}>{resource.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-xs font-bold text-[var(--color-cacao)]">Estado</label>
              <select id="status" value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-[var(--color-dusty-rose)] bg-white px-3 py-2.5 text-sm">
                <option value="">Todos los estados</option>
                <option value="ACTIVA">Activa</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="CANCELADA_POR_EL_PROVEEDOR">Cancelada por el proveedor</option>
              </select>
            </div>
            <fieldset className="space-y-1.5">
              <legend className="text-xs font-bold text-[var(--color-cacao)]">Formato</legend>
              <div className="flex gap-3">
                {(["PDF", "EXCEL"] as const).map((value) => (
                  <label key={value} className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--color-dusty-rose)] bg-white px-3 py-2.5 text-sm font-semibold">
                    <input type="radio" name="format" value={value} checked={format === value} onChange={() => setFormat(value)} className="accent-[var(--color-pompadour)]" />
                    {value === "PDF" ? "PDF" : "Excel"}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {validate() && <p id="date-error" className="text-xs font-medium text-rose-700">{validate()}</p>}

          <button type="submit" disabled={isGenerating} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-pompadour-ink)] px-6 py-3 text-sm font-bold text-white shadow-md disabled:opacity-60">
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isGenerating ? "Generando reporte..." : "Generar y descargar"}
          </button>
        </form>
      </div>
    </main>
  );
};
