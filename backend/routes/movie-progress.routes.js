const express = require("express");
const router = express.Router();
const movieProgressController = require("../controllers/movie-progress.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.get(
  "/details/:id",
  authenticate,
  movieProgressController.getProgressByMovieId,
);
router.get("/", authenticate, movieProgressController.getMoviesProgress);
router.post("/", authenticate, movieProgressController.setMovieProgress);
router.delete(
  "/:id",
  authenticate,
  movieProgressController.deleteMovieProgress,
);

module.exports = router;
