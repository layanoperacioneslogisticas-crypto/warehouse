import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { zoneApi } from "../api/modules";
import { DataTable } from "../components/DataTable";
import { Zone } from "../types";

const columns: ColumnDef<Zone>[] = [
  { header: "Bodega", cell: ({ row }) => row.original.warehouse?.code || "-" },
  { header: "Codigo", accessorKey: "code" },
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
    <div className="page-panel p-4">
      <div className="page-header">
        <div>
          <h2>Zonas</h2>
          <div className="text-muted">Control de zonas por bodega.</div>
        </div>
      </div>
      <DataTable data={data} columns={columns} />
    </div>
  );
}

