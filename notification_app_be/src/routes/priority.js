const express = require("express");
const { fetchNotifications } = require("../services/notificationApi");
const { pickTopNotifications } = require("../services/priority");
const { Log } = require("../../../logging_middleware");

const router = express.Router();

router.get("/notifications/priority", async (req, res, next) => {
  try {
    const limitRaw = Number(req.query.limit || 10);
    const limit = Number.isNaN(limitRaw) ? 10 : Math.max(1, Math.min(50, limitRaw));

    await Log("backend", "info", "controller", `priority request received (limit ${limit})`);

    const notifications = await fetchNotifications();
    const top = pickTopNotifications(notifications, limit);

    await Log("backend", "info", "controller", `priority list ready with ${top.length} items`);

    return res.json({
      count: top.length,
      items: top
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
