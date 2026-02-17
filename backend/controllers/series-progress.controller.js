const { AppError } = require("../middlewares/error-handler.middleware");
const { handleControllerError } = require("../utils/error-response.util");
const seriesProgressService = require("../services/series-progress.service");
const { MESSAGES } = require("../constants/series-messages");

const getProgressBySeriesId = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const seriesId = req.params.id;
    if (!seriesId) throw AppError.badRequest("Missing series id");

    const seriesProgress = await seriesProgressService.getProgressBySeriesId(
      userId,
      seriesId,
    );
    res.status(200).json(seriesProgress);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const getSeriesProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const seriesProgress =
      await seriesProgressService.getSeriesProgress(userId);
    res.status(200).json(seriesProgress);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const setSeriesProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const { seriesId, status, season, episode } = req.body;
    if (!seriesId) throw AppError.badRequest("Missing series id");
    if (!status) throw AppError.badRequest("Missing status");
    if (season === null || season === undefined || season === "")
      throw AppError.badRequest("Missing season");
    if (episode === null || episode === undefined || episode === "")
      throw AppError.badRequest("Missing episode");

    const { action } = await seriesProgressService.setSeriesProgress(
      userId,
      seriesId,
      status,
      season,
      episode,
    );

    res.status(200).json({ message: MESSAGES[action] });
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const deleteSeriesProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const seriesId = req.params.id;
    if (!seriesId) throw AppError.badRequest("Missing series id");

    await seriesProgressService.deleteSeriesProgress(userId, seriesId);
    res.status(200).json({ message: "Series progress successfully deleted" });
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

module.exports = {
  getProgressBySeriesId,
  getSeriesProgress,
  setSeriesProgress,
  deleteSeriesProgress,
};
