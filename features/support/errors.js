class ApiStandardsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiStandardsError';
  }
}

class ApiStandardsTestAssertionInvalid extends ApiStandardsError {
  constructor(message, data) {
    super(`${message} - ${JSON.stringify(data)}`);
    this.stack = '';
  }
}

module.exports = {
  ApiStandardsTestAssertionInvalid,
};
