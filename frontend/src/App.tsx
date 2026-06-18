import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LocationsPage } from "./pages/LocationsPage";
import { LoginPage } from "./pages/LoginPage";
import { MovementsPage } from "./pages/MovementsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { VisualMapPage } from "./pages/VisualMapPage";
import { WarehousesPage } from "./pages/WarehousesPage";
import { ZonesPage } from "./pages/ZonesPage";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("wm_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/warehouses" element={<WarehousesPage />} />
        <Route path="/zones" element={<ZonesPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/visual-map" element={<VisualMapPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/movements" element={<MovementsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

