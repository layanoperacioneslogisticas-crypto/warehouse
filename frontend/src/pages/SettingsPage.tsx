export function SettingsPage() {
  return (
    <div className="d-flex flex-column gap-4">
      <section className="hero-panel">
        <div className="hero-grid">
          <div>
            <div className="page-kicker">Administración</div>
            <h1 className="page-title">Configuración</h1>
            <p className="page-copy">Espacio para parámetros globales, catálogos, reglas de layout y preferencias operativas.</p>
          </div>
          <div className="page-panel-soft p-4">
            <div className="small text-muted mb-2">Ambiente</div>
            <div className="hero-stat-value">Production</div>
          </div>
        </div>
      </section>

      <div className="control-grid">
        <div className="control-panel">
          <h6>Parámetros</h6>
          <p className="text-muted mb-0">Ajustes globales de operación y validaciones de negocio.</p>
        </div>
        <div className="control-panel">
          <h6>Catálogos</h6>
          <p className="text-muted mb-0">Estados, tipos de ubicación y futuras clasificaciones logísticas.</p>
        </div>
        <div className="control-panel">
          <h6>Preferencias</h6>
          <p className="text-muted mb-0">Extensión natural para perfiles, permisos y configuración visual.</p>
        </div>
      </div>
    </div>
  );
}
