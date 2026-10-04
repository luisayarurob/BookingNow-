import { LogOut, Scissors, Sparkles, Wrench } from "lucide-react";

interface HomeProps {
  onLogout?: () => void;
}

export default function Home({ onLogout }: HomeProps) {
  return (
    <div className="min-h-screen bg-[#FFDDED] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E6C1C6] bg-[#FCF6EF]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F7769B]/15">
              <Scissors className="text-[#F7769B]" size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8D93CB]">
                BookingNow
              </p>
              <p className="font-display text-xl font-semibold text-[#493333]">
                Vista Cliente
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200"
            >
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#FCF6EF] rounded-3xl border border-[#E6C1C6] p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#F7769B]/15 flex items-center justify-center mx-auto mb-5 text-[#F7769B]">
            <Wrench size={32} strokeWidth={1.5} />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#F7C9D7] bg-[#FFDDED] px-3 py-1 text-xs font-semibold text-[#493333] mb-4">
            <Sparkles size={13} className="text-[#F7769B]" />
            Módulo en desarrollo
          </div>

          <h1 className="font-display text-3xl font-semibold text-[#493333] mb-3">
            Página en proceso
          </h1>

          <p className="text-sm text-[#493333]/70 leading-relaxed mb-6">
            Estamos diseñando y construyendo esta sección para ofrecerte la mejor experiencia de exploración y reserva de servicios.
          </p>

          <div className="p-4 rounded-2xl bg-[#FFDDED]/50 border border-[#E6C1C6] text-xs text-[#8D93CB] font-medium">
            ¡Estará disponible muy pronto!
          </div>
        </div>
      </main>
    </div>
  );
}
