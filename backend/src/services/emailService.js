/**
 * Email Service using SendGrid
 * 
 * Required environment variables:
 * - SENDGRID_API_KEY: Your SendGrid API key
 * - SENDGRID_FROM_EMAIL: Verified sender email address
 * - SENDGRID_SANDBOX_MODE: Set to 'true' for local dev (no actual sends)
 * - SENDGRID_ADMIN_EMAIL: Admin email for contact form submissions (optional)
 */

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
const initializeSendGrid = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (apiKey) {
    sgMail.setApiKey(apiKey);
    return true;
  }
  return false;
};

// Check if sandbox mode is enabled (for local development)
const isSandboxMode = () => {
  return process.env.SENDGRID_SANDBOX_MODE === 'true';
};

// Check if SendGrid is configured
const isConfigured = () => {
  return !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL);
};

/**
 * Central email sending function
 * @param {Object} options - Email options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML body
 * @param {string} [options.from] - Sender email (defaults to SENDGRID_FROM_EMAIL)
 * @param {string} [options.replyTo] - Reply-to email
 * @param {string|string[]} [options.cc] - CC recipient(s)
 * @param {string|string[]} [options.bcc] - BCC recipient(s)
 * @param {Array} [options.attachments] - Array of attachment objects
 * @param {string} [options.templateId] - SendGrid dynamic template ID
 * @param {Object} [options.dynamicTemplateData] - Data for dynamic template
 * @returns {Promise<{success: boolean, messageId: string}>}
 */
