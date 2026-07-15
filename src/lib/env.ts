/**
 * Validates required environment variables at startup.
 * Throws if any critical variable is missing in production.
 */

const required = ["JWT_SECRET", "NEXTAUTH_URL"] as const;
const smtpKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"] as const;

function isBuildTime() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build"
  );
}

function validateEnv() {
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasAnySmtp = smtpKeys.some((key) => Boolean(process.env[key]));
  const hasCompleteSmtp = smtpKeys.every((key) => Boolean(process.env[key]));

  if (hasAnySmtp && !hasCompleteSmtp) {
    missing.push("Configuration SMTP incomplète (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)");
  }

  if (process.env.NODE_ENV === "production" && !hasResend && !hasCompleteSmtp) {
    missing.push("RESEND_API_KEY ou une configuration SMTP complète (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nCopy .env.example to .env and fill in the values.`
    );
  }
}

// Validation côté serveur hors phase de build.
// Next évalue aussi certains modules d'API pendant `next build` pour collecter les données ;
// à ce stade, on veut compiler sans exiger la totalité des secrets runtime.
if (typeof window === "undefined" && !isBuildTime()) {
  validateEnv();
}

export const env = {
  JWT_SECRET: process.env.JWT_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? "https://www.immelio.fr" : "http://localhost:3000"),
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  FROM_EMAIL: process.env.FROM_EMAIL || "Immelio Transaction <contact@immelio.fr>",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM || process.env.FROM_EMAIL || "Immelio Transaction <contact@immelio.fr>",
  SMTP_SECURE: process.env.SMTP_SECURE,
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;
