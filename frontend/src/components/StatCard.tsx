import { IconType } from "react-icons";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconType;
  helper?: string;
}

export function StatCard({ label, value, icon: Icon, helper }: StatCardProps) {
  return (
    <div className="metric-tile">
      <div className="text-muted">
        <Icon size={20} />
      </div>
      <h3>{value}</h3>
      <div className="fw-semibold">{label}</div>
      {helper ? <small className="text-muted">{helper}</small> : null}
    </div>
  );
}

