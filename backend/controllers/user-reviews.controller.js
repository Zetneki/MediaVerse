const { AppError } = require("../middlewares/error-handler.middleware");
const { handleControllerError } = require("../utils/error-response.util");
const userReviewsService = require("../services/user-reviews.service");
const { MESSAGES } = require("../constants/review-messages");

const getReviewsByContent = async (req, res) => {
  try {
    const userId = req.user?.id ?? null;
    const { contentType, contentId } = req.params;
    if (!contentId) throw AppError.badRequest("Missing content ID");
    if (!contentType) throw AppError.badRequest("Missing content type");

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const reviews = await userReviewsService.getReviewsByContent(
      userId,
      contentId,
      contentType,
      page,
      limit,
    );

    res.status(200).json(reviews);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const search = req.query.search || "";

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const reviews = await userReviewsService.getUserReviews(
      userId,
      page,
      limit,
      search,
    );

    res.status(200).json(reviews);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const upsertReview = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const { contentId, contentType, score, review = null } = req.body;
    if (!contentId) throw AppError.badRequest("Missing content ID");
    if (!contentType) throw AppError.badRequest("Missing content type");
    if (!score) throw AppError.badRequest("Missing score");

    const result = await userReviewsService.upsertReview(
      userId,
      contentId,
      contentType,
      score,
      review,
    );

    res.status(201).json({ message: MESSAGES[result.action] });
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const { contentType, contentId } = req.params;
    if (!contentId) throw AppError.badRequest("Missing content ID");
    if (!contentType) throw AppError.badRequest("Missing content type");

    await userReviewsService.deleteReview(userId, contentId, contentType);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

module.exports = {
  getReviewsByContent,
  getUserReviews,
  upsertReview,
  deleteReview,
};
