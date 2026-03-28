import nodemailer from 'nodemailer';

let mailConfig = {
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: process.env.MAIL_SECURE === 'true',
  user: process.env.MAIL_USER || '',
  password: process.env.MAIL_PASSWORD || '',
  fromEmail: process.env.MAIL_FROM_EMAIL || 'noreply@socialstoryai.com',
  fromName: process.env.MAIL_FROM_NAME || 'SocialStoryAI',
};

export function getMailConfig() {
  return { ...mailConfig };
}

export function updateMailConfig(updates) {
  mailConfig = { ...mailConfig, ...updates };
}

export async function sendEmail(to, subject, html) {
  if (!mailConfig.user || !mailConfig.password) {
    console.warn('⚠️ Email configuration not set. Email not sent.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.password,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${mailConfig.fromName}" <${mailConfig.fromEmail}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

export async function testMailConnection() {
  if (!mailConfig.user || !mailConfig.password) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.password,
    },
  });

  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Mail connection test failed:', error);
    return false;
  }
}
