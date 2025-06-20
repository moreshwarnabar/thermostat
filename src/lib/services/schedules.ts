import supabaseAdmin from "@/lib/services/supabaseAdmin";
import { Tables } from "@/lib/types/supabase";
import { NewSchedule, Schedule } from "../types/types";

// Type alias for the Schedule row from Supabase
export type ScheduleTable = Tables<"schedules">;

// Interface for error responses
interface ScheduleError {
  message: string;
  details?: string;
}

// Interface for successful responses
interface ScheduleResponse<T> {
  data: T | null;
  error: ScheduleError | null;
}

/**
 * Fetch all schedules from the database
 * @returns Promise containing schedules array or error
 */
export const fetchAllSchedules = async (): Promise<
  ScheduleResponse<Schedule[]>
> => {
  try {
    const { data, error } = await supabaseAdmin
      .from("schedules")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching schedules:", error);
      return {
        data: null,
        error: {
          message: "Failed to fetch schedules",
          details: error.message,
        },
      };
    }

    return {
      data: data || [],
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error fetching schedules:", error);
    return {
      data: null,
      error: {
        message: "An unexpected error occurred while fetching schedules",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

/**
 * Fetch schedules for a specific user
 * @param userId - The user ID to fetch schedules for
 * @returns Promise containing user's schedules array or error
 */
export const fetchSchedulesByUserId = async (
  userId: string
): Promise<ScheduleResponse<ScheduleTable[]>> => {
  try {
    if (!userId) {
      return {
        data: null,
        error: {
          message: "User ID is required",
        },
      };
    }

    const { data, error } = await supabaseAdmin
      .from("schedules")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching schedules for user:", error);
      return {
        data: null,
        error: {
          message: "Failed to fetch user schedules",
          details: error.message,
        },
      };
    }

    console.log(data);

    return {
      data: data || [],
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error fetching user schedules:", error);
    return {
      data: null,
      error: {
        message: "An unexpected error occurred while fetching user schedules",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

/**
 * Fetch a single schedule by ID
 * @param scheduleId - The schedule ID to fetch
 * @returns Promise containing schedule or error
 */
export const fetchScheduleById = async (
  scheduleId: number
): Promise<ScheduleResponse<Schedule>> => {
  try {
    if (!scheduleId) {
      return {
        data: null,
        error: {
          message: "Schedule ID is required",
        },
      };
    }

    const { data, error } = await supabaseAdmin
      .from("schedules")
      .select("*")
      .eq("id", scheduleId)
      .single();

    if (error) {
      console.error("Error fetching schedule:", error);
      return {
        data: null,
        error: {
          message: "Failed to fetch schedule",
          details: error.message,
        },
      };
    }

    return {
      data: data,
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error fetching schedule:", error);
    return {
      data: null,
      error: {
        message: "An unexpected error occurred while fetching schedule",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

/**
 * Fetch schedules within a specific time range
 * @param startTime - Start time for filtering (ISO string)
 * @param endTime - End time for filtering (ISO string)
 * @param userId - Optional user ID to filter by specific user
 * @returns Promise containing schedules array or error
 */
export const fetchSchedulesByTimeRange = async (
  startTime: string,
  endTime: string,
  userId?: string
): Promise<ScheduleResponse<Schedule[]>> => {
  try {
    if (!startTime || !endTime) {
      return {
        data: null,
        error: {
          message: "Start time and end time are required",
        },
      };
    }

    let query = supabaseAdmin
      .from("schedules")
      .select("*")
      .gte("start_time", startTime)
      .lte("end_time", endTime);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.order("start_time", {
      ascending: true,
    });

    if (error) {
      console.error("Error fetching schedules by time range:", error);
      return {
        data: null,
        error: {
          message: "Failed to fetch schedules by time range",
          details: error.message,
        },
      };
    }

    return {
      data: data || [],
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error fetching schedules by time range:", error);
    return {
      data: null,
      error: {
        message:
          "An unexpected error occurred while fetching schedules by time range",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

export const getCurrentSchedule = async (
  userId: string
): Promise<ScheduleResponse<ScheduleTable>> => {
  const now = new Date();
  const currentTime = now.toISOString();

  try {
    const { data: schedules, error } = await supabaseAdmin
      .from("schedules")
      .select("*")
      .eq("user_id", userId)
      .lte("start_time", currentTime)
      .gte("end_time", currentTime)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching current schedule:", error);
      return {
        data: null,
        error: {
          message: "Failed to fetch current schedule",
          details: error.message,
        },
      };
    }

    if (schedules.length === 0) {
      return {
        data: null,
        error: null,
      };
    }

    return {
      data: schedules[0],
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error fetching current schedule:", error);
    return {
      data: null,
      error: {
        message: "An unexpected error occurred while fetching current schedule",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

export const createSchedule = async (
  schedule: NewSchedule
): Promise<ScheduleResponse<ScheduleTable>> => {
  try {
    const { data, error } = await supabaseAdmin
      .from("schedules")
      .insert(schedule)
      .select();

    console.log("Data:", data);

    if (error || !data) {
      console.error("Error creating schedule:", error);
      return {
        data: null,
        error: {
          message: "Failed to create schedule",
          details: error?.message || "Unknown error",
        },
      };
    }

    return {
      data: data[0],
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error creating schedule:", error);
    return {
      data: null,
      error: {
        message: "An unexpected error occurred while creating schedule",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};
