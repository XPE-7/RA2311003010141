const { config } = require("../config");
const { Log } = require("../../logging_middleware");

async function callApi(path) {
  const url = `${config.evaluationBaseUrl}${path}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.evalAuthToken}`
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.message || response.statusText;
    await Log("backend", "error", "service", `evaluation api failed: ${path} (${response.status}) ${detail}`);
    throw new Error(`Evaluation API failed: ${detail}`);
  }

  return data;
}

async function fetchDepots() {
  await Log("backend", "info", "service", "fetching depots from evaluation api");
  const data = await callApi("/depots");
  return data.depots || [];
}

async function fetchVehicles() {
  await Log("backend", "info", "service", "fetching vehicles from evaluation api");
  const data = await callApi("/vehicles");
  return data.vehicles || [];
}

module.exports = { fetchDepots, fetchVehicles };
