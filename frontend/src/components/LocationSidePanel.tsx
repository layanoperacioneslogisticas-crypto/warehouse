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
        <h5 className="mb-2">Información de ubicación</h5>
        <div className="empty-state">
          <div>
            <div className="fw-semibold mb-2">Selecciona una ubicación</div>
            <div className="small text-muted">
              Haz clic sobre un rack o una posición para abrir su detalle operativo.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const firstItem = inventory?.[0];

  return (
    <div className="d-flex flex-column gap-3">
      <div className="side-card">
        <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
          <div>
            <h5 className="mb-2">Información de ubicación</h5>
            <div className="warehouse-location-code">{location.locationCode}</div>
          </div>
          <LocationStatusBadge status={location.status} />
        </div>

        <ul className="info-list">
          <li><span>Ubicación</span><strong>{location.locationCode}</strong></li>
          <li><span>Zona</span><strong>{location.zone?.code || "-"}</strong></li>
          <li><span>Rack</span><strong>{location.rack || "-"}</strong></li>
          <li><span>Nivel</span><strong>{location.level || "-"}</strong></li>
          <li><span>Posición</span><strong>{location.position || "-"}</strong></li>
          <li><span>Tipo</span><strong>{location.locationType}</strong></li>
        </ul>
      </div>

      <div className="side-card">
        <h5 className="mb-3">Inventario en ubicación</h5>
        {inventory?.length ? (
          <div className="d-flex flex-column gap-2">
            {inventory.map((item) => (
              <div key={item.id} className="inventory-card">
                <div className="d-flex justify-content-between gap-3">
                  <div>
                    <div className="fw-semibold">{item.sku}</div>
                    <div className="small text-muted">{item.description}</div>
                  </div>
                  <span className="inventory-pill">{item.quantity} {item.unit}</span>
                </div>

                <div className="inventory-grid mt-3">
                  <div>
                    <span>SKU</span>
                    <strong>{item.sku}</strong>
                  </div>
                  <div>
                    <span>Lote</span>
                    <strong>{item.lot || "-"}</strong>
                  </div>
                  <div>
                    <span>Pallet</span>
                    <strong>{item.palletCode || "-"}</strong>
                  </div>
                  <div>
                    <span>Estado</span>
                    <strong>{item.status}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted small">Sin inventario asignado.</div>
        )}
      </div>

      <div className="side-card">
        <h5 className="mb-3">Vista rápida</h5>
        <div className="location-preview">
          <div className="location-preview-rack">
            <span className="location-preview-label">{location.locationCode}</span>
          </div>
          <div className="location-preview-stack">
            <div className={`preview-box ${location.status.toLowerCase()}`}></div>
            <div className={`preview-box ${location.status.toLowerCase()}`}></div>
            <div className={`preview-box ${location.status.toLowerCase()}`}></div>
          </div>
        </div>
        <div className="small text-muted mt-3">
          {firstItem ? `${firstItem.sku} · ${firstItem.description}` : "Ubicación sin inventario asignado."}
        </div>
      </div>
    </div>
  );
}
