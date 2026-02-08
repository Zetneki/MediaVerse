const { AppError } = require("../middlewares/error-handler.middleware");
const { handleControllerError } = require("../utils/error-response.util");
const userThemesService = require("../services/user-themes.service");

const getUserThemes = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const themes = await userThemesService.getUserThemes(userId);
    res.status(200).json(themes);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const buyTheme = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    //const theme = req.params.theme;
    const { theme } = req.body;
    if (!theme) throw AppError.badRequest("Missing theme");

    await userThemesService.buyTheme(userId, theme);
    res.status(200).json({ message: "Theme bought successfully" });
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

module.exports = {
  getUserThemes,
  buyTheme,
};
