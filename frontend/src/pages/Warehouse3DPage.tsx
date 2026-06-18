import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiEdit3, FiLayers, FiMaximize2, FiMove, FiRotateCw, FiSearch } from "react-icons/fi";
import { inventoryApi, locationApi, warehouseApi } from "../api/modules";
import { InventoryLocation, Location } from "../types";
import { LocationSidePanel } from "../components/LocationSidePanel";
import { WarehouseScene3D } from "../components/WarehouseScene3D";

const statusLegend = [
  { status: "Disponible", color: "#22c55e" },
  { status: "Ocupado", color: "#3b82f6" },
  { status: "Próximo a vencer", color: "#f59e0b" },
  { status: "Bloqueado", color: "#ef4444" },
  { status: "Vacío", color: "#d1d5db" }
];

export function Warehouse3DPage() {
  const [warehouseId, setWarehouseId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>();
  const [inventory, setInventory] = useState<InventoryLocation[]>([]);
  const [zoneFilter, setZoneFilter] = useState("");
  const [sceneMode, setSceneMode] = useState<"overview" | "focus" | "inspect" | "pan">("overview");
  const [showLabels, setShowLabels] = useState(true);
  const [showDecorations, setShowDecorations] = useState(true);

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
    () => layout.filter((location) => !zoneFilter || location.zone?.code === zoneFilter),
    [layout, zoneFilter]
  );

  const zones = useMemo(
    () => Array.from(new Set(layout.map((location) => location.zone?.code).filter(Boolean))) as string[],
    [layout]
  );

  const occupiedCount = visibleLocations.filter((item) => item.status === "OCUPADO").length;
  const freeCount = visibleLocations.filter((item) => item.status === "LIBRE").length;
  const blockedCount = visibleLocations.filter((item) => item.status === "BLOQUEADO").length;
  const occupancyPercent = visibleLocations.length
    ? Math.round((occupiedCount / visibleLocations.length) * 100)
    : 0;

  useEffect(() => {
    if (!visibleLocations.length) return;

    const currentVisible = selectedLocation && visibleLocations.some((item) => item.id === selectedLocation.id);
    const nextLocation = currentVisible ? selectedLocation : visibleLocations[0];

    if (nextLocation && nextLocation.id !== selectedLocation?.id) {
      setSelectedLocation(nextLocation);
      inventoryApi.byLocation(nextLocation.id).then(setInventory).catch(() => setInventory([]));
    }
  }, [visibleLocations, selectedLocation]);

  const handleSelectLocation = async (location: Location) => {
    setSelectedLocation(location);
    try {
      const rows = await inventoryApi.byLocation(location.id);
      setInventory(rows);
    } catch {
      setInventory([]);
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

  return (
    <div className="row g-4">
      <div className="col-xl-2">
        <div className="side-card mb-3">
          <h5 className="mb-3">Leyenda</h5>
          <ul className="legend-list">
            {statusLegend.map((item) => (
              <li key={item.status} className="legend-item">
                <div className="d-flex align-items-center gap-2">
                  <span className="legend-swatch" style={{ background: item.color }} />
                  <span>{item.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="side-card">
          <h6 className="mb-3">Filtros del layout</h6>
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
          </div>
        </div>
      </div>

      <div className="col-xl-7">
        <div className="page-panel p-3">
          <div className="page-header px-2 pt-2">
            <div>
              <div className="page-kicker">Warehouse 3D</div>
              <div className="page-title" style={{ fontSize: "1.7rem" }}>Layout 3D del almacén</div>
              <p className="page-copy">Racks, zonas y ubicaciones modeladas con interacción avanzada en navegador.</p>
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
              <div className="scene-kpi-value">{occupancyPercent}%</div>
              <div className="scene-kpi-label">Ocupación</div>
            </div>
          </div>

          <div className="scene-wrapper">
            <WarehouseScene3D
              locations={visibleLocations}
              selectedLocationId={selectedLocation?.id}
              sceneMode={sceneMode}
              showLabels={showLabels}
              showDecorations={showDecorations}
              onSelectLocation={handleSelectLocation}
            />
          </div>

          <div className="scene-toolbar mt-3">
            <button
              type="button"
              className={`scene-tool ${sceneMode === "overview" ? "active" : ""}`}
              onClick={() => setSceneMode("overview")}
            >
              <FiRotateCw size={18} /><small>Rotar</small>
            </button>
            <button
              type="button"
              className={`scene-tool ${sceneMode === "pan" ? "active" : ""}`}
              onClick={() => setSceneMode((current) => (current === "pan" ? "overview" : "pan"))}
            >
              <FiMove size={18} /><small>Mover</small>
            </button>
            <button
              type="button"
              className={`scene-tool ${sceneMode === "focus" ? "active" : ""}`}
              onClick={() => setSceneMode("focus")}
            >
              <FiSearch size={18} /><small>Zoom</small>
            </button>
            <button
              type="button"
              className={`scene-tool ${sceneMode === "inspect" ? "active" : ""}`}
              onClick={() => setSceneMode("inspect")}
            >
              <FiEdit3 size={18} /><small>Medir</small>
            </button>
            <button
              type="button"
              className={`scene-tool ${showLabels ? "active" : ""}`}
              onClick={() => setShowLabels((current) => !current)}
            >
              <FiEdit3 size={18} /><small>Etiquetas</small>
            </button>
            <button
              type="button"
              className={`scene-tool ${showDecorations ? "active" : ""}`}
              onClick={() => setShowDecorations((current) => !current)}
            >
              <FiLayers size={18} /><small>Capas</small>
            </button>
            <button type="button" className="scene-tool" onClick={handleFullscreen}>
              <FiMaximize2 size={18} /><small>Pantalla</small>
            </button>
          </div>
        </div>
      </div>

      <div className="col-xl-3 d-flex flex-column gap-3">
        <LocationSidePanel location={selectedLocation} inventory={inventory} />

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
          </div>

          <div className="d-flex flex-column gap-2 mt-3">
            {(zones.length ? zones : ["A", "B", "C", "D"]).slice(0, 5).map((zone, index) => {
              const zoneLocations = visibleLocations.filter((item) => item.zone?.code === zone);
              const zoneOccupied = zoneLocations.filter((item) => item.status === "OCUPADO").length;
              const zonePercent = zoneLocations.length ? Math.round((zoneOccupied / zoneLocations.length) * 100) : [85, 72, 65, 58, 48][index] ?? 0;

              return (
                <div key={zone}>
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Zona {zone}</span>
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

        <div className="side-card">
          <h5 className="mb-3">Resumen general</h5>
          <ul className="info-list">
            <li><span>Ubicaciones totales</span><strong>{visibleLocations.length}</strong></li>
            <li><span>Ubicaciones ocupadas</span><strong>{occupiedCount}</strong></li>
            <li><span>Disponibles</span><strong>{freeCount}</strong></li>
            <li><span>Bloqueadas</span><strong>{blockedCount}</strong></li>
          </ul>
          <div className="mt-3 small text-muted">
            Demo activa sobre {selectedLocation?.locationCode || "sin selección"}.
          </div>
        </div>
      </div>
    </div>
  );
}
