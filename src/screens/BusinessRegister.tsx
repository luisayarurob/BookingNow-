import { useState, useRef, useCallback } from "react";
import { CheckCircle2, Upload, X, ImagePlus, Building2 } from "lucide-react";

interface BusinessRegisterProps {
  onSuccess: () => void;
}

const CATEGORIES = [
  "Belleza y estética",
  "Spa y bienestar",
  "Peluquería",
  "Uñas y nail art",
  "Maquillaje",
  "Masajes terapéuticos",
  "Depilación",
  "Tatuajes y piercings",
  "Barbería",
];

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

export default function BusinessRegister({ onSuccess }: BusinessRegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [isVirtual, setIsVirtual] = useState(false);
  const [mainPhoto, setMainPhoto] = useState<File | null>(null);
  const [mainPhotoPreview, setMainPhotoPreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const mainPhotoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function handleMainPhoto(file: File) {
    setMainPhoto(file);
    setMainPhotoPreview(URL.createObjectURL(file));
  }

  function handleGalleryFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    setGallery(prev => [...prev, ...arr]);
    setGalleryPreviews(prev => [...prev, ...arr.map(f => URL.createObjectURL(f))]);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleGalleryFiles(e.dataTransfer.files);
  }, []);

  function removeGalleryItem(idx: number) {
    setGallery(prev => prev.filter((_, i) => i !== idx));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 3) errs.name = "Mínimo 3 caracteres.";
    if (!EMAIL_REGEX.test(email)) errs.email = "Correo no válido.";
    if (!phone.trim()) errs.phone = "Campo requerido.";
    if (!isVirtual && !address.trim()) errs.address = "Ingresa la dirección del negocio.";
    if (!category) errs.category = "Selecciona una categoría.";
    if (!mainPhoto) errs.mainPhoto = "Agrega una foto principal.";
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
            <h2 className="font-display text-2xl text-[#493333] mb-2">¡Negocio creado!</h2>
            <p className="text-sm text-[#493333]/70 mb-6">Tu negocio fue registrado exitosamente. Ahora puedes agregar tus servicios.</p>
            <button
              onClick={onSuccess}
              className="w-full bg-[#F7769B] text-white font-semibold py-3 rounded-xl hover:bg-[#f55d87] transition-colors"
            >
              Agregar servicio
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#F7769B]/15 flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-[#F7769B]" size={26} strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl font-semibold text-[#493333] mb-1">Registra tu negocio</h1>
          <p className="text-sm text-[#493333]/60">Completa la información para comenzar a ofrecer tus servicios</p>
        </div>

        <div className="bg-[#FCF6EF] rounded-3xl shadow-xl border border-[#E6C1C6] p-8">
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre del negocio" error={errors.name}>
                <input
                  className={`${inputBase} ${errors.name ? "border-red-400" : "border-[#E6C1C6]"}`}
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ej: Studio Belleza Rosa"
                />
              </Field>
              <Field label="Correo del negocio" error={errors.email}>
                <input
                  type="email"
                  className={`${inputBase} ${errors.email ? "border-red-400" : "border-[#E6C1C6]"}`}
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="negocio@correo.com"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Número de contacto" error={errors.phone}>
                <input
                  type="tel"
                  className={`${inputBase} ${errors.phone ? "border-red-400" : "border-[#E6C1C6]"}`}
                  value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+57 300 000 0000"
                />
              </Field>
              <Field label="Categoría" error={errors.category}>
                <select
                  className={`${inputBase} ${errors.category ? "border-red-400" : "border-[#E6C1C6]"} appearance-none cursor-pointer`}
                  value={category} onChange={e => setCategory(e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            {/* Virtual toggle */}
            <div className="flex items-center gap-3 bg-[#FFDDED]/60 rounded-xl px-4 py-3 border border-[#E6C1C6]">
              <button
                type="button"
                onClick={() => setIsVirtual(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${isVirtual ? "bg-[#F7769B]" : "bg-[#E6C1C6]"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isVirtual ? "translate-x-5" : ""}`} />
              </button>
              <div>
                <p className="text-sm font-semibold text-[#493333]">¿Es modalidad virtual?</p>
                <p className="text-xs text-[#493333]/50">{isVirtual ? "Servicio en línea — sin dirección física" : "Servicio presencial"}</p>
              </div>
            </div>

            {!isVirtual && (
              <Field label="Dirección" error={errors.address}>
                <input
                  className={`${inputBase} ${errors.address ? "border-red-400" : "border-[#E6C1C6]"}`}
                  value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Calle 123 # 45-67, Ciudad"
                />
              </Field>
            )}

            {/* Main photo */}
            <Field label="Foto principal" error={errors.mainPhoto}>
              <div
                onClick={() => mainPhotoRef.current?.click()}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors overflow-hidden ${errors.mainPhoto ? "border-red-400" : "border-[#E6C1C6] hover:border-[#F7769B]"}`}
              >
                {mainPhotoPreview ? (
                  <div className="relative h-44">
                    <img src={mainPhotoPreview} alt="Foto principal" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setMainPhoto(null); setMainPhotoPreview(null); }}
                      className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white"
                    >
                      <X size={14} className="text-[#493333]" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-8 text-[#8D93CB]">
                    <ImagePlus size={28} strokeWidth={1.5} />
                    <span className="text-sm">Haz clic para subir la foto principal</span>
                  </div>
                )}
              </div>
              <input ref={mainPhotoRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleMainPhoto(e.target.files[0])} />
            </Field>

            {/* Gallery */}
            <Field label="Galería multimedia">
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => galleryRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 transition-colors ${dragging ? "border-[#F7769B] bg-[#F7769B]/5" : "border-[#E6C1C6] hover:border-[#F7769B]"}`}
              >
                {gallery.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 text-[#8D93CB]">
                    <Upload size={24} strokeWidth={1.5} />
                    <p className="text-sm">Arrastra imágenes o haz clic para seleccionar</p>
                    <p className="text-xs opacity-60">JPG, PNG, GIF, WEBP</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2" onClick={e => e.stopPropagation()}>
                    {galleryPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#FFDDED]">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(i)}
                          className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 hover:bg-white"
                        >
                          <X size={10} className="text-[#493333]" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => galleryRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-[#E6C1C6] flex items-center justify-center text-[#8D93CB] hover:border-[#F7769B] hover:text-[#F7769B] transition-colors"
                    >
                      <ImagePlus size={20} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
              </div>
              <input ref={galleryRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={e => e.target.files && handleGalleryFiles(e.target.files)} />
            </Field>

            <button
              type="submit"
              className="mt-2 w-full bg-[#F7769B] text-white font-semibold py-3.5 rounded-xl hover:bg-[#f55d87] active:scale-[0.98] transition-all shadow-md shadow-[#F7769B]/30"
            >
              Crear negocio
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
