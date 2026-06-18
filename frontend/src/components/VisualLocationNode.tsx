import { Handle, NodeProps, Position } from "react-flow-renderer";

const colorMap: Record<string, string> = {
  LIBRE: "#16a34a",
  OCUPADO: "#2563eb",
  BLOQUEADO: "#dc2626",
  DANADO: "#334155",
  CUARENTENA: "#facc15",
  PAV: "#f97316",
  NPI: "#7c3aed",
  VALIDACION: "#06b6d4",
  RESERVADO: "#a855f7"
};

export function VisualLocationNode({ data }: NodeProps<any>) {
  return (
    <div
      className="rounded-3 border text-white p-2 shadow-sm"
      style={{
        background: colorMap[data.status] || "#64748b",
        minWidth: 160
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="fw-semibold">{data.label}</div>
      <small>{data.zone}</small>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

