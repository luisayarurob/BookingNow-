import React from "react";
import type { Screen } from "../../types/navigation";

interface DemoNavProps {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
}

export default function DemoNav({ screen, onNavigate }: DemoNavProps) {
  const screens: { id: Screen; label: string }[] = [
    { id: "login", label: "Login" },
    { id: "register", label: "Register" },
    { id: "client-home", label: "Cliente" },
    { id: "business-register", label: "Negocio" },
    { id: "business-schedule", label: "Horarios" },
    { id: "resource-register", label: "Recursos" },
    { id: "employee-register", label: "Empleados" },
    { id: "service-register", label: "Reg. Servicio" },
    { id: "service-assignment", label: "Asignaciones" },
    { id: "service-list", label: "List. Servicios" },
  ];

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-cream)]/95 border border-[var(--color-dusty-rose)] px-3 py-2 rounded-2xl shadow-lg backdrop-blur-xs flex items-center gap-1.5 overflow-x-auto max-w-[95vw] scrollbar-none">
      {screens.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onNavigate(s.id)}
          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            screen === s.id
              ? "bg-[var(--color-pompadour)] text-white shadow-xs"
              : "text-[var(--color-cacao)]/75 hover:bg-[var(--color-mimi-pink)]/40 hover:text-[var(--color-cacao)]"
          }`}
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}