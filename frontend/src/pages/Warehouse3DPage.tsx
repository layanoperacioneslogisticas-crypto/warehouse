import { useMemo, useState } from "react";
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

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: warehouseApi.list
  });

  const { data: layout = [] } = useQuery({
    queryKey: ["layout-3d", warehouseId],
    queryFn: () => locationApi.layout(warehouseId),
    enabled: Boolean(warehouseId)
  });

  const visibleLocations = useMemo(() => {
    return layout.filter((location) => !zoneFilter || location.zone?.code === zoneFilter);
  }, [layout, zoneFilter]);

  const zones = useMemo(() => {
    return Array.from(new Set(layout.map((location) => location.zone?.code).filter(Boolean))) as string[];
  }, [layout]);

  const handleSelectLocation = async (location: Location) => {
    setSelectedLocation(location);
    const rows = await inventoryApi.byLocation(location.id);
    setInventory(rows);
  };

  return (
    <div className="row g-4">
      <div className="col-xl-2">
        <div className="side-card">
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
      </div>

      <div className="col-xl-7">
        <div className="page-panel p-3">
          <div className="page-header px-2 pt-2">
            <div>
              <div className="page-title" style={{ fontSize: "1.65rem" }}>Layout 3D del almacén</div>
              <p className="page-copy">Racks, zonas y ubicaciones modeladas con interacción desde navegador.</p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <select
                className="form-select"
                style={{ minWidth: 220 }}
                value={warehouseId}
                onChange={(event) => {
                  setWarehouseId(event.target.value);
                  setSelectedLocation(undefined);
                  setInventory([]);
                }}
              >
                <option value="">Almacén Principal</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} - {warehouse.name}
                  </option>
                ))}
              </select>
              <select
                className="form-select"
                style={{ minWidth: 180 }}
                value={zoneFilter}
                onChange={(event) => setZoneFilter(event.target.value)}
                disabled={!warehouseId}
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

          <div className="scene-wrapper">
            <WarehouseScene3D
              locations={visibleLocations}
              selectedLocationId={selectedLocation?.id}
              onSelectLocation={handleSelectLocation}
            />
          </div>

          <div className="scene-toolbar mt-3">
            <button className="scene-tool"><FiRotateCw size={18} /><small>Rotar</small></button>
            <button className="scene-tool"><FiMove size={18} /><small>Mover</small></button>
            <button className="scene-tool"><FiSearch size={18} /><small>Zoom</small></button>
            <button className="scene-tool"><FiEdit3 size={18} /><small>Medir</small></button>
            <button className="scene-tool"><FiEdit3 size={18} /><small>Etiquetas</small></button>
            <button className="scene-tool"><FiLayers size={18} /><small>Capas</small></button>
            <button className="scene-tool"><FiMaximize2 size={18} /><small>Pantalla</small></button>
          </div>
        </div>
      </div>

      <div className="col-xl-3 d-flex flex-column gap-3">
        <LocationSidePanel location={selectedLocation} inventory={inventory} />

        <div className="side-card">
          <h5 className="mb-3">Ocupabilidad por Zona</h5>
          <div className="donut-shell">
            <div className="donut-ring">
              <div className="donut-center">
                <div>
                  <div style={{ fontSize: "2rem", lineHeight: 1 }}>72%</div>
                  <small className="text-muted">Promedio</small>
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex flex-column gap-2 mt-3">
            {["A", "B", "C", "D", "F"].map((zone, index) => {
              const values = [85, 72, 65, 58, 48];
              return (
                <div key={zone}>
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Zona {zone}</span>
                    <span>{values[index]}%</span>
                  </div>
                  <div className="mini-progress">
                    <span style={{ width: `${values[index]}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="side-card">
          <h5 className="mb-3">Resumen General</h5>
          <ul className="info-list">
            <li><span>Ubicaciones totales</span><strong>{visibleLocations.length}</strong></li>
            <li><span>Ubicaciones ocupadas</span><strong>{visibleLocations.filter((item) => item.status === "OCUPADO").length}</strong></li>
            <li><span>Disponibles</span><strong>{visibleLocations.filter((item) => item.status === "LIBRE").length}</strong></li>
            <li><span>Bloqueadas</span><strong>{visibleLocations.filter((item) => item.status === "BLOQUEADO").length}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
