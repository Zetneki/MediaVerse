const express = require("express");
const router = express.Router();
const questsController = require("../controllers/quests.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/", questsController.getUserQuests);
router.post("/reroll", questsController.rerollQuestSlot);
router.post("/claim", questsController.claimQuestReward);

module.exports = router;
