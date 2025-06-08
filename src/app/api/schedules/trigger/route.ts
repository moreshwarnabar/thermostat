import { NextResponse } from "next/server";
import { processSchedules } from "@/lib/services/scheduleProcessor";

export async function POST() {
  try {
    console.log("Processing schedules that should start now");

    const result = await processSchedules();

    if (!result.success) {
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

    return NextResponse.json({
      success: true,
      message: result.message,
      processedSchedules: result.processedSchedules,
      errors: result.errors,
    });
  } catch (error) {
    console.error("API Error processing schedules:", error);
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
  try {
    console.log("Processing schedules that should start now");

    const result = await processSchedules();

    if (!result.success) {
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

    return NextResponse.json({
      success: true,
      message: result.message,
      processedSchedules: result.processedSchedules,
      errors: result.errors,
    });
  } catch (error) {
    console.error("API Error processing schedules:", error);
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
