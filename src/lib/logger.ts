type LogLevel = "info" | "warn" | "error" | "debug";

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();

  if (process.env.NODE_ENV === "production") {
    // En production : JSON structuré (compatible Vercel logs / Datadog)
    console[level === "debug" ? "log" : level](
      JSON.stringify({ timestamp, level, message, ...meta })
    );
  } else {
    // En dev : format lisible
    const prefix = { info: "ℹ️", warn: "⚠️", error: "❌", debug: "🔍" }[level];
    console[level === "debug" ? "log" : level](
      `${prefix} [${timestamp}] ${message}`,
      meta ? meta : ""
    );
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "production") log("debug", message, meta);
  },
};
