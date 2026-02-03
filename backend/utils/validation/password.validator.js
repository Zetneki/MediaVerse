class PasswordValidator {
  static MIN_LENGTH = 8;
  static UPPERCASE_REGEX = /[A-Z]/;
  static LOWERCASE_REGEX = /[a-z]/;
  static NUMBER_REGEX = /[0-9]/;

  static validateNew(password, username) {
    const errors = [];

    if (!password || typeof password !== "string") {
      errors.push("Invalid password");
      return errors;
    }

    if (password.length < this.MIN_LENGTH)
      errors.push(
        `Password should be at least ${this.MIN_LENGTH} characters long`,
      );

    if (!this.UPPERCASE_REGEX.test(password))
      errors.push("Password must have at least 1 uppercase letter");

    if (!this.LOWERCASE_REGEX.test(password))
      errors.push("Password must have at least 1 lowercase letter");

    if (!this.NUMBER_REGEX.test(password))
      errors.push("Password must have at least 1 number");

    if (username && password === username)
      errors.push("Password cannot be the same as username");

    return errors;
  }

  static validateChange(oldPassword, newPassword, username) {
    if (oldPassword === newPassword)
      return ["New password cannot be the same as the old one"];

    return this.validateNew(newPassword, username);
  }
}

module.exports = PasswordValidator;
