import { LocationStatus } from "../types";

const colorMap: Record<LocationStatus, string> = {
  LIBRE: "bg-success-subtle text-success",
  OCUPADO: "bg-primary-subtle text-primary",
  BLOQUEADO: "bg-danger-subtle text-danger",
  DANADO: "bg-dark text-white",
  CUARENTENA: "bg-warning-subtle text-warning-emphasis",
  PAV: "bg-orange text-white",
  NPI: "bg-purple text-white",
  VALIDACION: "bg-info-subtle text-info-emphasis",
  RESERVADO: "bg-secondary-subtle text-secondary-emphasis"
};

export function LocationStatusBadge({ status }: { status: LocationStatus }) {
  return <span className={`status-badge ${colorMap[status] || "bg-light text-dark"}`}>{status}</span>;
}

