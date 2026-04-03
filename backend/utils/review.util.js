const isEmptyReview = (html) => {
  if (!html) return true;
  //strip all tags, check if anything remains
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length === 0;
};

const getTextLength = (html) => {
  if (!html) return 0;
  return html.replace(/<[^>]*>/g, "").trim().length;
};

module.exports = {
  isEmptyReview,
  getTextLength,
};
