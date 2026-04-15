const userStatisticsDao = require("../dao/user-statistics.dao");
const usersDao = require("../dao/users.dao");
const { AppError } = require("../middlewares/error-handler.middleware");

/**
 * Get movie status stats by user id
 * @param {number} userId
 * @returns {Promise<Array<Object>>} Movie status stats
 */

const getMovieStatusStatsByUserId = async (userId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const stats = await userStatisticsDao.getMovieStatusStatsByUserId(userId);

  return stats;
};

/**
 * Get series status stats by user id
 * @param {number} userId
 * @returns {Promise<Array<Object>>} Series status stats
 */

const getSeriesStatusStatsByUserId = async (userId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const stats = await userStatisticsDao.getSeriesStatusStatsByUserId(userId);

  return stats;
};

/**
 * Get movie top genres by user id
 * @param {number} userId
 * @returns {Promise<Array<Object>>} Movie top genres
 */

const getMovieTopGenresByUserId = async (userId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const stats = await userStatisticsDao.getMovieTopGenresByUserId(userId);

  return stats;
};

/**
 * Get series top genres by user id
 * @param {number} userId
 * @returns {Promise<Array<Object>>} Series top genres
 */

const getSeriesTopGenresByUserId = async (userId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const stats = await userStatisticsDao.getSeriesTopGenresByUserId(userId);

  return stats;
};

module.exports = {
  getMovieStatusStatsByUserId,
  getSeriesStatusStatsByUserId,
  getMovieTopGenresByUserId,
  getSeriesTopGenresByUserId,
};
