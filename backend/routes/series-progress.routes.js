const express = require("express");
const router = express.Router();
const seriesProgressController = require("../controllers/series-progress.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.get(
  "/details/:id",
  authenticate,
  seriesProgressController.getProgressBySeriesId,
);
router.get("/", authenticate, seriesProgressController.getSeriesProgress);
router.post("/", authenticate, seriesProgressController.setSeriesProgress);
router.delete(
  "/:id",
  authenticate,
  seriesProgressController.deleteSeriesProgress,
);

module.exports = router;
