const { config } = require("../config");
const { Log } = require("../../logging_middleware");

async function fetchNotifications() {
  await Log("backend", "info", "service", "fetching notifications from evaluation api");
  const url = `${config.evaluationBaseUrl}/notifications`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.evalAuthToken}`
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.message || response.statusText;
    await Log("backend", "error", "service", `notification api failed (${response.status}) ${detail}`);
    throw new Error(`Notification API failed: ${detail}`);
  }

  return data.notifications || [];
}

module.exports = { fetchNotifications };
