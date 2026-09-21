import type { Screen } from "../../types/navigation";

interface DemoNavProps {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
}

const NAV_ITEMS: { id: Screen; label: string }[] = [
  { id: "login", label: "Login" },
  { id: "register", label: "Registro" },
  { id: "home", label: "Home" },
];

export default function DemoNav({ screen, onNavigate }: DemoNavProps) {
  return (
    <nav className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-2xl border border-[#E6C1C6] bg-[#FCF6EF]/90 px-3 py-2 shadow-xl backdrop-blur">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
            screen === item.id
              ? "bg-[#F7769B] text-white shadow-sm"
              : "text-[#493333]/60 hover:bg-[#FFDDED] hover:text-[#493333]"
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}