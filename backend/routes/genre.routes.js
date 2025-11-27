const express = require("express");
const router = express.Router();
const genresController = require("../controllers/genre.controller");

router.get("/movies", genresController.getMovieGenres);
router.get("/series", genresController.getSeriesGenres);

module.exports = router;
