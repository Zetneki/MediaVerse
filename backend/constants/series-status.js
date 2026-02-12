const SERIES_STATUS = {
  WATCHING: "watching",
  COMPLETED: "completed",
  PLAN_TO_WATCH: "plan_to_watch",
};

const VALID_SERIES_STATUSES = Object.values(SERIES_STATUS);

module.exports = {
  SERIES_STATUS,
  VALID_SERIES_STATUSES,
};
