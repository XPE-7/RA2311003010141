const express = require("express");
const { fetchDepots, fetchVehicles } = require("../services/evaluationApi");
const { computeSchedule } = require("../services/scheduler");
const { Log } = require("../../logging_middleware");

const router = express.Router();

router.post("/schedule", async (req, res, next) => {
  try {
    const depotId = Number(req.body.depotId);
    if (!depotId) {
      await Log("backend", "warn", "controller", "schedule request missing depotId");
      return res.status(400).json({ error: "depotId is required" });
    }

    await Log("backend", "info", "controller", `schedule request received for depot ${depotId}`);

    const depots = await fetchDepots();
    const depot = depots.find((item) => Number(item.ID ?? item.id) === depotId);

    if (!depot) {
      await Log("backend", "warn", "controller", `depot not found: ${depotId}`);
      return res.status(404).json({ error: "depot not found" });
    }

    const mechanicHours = Number(depot.MechanicHours ?? depot.mechanicHours ?? 0);
    const vehicles = await fetchVehicles();

    const result = computeSchedule(vehicles, mechanicHours);

    await Log(
      "backend",
      "info",
      "controller",
      `schedule computed for depot ${depotId} with ${result.selected.length} tasks`
    );

    return res.json({
      depotId,
      mechanicHours,
      totalImpact: result.totalImpact,
      totalDuration: result.totalDuration,
      selectedTasks: result.selected
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
