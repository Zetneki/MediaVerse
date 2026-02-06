const handleControllerError = (err, res, defaultMessage = "Server error") => {
  if (err.code === "23505") {
    return res.status(409).json({ error: "Resource already exists" });
  }

  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .json(err.details ? { errors: err.details } : { error: err.message });
  }

  res.status(500).json({ error: defaultMessage });
};

module.exports = { handleControllerError };
