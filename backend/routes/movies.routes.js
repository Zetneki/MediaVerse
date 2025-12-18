const express = require("express");
const router = express.Router();
const moviesController = require("../controllers/movies.controller");

router.get("/toprated", moviesController.getTopRatedMovies);
router.get("/popular", moviesController.getPopularMovies);
router.get("/search", moviesController.searchMovies);
router.get("/filter", moviesController.filterMovies);
router.get("/details/:id", moviesController.searchMovieDetails);

module.exports = router;
