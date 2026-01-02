class Validator {
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password) {
    if (password.length < 6) {
      return {
        valid: false,
        message: 'Password must be at least 6 characters long'
      };
    }
    return { valid: true };
  }

  static sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  }

  static isValidName(name) {
    if (!name || name.trim().length < 2) {
      return {
        valid: false,
        message: 'Name must be at least 2 characters long'
      };
    }

    if (name.length > 50) {
      return {
        valid: false,
        message: 'Name must be less than 50 characters'
      };
    }

    return { valid: true };
  }
}

export default Validator;