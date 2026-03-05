const express = require("express");
const router = express.Router();
const movieProgressController = require("../controllers/movie-progress.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { progressLimiter } = require("../middlewares/rate-limit.middleware");
const { apiLimiter } = require("../middlewares/rate-limit.middleware");
const {
  checkWalletExpiry,
} = require("../middlewares/verify-wallet.middleware");

router.use(authenticate);

router.get(
  "/details/:id",
  apiLimiter,
  movieProgressController.getProgressByMovieId,
);
router.get("/", apiLimiter, movieProgressController.getMoviesProgress);
router.post(
  "/",
  progressLimiter,
  checkWalletExpiry,
  movieProgressController.setMovieProgress,
);
router.delete(
  "/:id",
  progressLimiter,
  movieProgressController.deleteMovieProgress,
);

module.exports = router;
