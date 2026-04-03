const express = require("express");
const router = express.Router();
const userReviewsController = require("../controllers/user-reviews.controller");
const {
  optionalAuthenticate,
  authenticate,
} = require("../middlewares/auth.middleware");

router.get("/", authenticate, userReviewsController.getUserReviews);
router.get(
  "/:contentType/:contentId",
  optionalAuthenticate,
  userReviewsController.getReviewsByContent,
);

router.post("/", authenticate, userReviewsController.upsertReview);
router.delete(
  "/:contentType/:contentId",
  authenticate,
  userReviewsController.deleteReview,
);

module.exports = router;
