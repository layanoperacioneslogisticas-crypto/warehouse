import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/modules";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("Admin123456");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const result = await authApi.login({ email, password });
      localStorage.setItem("wm_token", result.token);
      navigate("/dashboard");
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || "No fue posible iniciar sesión.");
    }
  };

  return (
    <div className="login-shell">
      <div className="login-grid">
        <section className="hero-panel login-showcase">
          <div className="page-kicker">Warehouse command center</div>
          <h1 className="page-title">Control visual del almacén en 3D</h1>
          <p className="page-copy">
            Accede a una operación con layout 3D, ocupación por zona, maestro de ubicaciones,
            inventario y monitoreo visual desde una sola interfaz.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">3D</div>
              <div className="hero-stat-label">Vista avanzada de racks</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">Live</div>
              <div className="hero-stat-label">Datos sincronizados con backend</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">Demo</div>
              <div className="hero-stat-label">Usuarios y datos semilla cargados</div>
            </div>
          </div>

          <div className="login-list">
            <div className="login-list-item">
              <div className="fw-semibold mb-1">Vista 3D operativa</div>
              <div className="text-muted small">Racks con estados, etiquetas, pallets y selección visual.</div>
            </div>
            <div className="login-list-item">
              <div className="fw-semibold mb-1">Panel ejecutivo</div>
              <div className="text-muted small">KPIs de ocupación, zonas críticas y capacidad disponible.</div>
            </div>
            <div className="login-list-item">
              <div className="fw-semibold mb-1">Datos demo listos</div>
              <div className="text-muted small mono">admin@demo.com / Admin123456</div>
            </div>
          </div>
        </section>

        <section className="page-panel login-card">
          <div className="page-kicker">Acceso seguro</div>
          <h2 className="mb-3">Iniciar sesión</h2>
          <p className="text-muted">Usa el usuario administrador del seed para iniciar.</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error ? <div className="alert alert-danger">{error}</div> : null}

            <button className="btn btn-primary w-100 mt-2">Ingresar</button>
          </form>
        </section>
      </div>
    </div>
  );
}
