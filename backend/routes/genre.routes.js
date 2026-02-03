const express = require("express");
const router = express.Router();
const genresController = require("../controllers/genre.controller");
const { apiLimiter } = require("../middlewares/rate-limit.middleware");

router.use(apiLimiter);

router.get("/movies", genresController.getMovieGenres);
router.get("/series", genresController.getSeriesGenres);

module.exports = router;
