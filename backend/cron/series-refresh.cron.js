const cron = require("node-cron");
const seriesDao = require("../dao/series.dao");
const tmdbSeriesService = require("../services/tmdb/tmdb-series.service");

cron.schedule("0 * * * *", async () => {
  console.log("Refreshing tracked series...");

  try {
    const outdatedTracked = await seriesDao.getOutdatedTrackedSeries(50);

    await Promise.all(
      outdatedTracked.map((series) =>
        tmdbSeriesService.getSeriesDetails(series.id),
      ),
    );

    console.log(`Refreshed ${outdatedTracked.length} series`);
  } catch (err) {
    console.error("Cron series refresh error:", err);
  }
});
