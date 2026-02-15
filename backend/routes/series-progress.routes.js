const express = require("express");
const router = express.Router();
const seriesProgressController = require("../controllers/series-progress.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.get(
  "/details",
  authenticate,
  seriesProgressController.getProgressBySeriesId,
);
router.get("/", authenticate, seriesProgressController.getSeriesProgress);
router.post("/", authenticate, seriesProgressController.setSeriesProgress);
router.delete("/", authenticate, seriesProgressController.deleteSeriesProgress);

module.exports = router;
