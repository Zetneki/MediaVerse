const express = require("express");
const router = express.Router();
const seriesController = require("../controllers/series.controller");

router.get("/toprated", seriesController.getTopRatedSeries);
router.get("/popular", seriesController.getPopularSeries);
router.get("/search", seriesController.searchSeries);
router.get("/filter", seriesController.filterSeries);
router.get("/details/:id", seriesController.searchSeriesDetails);

module.exports = router;
