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
      <div className="side-card">
        <h5 className="mb-2">Información de Ubicación</h5>
        <div className="empty-state">
          <div>
            <div className="fw-semibold mb-2">Selecciona una ubicación</div>
            <div className="small text-muted">
              Haz clic sobre un rack o posición para abrir su detalle operativo.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="side-card">
        <h5 className="mb-3">Información de Ubicación</h5>
        <div className="fs-3 fw-bold text-primary mb-2">{location.locationCode}</div>
        <div className="mb-3">
          <LocationStatusBadge status={location.status} />
        </div>

        <ul className="info-list">
          <li><span>Bodega</span><strong>{location.warehouse?.code || "-"}</strong></li>
          <li><span>Zona</span><strong>{location.zone?.code || "-"}</strong></li>
          <li><span>Tipo</span><strong>{location.locationType}</strong></li>
          <li><span>Capacidad cajas</span><strong>{location.maxBoxes ?? "-"}</strong></li>
          <li><span>Capacidad kg</span><strong>{location.maxWeightKg ?? "-"}</strong></li>
          <li><span>Capacidad m3</span><strong>{location.maxVolumeM3 ?? "-"}</strong></li>
        </ul>
      </div>

      <div className="side-card">
        <h5 className="mb-3">Inventario en ubicación</h5>
        {inventory?.length ? (
          <div className="d-flex flex-column gap-2">
            {inventory.map((item) => (
              <div key={item.id} className="dark-list-item">
                <div className="fw-semibold">{item.sku}</div>
                <div className="small text-muted mb-2">{item.description}</div>
                <div className="small">Lote: {item.lot || "-"}</div>
                <div className="small">Pallet: {item.palletCode || "-"}</div>
                <div className="small">
                  Cantidad: <strong>{item.quantity} {item.unit}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted small">Sin inventario asignado.</div>
        )}
      </div>
    </div>
  );
}
