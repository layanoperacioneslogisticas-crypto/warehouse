import { useMemo, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap, Node, NodeTypes } from "react-flow-renderer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { inventoryApi, locationApi, warehouseApi } from "../api/modules";
import { Location, InventoryLocation } from "../types";
import { VisualLocationNode } from "../components/VisualLocationNode";
import { LocationSidePanel } from "../components/LocationSidePanel";

const nodeTypes: NodeTypes = {
  locationNode: VisualLocationNode
};

export function VisualMapPage() {
  const [warehouseId, setWarehouseId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>();
  const [inventory, setInventory] = useState<InventoryLocation[]>([]);

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: warehouseApi.list
  });

  const { data: layout = [] } = useQuery({
    queryKey: ["layout", warehouseId],
    queryFn: () => locationApi.layout(warehouseId),
    enabled: Boolean(warehouseId)
  });

  const coordinatesMutation = useMutation({
    mutationFn: ({ id, coordinateX, coordinateY }: { id: string; coordinateX: number; coordinateY: number }) =>
      locationApi.updateCoordinates(id, { coordinateX, coordinateY })
  });

  const nodes = useMemo<Node[]>(() => {
    return layout.map((location) => ({
      id: location.id,
      type: "locationNode",
      position: { x: location.coordinateX, y: location.coordinateY },
      data: {
        label: location.locationCode,
        status: location.status,
        zone: location.zone?.code || "-"
      }
    }));
  }, [layout]);

  const handleNodeClick = async (_event: unknown, node: Node) => {
    const current = layout.find((item) => item.id === node.id);
    setSelectedLocation(current);
    if (current) {
      const rows = await inventoryApi.byLocation(current.id);
      setInventory(rows);
    }
  };

  const handleNodeDragStop = (_event: unknown, node: Node) => {
    coordinatesMutation.mutate({
      id: node.id,
      coordinateX: node.position.x,
      coordinateY: node.position.y
    });
  };

  return (
    <div className="row g-4">
      <div className="col-xl-9">
        <div className="page-panel p-4">
          <div className="page-header">
            <div>
              <h2>Mapa Visual</h2>
              <div className="text-muted">Ubicaciones coloreadas por estado y arrastrables.</div>
            </div>
            <div style={{ minWidth: 260 }}>
              <select
                className="form-select"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
              >
                <option value="">Selecciona una bodega</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} - {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ height: 620 }}>
            <ReactFlow
              nodes={nodes}
              edges={[]}
              nodeTypes={nodeTypes}
              onNodeClick={handleNodeClick}
              onNodeDragStop={handleNodeDragStop}
              fitView
            >
              <Background />
              <MiniMap />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      </div>
      <div className="col-xl-3">
        <LocationSidePanel location={selectedLocation} inventory={inventory} />
      </div>
    </div>
  );
}

