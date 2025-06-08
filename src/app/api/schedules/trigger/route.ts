import { NextResponse } from "next/server";
import { processSchedules } from "@/lib/services/scheduleProcessor";
import { logger } from "@/lib/services/logger";

export async function POST() {
  const triggerLogger = logger.apiStart("schedule_trigger_post");

  try {
    triggerLogger.info("Processing schedules that should start now");

    const result = await processSchedules();

    if (!result.success) {
      triggerLogger.warn("Schedule processing completed with errors", {
        processedSchedules: result.processedSchedules,
        errorCount: result.errors.length,
        errors: result.errors,
      });

      return NextResponse.json(
        {
          success: false,
          message: result.message,
          errors: result.errors,
          processedSchedules: result.processedSchedules,
        },
        { status: 500 }
      );
    }

    triggerLogger.apiEnd("schedule_trigger_post", {
      success: true,
      processedSchedules: result.processedSchedules,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      processedSchedules: result.processedSchedules,
      errors: result.errors,
    });
  } catch (error) {
    triggerLogger.apiError(
      "schedule_trigger_post",
      error instanceof Error ? error : new Error("Unknown error")
    );
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const triggerLogger = logger.apiStart("schedule_trigger_get");

  try {
    triggerLogger.info("Processing schedules that should start now");

    const result = await processSchedules();

    if (!result.success) {
      triggerLogger.warn("Schedule processing completed with errors", {
        processedSchedules: result.processedSchedules,
        errorCount: result.errors.length,
        errors: result.errors,
      });

      return NextResponse.json(
        {
          success: false,
          message: result.message,
          errors: result.errors,
          processedSchedules: result.processedSchedules,
        },
        { status: 500 }
      );
    }

    triggerLogger.apiEnd("schedule_trigger_get", {
      success: true,
      processedSchedules: result.processedSchedules,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      processedSchedules: result.processedSchedules,
      errors: result.errors,
    });
  } catch (error) {
    triggerLogger.apiError(
      "schedule_trigger_get",
      error instanceof Error ? error : new Error("Unknown error")
    );
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
