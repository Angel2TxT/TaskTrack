import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import {
  currentElapsed,
  formatDuration,
  formatEstimate,
  readActiveTimer,
  writeActiveTimer,
} from "../time.js";

const ESTIMATE_PRESETS = [15, 30, 45, 60, 90, 120];

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
  const [estimate, setEstimate] = useState(30);
  const [tasks, setTasks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [timer, setTimer] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const restoredRef = useRef(false);

  const selectedTask = tasks.find((task) => task.id === selectedId) || null;
  const elapsed = currentElapsed(timer, now);
  const estimatedSeconds = (selectedTask?.estimated_minutes || 0) * 60;
  const progress = estimatedSeconds
    ? Math.min(100, Math.round((elapsed / estimatedSeconds) * 100))
    : 0;
  const isOvertime = estimatedSeconds > 0 && elapsed > estimatedSeconds;
  const isRunning = Boolean(timer?.running && timer.taskId === selectedId);

  const selectedLabel = useMemo(() => {
    if (!selectedTask) return "Selecciona una tarea para cronometrar";
    return selectedTask.title;
  }, [selectedTask]);

  async function loadTasks() {
    const pending = await api.listTasks();
    setTasks(pending);
    return pending;
  }

  useEffect(() => {
    loadTasks()
      .catch((err) => setError(err.message))
      .finally(() => setLoadingTasks(false));
  }, []);

  useEffect(() => {
    if (restoredRef.current || loadingTasks) return;
    const saved = readActiveTimer();
    if (saved && tasks.some((task) => task.id === saved.taskId)) {
      setSelectedId(saved.taskId);
      setTimer(saved);
    }
    restoredRef.current = true;
  }, [loadingTasks, tasks]);

  useEffect(() => {
    if (!timer?.running) return undefined;
    const tick = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(tick);
  }, [timer?.running]);

  useEffect(() => {
    writeActiveTimer(timer);
  }, [timer]);

  useEffect(() => {
    if (!timer?.running) return undefined;
    const persist = window.setInterval(() => {
      api.saveTaskTime(timer.taskId, currentElapsed(timer)).catch(() => {});
    }, 15000);
    return () => window.clearInterval(persist);
  }, [timer]);

  async function persistElapsed(nextTimer = timer) {
    if (!nextTimer) return;
    const seconds = currentElapsed(nextTimer);
    const updated = await api.saveTaskTime(nextTimer.taskId, seconds);
    setTasks((current) =>
      current.map((task) => (task.id === updated.id ? updated : task)),
    );
    return seconds;
  }

  async function selectTask(task) {
    if (timer?.running && timer.taskId !== task.id) {
      const paused = {
        ...timer,
        running: false,
        baseElapsed: currentElapsed(timer),
      };
      setTimer(paused);
      await persistElapsed(paused);
    }
    setSelectedId(task.id);
    if (!timer || timer.taskId !== task.id) {
      setTimer({
        taskId: task.id,
        running: false,
        startedAt: Date.now(),
        baseElapsed: task.elapsed_seconds || 0,
      });
    }
  }

  async function startTimer() {
    if (!selectedTask) return;
    setError("");
    setTimer({
      taskId: selectedTask.id,
      running: true,
      startedAt: Date.now(),
      baseElapsed: timer?.taskId === selectedTask.id ? elapsed : selectedTask.elapsed_seconds || 0,
    });
    setNow(Date.now());
  }

  async function pauseTimer() {
    if (!timer?.running) return;
    const paused = {
      ...timer,
      running: false,
      baseElapsed: currentElapsed(timer),
    };
    setTimer(paused);
    setError("");
    try {
      await persistElapsed(paused);
      setSuccess("Tiempo en pausa. Se guardó lo que llevas en esta tarea.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.createTask({
        title,
        description,
        estimated_minutes: Number(estimate),
      });
      setTitle("");
      setDescription("");
      setEstimate(30);
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
      if (timer?.taskId === taskId) {
        const snapshot = timer.running
          ? { ...timer, running: false, baseElapsed: currentElapsed(timer) }
          : timer;
        await persistElapsed(snapshot);
        setTimer(null);
        writeActiveTimer(null);
        if (selectedId === taskId) setSelectedId(null);
      }
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
        <div className="dash-brand">
          <strong>TaskTrack</strong>
          <span>Hola, {user.name.split(" ")[0].trim()}</span>
        </div>
        <div className="dash-user">
          <span>{user.name}</span>
          <button type="button" onClick={signOut}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className={`timer-bar${isRunning ? " is-running" : ""}`}>
        <div className="timer-copy">
          <p className="eyebrow">Temporizador</p>
          <strong>{selectedLabel}</strong>
        </div>
        <div className={`timer-clock${isOvertime ? " is-over" : ""}`}>
          {formatDuration(selectedTask ? elapsed : 0)}
        </div>
        <div className="timer-meta">
          <span>
            Estimado:{" "}
            {selectedTask ? formatEstimate(selectedTask.estimated_minutes) : "—"}
          </span>
          <div className="timer-track" aria-hidden="true">
            <div
              className="timer-fill"
              style={{ width: `${selectedTask ? progress : 0}%` }}
            />
          </div>
        </div>
        <div className="timer-actions">
          <button
            type="button"
            className="timer-start"
            onClick={startTimer}
            disabled={!selectedTask || isRunning}
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={pauseTimer}
            disabled={!isRunning}
          >
            Pausa
          </button>
        </div>
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
              rows={2}
              maxLength={1000}
            />
          </label>
          <fieldset className="estimate-field">
            <legend>Tiempo estimado</legend>
            <div className="estimate-presets">
              {ESTIMATE_PRESETS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={estimate === minutes ? "is-active" : ""}
                  onClick={() => setEstimate(minutes)}
                >
                  {formatEstimate(minutes)}
                </button>
              ))}
            </div>
            <label className="estimate-minutes">
              Minutos
              <input
                type="number"
                min={1}
                max={1440}
                value={estimate}
                onChange={(e) => setEstimate(Number(e.target.value))}
                required
              />
            </label>
          </fieldset>
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
              <li
                key={task.id}
                className={selectedId === task.id ? "is-selected" : ""}
              >
                <button
                  type="button"
                  className="task-select"
                  onClick={() => selectTask(task)}
                >
                  <strong>{task.title}</strong>
                  {task.description && <p>{task.description}</p>}
                  <span className="task-estimate">
                    Estimado {formatEstimate(task.estimated_minutes)} · Hecho{" "}
                    {formatDuration(
                      selectedId === task.id ? elapsed : task.elapsed_seconds || 0,
                    )}
                  </span>
                </button>
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
