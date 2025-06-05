import { Credentials } from "@/lib/types/types";
import supabaseAdmin from "@/lib/services/supabaseAdmin";
import { v5 as uuidv5 } from "uuid";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const getAuthToken = async () => {
  const { data: user_tokens, error } = await supabaseAdmin
    .from("user_tokens")
    .select("access_token")
    .single();
  if (error) {
    console.error("Error getting auth token", error);
    return null;
  }

  console.log("User tokens", user_tokens);
  return user_tokens.access_token;
};

const storeAuthToken = async (tokens: Credentials, response?: NextResponse) => {
  const b64Payload = tokens.id_token?.split(".")[1];
  const payload = JSON.parse(Buffer.from(b64Payload!, "base64").toString());
  const userId = payload.sub;

  // store access and refresh tokens to supabase
  const { error } = await supabaseAdmin.from("user_tokens").upsert({
    user_id: uuidv5(userId, process.env.NAMESPACE!),
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: new Date(tokens.expiry_date!).toISOString(),
  });

  // If response object is provided, also store tokens as secure cookies
  if (response && !error) {
    const maxAge = Math.floor((tokens.expiry_date! - Date.now()) / 1000); // Convert to seconds

    // Set secure HTTP-only cookies
    response.cookies.set("access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: maxAge,
      sameSite: "lax",
      path: "/",
    });

    response.cookies.set("refresh_token", tokens.refresh_token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days for refresh token
      sameSite: "lax",
      path: "/",
    });

    response.cookies.set("user_id", uuidv5(userId, process.env.NAMESPACE!), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: maxAge,
      sameSite: "lax",
      path: "/",
    });

    console.log("Tokens stored in cookies successfully");
  }

  return error;
};

const getAuthTokenFromCookies = async () => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;
    const userId = cookieStore.get("user_id")?.value;

    if (!accessToken) {
      console.log("No access token found in cookies");
      return null;
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user_id: userId,
    };
  } catch (error) {
    console.error("Error getting tokens from cookies", error);
    return null;
  }
};

const clearAuthCookies = (response: NextResponse) => {
  // Clear all authentication cookies
  response.cookies.set("access_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    sameSite: "lax",
    path: "/",
  });

  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    sameSite: "lax",
    path: "/",
  });

  response.cookies.set("user_id", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    sameSite: "lax",
    path: "/",
  });

  console.log("Authentication cookies cleared");
};

export {
  getAuthToken,
  storeAuthToken,
  getAuthTokenFromCookies,
  clearAuthCookies,
};
