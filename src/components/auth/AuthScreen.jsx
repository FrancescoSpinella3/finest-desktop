import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import { Input, Select } from "../ui/Input";
import Spinner from "../ui/Spinner";
import finestLogo from "/finest-logo.png";

function EyeToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-(--dark-third-color) hover:text-(--dark-main-color) dark:hover:text-(--light-color) cursor-pointer"
      tabIndex={-1}
    >
      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );
}

const EMPTY_FORM = {
  name: "", lastName: "", email: "",
  password: "", birthdate: "", gender: "",
};

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function set(field) {
    return (e) => {
      const value = e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
      if (value.trim()) setFieldErrors((prev) => ({ ...prev, [field]: null }));
    };
  }

  function validate() {
    const errors = {};
    if (!form.email.trim()) errors.email = "Inserire un'email";
    if (!form.password) errors.password = "Inserire una password";
    if (mode === "register") {
      if (!form.name.trim()) errors.name = "Inserire il nome";
      if (!form.lastName.trim()) errors.lastName = "Inserire il cognome";
    }
    return errors;
  }

  const isDisabled = loading || !form.email || !form.password ||
    (mode === "register" && (!form.name || !form.lastName));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const { error: authError } = mode === "login"
      ? await signIn(form.email, form.password)
      : await signUp(form.email, form.password, {
          name: form.name.trim(),
          lastName: form.lastName.trim(),
          birthdate: form.birthdate || null,
          gender: form.gender || null,
        });
    setLoading(false);

    if (authError) setError(mode === "login" ? "Email o password errate. Riprova." : authError.message);
  }

  function switchMode(newMode) {
    setMode(newMode);
    setError(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setShowPassword(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--light-bg-main-color) dark:bg-(--dark-bg-dashboard) px-4 py-8">
      <div className="w-full max-w-md">

        {/* Logo + titolo */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <img src={finestLogo} alt="Finest" className="h-12" />
            <span className="text-4xl font-extrabold text-(--main-color)">Finest</span>
          </div>
          <h1 className="text-2xl font-bold text-(--dark-main-color) dark:text-(--light-color)">
            {mode === "login" ? "Accedi al tuo account" : "Crea il tuo account"}
          </h1>
          <p className="text-sm text-(--dark-third-color) mt-1.5">
            {mode === "login" ? "Riprendi a gestire le tue finanze" : "Inizia a gestire le tue finanze"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nome"
                  type="text"
                  placeholder="Mario"
                  value={form.name}
                  onChange={set("name")}
                  error={fieldErrors.name}
                  autoComplete="given-name"
                  className="rounded-xl"
                />
                <Input
                  label="Cognome"
                  type="text"
                  placeholder="Rossi"
                  value={form.lastName}
                  onChange={set("lastName")}
                  error={fieldErrors.lastName}
                  autoComplete="family-name"
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Data di nascita"
                  type="date"
                  value={form.birthdate}
                  onChange={set("birthdate")}
                  className="rounded-xl"
                />
                <Select label="Sesso" value={form.gender} onChange={set("gender")} className="rounded-xl">
                  <option value="">Seleziona un'opzione</option>
                  <option value="Maschio">Maschio</option>
                  <option value="Femmina">Femmina</option>
                  <option value="Preferisco non specificare">Preferisco non specificare</option>
                </Select>
              </div>
            </>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="mario.rossi@email.com"
            value={form.email}
            onChange={set("email")}
            error={fieldErrors.email}
            autoComplete="email"
            className="rounded-xl"
          />
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={set("password")}
            error={fieldErrors.password}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            rightElement={<EyeToggle show={showPassword} onToggle={() => setShowPassword((p) => !p)} />}
            className="rounded-xl"
          />

          {error && <p className="text-sm text-(--danger-color) text-center font-medium">{error}</p>}

          <Button type="submit" disabled={isDisabled} className="mt-1 w-full py-3 rounded-xl text-base">
            {loading ? <><Spinner />{mode === "login" ? "Accesso in corso..." : "Registrazione in corso..."}</> : mode === "login" ? "Accedi" : "Registrati"}
          </Button>
        </form>

        {/* Divisore */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-(--light-border-color) dark:bg-(--dark-border-color)" />
          <span className="text-sm text-(--dark-third-color)">Oppure</span>
          <div className="flex-1 h-px bg-(--light-border-color) dark:bg-(--dark-border-color)" />
        </div>

        {/* Cambio modalità */}
        <p className="text-center text-sm text-(--dark-third-color)">
          {mode === "login" ? (
            <>Non hai un account?{" "}
              <button onClick={() => switchMode("register")} className="text-(--main-color) font-semibold hover:underline cursor-pointer">
                Registrati
              </button>
            </>
          ) : (
            <>Hai già un account?{" "}
              <button onClick={() => switchMode("login")} className="text-(--main-color) font-semibold hover:underline cursor-pointer">
                Accedi
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
