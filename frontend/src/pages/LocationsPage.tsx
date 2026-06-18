import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { locationApi } from "../api/modules";
import { DataTable } from "../components/DataTable";
import { LocationStatusBadge } from "../components/LocationStatusBadge";
import { Location } from "../types";

const columns: ColumnDef<Location>[] = [
  { header: "Ubicacion", accessorKey: "locationCode" },
  { header: "Bodega", cell: ({ row }) => row.original.warehouse?.code || "-" },
  { header: "Zona", cell: ({ row }) => row.original.zone?.code || "-" },
  { header: "Tipo", accessorKey: "locationType" },
  { header: "Estado", cell: ({ row }) => <LocationStatusBadge status={row.original.status} /> },
  { header: "Activo", cell: ({ row }) => (row.original.active ? "Si" : "No") }
];

export function LocationsPage() {
  const { data = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: locationApi.list
  });

  return (
    <div className="page-panel p-4">
      <div className="page-header">
        <div>
          <h2>Ubicaciones</h2>
          <div className="text-muted">Vista tabular del maestro de ubicaciones.</div>
        </div>
      </div>
      <DataTable data={data} columns={columns} />
    </div>
  );
}

