import { NextResponse } from "next/server";
import { google } from "googleapis";
import supabaseAdmin from "@/lib/services/supabaseAdmin";
import { logger } from "@/lib/services/logger";

export async function POST() {
  const refreshLogger = logger.authOperation("refresh_all_tokens");

  try {
    refreshLogger.info("Starting automatic token refresh for all users");

    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { data: userTokens, error: fetchError } = await supabaseAdmin
      .from("user_tokens")
      .select("*")
      .lt("expires_at", oneHourFromNow)
      .not("refresh_token", "is", null);

    if (fetchError) {
      refreshLogger.error("Error fetching user tokens", {
        error: fetchError.message,
        details: fetchError.details,
      });
      return NextResponse.json(
        { error: "Failed to fetch user tokens" },
        { status: 500 }
      );
    }

    if (!userTokens || userTokens.length === 0) {
      refreshLogger.info("No tokens need refreshing at this time");
      return NextResponse.json({
        message: "No tokens needed refreshing",
        refreshed_count: 0,
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    for (const userToken of userTokens) {
      const userLogger = refreshLogger.setContext({
        userId: userToken.user_id,
      });

      try {
        userLogger.info("Refreshing token for user");

        oauth2Client.setCredentials({
          refresh_token: userToken.refresh_token,
        });

        const { credentials } = await oauth2Client.refreshAccessToken();

        if (!credentials.access_token) {
          userLogger.error("Failed to refresh token: No access token received");
          failureCount++;
          results.push({
            user_id: userToken.user_id,
            success: false,
            error: "No access token received",
          });
          continue;
        }

        const { error: updateError } = await supabaseAdmin
          .from("user_tokens")
          .update({
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token || userToken.refresh_token,
            expires_at: new Date(
              credentials.expiry_date || Date.now() + 3600000
            ).toISOString(),
          })
          .eq("user_id", userToken.user_id);

        if (updateError) {
          userLogger.error("Failed to update tokens", {
            error: updateError.message,
            details: updateError.details,
          });
          failureCount++;
          results.push({
            user_id: userToken.user_id,
            success: false,
            error: updateError.message,
          });
        } else {
          userLogger.info("Successfully refreshed token");
          successCount++;
          results.push({
            user_id: userToken.user_id,
            success: true,
            expires_at: new Date(
              credentials.expiry_date || Date.now() + 3600000
            ).toISOString(),
          });
        }
      } catch (error) {
        userLogger.error("Error refreshing token", {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });
        failureCount++;
        results.push({
          user_id: userToken.user_id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    refreshLogger.info("Token refresh completed", {
      successfulRefreshes: successCount,
      failedRefreshes: failureCount,
      totalTokens: userTokens.length,
    });

    return NextResponse.json({
      message: "Token refresh completed",
      total_tokens: userTokens.length,
      successful_refreshes: successCount,
      failed_refreshes: failureCount,
      results: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    refreshLogger.error("Error in automatic token refresh", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Internal server error during token refresh" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
