import { ThermostatEvent } from "@/lib/types/types";

interface DeviceInfo {
  mode: string;
  eco: boolean;
  curr_temp: number;
}

interface ValidationResult {
  shouldBeProcessed: boolean;
  deviceInfo: DeviceInfo;
}

export function validateEvent(event: ThermostatEvent): ValidationResult {
  const baseTrait = "sdm.devices.traits.Thermostat";

  // Check if event has required structure
  if (!event.resourceUpdate || !event.resourceUpdate.traits) {
    return { shouldBeProcessed: false, deviceInfo: {} as DeviceInfo };
  }

  const traits = event.resourceUpdate.traits;
  const traitKeys = Object.keys(traits);

  const deviceInfo: Partial<DeviceInfo> = {};

  // Check for ThermostatMode trait
  const modeTraitKey = `${baseTrait}Mode`;
  if (!traitKeys.includes(modeTraitKey)) {
    return { shouldBeProcessed: false, deviceInfo: {} as DeviceInfo };
  }
  deviceInfo.mode = traits[modeTraitKey]?.mode;

  // Check for ThermostatEco trait
  const ecoTraitKey = `${baseTrait}Eco`;
  if (!traitKeys.includes(ecoTraitKey)) {
    return { shouldBeProcessed: false, deviceInfo: {} as DeviceInfo };
  }
  deviceInfo.eco = traits[ecoTraitKey]?.mode === "MANUAL_ECO";

  // Check for ThermostatTemperatureSetpoint trait
  const tempTraitKey = `${baseTrait}TemperatureSetpoint`;
  if (!traitKeys.includes(tempTraitKey)) {
    return { shouldBeProcessed: false, deviceInfo: {} as DeviceInfo };
  }
  deviceInfo.curr_temp = traits[tempTraitKey]?.coolCelsius ?? -1;

  return { shouldBeProcessed: true, deviceInfo: deviceInfo as DeviceInfo };
}
