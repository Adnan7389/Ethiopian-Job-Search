const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS // App Password
  }
});

const sendVerificationEmail = async (toEmail, code) => {
  try {
    // Email options
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: toEmail,
      subject: 'Verify your Email',
      text: `Your verification code is: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verify your Email</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
            <strong>${code}</strong>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
    };

    // Log email details to console (similar to previous mock email)
    console.log(`Email to be sent to ${toEmail}:`, {
      subject: mailOptions.subject,
      text: mailOptions.text
    });

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
};

module.exports = {
  sendVerificationEmail
}; 