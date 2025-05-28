// Client-side Google Auth configuration
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
export const GOOGLE_SCOPES =
  process.env.NEXT_PUBLIC_GOOGLE_SDM_SCOPE ||
  "https://www.googleapis.com/auth/sdm.service";

// Google Identity Services configuration
export const googleAuthConfig = {
  client_id: GOOGLE_CLIENT_ID,
  scope: GOOGLE_SCOPES,
  response_type: "code",
  access_type: "offline",
  prompt: "consent",
};

// Generate auth URL for client-side redirect
export const generateAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    redirect_uri:
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
      `${window.location.origin}/auth/callback`,
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};
