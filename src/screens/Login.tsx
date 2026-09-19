import { useState } from "react";
import { iniciarSesion } from "../services/apiService";
import { Eye, EyeOff, AlertTriangle, Lock } from "lucide-react";

interface LoginProps {
  onGoRegister: () => void;
  onSuccess: (role: "cliente" | "proveedor") => void;
}

export default function Login({ onGoRegister, onSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<"credentials" | "empty" | "blocked" | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !pw.trim()) {
      setError("empty");
      return;
    }

    try {
      const data = await iniciarSesion(email, pw);
      console.log("Respuesta del backend:", data);

      localStorage.setItem("token", data.token);
      localStorage.setItem("cuenta", JSON.stringify(data.cuenta));

      setError(null);

      const role = data.cuenta?.rol?.toLowerCase();

      if (role === "cliente" || role === "proveedor") {
        onSuccess(role);
      }
    } catch (error) {
      console.error(error);
      setError("credentials");
    }
  }

  const inputBase =
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all placeholder-[#8D93CB] bg-white/60 focus:ring-2 focus:ring-[#F7769B]/40 focus:border-[#F7769B]";
  const fieldErr = (field: "email" | "pw") =>
    error === "empty" && !( field === "email" ? email.trim() : pw.trim() )
      ? "border-red-400 focus:border-red-400"
      : "border-[#E6C1C6]";

  return (
    <div className="min-h-screen bg-[#FFDDED] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#F7769B]/15 flex items-center justify-center mx-auto mb-4">
            <Lock className="text-[#F7769B]" size={26} strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl font-semibold text-[#493333] mb-1">Bienvenida</h1>
          <p className="text-sm text-[#493333]/60">Ingresa a tu cuenta para continuar</p>
        </div>

        <div className="bg-[#FCF6EF] rounded-3xl shadow-xl border border-[#E6C1C6] p-8">
          {/* Error banners */}
          {error === "credentials" && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertTriangle className="text-red-500 shrink-0" size={16} />
              <p className="text-sm text-red-600 font-medium">Correo o contraseña incorrectos.</p>
            </div>
          )}
          {error === "empty" && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertTriangle className="text-red-500 shrink-0" size={16} />
              <p className="text-sm text-red-600 font-medium">Por favor completa todos los campos.</p>
            </div>
          )}
          {error === "blocked" && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <AlertTriangle className="text-amber-500 shrink-0" size={16} />
              <p className="text-sm text-amber-700 font-medium">La cuenta no se encuentra habilitada.</p>
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-[#493333]/70 uppercase">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className={`${inputBase} ${fieldErr("email")}`}
              />
              {error === "empty" && !email.trim() && (
                <p className="text-xs text-red-500">Este campo es requerido.</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-[#493333]/70 uppercase">Contraseña</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  placeholder="Tu contraseña"
                  className={`${inputBase} pr-10 ${fieldErr("pw")}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D93CB] hover:text-[#F7769B] transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error === "empty" && !pw.trim() && (
                <p className="text-xs text-red-500">Este campo es requerido.</p>
              )}
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-[#F7769B] text-white font-semibold py-3.5 rounded-xl hover:bg-[#f55d87] active:scale-[0.98] transition-all shadow-md shadow-[#F7769B]/30"
            >
              Iniciar sesión
            </button>
          </form>

          <p className="text-center text-sm text-[#493333]/60 mt-6">
            ¿No tienes cuenta?{" "}
            <button onClick={onGoRegister} className="text-[#F7769B] font-semibold hover:underline">
              Regístrate
            </button>
          </p>

          <div className="mt-6 pt-5 border-t border-[#E6C1C6]">
            <p className="text-xs text-[#493333]/40 text-center font-medium mb-3">Cuentas demo</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setEmail("cliente@demo.com"); setPw("Cliente1!"); setError(null); }}
                className="text-xs bg-[#FFDDED] border border-[#E6C1C6] rounded-lg py-2 px-3 text-[#493333]/70 hover:border-[#F7769B] hover:text-[#F7769B] transition-colors"
              >
                Demo Cliente
              </button>
              <button
                type="button"
                onClick={() => { setEmail("proveedor@demo.com"); setPw("Proveedor1!"); setError(null); }}
                className="text-xs bg-[#FFDDED] border border-[#E6C1C6] rounded-lg py-2 px-3 text-[#493333]/70 hover:border-[#F7769B] hover:text-[#F7769B] transition-colors"
              >
                Demo Proveedor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
