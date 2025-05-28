import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  console.log("Received callback request");
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    console.error("No authorization code received");
    return NextResponse.json(
      { error: "No authorization code received" },
      { status: 400 }
    );
  }

  try {
    console.log("Processing callback with code:", code);

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }
    );

    console.log("Received token response:", tokenResponse.data);

    const { access_token, refresh_token, expires_in, id_token } =
      tokenResponse.data;

    const b64Payload = id_token.split(".")[1];
    const payload = JSON.parse(Buffer.from(b64Payload, "base64").toString());
    const userId = payload.sub;

    const expiresAt = new Date(Date.now() + expires_in * 1000);

    const { error } = await supabaseAdmin.from("user_tokens").upsert({
      user_id: userId,
      access_token: access_token,
      refresh_token: refresh_token,
      expires_at: expiresAt,
    });

    if (error) {
      console.error("Error upserting user token:", error);
      return NextResponse.json(
        { error: "Failed to upsert user token" },
        { status: 500 }
      );
    }

    console.log("User token upserted successfully");

    // Redirect back to the main page or show success
    return new NextResponse(
      `
      <html>
        <body>
          <h1>Authentication Successful!</h1>
          <p>You have been successfully logged in. You can close this window.</p>
          <script>
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          </script>
        </body>
      </html>
    `,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return NextResponse.json(
      { error: "Failed to authenticate" },
      { status: 500 }
    );
  }
}
