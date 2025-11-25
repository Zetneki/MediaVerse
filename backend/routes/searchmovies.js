var express = require("express");
var router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      res.status(400).json({ error: "Missing query parameter" });
      return;
    }

    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: "en-US",
          query: query,
          page: 1,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

module.exports = router;
