import { UUID } from "crypto";

export interface ThermostatEvent {
  eventId: UUID;
  timestamp: string;
  resourceUpdate: {
    name: string;
    traits: ThermostatTraits;
  };
  userId: string;
  resourceGroup: Array<string>;
}

interface ThermostatMode {
  availableModes: Array<"HEAT" | "COOL" | "HEATCOOL" | "OFF">;
  mode: "HEAT" | "COOL" | "HEATCOOL" | "OFF";
}

interface ThermostatEco {
  availableModes: Array<"MANUAL_ECO" | "OFF">;
  mode: "MANUAL_ECO" | "OFF";
  heatCelsius?: number;
  coolCelsius?: number;
}

interface ThermostatTemperatureSetpoint {
  heatCelsius?: number;
  coolCelsius?: number;
}

export interface ThermostatTraits {
  "sdm.devices.traits.ThermostatMode"?: ThermostatMode;
  "sdm.devices.traits.ThermostatEco"?: ThermostatEco;
  "sdm.devices.traits.ThermostatTemperatureSetpoint"?: ThermostatTemperatureSetpoint;
}

export interface Credentials {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expiry_date: number;
}

export interface ExecuteCommandBody {
  command: string;
  params: Record<string, string | number>;
}

export interface AuthHeaders {
  Authorization: string;
  "Content-Type": string;
  [key: string]: string;
}

export interface Schedule {
  id: number;
  temperature: number;
  startTime: string;
  endTime: string;
  date: string;
}
