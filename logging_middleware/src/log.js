const LOG_URL = process.env.LOG_URL || "http://20.207.122.201/evaluation-service/logs";

const ALLOWED_STACKS = new Set(["backend", "frontend"]);
const ALLOWED_LEVELS = new Set(["debug", "info", "warn", "error", "fatal"]);
const ALLOWED_PACKAGES = new Set([
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
  "auth",
  "config",
  "middleware",
  "utils"
]);

function assertAllowed(name, value, allowed) {
  if (!allowed.has(value)) {
    const choices = Array.from(allowed).join(", ");
    throw new Error(`${name} must be one of: ${choices}`);
  }
}

async function Log(stack, level, pkg, message) {
  assertAllowed("stack", stack, ALLOWED_STACKS);
  assertAllowed("level", level, ALLOWED_LEVELS);
  assertAllowed("package", pkg, ALLOWED_PACKAGES);

  const token = process.env.LOG_AUTH_TOKEN;
  if (!token) {
    throw new Error("LOG_AUTH_TOKEN is required");
  }

  const payload = {
    stack,
    level,
    package: pkg,
    message
  };

  const response = await fetch(LOG_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.message || response.statusText;
    throw new Error(`Log API failed (${response.status}): ${detail}`);
  }

  return data;
}

module.exports = { Log };
