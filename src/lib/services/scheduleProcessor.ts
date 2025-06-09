import supabaseAdmin from "@/lib/services/supabaseAdmin";
import { ScheduleTable } from "@/lib/services/schedules";
import { getAuthToken } from "@/lib/services/auth";
import {
  setMode,
  setCustomTemp,
  getDeviceInfo,
  setEcoOff,
} from "@/lib/services/updateThermostat";
import { logger } from "@/lib/services/logger";

interface ScheduleProcessorResult {
  success: boolean;
  message: string;
  processedSchedules: number;
  errors: string[];
}

/**
 * Fetch schedules that should start at the current 15-minute mark
 */
const fetchSchedulesToStart = async (
  currentTime: string
): Promise<{
  data: ScheduleTable[] | null;
  error: { message: string } | null;
}> => {
  const scheduleLogger = logger.scheduleProcessing("fetch_schedules");

  try {
    // Round down to the nearest 15-minute mark
    const now = new Date(currentTime);
    const minutes = now.getMinutes();
    const roundedMinutes = Math.floor(minutes / 15) * 15;

    const scheduleTime = new Date(now);
    scheduleTime.setMinutes(roundedMinutes, 0, 0); // Set to exact 15-minute mark

    scheduleLogger.info("Looking for schedules that start at specific time", {
      scheduleTime: scheduleTime.toISOString(),
      currentTime,
    });

    const { data, error } = await supabaseAdmin
      .from("schedules")
      .select("*")
      .eq("start_time", scheduleTime.toISOString())
      .order("start_time", { ascending: true });

    if (error) {
      scheduleLogger.error("Error fetching schedules to start", {
        error: error.message,
      });
      return { data: null, error: { message: error.message } };
    }

    scheduleLogger.info("Successfully fetched schedules", {
      scheduleCount: data?.length || 0,
    });
    return { data: data || [], error: null };
  } catch (error) {
    scheduleLogger.error("Unexpected error fetching schedules to start", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

/**
 * Process schedules that should start at the current 15-minute mark
 * Designed to run every 15 minutes via cron
 * @returns Promise containing processing results
 */
export const processSchedules = async (): Promise<ScheduleProcessorResult> => {
  const processLogger = logger.scheduleProcessing("process_schedules");
  const errors: string[] = [];
  let processedSchedules = 0;

  try {
    const now = new Date();
    processLogger.info("Starting schedule processing", {
      timestamp: now.toISOString(),
    });

    // Fetch schedules that should start right now (within current minute)
    const { data: schedules, error } = await fetchSchedulesToStart(
      now.toISOString()
    );

    if (error) {
      const errorMessage = `Failed to fetch schedules: ${
        error.message || "Unknown error"
      }`;
      processLogger.error("Failed to fetch schedules", {
        error: error.message,
      });
      errors.push(errorMessage);
      return {
        success: false,
        message: "Failed to fetch schedules",
        processedSchedules: 0,
        errors,
      };
    }

    if (!schedules || schedules.length === 0) {
      processLogger.info("No schedules to process");
      return {
        success: true,
        message: "No schedules to process",
        processedSchedules: 0,
        errors: [],
      };
    }

    processLogger.info("Found schedules to process", {
      scheduleCount: schedules.length,
    });

    // Process each schedule
    for (const schedule of schedules) {
      const scheduleSpecificLogger = processLogger.setContext({
        scheduleId: schedule.id.toString(),
      });

      try {
        scheduleSpecificLogger.info("Processing individual schedule", {
          temperature: schedule.temperature,
          startTime: schedule.start_time,
        });

        const success = await triggerThermostatUpdate(schedule);
        if (success) {
          processedSchedules++;
          scheduleSpecificLogger.info("Successfully processed schedule");
        } else {
          const errorMessage = `Failed to process schedule ${schedule.id}`;
          scheduleSpecificLogger.error("Failed to process schedule");
          errors.push(errorMessage);
        }
      } catch (error) {
        const errorMessage = `Error processing schedule ${schedule.id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        scheduleSpecificLogger.error("Error processing schedule", {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });
        errors.push(errorMessage);
      }
    }

    const result = {
      success: errors.length === 0,
      message: `Processed ${processedSchedules} schedules`,
      processedSchedules,
      errors,
    };

    processLogger.info("Schedule processing completed", {
      success: result.success,
      processedCount: processedSchedules,
      errorCount: errors.length,
    });

    return result;
  } catch (error) {
    const errorMessage = `Unexpected error in processSchedules: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
    processLogger.error("Unexpected error in processSchedules", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    errors.push(errorMessage);

    return {
      success: false,
      message: "Unexpected error occurred",
      processedSchedules,
      errors,
    };
  }
};

/**
 * Trigger thermostat update for a specific schedule using the existing helper methods
 * @param schedule - The schedule to process
 * @returns Promise<boolean> - Success status
 */
const triggerThermostatUpdate = async (
  schedule: ScheduleTable
): Promise<boolean> => {
  const thermoLogger = logger
    .scheduleProcessing(schedule.id.toString())
    .thermostatOperation("trigger_update", {
      scheduleId: schedule.id.toString(),
      targetTemperature: schedule.temperature,
    });

  try {
    thermoLogger.info("Processing schedule with temperature", {
      temperature: schedule.temperature,
      unit: "°C",
    });

    const creds = await getAuthToken();
    if (!creds) {
      thermoLogger.error("No credentials found");
      return false;
    }

    let retryCount = 0;
    while (retryCount < 3) {
      try {
        let success = true;

        const deviceInfo = await getDeviceInfo(creds);
        thermoLogger.info("Device Info: ", deviceInfo);
        if (!deviceInfo) {
          thermoLogger.error("Failed to get device info");
          return false;
        }

        const deviceTraits = deviceInfo.traits;
        thermoLogger.info("Device Traits: ", deviceTraits);
        if (!deviceTraits[`${process.env.THERMO_BASE_TRAIT}Mode`]) {
          thermoLogger.error("Trait not found");
          return false;
        }

        const currMode = deviceTraits[`${process.env.THERMO_BASE_TRAIT}Mode`];
        thermoLogger.info("Current Mode: ", currMode);
        if (currMode === "ECO") {
          const ecoSuccess = await setEcoOff(creds);
          if (!ecoSuccess) {
            thermoLogger.warn("Failed to set thermostat to ECO mode");
            return false;
          }
          thermoLogger.info("Successfully switched off ECO mode");
        }

        // Set thermostat to COOL mode
        thermoLogger.info("Setting thermostat to COOL mode", {
          retryAttempt: retryCount + 1,
        });
        const modeSuccess = await setMode(creds, "COOL");
        if (!modeSuccess) {
          success = false;
          thermoLogger.warn("Failed to set thermostat to COOL mode");
        }

        // Set the scheduled temperature
        thermoLogger.info("Setting temperature", {
          temperature: schedule.temperature,
          retryAttempt: retryCount + 1,
        });
        const tempSuccess = await setCustomTemp(creds, schedule.temperature);
        if (!tempSuccess) {
          success = false;
          thermoLogger.warn("Failed to set temperature");
        }

        if (success) {
          thermoLogger.info("Successfully updated thermostat for schedule");
          return true;
        }

        retryCount++;
        const waitTime = 60000 * retryCount;
        thermoLogger.warn("Retry attempt failed, waiting before next attempt", {
          retryCount,
          waitTimeMs: waitTime,
        });
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } catch (error) {
        thermoLogger.error("Error in retry attempt", {
          retryCount,
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });
        retryCount++;
        const waitTime = 60000 * retryCount;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    thermoLogger.error("Failed to update thermostat after all retry attempts", {
      maxRetries: 3,
    });
    return false;
  } catch (error) {
    thermoLogger.error("Error triggering thermostat update", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
};
