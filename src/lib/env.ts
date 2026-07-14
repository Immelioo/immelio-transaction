/**
 * Validates required environment variables at startup.
 * Throws if any critical variable is missing in production.
 */

const required = ["JWT_SECRET", "NEXTAUTH_URL"] as const;
const production = ["RESEND_API_KEY"] as const;

function validateEnv() {
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (process.env.NODE_ENV === "production") {
    for (const key of production) {
      if (!process.env[key]) {
        missing.push(`${key} (required in production)`);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nCopy .env.example to .env and fill in the values.`
    );
  }
}

// Only validate in server context (not during client-side bundling)
if (typeof window === "undefined") {
  validateEnv();
}

export const env = {
  JWT_SECRET: process.env.JWT_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  FROM_EMAIL: process.env.FROM_EMAIL || "Immelio Transaction <contact@immelio.fr>",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;
