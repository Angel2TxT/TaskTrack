import { useAuth } from "./AuthContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="boot">
        <div className="boot-mark" />
        <p>Cargando TaskTrack…</p>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
}
