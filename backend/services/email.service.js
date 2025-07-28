const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

class EmailService {
  constructor() {
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      throw new Error('EMAIL_USERNAME and EMAIL_PASSWORD must be defined in environment variables');
    }

    console.log('Initializing email service with:', {
      service: process.env.EMAIL_SERVICE,
      user: process.env.EMAIL_USERNAME
    });

    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Using Gmail SMTP
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Only for development
      },
      debug: true,
      logger: true
    });
  }

  /**
   * Send password reset OTP email
   * @param {Object} user - User object with email and username
   * @param {string} otp - The OTP to send
   * @returns {Promise<void>}
   */
  async sendPasswordResetOTP(user, otp) {
    try {
      console.log('Sending password reset OTP to:', user.email);
      
      // Validate environment variables
      if (!process.env.BREVO_SENDER_EMAIL || !process.env.BREVO_API_KEY) {
        throw new Error('Missing required environment variables: BREVO_SENDER_EMAIL and BREVO_API_KEY must be set');
      }
      
      console.log('Using Brevo sender email:', process.env.BREVO_SENDER_EMAIL);
      
      const firstName = user.username?.split(' ')[0] || 'User';
      const subject = 'Your Password Reset OTP';
      
      // Verify email template exists
      const templatePath = `${__dirname}/../views/emails/passwordResetOTP.pug`;
      console.log('Looking for email template at:', templatePath);
      
      // Render HTML from pug template
      const html = pug.renderFile(templatePath, {
        firstName,
        otp,
        subject
      });

      if (!html) {
        throw new Error('Failed to render email template');
      }

      // Define email options
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Admin'}" <${process.env.BREVO_SENDER_EMAIL}>`,
        to: user.email,
        subject,
        html,
        text: `Your password reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
      };

      console.log('Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      // Send email
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Detailed error sending password reset OTP:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        code: error.code,
        smtp: error.smtp,
        smtpResponse: error.response
      });
      throw new Error('Failed to send password reset email: ' + (error.message || 'Unknown error'));
    }
  }
}

module.exports = new EmailService();
