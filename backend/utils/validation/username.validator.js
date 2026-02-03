class UsernameValidator {
  static MIN_LENGTH = 3;
  static MAX_LENGTH = 30;

  static validateNew(username) {
    const errors = [];

    if (!username || typeof username !== "string") {
      errors.push("Invalid username");
      return errors;
    }

    if (username.length < 3 || username.length > 30)
      errors.push(
        `Username must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters long`,
      );

    return errors;
  }

  static validateChange(oldUsername, newUsername) {
    if (newUsername === oldUsername) {
      return ["Username cannot be the same as the old one"];
    }

    return this.validateNew(newUsername);
  }
}

module.exports = UsernameValidator;
