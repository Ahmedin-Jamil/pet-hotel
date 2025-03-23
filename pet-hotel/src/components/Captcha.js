import React, { useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import './Captcha.css';

/**
 * CAPTCHA component for form validation
 * Uses Google reCAPTCHA v2
 */
const Captcha = ({ onChange, onExpired }) => {
  const recaptchaRef = useRef(null);

  // This site key is for testing only - replace with your actual site key in production
  const sitekey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  const handleChange = (value) => {
    if (onChange) {
      onChange(value);
    }
  };

  const handleExpired = () => {
    if (onExpired) {
      onExpired();
    }
  };

  const reset = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  return (
    <div className="captcha-container">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={sitekey}
        onChange={handleChange}
        onExpired={handleExpired}
      />
      <p className="captcha-info">
        This helps us protect our site from spam and automated abuse.
      </p>
    </div>
  );
};

export default Captcha;