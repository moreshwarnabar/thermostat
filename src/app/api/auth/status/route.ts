import { NextResponse } from "next/server";
import { getAuthTokenFromCookies } from "@/lib/services/db";

export async function GET() {
  try {
    const tokenData = await getAuthTokenFromCookies();

    if (!tokenData || !tokenData.access_token) {
      return NextResponse.json(
        { authenticated: false, message: "No valid authentication found" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user_id: tokenData.user_id,
      message: "User is authenticated",
    });
  } catch (error) {
    console.error("Auth status check error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to check authentication status" },
      { status: 500 }
    );
  }
}
