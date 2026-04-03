const userReviewsDao = require("../dao/user-reviews.dao");
const usersDao = require("../dao/users.dao");
const {
  VALID_REVIEW_CONTENTTYPES,
} = require("../constants/review-contenttypes");
const sanitizeHtml = require("sanitize-html");
const { isEmptyReview, getTextLength } = require("../utils/review.util");
const { AppError } = require("../middlewares/error-handler.middleware");

/**
 * Get reviews by content id and type with pagination
 * @param {number} userId
 * @param {number} contentId
 * @param {string} contentType
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<items>, total} Paginated reviews
 */
const getReviewsByContent = async (
  userId,
  contentId,
  contentType,
  page = 1,
  limit = 20,
) => {
  if (!VALID_REVIEW_CONTENTTYPES.includes(contentType))
    throw AppError.badRequest("Invalid content type");

  const parsedContentId = parseInt(contentId);
  if (isNaN(parsedContentId)) throw AppError.badRequest("Invalid content ID");

  const contentExists = await userReviewsDao.doesContentExist(
    parsedContentId,
    contentType,
  );
  if (!contentExists) throw AppError.notFound("Content not found");

  const [reviews, userReview] = await Promise.all([
    userReviewsDao.getReviewsByContent(
      parsedContentId,
      contentType,
      page,
      limit,
    ),
    userId
      ? userReviewsDao.getUserReviewByContent(
          userId,
          parsedContentId,
          contentType,
        )
      : null,
  ]);

  return {
    ...reviews,
    userReview: userReview ?? null,
  };
};

/**
 * Get specific user's reviews with pagination
 * @param {number} userId
 * @param {number} page
 * @param {number} limit
 * @param {string} search
 * @returns {Promise<items>, total} Paginated reviews
 */
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

/**
 * Insert or update user's review about the chosen content
 * @param {number} userId
 * @param {number} contentId
 * @param {string} contentType
 * @param {number} score
 * @param {string} review
 * @returns {action: string} action - INSERTED, UPDATED, UNCHANGED
 */
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

  if (isEmptyReview(review)) {
    review = null;
  }

  const textLength = getTextLength(review);
  if (textLength > 5000)
    throw AppError.badRequest(
      "Review is too long (maximum 5000 characters). Your review is " +
        textLength +
        " characters long.",
    );
  if (review && review.length > 20000)
    throw AppError.badRequest(
      "Review with formatting is too long (maximum 20000 characters) Your review is " +
        review.length +
        " characters long.",
    );

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
          p: ["class"],
          span: ["class"],
          ol: ["class"],
          ul: ["class"],
          li: ["class"],
        },
        allowedSchemes: ["http", "https", "mailto"],
      })
    : null;

  const contentExists = await userReviewsDao.doesContentExist(
    parsedContentId,
    contentType,
  );
  if (!contentExists) throw AppError.notFound("Content not found");

  const existing = await userReviewsDao.getUserReviewByContent(
    userId,
    parsedContentId,
    contentType,
  );

  if (
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

/**
 * Delete user's review about the chosen content
 * @param {number} userId
 * @param {number} contentId
 * @param {string} contentType
 */
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
