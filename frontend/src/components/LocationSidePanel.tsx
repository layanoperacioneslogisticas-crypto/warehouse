import { InventoryLocation, Location } from "../types";
import { LocationStatusBadge } from "./LocationStatusBadge";

export function LocationSidePanel({
  location,
  inventory
}: {
  location?: Location;
  inventory?: InventoryLocation[];
}) {
  if (!location) {
    return (
      <div className="page-panel p-4">
        <div className="text-muted">Selecciona una ubicacion del mapa.</div>
      </div>
    );
  }

  return (
    <div className="page-panel p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{location.locationCode}</h5>
        <LocationStatusBadge status={location.status} />
      </div>
      <div className="small text-muted mb-3">
        {location.warehouse?.name} · {location.zone?.name}
      </div>
      <ul className="list-group list-group-flush">
        <li className="list-group-item px-0">Tipo: {location.locationType}</li>
        <li className="list-group-item px-0">Capacidad cajas: {location.maxBoxes ?? "-"}</li>
        <li className="list-group-item px-0">Capacidad kg: {location.maxWeightKg ?? "-"}</li>
        <li className="list-group-item px-0">Capacidad m3: {location.maxVolumeM3 ?? "-"}</li>
      </ul>
      <div className="mt-3">
        <h6>Inventario</h6>
        {inventory?.length ? (
          inventory.map((item) => (
            <div key={item.id} className="border rounded-3 p-2 mb-2">
              <div className="fw-semibold">{item.sku}</div>
              <small>{item.description}</small>
              <div className="small text-muted">
                {item.quantity} {item.unit} · Lote {item.lot || "-"}
              </div>
            </div>
          ))
        ) : (
          <div className="text-muted small">Sin inventario.</div>
        )}
      </div>
    </div>
  );
}

