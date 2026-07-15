const nodemailer = require('nodemailer');

// Validate email configuration
const validateEmailConfig = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Warning: EMAIL_USER or EMAIL_PASS not configured. Email sending will fail.');
    return false;
  }
  return true;
};

// Create transporter
const createTransporter = () => {
  if (!validateEmailConfig()) {
    throw new Error('Email configuration missing. Set EMAIL_USER and EMAIL_PASS environment variables.');
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Fanora" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

// Email templates
const emailTemplates = {
  welcome: (name, verificationUrl) => ({
    subject: 'Welcome to Fanora!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #22c55e; margin: 0;">Fanora</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Content Creator Platform</p>
        </div>

        <h2 style="color: #333;">Welcome to Fanora, ${name}!</h2>

        <p style="color: #666; line-height: 1.6;">
          Thank you for joining the Fanora community of content creators and supporters.
          We're excited to have you on board!
        </p>

        <p style="color: #666; line-height: 1.6;">
          To get started, please verify your email address by clicking the button below:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Verify Email Address
          </a>
        </div>

        <p style="color: #666; line-height: 1.6;">
          If the button doesn't work, you can also copy and paste this link into your browser:
        </p>
        <p style="color: #22c55e; word-break: break-all;">${verificationUrl}</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #666; font-size: 14px;">
          If you didn't create this account, please ignore this email.
          This verification link will expire in 24 hours.
        </p>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2024 Fanora. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'Password Reset Request - Fanora',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #22c55e; margin: 0;">Fanora</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Content Creator Platform</p>
        </div>

        <h2 style="color: #333;">Password Reset Request</h2>

        <p style="color: #666; line-height: 1.6;">Hello ${name},</p>

        <p style="color: #666; line-height: 1.6;">
          We received a request to reset your password for your Fanora account.
          If you made this request, click the button below to reset your password:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>

        <p style="color: #666; line-height: 1.6;">
          If the button doesn't work, you can also copy and paste this link into your browser:
        </p>
        <p style="color: #22c55e; word-break: break-all;">${resetUrl}</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #666; font-size: 14px;">
          If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
          This reset link will expire in 1 hour for security reasons.
        </p>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2024 Fanora. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  subscriptionConfirmation: (userName, creatorName, planName, amount) => ({
    subject: `Subscription Confirmed - ${creatorName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #22c55e; margin: 0;">Fanora</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Subscription Confirmed</p>
        </div>

        <h2 style="color: #333;">Thank you for your subscription!</h2>

        <p style="color: #666; line-height: 1.6;">Hello ${userName},</p>

        <p style="color: #666; line-height: 1.6;">
          Your subscription to <strong>${creatorName}</strong> has been confirmed successfully!
        </p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Subscription Details:</h3>
          <p style="margin: 5px 0;"><strong>Creator:</strong> ${creatorName}</p>
          <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> ${amount} ETB</p>
        </div>

        <p style="color: #666; line-height: 1.6;">
          You now have access to all premium content from ${creatorName}.
          Enjoy exploring their exclusive content!
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard"
             style="background-color: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            View Your Subscriptions
          </a>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2024 Fanora. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  walletTopUp: (userName, amount, method) => ({
    subject: 'Wallet Top-up Successful - Fanora',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #22c55e; margin: 0;">Fanora</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Wallet Top-up Successful</p>
        </div>

        <h2 style="color: #333;">Wallet Top-up Confirmed</h2>

        <p style="color: #666; line-height: 1.6;">Hello ${userName},</p>

        <p style="color: #666; line-height: 1.6;">
          Your wallet has been successfully topped up!
        </p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Transaction Details:</h3>
          <p style="margin: 5px 0;"><strong>Amount:</strong> ${amount} ETB</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${method}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <p style="color: #666; line-height: 1.6;">
          You can now use your wallet balance to subscribe to creators and purchase premium content.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/wallet"
             style="background-color: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            View Wallet
          </a>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2024 Fanora. All rights reserved.
          </p>
        </div>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};
