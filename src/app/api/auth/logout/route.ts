import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/services/auth";
import { logger } from "@/lib/services/logger";

export async function POST(req: NextRequest) {
  const logoutLogger = logger.authOperation("logout");

  try {
    logoutLogger.info("Processing user logout");

    // Create redirect response
    const redirectResponse = NextResponse.redirect(new URL("/", req.url));

    // Clear authentication cookies
    clearAuthCookies(redirectResponse);

    logoutLogger.info("User logged out successfully");
    return redirectResponse;
  } catch (error) {
    logoutLogger.error("Logout error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Support GET requests for logout as well
  return POST(req);
}
