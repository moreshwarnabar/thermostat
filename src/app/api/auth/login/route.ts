import { NextResponse } from "next/server";
import qs from "qs";
import { logger } from "@/lib/services/logger";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET() {
  const loginLogger = logger.authOperation("login_redirect");

  loginLogger.info("Redirecting to Google Auth URL");

  const query = qs.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: `openid ${process.env.GOOGLE_SDM_SCOPE}`,
    access_type: "offline",
    prompt: "consent",
  });

  const redirectUrl = `${GOOGLE_AUTH_URL}?${query}`;
  loginLogger.debug("Generated OAuth redirect URL", {
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasRedirectUri: !!process.env.GOOGLE_REDIRECT_URI,
    hasScope: !!process.env.GOOGLE_SDM_SCOPE,
  });

  return NextResponse.redirect(redirectUrl);
}
