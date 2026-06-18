import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { warehouseApi } from "../api/modules";
import { DataTable } from "../components/DataTable";
import { Warehouse } from "../types";

const columns: ColumnDef<Warehouse>[] = [
  { header: "Código", accessorKey: "code" },
  { header: "Nombre", accessorKey: "name" },
  { header: "País", accessorKey: "country" },
  { header: "Ciudad", accessorKey: "city" },
  { header: "Estado", cell: ({ row }) => (row.original.active ? "Activo" : "Inactivo") }
];

export function WarehousesPage() {
  const { data = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: warehouseApi.list
  });

  return (
    <div className="d-flex flex-column gap-4">
      <section className="hero-panel">
        <div className="hero-grid">
          <div>
            <div className="page-kicker">Maestros</div>
            <h1 className="page-title">Bodegas</h1>
            <p className="page-copy">Administra la red de almacenes, ciudades y estados operativos desde un mismo panel.</p>
          </div>
          <div className="page-panel-soft p-4">
            <div className="small text-muted mb-2">Total registradas</div>
            <div className="hero-stat-value">{data.length}</div>
          </div>
        </div>
      </section>

      <section className="table-panel">
        <div className="table-card-header">
          <div>
            <h5 className="mb-1">Catálogo de bodegas</h5>
            <div className="text-muted">Vista tabular del maestro principal.</div>
          </div>
        </div>
        <DataTable data={data} columns={columns} />
      </section>
    </div>
  );
}
