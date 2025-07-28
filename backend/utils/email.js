const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

class Email {
  constructor(user, otp) {
    this.to = user.email;
    this.firstName = user.username.split(' ')[0];
    this.otp = otp;
    this.from = `"${process.env.EMAIL_FROM_NAME || 'Admin'}" <${process.env.BREVO_SENDER_EMAIL}>`;
  }

  newTransport() {
    // Use Brevo (Sendinblue) for both development and production
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.BREVO_SENDER_EMAIL,
        pass: process.env.BREVO_API_KEY,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    try {
      // 1) Render HTML based on a pug template
      const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
        firstName: this.firstName,
        otp: this.otp,
        subject,
      });

      // 2) Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject: subject,
        html: html,
        text: `Your password reset OTP is: ${this.otp}\n\nThis OTP is valid for 10 minutes.`,
      };

      // 3) Create a transport and send email
      const transport = this.newTransport();
      await transport.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('There was an error sending the email. Please try again later.');
    }
  }

  async sendPasswordResetOTP() {
    await this.send('passwordResetOTP', 'Your Password Reset OTP');
  }
}

module.exports = Email;
