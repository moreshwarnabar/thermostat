import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { storeAuthToken } from "@/lib/services/auth";
import { Credentials } from "@/lib/types/types";
import { logger } from "@/lib/services/logger";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(req: NextRequest) {
  const callbackLogger = logger.authOperation("oauth_callback");

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    callbackLogger.error("OAuth error received", { error });
    return NextResponse.json(
      { error: `OAuth error: ${error}` },
      { status: 400 }
    );
  }

  if (!code) {
    callbackLogger.error("Missing authorization code in callback");
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    callbackLogger.info("Exchanging authorization code for tokens");
    const { tokens } = await oauth2Client.getToken(code);

    // Create the redirect response first so we can pass it to storeAuthToken
    const redirectResponse = NextResponse.redirect(new URL("/", req.url));

    callbackLogger.info("Storing authentication tokens");
    const error = await storeAuthToken(tokens as Credentials, redirectResponse);

    if (error) {
      callbackLogger.error("Error storing tokens", {
        error: error.message,
        details: error,
      });
      return NextResponse.json(
        { error: "Failed to store tokens", details: error },
        { status: 500 }
      );
    }

    callbackLogger.info("Authentication completed successfully");
    return redirectResponse;
  } catch (error) {
    callbackLogger.error("OAuth token exchange failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Google OAuth error, failed to exchange code for tokens",
        details: error,
      },
      { status: 500 }
    );
  }
}
