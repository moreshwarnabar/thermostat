import { Credentials } from "@/lib/types";
import supabaseAdmin from "@/lib/services/supabaseAdmin";
import { v5 as uuidv5 } from "uuid";

const getAuthToken = async () => {
  const { data, error } = await supabaseAdmin
    .from("user_tokens")
    .select("*")
    .single();
  if (error) {
    console.error("Error getting auth token", error);
    return null;
  }
  return data.token;
};

const storeAuthToken = async (tokens: Credentials) => {
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

  return error;
};

export { getAuthToken, storeAuthToken };
