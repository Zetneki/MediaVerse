var express = require("express");
var router = express.Router();
const axios = require("axios");

/* GET movies page. */
router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/popular`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: "en-US",
          page: 1,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch popular movies" });
  }
});

module.exports = router;
