import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi, locationApi, warehouseApi } from "../api/modules";
import { InventoryLocation, Location } from "../types";
import { LocationSidePanel } from "../components/LocationSidePanel";
import { WarehouseScene3D } from "../components/WarehouseScene3D";

const statusLegend = [
  { status: "LIBRE", color: "#16a34a" },
  { status: "OCUPADO", color: "#2563eb" },
  { status: "BLOQUEADO", color: "#dc2626" },
  { status: "DANADO", color: "#334155" },
  { status: "CUARENTENA", color: "#facc15" },
  { status: "PAV", color: "#f97316" },
  { status: "NPI", color: "#7c3aed" },
  { status: "VALIDACION", color: "#06b6d4" },
  { status: "RESERVADO", color: "#a855f7" }
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
      <div className="col-xl-9">
        <div className="page-panel p-4">
          <div className="page-header">
            <div>
              <h2>Almacen 3D</h2>
              <div className="text-muted">
                Visualizacion tridimensional de racks, piso y estados de ubicacion usando Three.js.
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <select
                className="form-select"
                style={{ minWidth: 260 }}
                value={warehouseId}
                onChange={(event) => {
                  setWarehouseId(event.target.value);
                  setSelectedLocation(undefined);
                  setInventory([]);
                }}
              >
                <option value="">Selecciona una bodega</option>
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
                    {zoneCode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-3 mb-3">
            {statusLegend.map((item) => (
              <span key={item.status} className="d-inline-flex align-items-center gap-2 small text-muted">
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    background: item.color,
                    display: "inline-block"
                  }}
                />
                {item.status}
              </span>
            ))}
          </div>

          <WarehouseScene3D
            locations={visibleLocations}
            selectedLocationId={selectedLocation?.id}
            onSelectLocation={handleSelectLocation}
          />
        </div>
      </div>

      <div className="col-xl-3">
        <LocationSidePanel location={selectedLocation} inventory={inventory} />
      </div>
    </div>
  );
}
