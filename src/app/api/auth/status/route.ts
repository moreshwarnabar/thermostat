import { NextResponse } from "next/server";
import { getAuthTokenFromCookies } from "@/lib/services/auth";
import { logger } from "@/lib/services/logger";

export async function GET() {
  const statusLogger = logger.authOperation("auth_status_check");

  try {
    statusLogger.debug("Checking authentication status");

    const tokenData = await getAuthTokenFromCookies();

    if (!tokenData || !tokenData.access_token) {
      statusLogger.info("No valid authentication found");
      return NextResponse.json(
        { authenticated: false, message: "No valid authentication found" },
        { status: 401 }
      );
    }

    statusLogger.info("User authentication verified", {
      userId: tokenData.user_id,
      hasRefreshToken: !!tokenData.refresh_token,
    });

    return NextResponse.json({
      authenticated: true,
      user_id: tokenData.user_id,
      message: "User is authenticated",
    });
  } catch (error) {
    statusLogger.error("Auth status check error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { authenticated: false, error: "Failed to check authentication status" },
      { status: 500 }
    );
  }
}
