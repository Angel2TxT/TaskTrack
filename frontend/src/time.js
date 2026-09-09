const TIMER_KEY = "tasktrack_active_timer";

export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(rest)}`;
}

export function formatEstimate(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export function currentElapsed(timer, now = Date.now()) {
  if (!timer) return 0;
  if (!timer.running) return timer.baseElapsed;
  return timer.baseElapsed + Math.floor((now - timer.startedAt) / 1000);
}

export function readActiveTimer() {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeActiveTimer(timer) {
  if (!timer) {
    localStorage.removeItem(TIMER_KEY);
    return;
  }
  localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
}
