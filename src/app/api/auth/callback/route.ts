import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { storeAuthToken } from "@/lib/services/db";
import { Credentials } from "@/lib/types/types";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: `OAuth error: ${error}` },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    const error = await storeAuthToken(tokens as Credentials);

    if (error) {
      console.error("Error storing tokens:", error);
      return NextResponse.json(
        { error: "Failed to store tokens", details: error },
        { status: 500 }
      );
    }

    console.log("Tokens stored successfully");

    return NextResponse.redirect(new URL("/", req.url));
  } catch (error) {
    console.error("OAuth error:", error);
    return NextResponse.json(
      {
        error: "Google OAuth error, failed to exchange code for tokens",
        details: error,
      },
      { status: 500 }
    );
  }
}
