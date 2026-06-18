import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { zoneApi } from "../api/modules";
import { DataTable } from "../components/DataTable";
import { Zone } from "../types";

const columns: ColumnDef<Zone>[] = [
  { header: "Bodega", cell: ({ row }) => row.original.warehouse?.code || "-" },
  { header: "Código", accessorKey: "code" },
  { header: "Nombre", accessorKey: "name" },
  { header: "Tipo", accessorKey: "type" },
  { header: "Estado", cell: ({ row }) => (row.original.active ? "Activo" : "Inactivo") }
];

export function ZonesPage() {
  const { data = [] } = useQuery({
    queryKey: ["zones"],
    queryFn: zoneApi.list
  });

  return (
    <div className="d-flex flex-column gap-4">
      <section className="hero-panel">
        <div className="hero-grid">
          <div>
            <div className="page-kicker">Segmentación operativa</div>
            <h1 className="page-title">Zonas</h1>
            <p className="page-copy">Controla recepción, picking, despacho y cualquier segmentación de capacidad dentro de cada bodega.</p>
          </div>
          <div className="page-panel-soft p-4">
            <div className="small text-muted mb-2">Zonas activas</div>
            <div className="hero-stat-value">{data.filter((item) => item.active).length}</div>
          </div>
        </div>
      </section>

      <section className="table-panel">
        <div className="table-card-header">
          <div>
            <h5 className="mb-1">Catálogo de zonas</h5>
            <div className="text-muted">Control de zonas por bodega.</div>
          </div>
        </div>
        <DataTable data={data} columns={columns} />
      </section>
    </div>
  );
}
