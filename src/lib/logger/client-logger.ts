type ClientLogLevel = "error" | "warn" | "info";

export function logClientEvent(
  level: ClientLogLevel,
  message: string,
  meta?: any,
) {
  // Prevent logging endpoint recursion
  if (meta?.url && String(meta.url).includes("/api/log-client-error")) return;

  console[level](message, meta);

  fetch("/api/log-client-error", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      level,
      message,
      meta: sanitize(meta),
      href: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      ts: Date.now(),
    }),
  }).catch(() => {});
}

function sanitize(meta: any) {
  if (!meta) return meta;

  // Avoid leaking tokens / cookies / passwords
  const clone = structuredCloneSafe(meta);

  // Common scrub points
  if (clone?.headers?.Authorization) clone.headers.Authorization = "[redacted]";
  if (clone?.config?.headers?.Authorization)
    clone.config.headers.Authorization = "[redacted]";

  // Truncate big bodies
  const truncate = (v: any) => {
    try {
      const s = typeof v === "string" ? v : JSON.stringify(v);
      return s.length > 2000 ? s.slice(0, 2000) + "…(truncated)" : s;
    } catch {
      return "[unserializable]";
    }
  };

  if (clone?.responseData) clone.responseData = truncate(clone.responseData);
  if (clone?.data) clone.data = truncate(clone.data);

  return clone;
}

function structuredCloneSafe(value: any) {
  try {
    return structuredClone(value);
  } catch {
    // fallback
    return JSON.parse(JSON.stringify(value));
  }
}
