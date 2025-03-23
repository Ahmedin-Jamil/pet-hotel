const axios = require('axios');

/**
 * Service to handle CAPTCHA verification
 */
class CaptchaService {
  /**
   * Verify a reCAPTCHA token with Google's reCAPTCHA API
   * @param {string} token - The reCAPTCHA token to verify
   * @returns {Promise<boolean>} - Whether the token is valid
   */
  async verifyCaptcha(token) {
    try {
      // The secret key should be stored in environment variables
      const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'; // Test secret key
      
      const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: secretKey,
            response: token
          }
        }
      );
      
      return response.data.success;
    } catch (error) {
      console.error('Error verifying CAPTCHA:', error);
      return false;
    }
  }
}

module.exports = new CaptchaService();