import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiCamera, FiCheckSquare, FiEdit3, FiLayers, FiMaximize2, FiMove, FiRotateCw, FiSearch } from "react-icons/fi";
import { inventoryApi, locationApi, warehouseApi } from "../api/modules";
import { InventoryLocation, Location, LocationStatus } from "../types";
import { LocationSidePanel } from "../components/LocationSidePanel";
import { WarehouseScene3D } from "../components/WarehouseScene3D";

const statusLegend = [
  { status: "OCUPADO", label: "Ocupado", color: "#2e74ff" },
  { status: "LIBRE", label: "Disponible", color: "#22c55e" },
  { status: "BLOQUEADO", label: "Bloqueado", color: "#ef4444" },
  { status: "CUARENTENA", label: "Próx. vencer", color: "#f59e0b" },
  { status: "VALIDACION", label: "En conteo", color: "#8b5cf6" }
] as const;

type StatusKey = (typeof statusLegend)[number]["status"] | "PAV" | "NPI" | "DANADO" | "RESERVADO";

const defaultStatusFilter: Record<StatusKey, boolean> = {
  OCUPADO: true,
  LIBRE: true,
  BLOQUEADO: true,
  CUARENTENA: true,
  VALIDACION: true,
  PAV: true,
  NPI: true,
  DANADO: true,
  RESERVADO: true
};

