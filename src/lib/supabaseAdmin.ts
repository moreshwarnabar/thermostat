import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co`,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default supabaseAdmin;
