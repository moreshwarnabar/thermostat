import {
  AuthHeaders,
  ExecuteCommandBody,
  ThermostatEvent,
} from "@/lib/types/types";
import { validateEvent } from "@/lib/validators/thermostat";
import { getAuthToken } from "@/lib/services/auth";

const TARGET_TEMP = 25;
const THERMO_BASE_URL = process.env.THERMO_BASE_URL;
const THERMO_PROJECT_ID = process.env.THERMO_PROJECT_ID;
const THERMO_DEVICE_ID = process.env.THERMO_DEVICE_ID;

const updateThermostat = async (event: ThermostatEvent) => {
  console.log("Validating event", event);

  const { shouldBeProcessed, deviceInfo } = validateEvent(event);

  if (!shouldBeProcessed) {
    console.log("No need to update the thermostat!");
    return;
  }

  console.log("Updating thermostat", deviceInfo);

  const creds = await getAuthToken();
  if (!creds) {
    console.error("No credentials found");
    return;
  }

  const { mode, eco, curr_temp } = deviceInfo;
  let retryCount = 0;
  while (retryCount < 3) {
    let done = true;
    try {
      if (mode === "OFF") {
        console.log("Turning on the thermostat to COOL");
        done = await setMode(creds, "COOL");
      } else if (eco) {
        console.log("Turning off ECO mode");
        done = await setEcoOff(creds);
      } else if (mode !== "COOL") {
        console.log("Turning on the thermostat to COOL");
        done = await setMode(creds, "COOL");
      } else if (curr_temp !== TARGET_TEMP) {
        console.log("Setting the temperature to", TARGET_TEMP);
        done = await setTemp(creds);
      }

      if (!done) {
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 60000 * retryCount));
        continue;
      }
    } catch (error) {
      console.error("Error updating thermostat", error);
    }
  }

  console.log("Thermostat updated successfully");
};

const setEcoOff = async (creds: string) => {
  const url = `${THERMO_BASE_URL}/${THERMO_PROJECT_ID}/devices/${THERMO_DEVICE_ID}:executeCommand`;
  const headers = {
    Authorization: `Bearer ${creds}`,
    "Content-Type": "application/json",
  };

  const body = {
    command: `${process.env.BASE_COMMAND}Eco.SetMode`,
    params: {
      mode: "OFF",
    },
  };

  return await executeCommand(url, headers, body);
};

const setMode = async (creds: string, mode: string) => {
  const url = `${THERMO_BASE_URL}/${THERMO_PROJECT_ID}/devices/${THERMO_DEVICE_ID}:executeCommand`;
  const headers = {
    Authorization: `Bearer ${creds}`,
    "Content-Type": "application/json",
  };

  const body = {
    command: `${process.env.BASE_COMMAND}Thermostat.SetMode`,
    params: {
      mode: mode,
    },
  };

  return await executeCommand(url, headers, body);
};

const setTemp = async (creds: string) => {
  const url = `${THERMO_BASE_URL}/${THERMO_PROJECT_ID}/devices/${THERMO_DEVICE_ID}:executeCommand`;
  const headers = {
    Authorization: `Bearer ${creds}`,
    "Content-Type": "application/json",
  };

  const body = {
    command: `${process.env.BASE_COMMAND}TemperatureSetPoint.SetCool`,
    params: {
      coolCelsius: TARGET_TEMP,
    },
  };

  return await executeCommand(url, headers, body);
};

const executeCommand = async (
  url: string,
  headers: AuthHeaders,
  body: ExecuteCommandBody
): Promise<boolean> => {
  let retryCount = 0;
  while (retryCount < 3) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (response.ok) {
        console.log("Command executed successfully", body.command);
        return true;
      }

      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, 60000 * retryCount));
    } catch (error) {
      console.error("Error executing command", error);
      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, 60000 * retryCount));
    }
  }
  return false;
};

export default updateThermostat;
