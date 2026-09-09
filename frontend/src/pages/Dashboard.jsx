import { useAuth } from "../AuthContext.jsx";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="dash">
      <header className="dash-bar">
        <strong>TaskTrack</strong>
        <div className="dash-user">
          <span>{user.name}</span>
          <button type="button" onClick={signOut}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <section className="dash-hero">
        <p className="eyebrow">Sesión activa</p>
        <h1>Hola, {user.name.split(" ")[0].trim()}.</h1>
        <p>
          Ya estás dentro. Este es el punto de partida de tu espacio de trabajo:
          tus listas, plazos y el día, en un solo lugar.
        </p>
        <div className="dash-meta">
          <article>
            <span>Cuenta</span>
            <strong>{user.email}</strong>
          </article>
          <article>
            <span>Estado</span>
            <strong>Conectado</strong>
          </article>
        </div>
      </section>
    </div>
  );
}
