const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else if (process.env.SMTP_HOST) {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  } else {
    return null;
  }
};

const sendVerificationEmail = async (email, name, verificationToken) => {
  try {
    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"Food Link" <${process.env.EMAIL_FROM || 'noreply@foodlink.com'}>`,
      to: email,
      subject: 'Verify Your Email - Food Link',
      html: `
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
          <div class=\"container\">
            <div class=\"header\">
              <h1>🍽️ Welcome to Food Link!</h1>
            </div>
            <div class=\"content\">
              <h2>Hi ${name},</h2>
              <p>Thank you for joining Food Link! We're excited to have you as part of our mission to reduce food waste and help those in need.</p>
              
              <p>To complete your registration, please verify your email address by clicking the button below:</p>
              
              <div style=\"text-align: center;\">
                <a href=\"${verificationUrl}\" class=\"button\">Verify Email Address</a>
              </div>
  
              <div class=\"warning\">
                <strong>⏰ Important:</strong> This verification link will expire in 30 minutes for security reasons.
              </div>
              
              <p>If you didn't create an account with Food Link, please ignore this email.</p>
              
              <p>Best regards,<br><strong>The Food Link Team</strong></p>
            </div>
            <div class=\"footer\">
              <p>© 2025 Food Link. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${name},
        
        Welcome to Food Link!
        
        To complete your registration, please verify your email address by visiting:
        ${verificationUrl}
        
        This link will expire in 30 minutes.
        
        If you didn't create an account, please ignore this email.
        
        Best regards,
        The Food Link Team
      `
    };

    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } else {
      return { success: true, messageId: 'dev-mode', verificationUrl };
    }
  } catch (error) {
    throw error;
  }
};

const sendPasswordResetEmail = async (email, name, resetToken) => {
};

const sendDonationNotificationEmail = async (email, name, donationDetails) => {
};

const sendContactEmail = async (name, email, message) => {
  try {
    const transporter = createTransporter();
    const adminEmail = process.env.EMAIL_USER || 'foodlink.service.info@gmail.com';
    
    const mailOptions = {
      from: `"Food Link Contact" <${process.env.EMAIL_FROM || 'noreply@foodlink.com'}>`,
      to: adminEmail,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
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
      `,
      text: `
        New Contact Form Submission
        
        From: ${name}
        Email: ${email}
        Date: ${new Date().toLocaleString()}
        
        Message:
        ${message}
        
        ---
        You can reply directly to this email to respond to ${name}.
      `
    };

    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } else {
      console.log('Contact form submission (dev mode):', { name, email, message });
      return { success: true, messageId: 'dev-mode' };
    }
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendDonationNotificationEmail,
  sendContactEmail
};
