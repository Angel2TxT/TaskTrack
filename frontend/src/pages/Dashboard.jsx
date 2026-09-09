import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

function formatCreatedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  async function loadTasks() {
    const pending = await api.listTasks();
    setTasks(pending);
  }

  useEffect(() => {
    loadTasks()
      .catch((err) => setError(err.message))
      .finally(() => setLoadingTasks(false));
  }, []);

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
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComplete(taskId) {
    setError("");
    setCompletingId(taskId);
    try {
      await api.completeTask(taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
      setSuccess("Tarea completada. Ya no aparece en pendientes.");
    } catch (err) {
      setError(err.message);
    } finally {
      setCompletingId(null);
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
        <p className="eyebrow">Panel de pendientes</p>
        <h1>Hola, {user.name.split(" ")[0].trim()}.</h1>
        <p>
          Aquí ves tus tareas pendientes, de la más reciente a la más antigua,
          para organizar el trabajo del día.
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

        <section className="task-list">
          <h2>Pendientes</h2>
          {loadingTasks && <p className="empty">Cargando tus tareas…</p>}
          {!loadingTasks && tasks.length === 0 && (
            <p className="empty">Aún no tienes tareas pendientes.</p>
          )}
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  {task.description && <p>{task.description}</p>}
                </div>
                <div className="task-actions">
                  <time dateTime={task.created_at}>
                    {formatCreatedAt(task.created_at)}
                  </time>
                  <button
                    type="button"
                    onClick={() => handleComplete(task.id)}
                    disabled={completingId === task.id}
                  >
                    {completingId === task.id ? "Listo…" : "Completar"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </div>
  );
}
