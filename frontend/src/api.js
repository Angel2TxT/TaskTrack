const TOKEN_KEY = "tasktrack_token";

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = Array.isArray(data.detail)
      ? data.detail
          .map((item) => {
            const field = item.loc?.[item.loc.length - 1];
            if (field === "email") return "Introduce un correo válido";
            if (field === "password") return "La contraseña no es válida";
            if (field === "name") return "Introduce un nombre de al menos 2 caracteres";
            if (field === "title") return "El título de la tarea es obligatorio";
            if (field === "estimated_minutes") return "Elige un tiempo estimado válido";
            if (field === "elapsed_seconds") return "El tiempo registrado no es válido";
            if (field === "description") return "La descripción es demasiado larga";
            return item.msg;
          })
          .join(". ")
      : data.detail || "No se pudo completar la solicitud";
    throw new Error(message);
  }

  return data;
}

export function saveSession(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export const api = {
  register: (payload) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: () => request("/api/auth/me"),
  createTask: (payload) =>
    request("/api/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listTasks: (completed = false) =>
    request(`/api/tasks?completed=${completed ? "true" : "false"}`),
  saveTaskTime: (taskId, elapsedSeconds) =>
    request(`/api/tasks/${taskId}/time`, {
      method: "PATCH",
      body: JSON.stringify({ elapsed_seconds: elapsedSeconds }),
    }),
  updateTask: (taskId, payload) =>
    request(`/api/tasks/${taskId}/details`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  completeTask: (taskId) =>
    request(`/api/tasks/${taskId}/complete`, { method: "PATCH" }),
};
