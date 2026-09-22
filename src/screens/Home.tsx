import { Construction, LogOut, Scissors } from "lucide-react";

interface HomeProps {
  onLogout?: () => void;
}

export default function Home({ onLogout }: HomeProps) {
  return (
    <div className="min-h-screen bg-[#FFDDED]">
      <header className="sticky top-0 z-10 border-b border-[#E6C1C6] bg-[#FCF6EF]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F7769B]/15">
              <Scissors className="text-[#F7769B]" size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8D93CB]">BookingNow</p>
              <p className="font-display text-xl font-semibold text-[#493333]">Descubre más pronto...</p>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-12">
        <section className="w-full max-w-xl rounded-3xl border border-[#E6C1C6] bg-[#FCF6EF] p-10 text-center shadow-xl shadow-[#493333]/10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7769B]/15">
            <Construction className="text-[#F7769B]" size={30} strokeWidth={1.5} />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8D93CB]">BookingNow</p>
          <h1 className="font-display text-4xl font-semibold text-[#493333]">En construcción</h1>
          <p className="mt-3 text-sm text-[#493333]/65">Estamos preparando esta experiencia para ti.</p>
        </section>
      </main>
    </div>
  );
}