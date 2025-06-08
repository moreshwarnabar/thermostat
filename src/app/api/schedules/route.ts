import { NextRequest, NextResponse } from "next/server";
import { fetchSchedulesByUserId } from "@/lib/services/schedules";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await fetchSchedulesByUserId(userId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message, details: result.error.details },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("API Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
