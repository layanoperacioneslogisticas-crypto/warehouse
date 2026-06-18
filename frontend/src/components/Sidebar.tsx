import { NavLink } from "react-router-dom";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiBox,
  FiGrid,
  FiHome,
  FiLayers,
  FiMap,
  FiMove,
  FiSettings,
  FiTruck
} from "react-icons/fi";
import { TbCube3dSphere } from "react-icons/tb";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: FiHome },
  { to: "/warehouse-3d", label: "Layout 3D", icon: TbCube3dSphere },
  { to: "/inventory", label: "Inventario", icon: FiLayers },
  { to: "/movements", label: "Rutas", icon: FiMove },
  { to: "/visual-map", label: "Mapas de calor", icon: FiMap },
  { to: "/locations", label: "Ocupabilidad", icon: FiBox },
  { to: "/reports", label: "Reportes", icon: FiBarChart2 },
  { to: "/zones", label: "Zonas", icon: FiGrid },
  { to: "/warehouses", label: "Bodegas", icon: FiTruck },
  { to: "/settings", label: "Configuración", icon: FiSettings }
];

export function Sidebar() {
  return (
    <aside className="sidebar-shell">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <TbCube3dSphere size={22} />
        </div>
        <div>
          <div className="sidebar-brand-title">Warehouse 3D</div>
          <div className="sidebar-brand-copy">Powered by Three.js</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4">
        <div className="page-panel-soft p-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <FiAlertTriangle className="text-warning" />
            <strong>Monitoreo</strong>
          </div>
          <small className="text-muted">
            La operación está activa. Usa la vista 3D para revisar racks, zonas y ocupación.
          </small>
        </div>
      </div>
    </aside>
  );
}
