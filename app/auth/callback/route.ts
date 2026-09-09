import { NextResponse, type NextRequest } from "next/server";
import { serverClient } from "@/lib/supabase/server";
import { publicConfig } from "@/lib/supabase/config";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  if (publicConfig()) {
    const db = await serverClient();
    const result = code
      ? await db.auth.exchangeCodeForSession(code)
      : tokenHash
        ? await db.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" })
        : null;
    if (result && !result.error)
      return NextResponse.redirect(
        new URL("/admin/reset-password", request.url),
      );
  }
  return NextResponse.redirect(new URL("/admin/login?expired=1", request.url));
}
