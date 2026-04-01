const userReviewsDao = require("../dao/user-reviews.dao");
const usersDao = require("../dao/users.dao");
const {
  VALID_REVIEW_CONTENTTYPES,
} = require("../constants/review-contenttypes");
const sanitizeHtml = require("sanitize-html");
const { AppError } = require("../middlewares/error-handler.middleware");

const getReviewsByContent = async (
  contentId,
  contentType,
  page = 1,
  limit = 20,
) => {
  if (!VALID_REVIEW_CONTENTTYPES.includes(contentType))
    throw AppError.badRequest("Invalid content type");

  const parsedContentId = parseInt(contentId);
  if (isNaN(parsedContentId)) throw AppError.badRequest("Invalid content ID");

  const reviews = await userReviewsDao.getReviewsByContent(
    parsedContentId,
    contentType,
    page,
    limit,
  );

  if (!reviews) throw AppError.notFound("Content not found");

  return reviews;
};

const getUserReviews = async (userId, page = 1, limit = 20, search = "") => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const reviews = await userReviewsDao.getUserReviews(
    userId,
    page,
    limit,
    search,
  );

  return reviews;
};

const upsertReview = async (userId, contentId, contentType, score, review) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const parsedContentId = parseInt(contentId);
  if (isNaN(parsedContentId)) throw AppError.badRequest("Invalid content ID");
  if (!VALID_REVIEW_CONTENTTYPES.includes(contentType))
    throw AppError.badRequest("Invalid content type");
  const parsedScore = parseInt(score);
  if (isNaN(parsedScore)) throw AppError.badRequest("Invalid score");
  if (parsedScore < 1 || parsedScore > 5)
    throw AppError.badRequest("Score must be between 1 and 5");

  const cleanReview = review
    ? sanitizeHtml(review, {
        allowedTags: [
          "p",
          "br",
          "strong",
          "em",
          "u",
          "s",
          "h1",
          "h2",
          "h3",
          "ul",
          "ol",
          "li",
          "blockquote",
          "pre",
          "code",
          "a",
          "span",
        ],
        allowedAttributes: {
          a: ["href", "target", "rel"],
          span: ["class"],
        },
        allowedSchemes: ["http", "https", "mailto"],
      })
    : null;

  const existing = await userReviewsDao.getReviewByUserAndContent(
    userId,
    parsedContentId,
    contentType,
  );

  if (existing === false) throw AppError.notFound("Content not found");
  else if (
    existing &&
    existing.score === parsedScore &&
    existing.review === cleanReview
  ) {
    return { action: "UNCHANGED" };
  }

  const result = await userReviewsDao.upsertReview(
    userId,
    parsedContentId,
    contentType,
    parsedScore,
    cleanReview,
  );

  if (!result) throw AppError.badRequest("Failed to save review");

  return {
    action: result.inserted ? "INSERTED" : "UPDATED",
  };
};

const deleteReview = async (userId, contentId, contentType) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const parsedContentId = parseInt(contentId);
  if (isNaN(parsedContentId)) throw AppError.badRequest("Invalid content ID");
  if (!VALID_REVIEW_CONTENTTYPES.includes(contentType))
    throw AppError.badRequest("Invalid content type");

  const result = await userReviewsDao.deleteReview(
    userId,
    parsedContentId,
    contentType,
  );

  if (!result) throw AppError.badRequest("Failed to delete review");
};

module.exports = {
  getReviewsByContent,
  getUserReviews,
  upsertReview,
  deleteReview,
};
