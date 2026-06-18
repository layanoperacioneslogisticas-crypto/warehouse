import { FiBell, FiChevronDown, FiSettings } from "react-icons/fi";
import { useAuth } from "../hooks/use-auth";

export function Navbar() {
  const { data } = useAuth();
  const initials = (data?.name || "LP")
    .split(" ")
    .map((chunk: string) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="topbar-shell">
      <div className="topbar-left">
        <select className="form-select topbar-select" defaultValue="principal">
          <option value="principal">Almacén Principal</option>
        </select>
        <div className="topbar-badge">
          <span className="status-dot" />
          En línea
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-icon">
          <FiBell size={18} />
        </div>
        <div className="topbar-icon">
          <FiSettings size={18} />
        </div>
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="fw-semibold">{data?.name || "Luis Palacios"}</div>
            <small className="text-muted">{data?.role || "Administrador"}</small>
          </div>
          <FiChevronDown className="text-muted" />
        </div>
      </div>
    </header>
  );
}
