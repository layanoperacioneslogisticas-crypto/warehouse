import api from "./client";
import { DashboardReport, Location, Warehouse, Zone } from "../types";

export const authApi = {
  login: async (payload: { email: string; password: string }) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },
  me: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  }
};

export const warehouseApi = {
  list: async () => (await api.get<Warehouse[]>("/warehouses")).data
};

export const zoneApi = {
  list: async () => (await api.get<Zone[]>("/zones")).data
};

export const locationApi = {
  list: async () => (await api.get<Location[]>("/locations")).data,
  layout: async (warehouseId: string) => (await api.get<Location[]>(`/layout/warehouse/${warehouseId}`)).data,
  updateCoordinates: async (id: string, payload: { coordinateX: number; coordinateY: number }) =>
    (await api.put(`/locations/${id}/coordinates`, payload)).data
};

export const inventoryApi = {
  byLocation: async (locationId: string) => (await api.get(`/inventory/location/${locationId}`)).data
};

export const reportApi = {
  dashboard: async () => (await api.get<DashboardReport>("/reports/dashboard")).data,
  occupancy: async () => (await api.get("/reports/occupancy")).data
};

