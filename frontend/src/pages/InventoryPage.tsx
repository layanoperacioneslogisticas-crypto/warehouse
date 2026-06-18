export function InventoryPage() {
  return (
    <div className="d-flex flex-column gap-4">
      <section className="hero-panel">
        <div className="hero-grid">
          <div>
            <div className="page-kicker">Visibilidad de stock</div>
            <h1 className="page-title">Inventario</h1>
            <p className="page-copy">Gestiona asignación, consulta de saldos y movimientos desde el layout y desde los endpoints del backend.</p>
          </div>
          <div className="page-panel-soft p-4">
            <div className="small text-muted mb-2">Módulo preparado</div>
            <div className="hero-stat-value">API Ready</div>
          </div>
        </div>
      </section>

      <div className="control-grid">
        <div className="control-panel">
          <h6>Asignación por ubicación</h6>
          <p className="text-muted mb-0">Relaciona SKU, lote, pallet y cantidad con cada posición física.</p>
        </div>
        <div className="control-panel">
          <h6>Consulta operativa</h6>
          <p className="text-muted mb-0">Explora inventario desde mapa 2D o escena 3D con selección directa.</p>
        </div>
        <div className="control-panel">
          <h6>Trazabilidad</h6>
          <p className="text-muted mb-0">Base lista para entradas, salidas y movimientos internos.</p>
        </div>
      </div>
    </div>
  );
}
