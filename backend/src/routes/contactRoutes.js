const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../services/emailService');

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    await sendContactEmail(name, email, message);

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We\'ll get back to you soon!',
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
    });
  }
});

module.exports = router;
