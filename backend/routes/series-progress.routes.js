const express = require("express");
const router = express.Router();
const seriesProgressController = require("../controllers/series-progress.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { progressLimiter } = require("../middlewares/rate-limit.middleware");
const { apiLimiter } = require("../middlewares/rate-limit.middleware");

router.use(authenticate);

router.get(
  "/details/:id",
  apiLimiter,
  seriesProgressController.getProgressBySeriesId,
);
router.get("/", apiLimiter, seriesProgressController.getSeriesProgress);
router.post("/", progressLimiter, seriesProgressController.setSeriesProgress);
router.delete(
  "/:id",
  progressLimiter,
  seriesProgressController.deleteSeriesProgress,
);

module.exports = router;
