function userMessage(username, text, type) {
    return {
      username,
      text,
      type
    };
  }

module.exports = { userMessage };