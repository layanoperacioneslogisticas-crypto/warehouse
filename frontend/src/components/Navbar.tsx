import { useAuth } from "../hooks/use-auth";

export function Navbar() {
  const { data } = useAuth();

  return (
    <div className="page-panel p-3 mb-4">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <div className="text-muted small">Operacion de almacen</div>
          <h4 className="mb-0">Gestor Visual de Ubicaciones</h4>
        </div>
        <div className="text-end">
          <div className="fw-semibold">{data?.name || "Invitado"}</div>
          <small className="text-muted">{data?.role || "Sin sesion"}</small>
        </div>
      </div>
    </div>
  );
}

