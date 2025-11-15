import { createSupabaseServer } from "@/app/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServer();
  await (await supabase).auth.signOut();
  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}
