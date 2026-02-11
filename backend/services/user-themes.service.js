const userThemesDao = require("../dao/user-themes.dao");
const usersDao = require("../dao/users.dao");
const { VALID_THEME_NAMES } = require("../constants/themes");
const { AppError } = require("../middlewares/error-handler.middleware");

/**
 * Get themes owned by user
 * @param {number} userId
 * @returns {Promise<Array<Object>>} Themes
 */

const getUserThemes = async (userId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const themes = await userThemesDao.getUserThemes(userId);

  const formattedThemes = themes.map((t) => ({
    id: t.id,
    name: t.name,
    createdAt: t.created_at,
  }));

  return formattedThemes;
};

/**
 * Insert theme into user themes
 * @param {number} userId
 * @param {string} theme
 * @returns {Promise<void>}
 */

const buyTheme = async (userId, theme) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  if (user.wallet_verified === false || user.wallet_address === null)
    throw AppError.unauthorized("User wallet not verified");

  if (!VALID_THEME_NAMES.includes(theme)) {
    throw AppError.badRequest(
      `Invalid theme. Must be one of: ${VALID_THEME_NAMES.join(", ")}`,
    );
  }

  const userThemes = await getUserThemes(userId);
  const themeNames = userThemes.map((t) => t.name);
  if (themeNames.includes(theme)) {
    throw AppError.conflict("User already owns this theme");
  }

  try {
    await userThemesDao.buyTheme(userId, theme);
  } catch (err) {
    if (err.code === "23505") {
      throw AppError.conflict("Theme already owned");
    }
    throw err;
  }
};

module.exports = {
  getUserThemes,
  buyTheme,
};
