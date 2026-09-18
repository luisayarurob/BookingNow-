import { useState } from "react";
import { Eye, EyeOff, CheckCircle2, X } from "lucide-react";

interface RegisterProps {
  onGoLogin: () => void;
}

type Tab = "cliente" | "proveedor";

const NIT_REGEX = /^\d{9}-\d$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(pw: string) {
  if (pw.length < 8) return "Mínimo 8 caracteres.";
  if (!/[a-zA-Z]/.test(pw)) return "Debe incluir al menos 1 letra.";
  if (!/\d/.test(pw)) return "Debe incluir al menos 1 número.";
  if (!/[^a-zA-Z0-9]/.test(pw)) return "Debe incluir al menos 1 carácter especial.";
  return "";
}

const TAKEN_USERNAMES = ["usuario123", "pepe_garcia"];
const TAKEN_EMAILS = ["correo@tomado.com"];
const TAKEN_RAZON = ["Empresa Registrada S.A."];
const TAKEN_NIT = ["900123456-7"];

const inputBase =
  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all placeholder-[#8D93CB] bg-white/60 focus:ring-2 focus:ring-[#F7769B]/40 focus:border-[#F7769B]";
const inputOk = "border-[#E6C1C6]";
const inputErr = "border-red-400 focus:ring-red-300/40 focus:border-red-400";

function Field({
  label, value, onChange, type = "text", placeholder, error, suffix,
}: {
  label: string; value: string; onChange: (value: string) => void;
  type?: string; placeholder?: string; error?: string; suffix?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-wide text-[#493333]/70 uppercase">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputBase} ${error ? inputErr : inputOk} ${suffix ? "pr-10" : ""}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

export default function Register({ onGoLogin }: RegisterProps) {
  const [tab, setTab] = useState<Tab>("cliente");
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState(false);

  // Cliente
  const [cEmail, setCEmail] = useState("");
  const [cUser, setCUser] = useState("");
  const [cPw, setCPw] = useState("");
  const [cErrors, setCErrors] = useState<Record<string, string>>({});

  // Proveedor
  const [pEmail, setPEmail] = useState("");
  const [pRazon, setPRazon] = useState("");
  const [pNit, setPNit] = useState("");
  const [pUser, setPUser] = useState("");
  const [pPw, setPPw] = useState("");
  const [pErrors, setPErrors] = useState<Record<string, string>>({});

  function submitCliente(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!EMAIL_REGEX.test(cEmail)) errs.email = "Correo no válido.";
    if (TAKEN_EMAILS.includes(cEmail)) errs.email = "Correo ya registrado.";
    if (cUser.length < 3) errs.user = "Mínimo 3 caracteres.";
    if (TAKEN_USERNAMES.includes(cUser)) errs.user = "Nombre de usuario ya en uso.";
    const pwErr = validatePassword(cPw);
    if (pwErr) errs.pw = pwErr;
    if (Object.keys(errs).length) { setCErrors(errs); return; }
    setCErrors({});
    setSuccess(true);
  }

  function submitProveedor(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!EMAIL_REGEX.test(pEmail)) errs.email = "Correo no válido.";
    if (TAKEN_EMAILS.includes(pEmail)) errs.email = "Correo ya registrado.";
    if (pRazon.length < 3) errs.razon = "Mínimo 3 caracteres.";
    if (TAKEN_RAZON.includes(pRazon)) errs.razon = "Razón social ya registrada.";
    if (!NIT_REGEX.test(pNit)) errs.nit = "Formato inválido. Ej: 900123456-7";
    if (TAKEN_NIT.includes(pNit)) errs.nit = "NIT ya registrado.";
    if (pUser.length < 3) errs.user = "Mínimo 3 caracteres.";
    if (TAKEN_USERNAMES.includes(pUser)) errs.user = "Nombre de usuario o contraseña inválidos.";
    const pwErr = validatePassword(pPw);
    if (pwErr) errs.pw = pwErr;
    if (Object.keys(errs).length) { setPErrors(errs); return; }
    setPErrors({});
    setSuccess(true);
  }

  return (
    <div className="min-h-screen bg-[#FFDDED] flex items-center justify-center p-6">
      {/* Success modal */}
      {success && (
        <div className="fixed inset-0 bg-[#493333]/30 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#FCF6EF] rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl border border-[#E6C1C6]">
            <CheckCircle2 className="mx-auto mb-4 text-[#F7769B]" size={56} strokeWidth={1.5} />
            <h2 className="font-display text-2xl text-[#493333] mb-2">¡Cuenta creada!</h2>
            <p className="text-sm text-[#493333]/70 mb-6">Tu cuenta fue registrada exitosamente. Ya puedes iniciar sesión.</p>
            <button
              onClick={onGoLogin}
              className="w-full bg-[#F7769B] text-white font-semibold py-3 rounded-xl hover:bg-[#f55d87] transition-colors"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-semibold text-[#493333] mb-1">Crear cuenta</h1>
          <p className="text-sm text-[#493333]/60">Elige tu tipo de cuenta para comenzar</p>
        </div>

        <div className="bg-[#FCF6EF] rounded-3xl shadow-xl border border-[#E6C1C6] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#E6C1C6]">
            {(["cliente", "proveedor"] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${
                  tab === t
                    ? "text-[#F7769B] border-b-2 border-[#F7769B] bg-white/50"
                    : "text-[#493333]/50 hover:text-[#493333]/80"
                }`}
              >
                {t === "cliente" ? "Cliente" : "Proveedor"}
              </button>
            ))}
          </div>

          <div className="p-8">
            {tab === "cliente" ? (
              <form onSubmit={submitCliente} className="flex flex-col gap-4">
                <Field
                  label="Correo electrónico"
                  value={cEmail}
                  onChange={setCEmail}
                  type="email"
                  placeholder="tu@correo.com"
                  error={cErrors.email}
                />
                <Field
                  label="Nombre de usuario"
                  value={cUser}
                  onChange={setCUser}
                  placeholder="mínimo 3 caracteres"
                  error={cErrors.user}
                />
                <Field
                  label="Contraseña"
                  value={cPw}
                  onChange={setCPw}
                  type={showPw ? "text" : "password"}
                  placeholder="mínimo 8 caracteres"
                  error={cErrors.pw}
                  suffix={
                    <button type="button" onClick={() => setShowPw(v => !v)} className="text-[#8D93CB] hover:text-[#F7769B] transition-colors">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <button type="submit" className="mt-2 w-full bg-[#F7769B] text-white font-semibold py-3.5 rounded-xl hover:bg-[#f55d87] active:scale-[0.98] transition-all shadow-md shadow-[#F7769B]/30">
                  Crear cuenta
                </button>
              </form>
            ) : (
              <form onSubmit={submitProveedor} className="flex flex-col gap-4">
                <Field
                  label="Correo electrónico"
                  value={pEmail}
                  onChange={setPEmail}
                  type="email"
                  placeholder="empresa@correo.com"
                  error={pErrors.email}
                />
                <Field
                  label="Razón social"
                  value={pRazon}
                  onChange={setPRazon}
                  placeholder="Nombre legal del negocio"
                  error={pErrors.razon}
                />
                <Field
                  label="NIT"
                  value={pNit}
                  onChange={setPNit}
                  placeholder="900123456-7"
                  error={pErrors.nit}
                />
                <Field
                  label="Nombre de usuario"
                  value={pUser}
                  onChange={setPUser}
                  placeholder="mínimo 3 caracteres"
                  error={pErrors.user}
                />
                <Field
                  label="Contraseña"
                  value={pPw}
                  onChange={setPPw}
                  type={showPw ? "text" : "password"}
                  placeholder="mínimo 8 caracteres"
                  error={pErrors.pw}
                  suffix={
                    <button type="button" onClick={() => setShowPw(v => !v)} className="text-[#8D93CB] hover:text-[#F7769B] transition-colors">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <button type="submit" className="mt-2 w-full bg-[#F7769B] text-white font-semibold py-3.5 rounded-xl hover:bg-[#f55d87] active:scale-[0.98] transition-all shadow-md shadow-[#F7769B]/30">
                  Crear cuenta
                </button>
              </form>
            )}

            <p className="text-center text-sm text-[#493333]/60 mt-6">
              ¿Ya tienes cuenta?{" "}
              <button onClick={onGoLogin} className="text-[#F7769B] font-semibold hover:underline">
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
