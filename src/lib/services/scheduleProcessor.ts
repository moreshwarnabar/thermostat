import { getAuthToken } from "@/lib/services/auth";
import { setMode, setCustomTemp } from "@/lib/services/updateThermostat";
import supabaseAdmin from "@/lib/services/supabaseAdmin";
import { ScheduleTable } from "@/lib/services/schedules";

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
  try {
    // Round down to the nearest 15-minute mark
    const now = new Date(currentTime);
    const minutes = now.getMinutes();
    const roundedMinutes = Math.floor(minutes / 15) * 15;

    const scheduleTime = new Date(now);
    scheduleTime.setMinutes(roundedMinutes, 0, 0); // Set to exact 15-minute mark

    console.log(
      `Looking for schedules that start at: ${scheduleTime.toISOString()}`
    );

    const { data, error } = await supabaseAdmin
      .from("schedules")
      .select("*")
      .eq("start_time", scheduleTime.toISOString())
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching schedules to start:", error);
      return { data: null, error: { message: error.message } };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Unexpected error fetching schedules to start:", error);
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
  const errors: string[] = [];
  let processedSchedules = 0;

  try {
    const now = new Date();

    // Fetch schedules that should start right now (within current minute)
    const { data: schedules, error } = await fetchSchedulesToStart(
      now.toISOString()
    );

    if (error) {
      errors.push(
        `Failed to fetch schedules: ${error.message || "Unknown error"}`
      );
      return {
        success: false,
        message: "Failed to fetch schedules",
        processedSchedules: 0,
        errors,
      };
    }

    if (!schedules || schedules.length === 0) {
      return {
        success: true,
        message: "No schedules to process",
        processedSchedules: 0,
        errors: [],
      };
    }

    console.log(`Found ${schedules.length} schedules to process`);

    // Process each schedule
    for (const schedule of schedules) {
      try {
        const success = await triggerThermostatUpdate(schedule);
        if (success) {
          processedSchedules++;
          console.log(`Successfully processed schedule ${schedule.id}`);
        } else {
          errors.push(`Failed to process schedule ${schedule.id}`);
        }
      } catch (error) {
        const errorMessage = `Error processing schedule ${schedule.id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    return {
      success: errors.length === 0,
      message: `Processed ${processedSchedules} schedules`,
      processedSchedules,
      errors,
    };
  } catch (error) {
    const errorMessage = `Unexpected error in processSchedules: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
    console.error(errorMessage);
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
  try {
    console.log(
      `Processing schedule ${schedule.id} with temperature ${schedule.temperature}°C`
    );

    const creds = await getAuthToken();
    if (!creds) {
      console.error("No credentials found");
      return false;
    }

    let retryCount = 0;
    while (retryCount < 3) {
      try {
        let success = true;

        // Set thermostat to COOL mode
        console.log("Setting thermostat to COOL mode");
        const modeSuccess = await setMode(creds, "COOL");
        if (!modeSuccess) {
          success = false;
        }

        // Set the scheduled temperature
        console.log(`Setting temperature to ${schedule.temperature}°C`);
        const tempSuccess = await setCustomTemp(creds, schedule.temperature);
        if (!tempSuccess) {
          success = false;
        }

        if (success) {
          console.log(
            `Successfully updated thermostat for schedule ${schedule.id}`
          );
          return true;
        }

        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 60000 * retryCount));
      } catch (error) {
        console.error(
          `Error in retry ${retryCount} for schedule ${schedule.id}:`,
          error
        );
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 60000 * retryCount));
      }
    }

    console.error(
      `Failed to update thermostat for schedule ${schedule.id} after 3 retries`
    );
    return false;
  } catch (error) {
    console.error(
      `Error triggering thermostat update for schedule ${schedule.id}:`,
      error
    );
    return false;
  }
};
