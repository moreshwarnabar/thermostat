import { NextResponse } from "next/server";
import { google } from "googleapis";
import supabaseAdmin from "@/lib/services/supabaseAdmin";

export async function POST() {
  try {
    console.log(
      `[${new Date().toISOString()}] Starting automatic token refresh for all users`
    );

    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { data: userTokens, error: fetchError } = await supabaseAdmin
      .from("user_tokens")
      .select("*")
      .lt("expires_at", oneHourFromNow)
      .not("refresh_token", "is", null);

    if (fetchError) {
      console.error("Error fetching user tokens:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch user tokens" },
        { status: 500 }
      );
    }

    if (!userTokens || userTokens.length === 0) {
      console.log("No tokens need refreshing at this time");
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
      try {
        console.log(`Refreshing token for user: ${userToken.user_id}`);

        oauth2Client.setCredentials({
          refresh_token: userToken.refresh_token,
        });

        const { credentials } = await oauth2Client.refreshAccessToken();

        if (!credentials.access_token) {
          console.error(
            `Failed to refresh token for user ${userToken.user_id}: No access token received`
          );
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
          console.error(
            `Failed to update tokens for user ${userToken.user_id}:`,
            updateError
          );
          failureCount++;
          results.push({
            user_id: userToken.user_id,
            success: false,
            error: updateError.message,
          });
        } else {
          console.log(
            `Successfully refreshed token for user: ${userToken.user_id}`
          );
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
        console.error(
          `Error refreshing token for user ${userToken.user_id}:`,
          error
        );
        failureCount++;
        results.push({
          user_id: userToken.user_id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log(
      `Token refresh completed: ${successCount} successful, ${failureCount} failed`
    );

    return NextResponse.json({
      message: "Token refresh completed",
      total_tokens: userTokens.length,
      successful_refreshes: successCount,
      failed_refreshes: failureCount,
      results: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in automatic token refresh:", error);
    return NextResponse.json(
      { error: "Internal server error during token refresh" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
