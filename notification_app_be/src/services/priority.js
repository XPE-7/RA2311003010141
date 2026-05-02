const TYPE_WEIGHTS = {
  placement: 3,
  result: 2,
  event: 1
};

const WEIGHT_BOOST = 1000000000000;

function toTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 0;
  }
  return date.getTime();
}

function computeScore(notification) {
  const typeRaw = notification.Type || notification.type || "";
  const type = String(typeRaw).toLowerCase();
  const weight = TYPE_WEIGHTS[type] || 0;
  const timestamp = toTimestamp(notification.Timestamp || notification.timestamp);
  return weight * WEIGHT_BOOST + timestamp;
}

function pickTopNotifications(list, limit) {
  const items = list.map((item) => ({
    id: item.ID || item.id,
    type: item.Type || item.type,
    message: item.Message || item.message,
    timestamp: item.Timestamp || item.timestamp,
    score: computeScore(item)
  }));

  return items
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

module.exports = { pickTopNotifications };
