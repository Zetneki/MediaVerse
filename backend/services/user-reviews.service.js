const userReviewsDao = require("../dao/user-reviews.dao");
const usersDao = require("../dao/users.dao");
const REVIEW_CONTENTTYPES = require("../constants/review-contenttypes");
const sanitizeHtml = require("sanitize-html");
const { AppError } = require("../middlewares/error-handler.middleware");

const getReviewsByContent = async (
  contentId,
  contentType,
  page = 1,
  limit = 20,
) => {
  if (!REVIEW_CONTENTTYPES.includes(contentType))
    throw AppError.badRequest("Invalid content type");

  const reviews = await userReviewsDao.getReviewsByContent(
    contentId,
    contentType,
    page,
    limit,
  );

  return reviews;
};

const getUserReviews = async (userId, page = 1, limit = 20) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const reviews = await userReviewsDao.getUserReviews(userId, page, limit);

  return reviews;
};

const upsertReview = async (userId, contentId, contentType, score, review) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

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

  const result = await userReviewsDao.upsertReview(
    userId,
    contentId,
    contentType,
    score,
    cleanReview,
  );

  if (!result) throw AppError.badRequest("Failed to save review");
};

const deleteReview = async (userId, contentId, contentType) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const result = await userReviewsDao.deleteReview(
    userId,
    contentId,
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
