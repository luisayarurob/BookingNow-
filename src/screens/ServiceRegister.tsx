import { useState, useRef } from "react";
import { CheckCircle2, ImagePlus, X, Scissors } from "lucide-react";

interface ServiceRegisterProps {
  businessName: string;
  onSuccess: () => void;
}

const inputBase =
  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all placeholder-[#8D93CB] bg-white/60 focus:ring-2 focus:ring-[#F7769B]/40 focus:border-[#F7769B]";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-wide text-[#493333]/70 uppercase">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function ServiceRegister({ businessName, onSuccess }: ServiceRegisterProps) {
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (serviceName.trim().length < 3) errs.name = "Mínimo 3 caracteres.";
    if (!description.trim()) errs.description = "Agrega una descripción del servicio.";
    const dur = Number(duration);
    if (!duration || isNaN(dur) || dur <= 0) errs.duration = "La duración debe ser mayor a 0 minutos.";
    const pr = Number(price);
    if (price === "" || isNaN(pr) || pr < 0) errs.price = "El precio no puede ser negativo.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSuccess(true);
  }

  return (
    <div className="min-h-screen bg-[#FFDDED] flex items-center justify-center p-6 py-12">
      {success && (
        <div className="fixed inset-0 bg-[#493333]/30 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#FCF6EF] rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl border border-[#E6C1C6]">
            <CheckCircle2 className="mx-auto mb-4 text-[#F7769B]" size={56} strokeWidth={1.5} />
            <h2 className="font-display text-2xl text-[#493333] mb-2">¡Servicio creado!</h2>
            <p className="text-sm text-[#493333]/70 mb-6">El servicio fue registrado exitosamente y ya está disponible en tu catálogo.</p>
            <button
              onClick={onSuccess}
              className="w-full bg-[#F7769B] text-white font-semibold py-3 rounded-xl hover:bg-[#f55d87] transition-colors"
            >
              Ver mis servicios
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#F7769B]/15 flex items-center justify-center mx-auto mb-4">
            <Scissors className="text-[#F7769B]" size={26} strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl font-semibold text-[#493333] mb-1">Nuevo servicio</h1>
          <p className="text-sm text-[#493333]/60">Agrega los detalles del servicio que ofreces</p>
        </div>

        <div className="bg-[#FCF6EF] rounded-3xl shadow-xl border border-[#E6C1C6] p-8">
          <form onSubmit={submit} className="flex flex-col gap-5">
            {/* Locked business field */}
            <Field label="Negocio asociado">
              <div className="flex items-center gap-3 bg-[#FFDDED]/80 border border-[#E6C1C6] rounded-xl px-4 py-3">
                <div className="w-6 h-6 rounded-full bg-[#F7769B]/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#F7769B]" />
                </div>
                <span className="text-sm font-medium text-[#493333]">{businessName}</span>
                <span className="ml-auto text-xs text-[#8D93CB] bg-[#8D93CB]/10 px-2 py-0.5 rounded-full">Fijo</span>
              </div>
            </Field>

            <Field label="Nombre del servicio" error={errors.name}>
              <input
                className={`${inputBase} ${errors.name ? "border-red-400" : "border-[#E6C1C6]"}`}
                value={serviceName} onChange={e => setServiceName(e.target.value)}
                placeholder="Ej: Manicura semipermanente"
              />
            </Field>

            <Field label="Descripción" error={errors.description}>
              <textarea
                rows={3}
                className={`${inputBase} resize-none ${errors.description ? "border-red-400" : "border-[#E6C1C6]"}`}
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe el servicio, qué incluye, beneficios..."
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Duración (min)" error={errors.duration}>
                <input
                  type="number"
                  min={1}
                  className={`${inputBase} ${errors.duration ? "border-red-400" : "border-[#E6C1C6]"}`}
                  value={duration} onChange={e => setDuration(e.target.value)}
                  placeholder="60"
                />
              </Field>
              <Field label="Precio (COP)" error={errors.price}>
                <input
                  type="number"
                  min={0}
                  className={`${inputBase} ${errors.price ? "border-red-400" : "border-[#E6C1C6]"}`}
                  value={price} onChange={e => setPrice(e.target.value)}
                  placeholder="80000"
                />
              </Field>
            </div>

            {/* Image */}
            <Field label="Imagen de referencia">
              <div
                onClick={() => imageRef.current?.click()}
                className="cursor-pointer rounded-xl border-2 border-dashed border-[#E6C1C6] hover:border-[#F7769B] transition-colors overflow-hidden"
              >
                {imagePreview ? (
                  <div className="relative h-40">
                    <img src={imagePreview} alt="Referencia" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setImage(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white"
                    >
                      <X size={14} className="text-[#493333]" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8 text-[#8D93CB]">
                    <ImagePlus size={28} strokeWidth={1.5} />
                    <span className="text-sm">Agregar imagen de referencia</span>
                    <span className="text-xs opacity-60">Opcional — JPG, PNG, WEBP</span>
                  </div>
                )}
              </div>
              <input
                ref={imageRef} type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setImage(f); setImagePreview(URL.createObjectURL(f)); }
                }}
              />
            </Field>

            <button
              type="submit"
              className="mt-2 w-full bg-[#F7769B] text-white font-semibold py-3.5 rounded-xl hover:bg-[#f55d87] active:scale-[0.98] transition-all shadow-md shadow-[#F7769B]/30"
            >
              Crear servicio
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
