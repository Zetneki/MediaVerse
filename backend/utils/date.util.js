exports.isOutdated = (lastUpdated, maxAgeMinutes = 1) => {
  if (!lastUpdated) return true;
  const now = new Date();
  const diff = (now - new Date(lastUpdated)) / 1000 / 60; //minutes
  return diff > maxAgeMinutes;
};