export function Warehouse3DPage() {
  const [warehouseId, setWarehouseId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>();
  const [inventory, setInventory] = useState<InventoryLocation[]>([]);
  const [zoneFilter, setZoneFilter] = useState("");
  const [sceneMode, setSceneMode] = useState<"overview" | "focus" | "inspect" | "pan">("overview");
  const [showLabels, setShowLabels] = useState(true);
  const [showDecorations, setShowDecorations] = useState(true);
  const [statusFilter, setStatusFilter] = useState<Record<StatusKey, boolean>>(defaultStatusFilter);

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: warehouseApi.list
  });

  const effectiveWarehouseId = warehouseId || warehouses[0]?.id || "";

  const { data: layout = [] } = useQuery({
    queryKey: ["layout-3d", effectiveWarehouseId],
    queryFn: () => locationApi.layout(effectiveWarehouseId),
    enabled: Boolean(effectiveWarehouseId)
  });

  useEffect(() => {
    if (!warehouseId && warehouses[0]?.id) {
      setWarehouseId(warehouses[0].id);
    }
  }, [warehouseId, warehouses]);

  const visibleLocations = useMemo(
    () =>
      layout.filter((location) => {
        const zoneOk = !zoneFilter || location.zone?.code === zoneFilter;
        const statusKey = location.status as StatusKey;
        const statusOk = statusFilter[statusKey] !== false;
        return zoneOk && statusOk;
      }),
    [layout, zoneFilter, statusFilter]
  );

  const zones = useMemo(
    () => Array.from(new Set(layout.map((location) => location.zone?.code).filter(Boolean))) as string[],
    [layout]
  );

  const occupiedCount = visibleLocations.filter((item) => item.status === "OCUPADO").length;
  const freeCount = visibleLocations.filter((item) => item.status === "LIBRE").length;
  const blockedCount = visibleLocations.filter((item) => item.status === "BLOQUEADO").length;
  const countingCount = visibleLocations.filter((item) => item.status === "VALIDACION").length;
  const occupancyPercent = visibleLocations.length
    ? Math.round((occupiedCount / visibleLocations.length) * 100)
    : 0;

  useEffect(() => {
    if (!visibleLocations.length) return;

    const currentVisible = selectedLocation && visibleLocations.some((item) => item.id === selectedLocation.id);
    const nextLocation = currentVisible ? selectedLocation : visibleLocations[0];

    if (nextLocation && nextLocation.id !== selectedLocation?.id) {
      setSelectedLocation(nextLocation);
      setInventory(nextLocation.inventory ?? []);
      inventoryApi.byLocation(nextLocation.id).then(setInventory).catch(() => setInventory(nextLocation.inventory ?? []));
    }
  }, [visibleLocations, selectedLocation]);

  const handleSelectLocation = async (location: Location) => {
    setSelectedLocation(location);
    setInventory(location.inventory ?? []);
    try {
      const rows = await inventoryApi.byLocation(location.id);
      setInventory(rows);
    } catch {
      setInventory(location.inventory ?? []);
    }
    setSceneMode("focus");
  };

  const handleFullscreen = async () => {
    const element = document.documentElement;
    if (!document.fullscreenElement) {
      await element.requestFullscreen?.();
      return;
    }
    await document.exitFullscreen?.();
  };

  const selectedWarehouse = warehouses.find((item) => item.id === effectiveWarehouseId);

  return (
    <div className="warehouse3d-grid">
      <aside className="warehouse3d-left">
        <div className="side-card mb-3">
          <h5 className="mb-3">Filtros del layout</h5>
          <div className="d-flex flex-column gap-3">
            <div>
              <label className="form-label">Bodega</label>
              <select
                className="form-select"
                value={warehouseId}
                onChange={(event) => {
                  setWarehouseId(event.target.value);
                  setSelectedLocation(undefined);
                  setInventory([]);
                }}
              >
                <option value="">Almacén principal</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} - {warehouse.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Zona</label>
              <select
                className="form-select"
                value={zoneFilter}
                onChange={(event) => setZoneFilter(event.target.value)}
                disabled={!effectiveWarehouseId}
              >
                <option value="">Todas las zonas</option>
                {zones.map((zoneCode) => (
                  <option key={zoneCode} value={zoneCode}>
                    Zona {zoneCode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Estado</label>
              <div className="status-filter-list">
                {statusLegend.map((item) => (
                  <label key={item.status} className="status-filter-item">
                    <input
                      type="checkbox"
                      checked={statusFilter[item.status]}
                      onChange={(event) =>
                        setStatusFilter((current) => ({
                          ...current,
                          [item.status]: event.target.checked
                        }))
                      }
                    />
                    <span className="status-filter-dot" style={{ background: item.color }} />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="side-card">
          <h6 className="mb-3">Vista</h6>
          <div className="d-flex gap-2">
            <button type="button" className={`scene-chip ${sceneMode !== "pan" ? "active" : ""}`} onClick={() => setSceneMode("overview")}>
              <FiRotateCw size={16} />
              <span>3D</span>
            </button>
            <button type="button" className={`scene-chip ${sceneMode === "pan" ? "active" : ""}`} onClick={() => setSceneMode((current) => (current === "pan" ? "overview" : "pan"))}>
              <FiMove size={16} />
              <span>Mover</span>
            </button>
          </div>

          <div className="toggle-list mt-3">
            <label className="toggle-row">
              <span>Etiquetas</span>
              <input type="checkbox" checked={showLabels} onChange={(event) => setShowLabels(event.target.checked)} />
            </label>
            <label className="toggle-row">
              <span>Decoración</span>
              <input type="checkbox" checked={showDecorations} onChange={(event) => setShowDecorations(event.target.checked)} />
            </label>
          </div>

          <button type="button" className="btn btn-outline-light w-100 mt-3" onClick={handleFullscreen}>
            Pantalla completa
          </button>
        </div>

        <div className="side-card mt-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="status-dot" />
            <strong>Monitoreo</strong>
          </div>
          <div className="small text-muted">Sistema activo</div>
          <div className="mini-stat mt-3">
            <div className="mini-stat-label">Última actualización</div>
            <div className="mini-stat-value">Hoy, {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>
      </aside>

      <section className="warehouse3d-center">
        <div className="page-panel warehouse3d-hero mb-4 p-4">
          <div className="warehouse3d-hero-grid">
            <div>
              <div className="page-kicker">Maestros</div>
              <div className="page-title">Warehouse 3D</div>
              <p className="page-copy">
                Visualiza racks, zonas y ocupación en un layout 3D industrial con datos operativos en tiempo real.
              </p>
              <div className="hero-chip-row mt-3">
                <span className="glass-pill">
                  <span className="status-dot" />
                  {selectedWarehouse ? `${selectedWarehouse.code} · ${selectedWarehouse.name}` : "Sin bodega"}
                </span>
                <span className="hero-chip">
                  <FiLayers size={14} />
                  {visibleLocations.length} ubicaciones visibles
                </span>
                <span className="hero-chip">
                  <FiCheckSquare size={14} />
                  {occupancyPercent}% ocupación
                </span>
              </div>
            </div>

            <div className="metric-tile warehouse3d-hero-metric">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Ubicaciones registradas</div>
                  <p className="metric-value">{layout.length}</p>
                  <div className="metric-helper">Vista maestra del layout 3D</div>
                </div>
                <div className="metric-icon">
                  <FiCamera size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="scene-kpi-strip mb-3">
          <div className="scene-kpi">
            <div className="scene-kpi-value">{visibleLocations.length}</div>
            <div className="scene-kpi-label">Ubicaciones visibles</div>
          </div>
          <div className="scene-kpi">
            <div className="scene-kpi-value">{occupiedCount}</div>
            <div className="scene-kpi-label">Ocupadas</div>
          </div>
          <div className="scene-kpi">
            <div className="scene-kpi-value">{freeCount}</div>
            <div className="scene-kpi-label">Disponibles</div>
          </div>
          <div className="scene-kpi">
            <div className="scene-kpi-value">{blockedCount}</div>
            <div className="scene-kpi-label">Bloqueadas</div>
          </div>
          <div className="scene-kpi scene-kpi-ring">
            <div className="scene-kpi-value">{occupancyPercent}%</div>
            <div className="scene-kpi-label">Ocupación</div>
          </div>
        </div>

        <div className="scene-wrapper warehouse3d-scene-shell">
          <WarehouseScene3D
            locations={visibleLocations}
            selectedLocationId={selectedLocation?.id}
            sceneMode={sceneMode}
            showLabels={showLabels}
            showDecorations={showDecorations}
            onSelectLocation={handleSelectLocation}
          />

          <div className="scene-toolbar scene-toolbar-floating">
            <button type="button" className={`scene-tool ${sceneMode === "overview" ? "active" : ""}`} onClick={() => setSceneMode("overview")}>
              <FiRotateCw size={18} /><small>Rotar</small>
            </button>
            <button type="button" className={`scene-tool ${sceneMode === "pan" ? "active" : ""}`} onClick={() => setSceneMode((current) => (current === "pan" ? "overview" : "pan"))}>
              <FiMove size={18} /><small>Mover</small>
            </button>
            <button type="button" className={`scene-tool ${sceneMode === "focus" ? "active" : ""}`} onClick={() => setSceneMode("focus")}>
              <FiSearch size={18} /><small>Buscar</small>
            </button>
            <button type="button" className={`scene-tool ${sceneMode === "inspect" ? "active" : ""}`} onClick={() => setSceneMode("inspect")}>
              <FiEdit3 size={18} /><small>Medir</small>
            </button>
            <button type="button" className={`scene-tool ${showLabels ? "active" : ""}`} onClick={() => setShowLabels((current) => !current)}>
              <FiLayers size={18} /><small>Etiquetas</small>
            </button>
            <button type="button" className={`scene-tool ${showDecorations ? "active" : ""}`} onClick={() => setShowDecorations((current) => !current)}>
              <FiLayers size={18} /><small>Capas</small>
            </button>
            <button type="button" className="scene-tool" onClick={handleFullscreen}>
              <FiMaximize2 size={18} /><small>Captura</small>
            </button>
          </div>
        </div>
      </section>

      <aside className="warehouse3d-right d-flex flex-column gap-3">
        <LocationSidePanel
          location={selectedLocation}
          inventory={inventory.length ? inventory : selectedLocation?.inventory ?? []}
        />

        <div className="side-card">
          <h5 className="mb-3">Leyenda de estados</h5>
          <div className="legend-grid">
            {statusLegend.map((item) => (
              <div key={item.status} className="legend-chip">
                <span className="legend-swatch" style={{ background: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="side-card">
          <h5 className="mb-3">Ocupabilidad por zona</h5>
          <div className="donut-shell">
            <div className="donut-ring">
              <div className="donut-center">
                <div>
                  <div style={{ fontSize: "2rem", lineHeight: 1 }}>{occupancyPercent}%</div>
                  <small className="text-muted">Promedio</small>
                </div>
              </div>
            </div>

            <div className="zone-summary-list">
              {(zones.length ? zones : ["A", "B", "C", "D"]).slice(0, 5).map((zone, index) => {
                const zoneLocations = visibleLocations.filter((item) => item.zone?.code === zone);
                const zoneOccupied = zoneLocations.filter((item) => item.status === "OCUPADO").length;
                const zonePercent = zoneLocations.length
                  ? Math.round((zoneOccupied / zoneLocations.length) * 100)
                  : [25, 18, 32, 15, 10][index] ?? 0;

                return (
                  <div key={zone}>
                    <div className="d-flex justify-content-between small mb-1">
                      <span>{zone}</span>
                      <span>{zonePercent}%</span>
                    </div>
                    <div className="mini-progress">
                      <span style={{ width: `${zonePercent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="side-card">
          <h5 className="mb-3">Resumen general</h5>
          <ul className="info-list">
            <li><span>Ubicaciones totales</span><strong>{visibleLocations.length}</strong></li>
            <li><span>Ubicaciones ocupadas</span><strong>{occupiedCount}</strong></li>
            <li><span>Disponibles</span><strong>{freeCount}</strong></li>
            <li><span>Bloqueadas</span><strong>{blockedCount}</strong></li>
            <li><span>En conteo</span><strong>{countingCount}</strong></li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
