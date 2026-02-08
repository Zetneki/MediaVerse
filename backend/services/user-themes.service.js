const userThemesDao = require("../dao/user-themes.dao");
const usersDao = require("../dao/users.dao");
const { AppError } = require("../middlewares/error-handler.middleware");

const getUserThemes = async (userId) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  const themes = await userThemesDao.getUserThemes(userId);
  if (themes.length === 0) throw AppError.notFound("User themes not found");
  return themes;
};

const buyTheme = async (userId, theme) => {
  const user = await usersDao.findById(userId);
  if (!user) throw AppError.notFound("User not found");

  if (user.wallet_verified === false || user.wallet_address === null)
    throw AppError.unauthorized("User wallet not verified");

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
