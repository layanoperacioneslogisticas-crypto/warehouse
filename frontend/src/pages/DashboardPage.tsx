import { useQuery } from "@tanstack/react-query";
import { FiAlertTriangle, FiBox, FiCheckCircle, FiGrid, FiShield } from "react-icons/fi";
import { reportApi } from "../api/modules";
import { StatCard } from "../components/StatCard";

export function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: reportApi.dashboard
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <div className="text-muted">Visibilidad general del estado de ubicaciones.</div>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-md-6 col-xl-3"><StatCard label="Total ubicaciones" value={data?.totalLocations ?? 0} icon={FiBox} /></div>
        <div className="col-md-6 col-xl-3"><StatCard label="Libres" value={data?.freeLocations ?? 0} icon={FiCheckCircle} /></div>
        <div className="col-md-6 col-xl-3"><StatCard label="Ocupadas" value={data?.occupiedLocations ?? 0} icon={FiGrid} /></div>
        <div className="col-md-6 col-xl-3"><StatCard label="Bloqueadas" value={data?.blockedLocations ?? 0} icon={FiShield} /></div>
        <div className="col-md-6 col-xl-3"><StatCard label="Danadas" value={data?.damagedLocations ?? 0} icon={FiAlertTriangle} /></div>
        <div className="col-md-6 col-xl-3"><StatCard label="PAV" value={data?.pavLocations ?? 0} icon={FiBox} /></div>
        <div className="col-md-6 col-xl-3"><StatCard label="NPI" value={data?.npiLocations ?? 0} icon={FiBox} /></div>
        <div className="col-md-6 col-xl-3"><StatCard label="Ocupabilidad" value={`${(data?.occupancyRate ?? 0).toFixed(1)}%`} icon={FiGrid} /></div>
      </div>
      <div className="page-panel p-4 mt-4">
        <h5>Top zonas con mayor ocupacion</h5>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Zona</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data?.topZones?.map((row) => (
                <tr key={row.zone}>
                  <td>{row.zone}</td>
                  <td>{row.total}</td>
                </tr>
              )) ?? null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

