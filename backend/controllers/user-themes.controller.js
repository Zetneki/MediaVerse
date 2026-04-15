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

    const { theme, deadline, v, r, s } = req.body;

    if (!theme || !deadline || !v || !r || !s) {
      throw AppError.badRequest("Missing required fields");
    }

    const receipt = await userThemesService.buyTheme(
      userId,
      theme,
      deadline,
      v,
      r,
      s,
    );

    const response = {
      message: "Theme bought successfully",
      txHash: receipt.hash,
    };

    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    handleControllerError(err, res);
  }
};

module.exports = {
  getUserThemes,
  buyTheme,
};
