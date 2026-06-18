import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { locationApi } from "../api/modules";
import { DataTable } from "../components/DataTable";
import { LocationStatusBadge } from "../components/LocationStatusBadge";
import { Location } from "../types";

const columns: ColumnDef<Location>[] = [
  { header: "Ubicación", accessorKey: "locationCode" },
  { header: "Bodega", cell: ({ row }) => row.original.warehouse?.code || "-" },
  { header: "Zona", cell: ({ row }) => row.original.zone?.code || "-" },
  { header: "Tipo", accessorKey: "locationType" },
  { header: "Estado", cell: ({ row }) => <LocationStatusBadge status={row.original.status} /> },
  { header: "Activo", cell: ({ row }) => (row.original.active ? "Sí" : "No") }
];

export function LocationsPage() {
  const { data = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: locationApi.list
  });

  return (
    <div className="d-flex flex-column gap-4">
      <section className="hero-panel">
        <div className="hero-grid">
          <div>
            <div className="page-kicker">Capacidad física</div>
            <h1 className="page-title">Ubicaciones</h1>
            <p className="page-copy">Consulta el maestro de ubicaciones, su tipo, bodega, zona y disponibilidad operativa.</p>
          </div>
          <div className="page-panel-soft p-4">
            <div className="small text-muted mb-2">Ubicaciones activas</div>
            <div className="hero-stat-value">{data.filter((item) => item.active).length}</div>
          </div>
        </div>
      </section>

      <section className="table-panel">
        <div className="table-card-header">
          <div>
            <h5 className="mb-1">Maestro de ubicaciones</h5>
            <div className="text-muted">Vista tabular del catálogo físico del almacén.</div>
          </div>
        </div>
        <DataTable data={data} columns={columns} />
      </section>
    </div>
  );
}
