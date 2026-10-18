import { LogOut, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";

interface ClientNavProps {
  onLogout: () => void;
}

export default function ClientNav({ onLogout }: ClientNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-[#493333]/20 backdrop-blur-[2px]"
        />
      )}

      <button
        type="button"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(open => !open)}
        className="fixed right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-[#E6C1C6] bg-[#FCF6EF] text-[#493333] shadow-lg transition hover:border-[#F7769B] hover:text-[#F7769B]"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        aria-label="Menú del cliente"
        className={`fixed right-0 top-0 z-40 flex h-full w-72 flex-col border-l border-[#E6C1C6] bg-[#FCF6EF] p-6 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-[#E6C1C6] pb-6 pr-12">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7769B]/15">
            <UserRound className="text-[#F7769B]" size={19} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8D93CB]">BookingNow</p>
            <p className="font-display text-lg font-semibold text-[#493333]">Panel cliente</p>
          </div>
        </div>

        <div className="mt-auto border-t border-[#E6C1C6] pt-5">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}