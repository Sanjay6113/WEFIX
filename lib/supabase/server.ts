import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { publicConfig } from "./config";

export async function serverClient() {
  const config = publicConfig();
  if (!config)
    throw new Error(
      "Supabase is not configured. Follow the admin setup guide.",
    );
  const jar = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) =>
            jar.set(name, value, options),
          );
        } catch {
          /* Middleware refreshes cookies for Server Components. */
        }
      },
    },
  });
}
export function privateClient() {
  const config = publicConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!config || !key)
    throw new Error("Private order tracking is not configured.");
  return createClient(config.url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
