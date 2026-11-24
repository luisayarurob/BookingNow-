import { useEffect, useRef, useState } from "react";
import { iniciarSesion } from "../services/apiService.ts";
import { Eye, EyeOff, AlertTriangle, Lock } from "lucide-react";

interface LoginProps {
  onGoRegister: () => void;
  onSuccess: (role: "cliente" | "proveedor" | "administrador") => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ onGoRegister, onSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<"credentials" | "empty" | "email" | "blocked" | null>(null);
  const [errorMessage, setErrorMessage] = useState("Correo o contraseña incorrectos.");
  const [emptyAttempt, setEmptyAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (emptyAttempt > 0) {
      formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
    }
  }, [emptyAttempt]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !pw.trim()) {
      setError("empty");
      setEmptyAttempt(attempt => attempt + 1);
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("email");
      setEmptyAttempt(attempt => attempt + 1);
      return;
    }

    try {
      const data = await iniciarSesion(email, pw);
      const accessToken = data.accessToken || data.token;
      if (!accessToken) {
        throw new Error("No se recibió el token de autenticación.");
      }
      localStorage.setItem("token", accessToken);
      localStorage.setItem("cuenta", JSON.stringify(data.cuenta));

      setError(null);

      const role = data.cuenta?.rol?.toLowerCase();

      if (role === "cliente" || role === "proveedor" || role === "administrador") {
        onSuccess(role);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "No fue posible iniciar sesión.");
      setError("credentials");
    }
  }

  const inputBase =
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all placeholder-[var(--color-vista-blue-ink)] bg-white/60 focus:ring-2 focus:ring-[#F7769B]/40 focus:border-[#F7769B]";
  const emailInvalid = error === "email" || (error === "empty" && !email.trim());
  const passwordInvalid = error === "empty" && !pw.trim();
  const fieldErr = (invalid: boolean) =>
    invalid ? "border-red-400 focus:border-red-400" : "border-[#E6C1C6]";

  return (
    <div className="min-h-screen bg-[#FFDDED] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#F7769B]/15 flex items-center justify-center mx-auto mb-4">
            <Lock className="text-[var(--color-pompadour-ink)]" size={26} strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-4xl font-semibold text-[#493333] mb-1">Bienvenido</h1>
          <p className="text-sm text-[#493333]/80">Ingresa a tu cuenta para continuar</p>
        </div>

        <div className="bg-[#FCF6EF] rounded-3xl shadow-xl border border-[#E6C1C6] p-8">
          {/* Error banners */}
          {error === "credentials" && (
            <div role="alert" aria-atomic="true" className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertTriangle className="text-red-500 shrink-0" size={16} />
              <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
            </div>
          )}
          {error === "empty" && (
            <div aria-hidden="true" className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertTriangle className="text-red-500 shrink-0" size={16} />
              <p className="text-sm text-red-600 font-medium">Por favor completa todos los campos.</p>
            </div>
          )}
          {error === "blocked" && (
            <div role="alert" aria-atomic="true" className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <AlertTriangle className="text-amber-500 shrink-0" size={16} />
              <p className="text-sm text-amber-700 font-medium">La cuenta no se encuentra habilitada.</p>
            </div>
          )}

          <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="login-email" className="text-xs font-semibold tracking-wide text-[#493333]/80 uppercase">Correo electrónico</label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={e => {
                  const value = e.target.value;
                  setEmail(value);
                  if (error === "email" || error === "empty" && value.trim() && pw.trim()) setError(null);
                }}
                placeholder="tu@correo.com"
                aria-invalid={emailInvalid || undefined}
                aria-describedby={emailInvalid ? "login-email-error" : undefined}
                className={`${inputBase} ${fieldErr(emailInvalid)}`}
              />
              {error === "email" && (
                <p id="login-email-error" className="text-xs text-red-700">Ingresa un correo electrónico válido.</p>
              )}
              {error === "empty" && !email.trim() && (
                <p id="login-email-error" className="text-xs text-red-700">Este campo es requerido.</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="login-password" className="text-xs font-semibold tracking-wide text-[#493333]/80 uppercase">Contraseña</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  required
                  value={pw}
                  onChange={e => {
                    const value = e.target.value;
                    setPw(value);
                    if (error === "empty" && email.trim() && value.trim()) setError(null);
                  }}
                  placeholder="Tu contraseña"
                  aria-invalid={passwordInvalid || undefined}
                  aria-describedby={passwordInvalid ? "login-password-error" : undefined}
                  className={`${inputBase} pr-10 ${fieldErr(passwordInvalid)}`}
                />
                <button
                  type="button"
                  aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-vista-blue-ink)] hover:text-[var(--color-pompadour-ink)] transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error === "empty" && !pw.trim() && (
                <p id="login-password-error" className="text-xs text-red-700">Este campo es requerido.</p>
              )}
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-[var(--color-pompadour-ink)] text-white font-semibold py-3.5 rounded-xl hover:bg-[#8F284B] active:scale-[0.98] transition-all shadow-md shadow-[#F7769B]/30"
            >
              Iniciar sesión
            </button>
          </form>

          <p className="text-center text-sm text-[#493333]/80 mt-6">
            ¿No tienes cuenta?{" "}
            <button onClick={onGoRegister} className="text-[var(--color-pompadour-ink)] font-semibold hover:underline">
              Regístrate
            </button>
          </p>

          <div className="mt-6 pt-5 border-t border-[#E6C1C6]">
            <p className="text-xs text-[#493333]/80 text-center font-medium mb-3">Cuentas demo</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setEmail("cliente@demo.com"); setPw("Cliente1!"); setError(null); }}
                className="text-xs bg-[#FFDDED] border border-[#E6C1C6] rounded-lg py-2 px-3 text-[#493333]/80 hover:border-[#F7769B] hover:text-[var(--color-pompadour-ink)] transition-colors"
              >
                Demo Cliente
              </button>
              <button
                type="button"
                onClick={() => { setEmail("proveedor@demo.com"); setPw("Proveedor1!"); setError(null); }}
                className="text-xs bg-[#FFDDED] border border-[#E6C1C6] rounded-lg py-2 px-3 text-[#493333]/80 hover:border-[#F7769B] hover:text-[var(--color-pompadour-ink)] transition-colors"
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