const { AppError } = require("../middlewares/error-handler.middleware");
const { handleControllerError } = require("../utils/error-response.util");
const userStatisticsService = require("../services/user-statistics.service");

const getMovieStatusStatsByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const stats =
      await userStatisticsService.getMovieStatusStatsByUserId(userId);
    res.status(200).json(stats);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const getSeriesStatusStatsByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const stats =
      await userStatisticsService.getSeriesStatusStatsByUserId(userId);
    res.status(200).json(stats);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const getMovieTopGenresByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const stats = await userStatisticsService.getMovieTopGenresByUserId(userId);
    res.status(200).json(stats);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const getSeriesTopGenresByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const stats =
      await userStatisticsService.getSeriesTopGenresByUserId(userId);
    res.status(200).json(stats);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

module.exports = {
  getMovieStatusStatsByUserId,
  getSeriesStatusStatsByUserId,
  getMovieTopGenresByUserId,
  getSeriesTopGenresByUserId,
};
