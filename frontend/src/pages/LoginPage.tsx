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
      setError(submitError?.response?.data?.message || "No fue posible iniciar sesion.");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-4">
          <div className="page-panel p-4">
            <h2 className="mb-3">Iniciar sesion</h2>
            <p className="text-muted">Usa el usuario administrador del seed para iniciar.</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error ? <div className="alert alert-danger">{error}</div> : null}
              <button className="btn btn-primary w-100">Ingresar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

