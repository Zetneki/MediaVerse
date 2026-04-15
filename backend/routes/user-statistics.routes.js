const express = require("express");
const router = express.Router();
const userStatisticsController = require("../controllers/user-statistics.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get(
  "/movie-status",
  userStatisticsController.getMovieStatusStatsByUserId,
);
router.get(
  "/series-status",
  userStatisticsController.getSeriesStatusStatsByUserId,
);
router.get("/movie-genres", userStatisticsController.getMovieTopGenresByUserId);
router.get(
  "/series-genres",
  userStatisticsController.getSeriesTopGenresByUserId,
);

module.exports = router;
