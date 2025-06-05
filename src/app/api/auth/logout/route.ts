import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/services/db";

export async function POST(req: NextRequest) {
  try {
    // Create redirect response
    const redirectResponse = NextResponse.redirect(new URL("/", req.url));

    // Clear authentication cookies
    clearAuthCookies(redirectResponse);

    console.log("User logged out successfully");

    return redirectResponse;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Support GET requests for logout as well
  return POST(req);
}
