const cron = require("node-cron");
const { deleteOldUserActivity } = require("../dao/user-activity.dao");

cron.schedule("0 0 * * *", async () => {
  console.log("Deleting old user activity...");
  try {
    const res = await deleteOldUserActivity();
    console.log(`Deleted ${res} rows`);
  } catch (err) {
    console.error("Failed to delete old user activity:", err);
  }
});
