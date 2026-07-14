import { NextRequest, NextResponse } from "next/server";
import { getExpiredAuthCookieOptions } from "@/lib/cookieOptions";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set("auth-token", "", getExpiredAuthCookieOptions(req));
  return response;
}
