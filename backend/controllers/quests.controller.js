const { AppError } = require("../middlewares/error-handler.middleware");
const { handleControllerError } = require("../utils/error-response.util");
const questsService = require("../services/quests.service");

const getUserQuests = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const data = await questsService.getUserQuestsWithCooldown(userId);

    res.status(200).json(data);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const rerollQuestSlot = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw AppError.unauthorized("User not logged in");

    const { slotNumber } = req.body;

    if (!slotNumber || (slotNumber !== 1 && slotNumber !== 2)) {
      throw AppError.badRequest("Invalid slot number");
    }

    const newQuest = await questsService.rerollQuestSlot(userId, slotNumber);
    res.status(200).json(newQuest);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

const claimQuestReward = async (req, res) => {
  try {
    const userId = req.user.id;

    const { slotNumber } = req.body;

    if (!slotNumber || (slotNumber !== 1 && slotNumber !== 2)) {
      throw AppError.badRequest("Invalid slot number");
    }

    const result = await questsService.claimQuestReward(userId, slotNumber);
    res.status(200).json(result);
  } catch (err) {
    //console.log(err);
    handleControllerError(err, res);
  }
};

module.exports = {
  getUserQuests,
  rerollQuestSlot,
  claimQuestReward,
};
