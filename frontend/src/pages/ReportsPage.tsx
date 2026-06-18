export function ReportsPage() {
  return (
    <div className="d-flex flex-column gap-4">
      <section className="hero-panel">
        <div className="hero-grid">
          <div>
            <div className="page-kicker">Análisis y exportación</div>
            <h1 className="page-title">Reportes</h1>
            <p className="page-copy">Expone ocupación, inventario, bloqueos y desempeño de zonas para análisis ejecutivo.</p>
          </div>
          <div className="page-panel-soft p-4">
            <div className="small text-muted mb-2">Formato</div>
            <div className="hero-stat-value">Ready to Export</div>
          </div>
        </div>
      </section>

      <div className="control-grid">
        <div className="control-panel">
          <h6>Ocupabilidad</h6>
          <p className="text-muted mb-0">Comparativos por zona, tipo de ubicación y disponibilidad.</p>
        </div>
        <div className="control-panel">
          <h6>Inventario</h6>
          <p className="text-muted mb-0">Consulta por SKU, lote, pallet o ubicación física.</p>
        </div>
        <div className="control-panel">
          <h6>Alertas</h6>
          <p className="text-muted mb-0">Base para reportes de bloqueo, daño y estados no operables.</p>
        </div>
      </div>
    </div>
  );
}
