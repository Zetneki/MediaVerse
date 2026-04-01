const express = require("express");
const router = express.Router();
const userReviewsController = require("../controllers/user-reviews.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.get("/", authenticate, userReviewsController.getUserReviews);
router.get(
  "/:contentType/:contentId",
  userReviewsController.getReviewsByContent,
);

router.post("/", authenticate, userReviewsController.upsertReview);
router.delete(
  "/:contentType/:contentId",
  authenticate,
  userReviewsController.deleteReview,
);

module.exports = router;
