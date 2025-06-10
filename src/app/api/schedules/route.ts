import { NextRequest, NextResponse } from "next/server";
import {
  createSchedule,
  fetchSchedulesByUserId,
} from "@/lib/services/schedules";
import { logger } from "@/lib/services/logger";

export async function GET(request: NextRequest) {
  const getLogger = logger.apiStart("fetch_schedules");

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      getLogger.warn("Missing userId parameter in request");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userLogger = getLogger.setContext({ userId });
    userLogger.info("Fetching schedules for user");

    const result = await fetchSchedulesByUserId(userId);

    if (result.error) {
      userLogger.error("Failed to fetch schedules", {
        error: result.error.message,
        details: result.error.details,
      });
      return NextResponse.json(
        { error: result.error.message, details: result.error.details },
        { status: 500 }
      );
    }

    userLogger.info("Successfully fetched schedules", {
      scheduleCount: result.data?.length || 0,
    });

    getLogger.apiEnd("fetch_schedules", {
      userId,
      scheduleCount: result.data?.length || 0,
    });

    return NextResponse.json({ data: result.data });
  } catch (error) {
    getLogger.apiError(
      "fetch_schedules",
      error instanceof Error ? error : new Error("Unknown error"),
      {
        hasUserId: !!new URL(request.url).searchParams.get("userId"),
      }
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const postLogger = logger.apiStart("create_schedule");

  try {
    const schedule = await request.json();

    const scheduleLogger = postLogger.setContext({
      userId: schedule.userId,
      scheduleId: schedule.id,
    });

    scheduleLogger.info("Creating new schedule", {
      temperature: schedule.temperature,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });

    const result = await createSchedule(schedule);
    scheduleLogger.debug("Create schedule operation result", {
      success: !result.error,
      hasData: !!result.data,
    });

    if (result.error) {
      scheduleLogger.error("Failed to create schedule", {
        error: result.error.message,
        details: result.error.details,
      });
      return NextResponse.json(
        { error: result.error.message, details: result.error.details },
        { status: 500 }
      );
    }

    scheduleLogger.info("Successfully created schedule", {
      scheduleId: result.data?.id,
    });

    postLogger.apiEnd("create_schedule", {
      userId: schedule.userId,
      scheduleId: result.data?.id,
    });

    return NextResponse.json({ data: result.data });
  } catch (error) {
    postLogger.apiError(
      "create_schedule",
      error instanceof Error ? error : new Error("Unknown error")
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