const sendEmail = async (options) => {
  const {
    to,
    subject,
    text,
    html,
    from,
    replyTo,
    cc,
    bcc,
    attachments,
    templateId,
    dynamicTemplateData
  } = options;

  // Build the message object
  const msg = {
    to,
    from: from || process.env.SENDGRID_FROM_EMAIL,
    subject,
  };

  // Add optional fields
  if (text) msg.text = text;
  if (html) msg.html = html;
  if (replyTo) msg.replyTo = replyTo;
  if (cc) msg.cc = cc;
  if (bcc) msg.bcc = bcc;
  
  // Handle SendGrid dynamic templates
  if (templateId) {
    msg.templateId = templateId;
    if (dynamicTemplateData) {
      msg.dynamicTemplateData = dynamicTemplateData;
    }
  }

  // Handle attachments (must be base64 encoded for SendGrid)
  if (attachments && attachments.length > 0) {
    msg.attachments = attachments.map(att => ({
      content: att.content, // Must be base64 encoded
      filename: att.filename,
      type: att.type || att.contentType || 'application/octet-stream',
      disposition: att.disposition || 'attachment',
      contentId: att.cid || att.contentId
    }));
  }

  // Sandbox mode - log but don't send
  if (isSandboxMode()) {
    console.log('📧 [SANDBOX MODE] Email would be sent:');
    console.log('  To:', to);
    console.log('  From:', msg.from);
    console.log('  Subject:', subject);
    if (replyTo) console.log('  Reply-To:', replyTo);
    if (cc) console.log('  CC:', cc);
    if (bcc) console.log('  BCC:', bcc);
    if (templateId) console.log('  Template ID:', templateId);
    if (attachments) console.log('  Attachments:', attachments.length);
    return { success: true, messageId: 'sandbox-mode-' + Date.now() };
  }

  // Check if SendGrid is configured
  if (!isConfigured()) {
    console.warn('⚠️ SendGrid not configured. Email not sent.');
    console.log('  To:', to);
    console.log('  Subject:', subject);
    return { success: true, messageId: 'dev-mode-' + Date.now() };
  }

  // Initialize and send
  initializeSendGrid();
  
  try {
    const [response] = await sgMail.send(msg);
    const messageId = response.headers['x-message-id'] || 'sg-' + Date.now();
    console.log('✅ Email sent successfully:', messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error('❌ SendGrid email error:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.statusCode);
      console.error('  Body:', JSON.stringify(error.response.body));
    }
    throw error;
  }
};

/**
 * Send verification email to new user
 */
const sendVerificationEmail = async (email, name, verificationToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .button:hover { background: #059669; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍽️ Welcome to Food Link!</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>Thank you for joining Food Link! We're excited to have you as part of our mission to reduce food waste and help those in need.</p>
          
          <p>To complete your registration, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>

          <div class="warning">
            <strong>⏰ Important:</strong> This verification link will expire in 30 minutes for security reasons.
          </div>
          
          <p>If you didn't create an account with Food Link, please ignore this email.</p>
          
          <p>Best regards,<br><strong>The Food Link Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 Food Link. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${name},

Welcome to Food Link!

To complete your registration, please verify your email address by visiting:
${verificationUrl}

This link will expire in 30 minutes.

If you didn't create an account, please ignore this email.

Best regards,
The Food Link Team
  `.trim();

  try {
    const result = await sendEmail({
      to: email,
      subject: 'Verify Your Email - Food Link',
      html,
      text
    });
    console.log('Verification email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId, verificationUrl };
  } catch (error) {
    console.error('Email sending error:', error.message);
    throw error;
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, name, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .button:hover { background: #059669; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .security { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>We received a request to reset the password for your Food Link account.</p>
          
          <p>To reset your password, please click the button below:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <div class="warning">
            <strong>⏰ Important:</strong> This password reset link will expire in 1 hour for security reasons.
          </div>
          
          <div class="security">
            <strong>🛡️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </div>
          
          <p>Best regards,<br><strong>The Food Link Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 Food Link. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${name},

We received a request to reset the password for your Food Link account.

To reset your password, please visit:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

Best regards,
The Food Link Team
  `.trim();

  try {
    const result = await sendEmail({
      to: email,
      subject: 'Password Reset Request - Food Link',
      html,
      text
    });
    return { success: true, messageId: result.messageId, resetUrl };
  } catch (error) {
    console.error('Password reset email error:', error.message);
    throw error;
  }
};

/**
 * Placeholder function for future implementation
 */
const sendDonationNotificationEmail = async (_email, _name, _donationDetails) => {
  // Not yet implemented
};

/**
 * Send donation claim confirmation email to NGO
 */
const sendDonationClaimEmail = async (ngoEmail, ngoName, donationDetails) => {
  const { donationId, donationTitle, donorName, donorEmail, donorPhone, donorAddress, pickupDateTime, pickupGeo } = donationDetails;
  
  const googleMapsLink = pickupGeo && pickupGeo.lat && pickupGeo.lng 
    ? `https://www.google.com/maps?q=${pickupGeo.lat},${pickupGeo.lng}`
    : null;
    
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .detail-row { margin: 15px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #059669; margin-bottom: 5px; }
        .value { color: #1f2937; }
        .highlight { background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .map-button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
        .map-button:hover { background: #059669; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Donation Claimed Successfully</h1>
        </div>
        <div class="content">
          <p>Hi ${ngoName},</p>
          <p>You have successfully claimed a donation. Below are the details you need to arrange the pickup.</p>
          
          <div class="highlight">
            <strong>Donation ID:</strong> ${donationId}
          </div>
          
          <div class="info-box">
            <div class="detail-row">
              <div class="label">Donation Title:</div>
              <div class="value">${donationTitle}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Donor Name:</div>
              <div class="value">${donorName}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Donor Email:</div>
              <div class="value"><a href="mailto:${donorEmail}">${donorEmail}</a></div>
            </div>
            
            <div class="detail-row">
              <div class="label">Donor Phone:</div>
              <div class="value">${donorPhone}</div>
            </div>
            
            ${googleMapsLink ? `
            <div class="detail-row">
              <div class="label">Location:</div>
              <div class="value">
                <a href="${googleMapsLink}" target="_blank" class="map-button">View on Google Maps</a>
              </div>
            </div>
            ` : ''}
            
            <div class="detail-row">
              <div class="label">Pickup Date & Time:</div>
              <div class="value">${new Date(pickupDateTime).toLocaleString()}</div>
            </div>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Contact the donor to confirm pickup arrangements</li>
            <li>Arrive at the specified location on time</li>
            <li>Confirm pickup in the system after collection</li>
          </ul>
          
          <p>Thank you for your commitment to reducing food waste!</p>
          
          <p>Best regards,<br><strong>The Food Link Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 Food Link. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Donation Claimed Successfully

Hi ${ngoName},

You have successfully claimed a donation. Below are the details:

Donation ID: ${donationId}
Donation Title: ${donationTitle}

Donor Information:
- Name: ${donorName}
- Email: ${donorEmail}
- Phone: ${donorPhone}
- Address: ${donorAddress}

${googleMapsLink ? `Location: ${googleMapsLink}\n` : ''}
Pickup Date & Time: ${new Date(pickupDateTime).toLocaleString()}

Next Steps:
- Contact the donor to confirm pickup arrangements
- Arrive at the specified location on time
- Confirm pickup in the system after collection

Thank you for your commitment to reducing food waste!

Best regards,
The Food Link Team
  `.trim();

  try {
    const result = await sendEmail({
      to: ngoEmail,
      subject: `Donation Claim Details — ${donationId}`,
      html,
      text
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Donation claim email error:', error.message);
    throw error;
  }
};

/**
 * Send contact form submission to admin
 */
const sendContactEmail = async (name, email, message) => {
  const adminEmail = process.env.SENDGRID_ADMIN_EMAIL || process.env.SENDGRID_FROM_EMAIL;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .label { font-weight: bold; color: #059669; margin-bottom: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 New Contact Form Submission</h1>
        </div>
        <div class="content">
          <p>You have received a new message through the Food Link contact form.</p>
          
          <div class="info-box">
            <div class="label">From:</div>
            <p><strong>${name}</strong></p>
            
            <div class="label">Email:</div>
            <p><a href="mailto:${email}">${email}</a></p>
            
            <div class="label">Submitted:</div>
            <p>${new Date().toLocaleString()}</p>
          </div>
          
          <div class="message-box">
            <div class="label">Message:</div>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            💡 You can reply directly to this email to respond to ${name}.
          </p>
        </div>
        <div class="footer">
          <p>© 2025 Food Link. All rights reserved.</p>
          <p>This is an automated notification from your Food Link contact form.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Contact Form Submission

From: ${name}
Email: ${email}
Date: ${new Date().toLocaleString()}

Message:
${message}

---
You can reply directly to this email to respond to ${name}.
  `.trim();

  try {
    const result = await sendEmail({
      to: adminEmail,
      subject: `New Contact Form Submission from ${name}`,
      html,
      text,
      replyTo: email
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Contact email error:', error.message);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendDonationNotificationEmail,
  sendDonationClaimEmail,
  sendContactEmail
};
