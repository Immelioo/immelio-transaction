import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req, "ADMIN");
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const result = await sendEmail({
    to: env.ADMIN_EMAIL || "giachinotao@gmail.com",
    subject: "Test email Immelio — " + new Date().toISOString(),
    html: "<h2>Test</h2><p>SMTP_HOST: " + (env.SMTP_HOST || "non défini") + "</p><p>SMTP_USER: " + (env.SMTP_USER || "non défini") + "</p>",
  });

  return NextResponse.json({
    result,
    config: {
      hasSmtp: Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS),
      hasResend: Boolean(env.RESEND_API_KEY),
      fromEmail: env.FROM_EMAIL,
      adminEmail: env.ADMIN_EMAIL,
      smtpHost: env.SMTP_HOST || null,
      smtpUser: env.SMTP_USER || null,
    },
  });
}
