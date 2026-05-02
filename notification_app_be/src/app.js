const express = require("express");
const { Log } = require("../logging_middleware");
const { config } = require("./config");
const priorityRoutes = require("./routes/priority");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/", priorityRoutes);

app.use(async (err, req, res, next) => {
  await Log("backend", "error", "handler", `unhandled error: ${err.message}`);
  res.status(500).json({ error: "internal server error" });
});

app.listen(config.port, () => {
  Log("backend", "info", "service", `notification backend running on port ${config.port}`)
    .catch(() => undefined);
});
