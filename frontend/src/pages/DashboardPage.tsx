import { useQuery } from "@tanstack/react-query";
import { FiAlertTriangle, FiBox, FiCheckCircle, FiGrid, FiShield } from "react-icons/fi";
import { reportApi } from "../api/modules";
import { StatCard } from "../components/StatCard";

export function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: reportApi.dashboard
  });

  const occupancy = Number(data?.occupancyRate ?? 0);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="page-header">
        <div>
          <div className="text-muted small mb-2">Centro de control logístico</div>
          <div className="page-title">Dashboard operativo</div>
          <p className="page-copy">
            Monitorea capacidad, ocupación y estados críticos del almacén con una visualización ejecutiva.
          </p>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6 col-xl-3">
          <StatCard label="Ubicaciones Totales" value={data?.totalLocations ?? 0} icon={FiBox} helper="Capacidad modelada" />
        </div>
        <div className="col-md-6 col-xl-3">
          <StatCard label="Disponibles" value={data?.freeLocations ?? 0} icon={FiCheckCircle} helper="Listas para recibir stock" />
        </div>
        <div className="col-md-6 col-xl-3">
          <StatCard label="Ocupadas" value={data?.occupiedLocations ?? 0} icon={FiGrid} helper="Con inventario activo" />
        </div>
        <div className="col-md-6 col-xl-3">
          <StatCard label="Bloqueadas" value={data?.blockedLocations ?? 0} icon={FiShield} helper="No operables" />
        </div>
        <div className="col-md-6 col-xl-3">
          <StatCard label="Dañadas" value={data?.damagedLocations ?? 0} icon={FiAlertTriangle} helper="Pendientes de atención" />
        </div>
        <div className="col-md-6 col-xl-3">
          <StatCard label="Zona PAV" value={data?.pavLocations ?? 0} icon={FiBox} helper="Stock promocional" />
        </div>
        <div className="col-md-6 col-xl-3">
          <StatCard label="Zona NPI" value={data?.npiLocations ?? 0} icon={FiBox} helper="Nuevos productos" />
        </div>
        <div className="col-md-6 col-xl-3">
          <StatCard label="Ocupabilidad" value={`${occupancy.toFixed(1)}%`} icon={FiGrid} helper="Promedio actual" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="page-panel p-4">
            <div className="page-header">
              <div>
                <h4 className="mb-1">Ocupabilidad por zona</h4>
                <p className="page-copy">Distribución de capacidad usada en las zonas más relevantes.</p>
              </div>
            </div>

            <div className="donut-shell">
              <div className="donut-ring">
                <div className="donut-center">
                  <div>
                    <div style={{ fontSize: "2rem", lineHeight: 1 }}>{occupancy.toFixed(0)}%</div>
                    <small className="text-muted">Promedio</small>
                  </div>
                </div>
              </div>

              <div className="flex-grow-1 d-flex flex-column gap-3">
                {data?.topZones?.map((zone, index) => {
                  const base = [85, 72, 65, 58, 48][index] ?? 42;
                  return (
                    <div key={zone.zone}>
                      <div className="d-flex justify-content-between small mb-1">
                        <span>{zone.zone}</span>
                        <span>{base}%</span>
                      </div>
                      <div className="mini-progress">
                        <span style={{ width: `${base}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="side-card h-100">
            <h5 className="mb-4">Resumen General</h5>
            <ul className="info-list">
              <li><span>Ubicaciones totales</span><strong>{data?.totalLocations ?? 0}</strong></li>
              <li><span>Ubicaciones ocupadas</span><strong>{data?.occupiedLocations ?? 0}</strong></li>
              <li><span>Disponibles</span><strong>{data?.freeLocations ?? 0}</strong></li>
              <li><span>Ocupabilidad</span><strong>{occupancy.toFixed(1)}%</strong></li>
              <li><span>Zonas críticas</span><strong>{data?.topZones?.length ?? 0}</strong></li>
            </ul>

            <div className="mt-4">
              <div className="small text-muted mb-2">Nivel de ocupación</div>
              <div className="mini-progress">
                <span style={{ width: `${occupancy}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
