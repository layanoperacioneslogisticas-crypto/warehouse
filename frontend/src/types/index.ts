export type Role = "ADMIN" | "SUPERVISOR" | "OPERARIO" | "AUDITOR";

export type ZoneType =
  | "RACK"
  | "PISO"
  | "PICKING"
  | "PAV"
  | "NPI"
  | "CUARENTENA"
  | "RECHAZO"
  | "VALIDACION"
  | "DANADO"
  | "CROSS_DOCKING"
  | "MAQUILADO";

export type LocationStatus =
  | "LIBRE"
  | "OCUPADO"
  | "BLOQUEADO"
  | "DANADO"
  | "CUARENTENA"
  | "PAV"
  | "NPI"
  | "VALIDACION"
  | "RESERVADO";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active?: boolean;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  country: string;
  city: string;
  active: boolean;
}

export interface Zone {
  id: string;
  warehouseId: string;
  code: string;
  name: string;
  type: ZoneType;
  active: boolean;
  warehouse?: Warehouse;
}

export interface InventoryLocation {
  id: string;
  locationId: string;
  sku: string;
  description: string;
  lot?: string | null;
  expirationDate?: string | null;
  palletCode?: string | null;
  quantity: number;
  unit: string;
  status: string;
}

export interface Location {
  id: string;
  warehouseId: string;
  zoneId: string;
  locationCode: string;
  aisle?: string | null;
  rack?: string | null;
  level?: string | null;
  position?: string | null;
  locationType: string;
  status: LocationStatus;
  maxBoxes?: number | null;
  maxWeightKg?: number | null;
  maxVolumeM3?: number | null;
  coordinateX: number;
  coordinateY: number;
  width: number;
  height: number;
  active: boolean;
  warehouse?: Warehouse;
  zone?: Zone;
  inventory?: InventoryLocation[];
}

export interface DashboardReport {
  totalLocations: number;
  freeLocations: number;
  occupiedLocations: number;
  blockedLocations: number;
  damagedLocations: number;
  pavLocations: number;
  npiLocations: number;
  occupancyRate: number;
  topZones: { zone: string; total: number }[];
}

