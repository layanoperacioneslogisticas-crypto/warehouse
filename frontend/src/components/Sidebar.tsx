import { NavLink } from "react-router-dom";
import {
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

const links = [
  { to: "/dashboard", label: "Dashboard", icon: FiHome },
  { to: "/visual-map", label: "Mapa Visual", icon: FiMap },
  { to: "/warehouse-3d", label: "Vista 3D", icon: FiBox },
  { to: "/warehouses", label: "Bodegas", icon: FiTruck },
  { to: "/zones", label: "Zonas", icon: FiGrid },
  { to: "/locations", label: "Ubicaciones", icon: FiBox },
  { to: "/inventory", label: "Inventario", icon: FiLayers },
  { to: "/movements", label: "Movimientos", icon: FiMove },
  { to: "/reports", label: "Reportes", icon: FiBarChart2 },
  { to: "/settings", label: "Configuracion", icon: FiSettings }
];

export function Sidebar() {
  return (
    <aside className="sidebar-shell">
      <div className="sidebar-brand">Warehouse Location Manager</div>
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
    </aside>
  );
}
