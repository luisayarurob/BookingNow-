import { useState, useRef } from "react";
import { CheckCircle2, ImagePlus, X, Scissors } from "lucide-react";
import { createService } from "../services/apiService";
import { saveServiceImage } from "../services/imageStorage";
import { obtenerCategoriasDeServicio } from "../config/categorias";

interface ServiceRegisterProps {
  businessName: string;
  businessCategory?: string;
  onSuccess: () => void;
}

const inputBase =
  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all placeholder-[#8D93CB] bg-white/60 focus:ring-2 focus:ring-[#F7769B]/40 focus:border-[#F7769B]";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("No fue posible leer la imagen."));
    };
    reader.onerror = () => reject(new Error("No fue posible leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-wide text-[#493333]/70 uppercase">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function ServiceRegister({ businessName, businessCategory, onSuccess }: ServiceRegisterProps) {
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  
  // Modificado: Ahora soporta múltiples imágenes
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const serviceCategories = obtenerCategoriasDeServicio(businessCategory);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImages((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
    // Reseteamos el input para permitir subir el mismo archivo si fue eliminado por error
    if (imageRef.current) imageRef.current.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (serviceName.trim().length < 3) errs.name = "Mínimo 3 caracteres.";
    if (!description.trim()) errs.description = "Agrega una descripción del servicio.";
    if (!serviceCategory) errs.category = "Selecciona una categoría para el servicio.";
    const dur = Number(duration);
    if (!duration || isNaN(dur) || dur <= 0) errs.duration = "La duración debe ser mayor a 0 minutos.";
    const pr = Number(price);
    if (price === "" || isNaN(pr) || pr < 0) errs.price = "El precio no puede ser negativo.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const token = localStorage.getItem("token");
    const businessId = Number(localStorage.getItem("idNegocio"));
    if (!token) {
      setErrors({ name: "Tu sesión expiró. Inicia sesión nuevamente." });
      return;
    }
    if (!Number.isInteger(businessId) || businessId <= 0) {
      setErrors({ name: "No se encontró el negocio asociado." });
      return;
    }

    try {
      // Modificado: Convertimos todas las imágenes a base64
      const base64Images = await Promise.all(images.map((img) => fileToBase64(img)));
      
      const createdService = await createService(businessId, {
        nombre: serviceName.trim(),
        duracionMinutos: Number(duration),
        precio: Number(price),
        descripcion: description.trim(),
        tipoServicio: serviceCategory,
        imagenReferenciaBase64: base64Images[0] || undefined, // La primera es la principal
        imagenesBase64: base64Images, // Mandamos el arreglo completo para el carrusel
      }, token);

      if (images.length > 0) {
        const serviceData = createdService as { idServicio?: number; id?: number };
        const imageKey = String(serviceData.idServicio || serviceData.id || `${businessId}:${serviceName.trim()}`);
        // Guardamos localmente la imagen principal
        await saveServiceImage(imageKey, images[0]);
      }

      setErrors({});
      setSuccess(true);
    } catch (error) {
      const apiError = error as Error & { fields?: Record<string, string> };
      const fields = apiError.fields || {};
      setErrors({
        name: fields.nombre || apiError.message,
        category: fields.tipoServicio,
        description: fields.descripcion,
        duration: fields.duracionMinutos,
        price: fields.precio,
      });
    }
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
          {errors.general && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {errors.general}
            </div>
          )}
          <form onSubmit={submit} className="flex flex-col gap-5">
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

            <Field label="Tipo de servicio" error={errors.category}>
              <select
                className={`${inputBase} ${errors.category ? "border-red-400" : "border-[#E6C1C6]"} appearance-none cursor-pointer`}
                value={serviceCategory}
                onChange={e => setServiceCategory(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {serviceCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
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

            {/* Selector Múltiple de Imágenes */}
            <Field label="Imágenes del servicio">
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative h-24 rounded-xl border border-[#E6C1C6] overflow-hidden group">
                    <img src={preview} alt={`Referencia ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                      className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <X size={14} className="text-red-500" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#F7769B]/90 text-white text-[10px] text-center py-0.5 font-medium">
                        Principal
                      </div>
                    )}
                  </div>
                ))}
                
                <div
                  onClick={() => imageRef.current?.click()}
                  className="h-24 cursor-pointer rounded-xl border-2 border-dashed border-[#E6C1C6] hover:border-[#F7769B] hover:bg-[#F7769B]/5 transition-colors flex flex-col items-center justify-center text-[#8D93CB]"
                >
                  <ImagePlus size={24} strokeWidth={1.5} className="mb-1" />
                  <span className="text-[10px] font-medium">Añadir foto</span>
                </div>
              </div>

              <input
                ref={imageRef} 
                type="file" 
                accept="image/*" 
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
              <span className="text-[10px] text-[#493333]/50 mt-1">La primera imagen será la de portada. Opcional — JPG, PNG, WEBP</span>
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