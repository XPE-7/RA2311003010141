function normalizeTasks(items) {
  return items.map((item, index) => {
    const id = item.TaskID || item.taskId || item.id || `task-${index + 1}`;
    const duration = Number(item.Duration ?? item.duration ?? 0);
    const impact = Number(item.Impact ?? item.impact ?? 0);
    return { id, duration, impact };
  });
}

function computeSchedule(rawTasks, capacity) {
  const tasks = normalizeTasks(rawTasks).filter((task) => task.duration > 0 && task.duration <= capacity);
  const n = tasks.length;
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
  const keep = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(false));

  for (let i = 1; i <= n; i += 1) {
    const { duration, impact } = tasks[i - 1];
    for (let w = 0; w <= capacity; w += 1) {
      if (duration <= w) {
        const take = impact + dp[i - 1][w - duration];
        const leave = dp[i - 1][w];
        if (take > leave) {
          dp[i][w] = take;
          keep[i][w] = true;
        } else {
          dp[i][w] = leave;
        }
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  const selected = [];
  let remaining = capacity;
  for (let i = n; i >= 1; i -= 1) {
    if (keep[i][remaining]) {
      const task = tasks[i - 1];
      selected.push(task);
      remaining -= task.duration;
    }
  }

  const totalImpact = selected.reduce((sum, task) => sum + task.impact, 0);
  const totalDuration = selected.reduce((sum, task) => sum + task.duration, 0);

  return {
    totalImpact,
    totalDuration,
    selected: selected.reverse()
  };
}

module.exports = { computeSchedule };
