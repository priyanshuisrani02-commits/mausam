import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser/admin code must share the same cookie-backed session created by
// lib/supabase/client.ts. Server-side storefront helpers still use the
// normal Supabase client because they only need public data.
export const supabase =
  typeof window !== "undefined"
    ? createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
      )
    : createSupabaseClient(
        supabaseUrl,
        supabaseAnonKey
      );
