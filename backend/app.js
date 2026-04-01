require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
const helmet = require("helmet");
var path = require("path");
const cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

const usersRouter = require("./routes/users.routes");
const moviesRouter = require("./routes/movies.routes");
const seriesRouter = require("./routes/series.routes");
const genresRouter = require("./routes/genre.routes");
const userThemesRouter = require("./routes/user-themes.routes");
const movieProgressRouter = require("./routes/movie-progress.routes");
const seriesProgressRouter = require("./routes/series-progress.routes");
const walletRouter = require("./routes/wallet.routes");
const questsRouter = require("./routes/quests.routes");
const userReviewsRouter = require("./routes/user-reviews.routes");

require("./cron/movie-refresh.cron");
require("./cron/series-refresh.cron");

var app = express();

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

//Production mode
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'"],  // NO unsafe-inline!
//       styleSrc: ["'self'"],
//       connectSrc: [
//         "'self'",
//         "https://your-frontend.com",
//         "https://rpc.sepolia.org",
//       ],
//     },
//   },
// }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use((req, res, next) => {
  if (req.path === "/favicon.ico") return res.sendStatus(204);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", usersRouter);
app.use("/api/movies", moviesRouter);
app.use("/api/series", seriesRouter);
app.use("/api/genres", genresRouter);
app.use("/user-themes", userThemesRouter);
app.use("/movie-progress", movieProgressRouter);
app.use("/series-progress", seriesProgressRouter);
app.use("/wallet", walletRouter);
app.use("/quests", questsRouter);
app.use("/user-reviews", userReviewsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
