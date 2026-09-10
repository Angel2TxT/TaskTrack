import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isRegister) {
        await signUp({ name, email, password });
      } else {
        await signIn({ email, password });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth">
      <section className="auth-showcase" aria-hidden="true">
        <div className="glow glow-one" />
        <div className="glow glow-two" />
        <div className="showcase-inner">
          <p className="eyebrow">TaskTrack</p>
          <h1>
            Organiza tu día.
            <br />
            Sin ruido.
          </h1>
          <p className="lede">
            Un espacio calmo para tus tareas, pensado para que avances con
            claridad y dejes de saltar entre mil pestañas.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="panel-card">
          <div className="brand-mobile">TaskTrack</div>
          <div className="mode-switch" role="tablist">
            <button
              type="button"
              role="tab"
              className={!isRegister ? "is-active" : ""}
              aria-selected={!isRegister}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              role="tab"
              className={isRegister ? "is-active" : ""}
              aria-selected={isRegister}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Crear cuenta
            </button>
          </div>

          <h2>{isRegister ? "Empieza en un minuto" : "Bienvenido de nuevo"}</h2>
          <p className="panel-copy">
            {isRegister
              ? "Crea tu espacio y guarda tu primera lista hoy."
              : "Entra para retomar exactamente donde lo dejaste."}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {isRegister && (
              <label>
                Nombre
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Ana López"
                  required
                  minLength={2}
                />
              </label>
            )}

            <label>
              Correo electrónico
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="tu@correo.com"
                required
              />
            </label>

            <label>
              Contraseña
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  placeholder={isRegister ? "Mínimo 8 caracteres" : "••••••••"}
                  required
                  minLength={isRegister ? 8 : 1}
                />
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </label>

            {error && <p className="form-error">{error}</p>}

            <p className="session-hint">
              Al entrar, tu sesión se guarda en este dispositivo. No tendrás que
              volver a iniciar sesión cada vez que abras TaskTrack.
            </p>

            <button className="submit" type="submit" disabled={submitting}>
              {submitting
                ? "Un momento…"
                : isRegister
                  ? "Crear cuenta"
                  : "Entrar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
