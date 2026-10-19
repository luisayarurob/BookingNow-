export const CATEGORIAS_NEGOCIO = [
  "Belleza y estética",
  "Spa y bienestar",
  "Uñas y nail art",
  "Maquillaje",
  "Masajes terapéuticos",
  "Tatuajes y piercings",
  "Fotografía y video",
  "Psicología y coaching",
  "Deportes y entrenamiento personal",
  "Clases de música y arte",
] as const;

export const CATEGORIAS_SERVICIO_POR_NEGOCIO: Record<string, string[]> = {
  "Belleza y estética": ["Cejas", "Pestañas", "Limpieza facial", "Depilación facial", "Maquillaje"],
  "Spa y bienestar": ["Masaje relajante", "Masaje terapéutico", "Aromaterapia", "Tratamiento corporal", "Facial"],
  "Uñas y nail art": ["Manicure", "Pedicure", "Uñas semipermanentes", "Uñas acrílicas", "Nail art"],
  "Maquillaje": ["Maquillaje social", "Maquillaje para eventos", "Maquillaje de novia", "Automaquillaje"],
  "Masajes terapéuticos": ["Masaje relajante", "Masaje deportivo", "Masaje descontracturante", "Drenaje linfático"],
  "Tatuajes y piercings": ["Tatuaje", "Retoque de tatuaje", "Diseño personalizado", "Piercing"],
  "Fotografía y video": ["Sesión fotográfica", "Fotografía de producto", "Video para eventos", "Edición de video"],
  "Psicología y coaching": ["Consulta psicológica", "Terapia individual", "Terapia de pareja", "Sesión de coaching"],
  "Deportes y entrenamiento personal": ["Entrenamiento personal", "Plan de ejercicios", "Clase grupal", "Evaluación física"],
  "Clases de música y arte": ["Clase de música", "Clase de dibujo", "Clase de pintura", "Taller artístico"],
};

const CATEGORIAS_SERVICIO_GENERALES = [
  "Consulta",
  "Sesión personalizada",
  "Servicio a domicilio",
  "Servicio básico",
  "Servicio premium",
];

export function obtenerCategoriasDeServicio(categoriaNegocio?: string): string[] {
  return CATEGORIAS_SERVICIO_POR_NEGOCIO[categoriaNegocio || ""] || CATEGORIAS_SERVICIO_GENERALES;
}
