import { BarChart3, CalendarClock, ClipboardCheck, List, LogOut, Menu, Package, Scissors, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Screen } from "../../types/navigation";

interface ProviderNavProps {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  role?: "proveedor" | "administrador";
}

export default function ProviderNav({ screen, onNavigate, onLogout, role = "proveedor" }: ProviderNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);

  function navigateTo(nextScreen: Screen) {
    onNavigate(nextScreen);
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) {
      if (wasOpen.current) triggerRef.current?.focus();
      wasOpen.current = false;
      return;
    }

    wasOpen.current = true;
    menuRef.current?.querySelector<HTMLButtonElement>("nav button:not(:disabled)")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const buttons = menuRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
      if (!buttons?.length) return;
      const firstButton = buttons.item(0);
      const lastButton = buttons.item(buttons.length - 1);
      if (!firstButton || !lastButton) return;

      if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault();
        lastButton.focus();
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault();
        firstButton.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-[#493333]/20 backdrop-blur-[2px]"
        />
      )}

      <button
        ref={triggerRef}
        type="button"
        aria-label={isOpen ? "Cerrar menú del proveedor" : "Abrir menú del proveedor"}
        aria-expanded={isOpen}
        aria-controls="provider-navigation-panel"
        onClick={() => setIsOpen(open => !open)}
        className="fixed right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-[#E6C1C6] bg-[#FCF6EF] text-[#493333] shadow-lg transition hover:border-[#F7769B] hover:text-[var(--color-pompadour-ink)]"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        ref={menuRef}
        id="provider-navigation-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menú del proveedor"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`fixed right-0 top-0 z-40 flex h-full w-72 flex-col border-l border-[#E6C1C6] bg-[#FCF6EF] p-6 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-[#E6C1C6] pb-6 pr-12">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7769B]/15">
            <Scissors className="text-[var(--color-pompadour-ink)]" size={19} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-vista-blue-ink)]">BookingNow</p>
            <p className="font-display text-lg font-semibold text-[#493333]">Panel proveedor</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-col gap-2">
          {role === "administrador" && (
            <button
              type="button"
              onClick={() => navigateTo("reports")}
              aria-current={screen === "reports" ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${screen === "reports" ? "bg-[#FFDDED] text-[var(--color-pompadour-ink)]" : "text-[#493333]/75 hover:bg-[#FFDDED]"}`}
            >
              <BarChart3 size={18} />
              Reportes
            </button>
          )}
          {role === "proveedor" && (
          <>
          <button
            type="button"
            onClick={() => navigateTo("service-list")}
            aria-current={screen === "service-list" ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
              screen === "service-list"
                ? "bg-[#FFDDED] text-[var(--color-pompadour-ink)]"
                : "text-[#493333]/75 hover:bg-[#FFDDED] hover:text-[var(--color-pompadour-ink)]"
            }`}
          >
            <List size={18} />
            Listar servicios
          </button>
          <button
            type="button"
            onClick={() => navigateTo("employee-register")}
            aria-current={screen === "employee-register" ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
              screen === "employee-register"
                ? "bg-[#FFDDED] text-[var(--color-pompadour-ink)]"
                : "text-[#493333]/75 hover:bg-[#FFDDED] hover:text-[var(--color-pompadour-ink)]"
            }`}
          >
            <Users size={18} />
            Registrar empleados
          </button>
          <button
            type="button"
            onClick={() => navigateTo("resource-register")}
            aria-current={screen === "resource-register" ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
              screen === "resource-register"
                ? "bg-[#FFDDED] text-[var(--color-pompadour-ink)]"
                : "text-[#493333]/75 hover:bg-[#FFDDED] hover:text-[var(--color-pompadour-ink)]"
            }`}
          >
            <Package size={18} />
            Registrar recursos
          </button>
          <button
            type="button"
            onClick={() => navigateTo("business-schedule")}
            aria-current={screen === "business-schedule" ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
              screen === "business-schedule"
                ? "bg-[#FFDDED] text-[var(--color-pompadour-ink)]"
                : "text-[#493333]/75 hover:bg-[#FFDDED] hover:text-[var(--color-pompadour-ink)]"
            }`}
          >
            <CalendarClock size={18} />
            Editar horario
          </button>
          <button
            type="button"
            onClick={() => navigateTo("service-assignment")}
            aria-current={screen === "service-assignment" ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
              screen === "service-assignment"
                ? "bg-[#FFDDED] text-[var(--color-pompadour-ink)]"
                : "text-[#493333]/75 hover:bg-[#FFDDED] hover:text-[var(--color-pompadour-ink)]"
            }`}
          >
            <ClipboardCheck size={18} />
            Asignar servicios
          </button>
          <button
            type="button"
            onClick={() => navigateTo("reports")}
            aria-current={screen === "reports" ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${screen === "reports" ? "bg-[#FFDDED] text-[var(--color-pompadour-ink)]" : "text-[#493333]/75 hover:bg-[#FFDDED] hover:text-[var(--color-pompadour-ink)]"}`}
          >
            <BarChart3 size={18} />
            Reportes
          </button>
          </>
          )}
        </nav>

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
