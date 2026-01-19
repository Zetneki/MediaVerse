exports.validatePassword = (password, username) => {
  const errors = [];
  if (!username || typeof username !== "string")
    errors.push("Invalid username");
  if (!password || typeof password !== "string")
    errors.push("Invalid password");
  if (username.length < 3 || username.length > 30)
    errors.push("Username must be between 3 and 30 characters long");
  if (password.length < 8)
    errors.push("Password should be at least 8 characters long");
  if (!/[A-Z]/.test(password))
    errors.push("Password must have at least 1 uppercase letter");
  if (!/[a-z]/.test(password))
    errors.push("Password must have at least 1 lowercase letter");
  if (!/[0-9]/.test(password))
    errors.push("Password must have at least 1 number");
  if (password === username)
    errors.push("Password cannot be the same as username");
  return errors;
};
