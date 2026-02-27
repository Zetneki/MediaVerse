const seriesProgressDao = require("../dao/series-progress.dao");
const usersDao = require("../dao/users.dao");
const seriesDao = require("../dao/series.dao");
const { VALID_SERIES_STATUSES } = require("../constants/series-status");
const { VALID_SERIES_ORDERS } = require("../constants/series-order");
const { VALID_SERIES_SORTBYS } = require("../constants/series-sortby");
const { AppError } = require("../middlewares/error-handler.middleware");

/**
 * Get progress by series id
 * @param {number} userId
 * @param {string} seriesId
 * @returns {Promise<Object>} Series progress
 */

const getProgressBySeriesId = async (userId, seriesId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const series = await seriesDao.getSeriesById(seriesId);
  if (!series) throw AppError.notFound("Series not found");

  const res = await seriesProgressDao.getProgressBySeriesId(userId, seriesId);
  if (!res) {
    return {
      status: "plan_to_watch",
      seasons: series.seasons,
      last_watched: null,
      current_season: 0,
      current_episode: 0,
    };
  }
  return res;
};

/**
 * Get paginated series progresses
 * @param {number} userId
 * @param {number} page
 * @param {number} limit
 * @param {status, search, sortBy, sortOrder} filters
 * @returns {Promise<Array<Object>>} Series progress
 */

const getSeriesProgress = async (
  userId,
  page = 1,
  limit = 20,
  filters = {},
) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  if (page < 1) throw AppError.badRequest("Page must be >= 1");
  if (limit < 1 || limit > 100)
    throw AppError.badRequest("Limit must be between 1 and 100");
  if (
    filters.status !== "" &&
    !VALID_SERIES_STATUSES.includes(filters.status)
  ) {
    throw AppError.badRequest(
      `Invalid status. Must be one of: ${VALID_SERIES_STATUSES.join(", ")}`,
    );
  }
  if (!VALID_SERIES_ORDERS.includes(filters.sortOrder))
    throw AppError.badRequest(
      `Invalid sort order. Must be one of: ${VALID_SERIES_ORDERS.join(", ")}`,
    );
  if (!VALID_SERIES_SORTBYS.includes(filters.sortBy))
    throw AppError.badRequest(
      `Invalid sort field. Must be one of: ${VALID_SERIES_SORTBYS.join(", ")}`,
    );

  return await seriesProgressDao.getSeriesWithDetails(
    userId,
    page,
    limit,
    filters,
  );
};

/**
 * Set series progress
 * @param {number} userId
 * @param {string} status
 * @param {number} season
 * @param {number} episode
 * @returns {Promise<{action: string}>} - action: INSERTED, UPDATED, UNCHANGED
 */

const setSeriesProgress = async (userId, seriesId, status, season, episode) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const series = await seriesDao.getSeriesById(seriesId);
  if (!series) throw AppError.notFound("Series not found");

  if (!VALID_SERIES_STATUSES.includes(status)) {
    throw AppError.badRequest(
      `Invalid status. Must be one of: ${VALID_SERIES_STATUSES.join(", ")}`,
    );
  }

  if (status === "plan_to_watch") {
    season = 0;
    episode = 0;
  } else {
    if (series.total_seasons < season || season < 0)
      throw AppError.badRequest("Season does not exist");

    const seasonData = series.seasons.find(
      (s) => s.season_number === Number(season),
    );

    if (!seasonData) throw AppError.badRequest("Season not found");

    if (episode > seasonData.episode_count || episode < 0)
      throw AppError.badRequest("Invalid episode number");

    const regularSeasons = series.seasons.filter((s) => s.season_number > 0);

    const maxRegularSeason = Math.max(
      ...regularSeasons.map((s) => s.season_number),
    );

    const isLastEpisode =
      Number(season) === maxRegularSeason &&
      Number(episode) === seasonData.episode_count;

    if (isLastEpisode) {
      status = "completed";
    } else if (status === "completed") {
      status = "watching";
    }
  }

  try {
    const result = await seriesProgressDao.upsertSeriesProgress(
      userId,
      seriesId,
      status,
      season,
      episode,
    );

    if (!result) return { action: "UNCHANGED" };

    return {
      action: result.inserted ? "INSERTED" : "UPDATED",
      progress: {
        status: result.status,
        current_season: result.current_season,
        current_episode: result.current_episode,
        last_watched: result.last_watched,
      },
    };
  } catch (err) {
    throw err;
  }
};

/**
 * Delete series progress
 * @param {number} userId
 * @param {string} seriesId
 * @returns {Promise<void>}
 */

const deleteSeriesProgress = async (userId, seriesId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const series = await seriesProgressDao.getProgressBySeriesId(
    userId,
    seriesId,
  );
  if (!series) throw AppError.notFound("Series not found");

  try {
    await seriesProgressDao.deleteSeriesProgress(userId, seriesId);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getProgressBySeriesId,
  getSeriesProgress,
  setSeriesProgress,
  deleteSeriesProgress,
};
