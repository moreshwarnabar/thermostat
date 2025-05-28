import { NextApiRequest, NextApiResponse } from "next";
import qs from "qs";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const query = qs.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: process.env.GOOGLE_SDM_SCOPE,
    access_type: "offline",
    prompt: "consent",
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${query}`);
}
