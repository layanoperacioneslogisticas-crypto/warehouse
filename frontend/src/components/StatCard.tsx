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
      <div className="metric-header">
        <div className="metric-label">{label}</div>
        <div className="metric-icon">
          <Icon size={18} />
        </div>
      </div>
      <div className="metric-value">{value}</div>
      {helper ? <div className="metric-helper">{helper}</div> : null}
    </div>
  );
}
