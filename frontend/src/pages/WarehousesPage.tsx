import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { warehouseApi } from "../api/modules";
import { DataTable } from "../components/DataTable";
import { Warehouse } from "../types";

const columns: ColumnDef<Warehouse>[] = [
  { header: "Codigo", accessorKey: "code" },
  { header: "Nombre", accessorKey: "name" },
  { header: "Pais", accessorKey: "country" },
  { header: "Ciudad", accessorKey: "city" },
  {
    header: "Estado",
    cell: ({ row }) => (row.original.active ? "Activo" : "Inactivo")
  }
];

export function WarehousesPage() {
  const { data = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: warehouseApi.list
  });

  return (
    <div className="page-panel p-4">
      <div className="page-header">
        <div>
          <h2>Bodegas</h2>
          <div className="text-muted">Maestro principal de bodegas.</div>
        </div>
      </div>
      <DataTable data={data} columns={columns} />
    </div>
  );
}

