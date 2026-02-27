const express = require("express");
const router = express.Router();
const movieProgressController = require("../controllers/movie-progress.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/details/:id", movieProgressController.getProgressByMovieId);
router.get("/", movieProgressController.getMoviesProgress);
router.post("/", movieProgressController.setMovieProgress);
router.delete("/:id", movieProgressController.deleteMovieProgress);

module.exports = router;
