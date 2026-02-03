const PasswordValidator = require("./password.validator");
const UsernameValidator = require("./username.validator");

exports.validateCredentials = (password, username) => {
  const usernameErrors = UsernameValidator.validateNew(username);
  const passwordErrors = PasswordValidator.validateNew(password, username);

  return [...usernameErrors, ...passwordErrors];
};
