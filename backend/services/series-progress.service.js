const seriesProgressDao = require("../dao/series-progress.dao");
const usersDao = require("../dao/users.dao");
const seriesDao = require("../dao/series.dao");
const { VALID_SERIES_STATUSES } = require("../constants/series-status");
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

  return await seriesProgressDao.getProgressBySeriesId(userId, seriesId);
};

/**
 * Get all series progresses
 * @param {number} userId
 * @returns {Promise<Array<Object>>} Series progress
 */

const getSeriesProgress = async (userId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  return await seriesProgressDao.getSeriesWithDetails(userId);
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

    const isLastEpisode =
      Number(season) === series.total_seasons &&
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
