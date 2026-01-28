exports.validateUsername = (oldUsername, newUsername) => {
  const errors = [];
  if (!newUsername || typeof newUsername !== "string")
    errors.push("Invalid username");
  if (newUsername === oldUsername)
    errors.push("Username cannot be the same as the old one");
  if (newUsername.length < 3 || newUsername.length > 30)
    errors.push("Username must be between 3 and 30 characters long");
  return errors;
};
