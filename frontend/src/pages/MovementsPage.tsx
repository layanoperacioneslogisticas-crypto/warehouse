export function MovementsPage() {
  return (
    <div className="d-flex flex-column gap-4">
      <section className="hero-panel">
        <div className="hero-grid">
          <div>
            <div className="page-kicker">Trazabilidad interna</div>
            <h1 className="page-title">Rutas y movimientos</h1>
            <p className="page-copy">Prepara la operación para registrar transferencias, auditorías y recorridos dentro del almacén.</p>
          </div>
          <div className="page-panel-soft p-4">
            <div className="small text-muted mb-2">Estado</div>
            <div className="hero-stat-value">Tracking Mode</div>
          </div>
        </div>
      </section>

      <div className="control-grid">
        <div className="control-panel">
          <h6>Transferencias</h6>
          <p className="text-muted mb-0">Registro de origen, destino, usuario y motivo del movimiento.</p>
        </div>
        <div className="control-panel">
          <h6>Auditoría</h6>
          <p className="text-muted mb-0">Historial operativo para revisión de cambios y bloqueos.</p>
        </div>
        <div className="control-panel">
          <h6>Flujos</h6>
          <p className="text-muted mb-0">Base visual para construir rutas de picking y abastecimiento.</p>
        </div>
      </div>
    </div>
  );
}
