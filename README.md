# TaskTrack

Gestor de tareas con **backend** (FastAPI + SQLite) y **frontend** (React + Vite), desarrollado con Extreme Programming.

## Historias de usuario

- **HU01** — Iniciar sesión y guardar la sesión en el dispositivo.
- **HU02** — Crear una tarea con título y descripción.
- **HU03** — Ver el dashboard con pendientes ordenados por fecha de creación.
- **HU04** — Marcar una tarea como completada para que salga de pendientes.

## Cómo arrancar

Backend (una terminal):

```powershell
cd backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

Si aún no existe el entorno virtual:

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend (otra terminal):

```powershell
cd frontend
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173). Crea una cuenta e inicia sesión. La API queda en `http://127.0.0.1:8000/docs`.
