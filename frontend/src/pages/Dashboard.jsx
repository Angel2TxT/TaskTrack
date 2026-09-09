import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext.jsx";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.createTask({ title, description });
      setTitle("");
      setDescription("");
      setSuccess("Tarea creada. Ya forma parte de tu día.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

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
          Crea una tarea con título y descripción para organizar el trabajo de
          hoy.
        </p>
      </section>

      <section className="dash-board">
        <form className="task-form" onSubmit={handleCreate}>
          <h2>Nueva tarea</h2>
          <label>
            Título
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Revisar el informe semanal"
              required
              maxLength={150}
            />
          </label>
          <label>
            Descripción
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qué hay que hacer y cualquier detalle útil."
              rows={4}
              maxLength={1000}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}
          <button className="submit" type="submit" disabled={submitting}>
            {submitting ? "Guardando…" : "Crear tarea"}
          </button>
        </form>
      </section>
    </div>
  );
}
