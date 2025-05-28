import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import supabaseAdmin from "@/lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query.code as string;

  try {
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

    const { accessToken, refreshToken, expiresIn, idToken } =
      tokenResponse.data;

    const b64Payload = idToken.split(".")[1];
    const payload = JSON.parse(Buffer.from(b64Payload, "base64").toString());
    const userId = payload.sub;

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const { error } = await supabaseAdmin.from("user_tokens").upsert({
      user_id: userId,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
    });

    if (error) {
      console.error("Error upserting user token:", error);
      return res.status(500).json({ error: "Failed to upsert user token" });
    }

    return res.send("Authentication successful!");
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    res.status(500).json({ error: "Failed to authenticate" });
  }
}
