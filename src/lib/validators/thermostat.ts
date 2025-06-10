import { ThermostatEvent } from "@/lib/types/types";
import { getCurrentSchedule } from "@/lib/services/schedules";
import { logger } from "@/lib/services/logger";

interface DeviceInfo {
  mode: string;
  eco: boolean;
  curr_temp: number;
  target_temp: number;
}

interface ValidationResult {
  shouldBeProcessed: boolean;
  deviceInfo: DeviceInfo;
}

export async function validateEvent(
  event: ThermostatEvent
): Promise<ValidationResult> {
  const validateLogger = logger.thermostatOperation("validate_event", {
    eventId: event.eventId,
  });

  validateLogger.info("Validating thermostat event", {
    eventId: event.eventId,
    timestamp: event.timestamp,
  });

  const baseTrait = "sdm.devices.traits.Thermostat";

  // Check if event has required structure
  if (!event.resourceUpdate || !event.resourceUpdate.traits) {
    validateLogger.warn("Event does not have required structure", {
      eventId: event.eventId,
    });
    return { shouldBeProcessed: false, deviceInfo: {} as DeviceInfo };
  }

  const traits = event.resourceUpdate.traits;
  const traitKeys = Object.keys(traits);

  const deviceInfo: Partial<DeviceInfo> = {};

  // fetch current schedule if any
  const schedule = await getCurrentSchedule(event.userId);
  validateLogger.info("Current schedule", { schedule });

  if (schedule.error) {
    validateLogger.warn("Error fetching current schedule", {
      error: schedule.error,
    });
    return { shouldBeProcessed: false, deviceInfo: {} as DeviceInfo };
  } else if (!schedule.data) {
    validateLogger.warn("No current schedule found", {
      eventId: event.eventId,
    });
    return { shouldBeProcessed: false, deviceInfo: {} as DeviceInfo };
  }

  const scheduleData = schedule.data;
  validateLogger.info("Schedule data", { scheduleData });

  // Check for ThermostatMode trait
  const modeTraitKey = `${baseTrait}Mode`;
  if (!traitKeys.includes(modeTraitKey)) {
    validateLogger.warn("ThermostatMode trait not found", {
      eventId: event.eventId,
    });
    return { shouldBeProcessed: false, deviceInfo: {} as DeviceInfo };
  }
  deviceInfo.mode = traits[modeTraitKey]?.mode;

  // Check for ThermostatEco trait
  const ecoTraitKey = `${baseTrait}Eco`;
  if (!traitKeys.includes(ecoTraitKey)) {
    validateLogger.warn("ThermostatEco trait not found", {
      eventId: event.eventId,
    });
    return { shouldBeProcessed: false, deviceInfo: {} as DeviceInfo };
  }
  deviceInfo.eco = traits[ecoTraitKey]?.mode === "MANUAL_ECO";

  // Check for ThermostatTemperatureSetpoint trait
  const tempTraitKey = `${baseTrait}TemperatureSetpoint`;
  if (!traitKeys.includes(tempTraitKey)) {
    validateLogger.warn("ThermostatTemperatureSetpoint trait not found", {
      eventId: event.eventId,
    });
    return { shouldBeProcessed: false, deviceInfo: {} as DeviceInfo };
  }
  deviceInfo.curr_temp = traits[tempTraitKey]?.coolCelsius ?? -1;
  deviceInfo.target_temp = scheduleData.temperature;

  validateLogger.info("Device info", { deviceInfo });

  return { shouldBeProcessed: true, deviceInfo: deviceInfo as DeviceInfo };
}
