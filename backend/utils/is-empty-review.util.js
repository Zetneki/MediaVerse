const isEmptyReview = (html) => {
  if (!html) return true;
  //strip all tags, check if anything remains
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length === 0;
};

module.exports = {
  isEmptyReview,
};
