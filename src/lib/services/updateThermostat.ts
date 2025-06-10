import {
  AuthHeaders,
  ExecuteCommandBody,
  ThermostatEvent,
} from "@/lib/types/types";
import { validateEvent } from "@/lib/validators/thermostat";
import { getAuthToken } from "@/lib/services/auth";
import { logger } from "@/lib/services/logger";

const TARGET_TEMP = 25;
const THERMO_BASE_URL = process.env.THERMO_BASE_URL;
const THERMO_PROJECT_ID = process.env.THERMO_PROJECT_ID;
const THERMO_DEVICE_ID = process.env.THERMO_DEVICE_ID;

export const getDeviceInfo = async (creds: string) => {
  const deviceInfoLogger = logger.thermostatOperation("get_device_info");

  const url = `${THERMO_BASE_URL}/${THERMO_PROJECT_ID}/devices/${THERMO_DEVICE_ID}`;
  const headers = {
    Authorization: `Bearer ${creds}`,
    "Content-Type": "application/json",
  };

  deviceInfoLogger.debug("Getting device info", { url, headers });
  const response = await fetch(url, { headers });
  const data = await response.json();
  deviceInfoLogger.debug("Device info", { data });
  return data;
};

const updateThermostat = async (event: ThermostatEvent) => {
  const thermostatLogger = logger.thermostatOperation("update_thermostat", {
    eventId: event.eventId,
    userId: event.userId,
  });

  thermostatLogger.info("Validating thermostat event", {
    eventId: event.eventId,
    timestamp: event.timestamp,
  });

  const { shouldBeProcessed, deviceInfo } = validateEvent(event);

  if (!shouldBeProcessed) {
    thermostatLogger.info("Event does not require thermostat update", {
      deviceInfo,
    });
    return;
  }

  thermostatLogger.info("Updating thermostat based on event", { deviceInfo });

  const creds = await getAuthToken();
  if (!creds) {
    thermostatLogger.error("No credentials found for thermostat update");
    return;
  }

  const { mode, eco, curr_temp } = deviceInfo;
  let retryCount = 0;

  while (retryCount < 3) {
    let done = true;
    try {
      if (mode === "OFF") {
        thermostatLogger.info("Turning on thermostat to COOL mode", {
          currentMode: mode,
          retryAttempt: retryCount + 1,
        });
        done = await setMode(creds, "COOL");
      } else if (eco) {
        thermostatLogger.info("Turning off ECO mode", {
          retryAttempt: retryCount + 1,
        });
        done = await setEcoOff(creds);
      } else if (mode !== "COOL") {
        thermostatLogger.info("Setting thermostat to COOL mode", {
          currentMode: mode,
          retryAttempt: retryCount + 1,
        });
        done = await setMode(creds, "COOL");
      } else if (curr_temp !== TARGET_TEMP) {
        thermostatLogger.info("Setting temperature to target", {
          currentTemp: curr_temp,
          targetTemp: TARGET_TEMP,
          retryAttempt: retryCount + 1,
        });
        done = await setTemp(creds);
      }

      if (!done) {
        retryCount++;
        const waitTime = 60000 * retryCount;
        thermostatLogger.warn("Operation incomplete, retrying", {
          retryCount,
          waitTimeMs: waitTime,
        });
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      thermostatLogger.info("Thermostat updated successfully");
      return;
    } catch (error) {
      thermostatLogger.error("Error updating thermostat", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        retryAttempt: retryCount + 1,
      });
      retryCount++;
      const waitTime = 60000 * retryCount;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  thermostatLogger.error(
    "Failed to update thermostat after all retry attempts",
    {
      maxRetries: 3,
    }
  );
};

export const setEcoOff = async (creds: string) => {
  const ecoLogger = logger.thermostatOperation("set_eco_off");

  const url = `${THERMO_BASE_URL}/${THERMO_PROJECT_ID}/devices/${THERMO_DEVICE_ID}:executeCommand`;
  const headers = {
    Authorization: `Bearer ${creds}`,
    "Content-Type": "application/json",
  };

  const body = {
    command: `${process.env.THERMO_BASE_COMMAND}Eco.SetMode`,
    params: {
      mode: "OFF",
    },
  };

  ecoLogger.debug("Setting ECO mode to OFF", { command: body.command });
  return await executeCommand(url, headers, body);
};

export const setMode = async (creds: string, mode: string) => {
  const modeLogger = logger.thermostatOperation("set_mode", {
    targetMode: mode,
  });

  const url = `${THERMO_BASE_URL}/${THERMO_PROJECT_ID}/devices/${THERMO_DEVICE_ID}:executeCommand`;
  const headers = {
    Authorization: `Bearer ${creds}`,
    "Content-Type": "application/json",
  };

  const body = {
    command: `${process.env.THERMO_BASE_COMMAND}Mode.SetMode`,
    params: {
      mode: mode,
    },
  };

  modeLogger.debug("Setting thermostat mode", { mode, command: body.command });
  return await executeCommand(url, headers, body);
};

const setTemp = async (creds: string) => {
  const tempLogger = logger.thermostatOperation("set_temp", {
    targetTemp: TARGET_TEMP,
  });

  const url = `${THERMO_BASE_URL}/${THERMO_PROJECT_ID}/devices/${THERMO_DEVICE_ID}:executeCommand`;
  const headers = {
    Authorization: `Bearer ${creds}`,
    "Content-Type": "application/json",
  };

  const body = {
    command: `${process.env.THERMO_BASE_COMMAND}TemperatureSetPoint.SetCool`,
    params: {
      coolCelsius: TARGET_TEMP,
    },
  };

  tempLogger.debug("Setting temperature", {
    temperature: TARGET_TEMP,
    command: body.command,
  });
  return await executeCommand(url, headers, body);
};

// Create a version that accepts custom temperature
export const setCustomTemp = async (creds: string, temperature: number) => {
  const customTempLogger = logger.thermostatOperation("set_custom_temp", {
    targetTemp: temperature,
  });

  const url = `${THERMO_BASE_URL}/${THERMO_PROJECT_ID}/devices/${THERMO_DEVICE_ID}:executeCommand`;
  const headers = {
    Authorization: `Bearer ${creds}`,
    "Content-Type": "application/json",
  };

  const body = {
    command: `${process.env.THERMO_BASE_COMMAND}TemperatureSetpoint.SetCool`,
    params: {
      coolCelsius: temperature,
    },
  };

  customTempLogger.debug("Setting custom temperature", {
    temperature,
    command: body.command,
  });
  return await executeCommand(url, headers, body);
};

const executeCommand = async (
  url: string,
  headers: AuthHeaders,
  body: ExecuteCommandBody
): Promise<boolean> => {
  const executeLogger = logger.thermostatOperation("execute_command", {
    command: body.command,
  });

  let retryCount = 0;
  while (retryCount < 3) {
    try {
      executeLogger.debug("Executing thermostat command", {
        command: body.command,
        params: body.params,
        retryAttempt: retryCount + 1,
      });

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (response.ok) {
        executeLogger.info("Command executed successfully", {
          command: body.command,
          statusCode: response.status,
        });
        return true;
      }

      executeLogger.warn("Command execution failed", {
        command: body.command,
        statusCode: response.status,
        retryAttempt: retryCount + 1,
      });

      retryCount++;
      const waitTime = 60000 * retryCount;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    } catch (error) {
      executeLogger.error("Error executing command", {
        command: body.command,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        retryAttempt: retryCount + 1,
      });
      retryCount++;
      const waitTime = 60000 * retryCount;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  executeLogger.error("Failed to execute command after all retry attempts", {
    command: body.command,
    maxRetries: 3,
  });
  return false;
};

export default updateThermostat;
