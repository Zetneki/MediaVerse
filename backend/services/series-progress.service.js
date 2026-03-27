const seriesProgressDao = require("../dao/series-progress.dao");
const usersDao = require("../dao/users.dao");
const seriesDao = require("../dao/series.dao");
const questsService = require("../services/quests.service");
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
 * @param {number} seriesId
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
    completedQuests = [];

    const oldProgress = await seriesProgressDao.getProgressBySeriesId(
      userId,
      seriesId,
    );

    const result = await seriesProgressDao.upsertSeriesProgress(
      userId,
      seriesId,
      status,
      season,
      episode,
    );

    if (!result) return { action: "UNCHANGED" };

    if (user.wallet_address && user.wallet_verified) {
      //Add to plan quest (first time only)
      if (status === "plan_to_watch" && !oldProgress) {
        completedQuests = await questsService.checkAndIncrementQuests(
          userId,
          "add_to_plan",
          "series",
          seriesId,
        );
      }

      const episodeIds = [];

      //Watch episode quest (episode incremented)
      if (oldProgress) {
        //Existing progress - check increment
        const seasonIncremented = season > oldProgress.current_season;
        const sameSeasonEpisodeIncremented =
          season === oldProgress.current_season &&
          episode > oldProgress.current_episode;

        series.seasons.sort((a, b) => {
          if (a.season_number === 0) return 1;
          if (b.season_number === 0) return -1;
          return a.season_number - b.season_number;
        });

        if (seasonIncremented) {
          //Season jump: count all episodes between old and new
          series.seasons.forEach((seasonData) => {
            if (seasonData.season_number === oldProgress.current_season) {
              //Old season: remaining episodes
              for (
                let e = oldProgress.current_episode + 1;
                e <= seasonData.episode_count;
                e++
              ) {
                episodeIds.push(
                  `${seriesId}_S${seasonData.season_number}E${e}`,
                );
              }
            } else if (
              seasonData.season_number > oldProgress.current_season &&
              seasonData.season_number < season
            ) {
              //Middle seasons: all episodes
              for (let e = 1; e <= seasonData.episode_count; e++) {
                episodeIds.push(
                  `${seriesId}_S${seasonData.season_number}E${e}`,
                );
              }
            } else if (seasonData.season_number === season) {
              //New season: episodes up to current
              for (let e = 1; e <= episode; e++) {
                episodeIds.push(
                  `${seriesId}_S${seasonData.season_number}E${e}`,
                );
              }
            }
          });
        } else if (sameSeasonEpisodeIncremented) {
          //Same season: simple delta
          for (let e = oldProgress.current_episode + 1; e <= episode; e++) {
            episodeIds.push(`${seriesId}_S${season}E${e}`);
          }
        }

        if (seasonIncremented || sameSeasonEpisodeIncremented) {
          completedQuests = await questsService.checkAndIncrementQuests(
            userId,
            "watch_episode",
            "series",
            seriesId,
            episodeIds,
          );
        }
      } else if (status === "watching" && season > 0 && episode > 0) {
        const targetSeason = season === 0 ? series.seasons.length : season;

        for (let s = 1; s <= targetSeason; s++) {
          const seasonData = series.seasons.find(
            (sd) => sd.season_number === s,
          );
          if (!seasonData) continue;

          if (s < season) {
            //All episodes in previous seasons
            for (let e = 1; e <= seasonData.episode_count; e++) {
              episodeIds.push(`${seriesId}_S${s}E${e}`);
            }
          } else {
            //Episodes up to current in current season
            for (let e = 1; e <= episode; e++) {
              episodeIds.push(`${seriesId}_S${s}E${e}`);
            }
          }
        }

        //First time watching (no previous progress)
        completedQuests = await questsService.checkAndIncrementQuests(
          userId,
          "watch_episode",
          "series",
          seriesId,
          episodeIds,
        );
      }

      //Complete series quest
      if (status === "completed") {
        completedQuests = await questsService.checkAndIncrementQuests(
          userId,
          "complete_series",
          "series",
          seriesId,
        );
      }
    }

    return {
      action: result.inserted ? "INSERTED" : "UPDATED",
      progress: {
        status: result.status,
        current_season: result.current_season,
        current_episode: result.current_episode,
        last_watched: result.last_watched,
      },
      completedQuests,
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
