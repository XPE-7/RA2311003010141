const dotenv = require("dotenv");

dotenv.config();

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

const config = {
  port: Number.parseInt(process.env.PORT || "4000", 10),
  evaluationBaseUrl: process.env.EVAL_BASE_URL || "http://20.207.122.201/evaluation-service",
  evalAuthToken: process.env.EVAL_AUTH_TOKEN,
  logAuthToken: process.env.LOG_AUTH_TOKEN || process.env.EVAL_AUTH_TOKEN
};

config.evalAuthToken = requireEnv("EVAL_AUTH_TOKEN", config.evalAuthToken);
config.logAuthToken = requireEnv("LOG_AUTH_TOKEN or EVAL_AUTH_TOKEN", config.logAuthToken);

process.env.LOG_AUTH_TOKEN = config.logAuthToken;

module.exports = { config };
