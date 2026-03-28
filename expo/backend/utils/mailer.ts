import nodemailer from 'nodemailer';

export type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
};

let mailConfig: MailConfig = {
  host: '',
  port: 587,
  secure: false,
  user: '',
  password: '',
  fromEmail: '',
  fromName: 'SocialStoryAI',
};

export function getMailConfig(): MailConfig {
  return mailConfig;
}

export function updateMailConfig(config: Partial<MailConfig>): void {
  mailConfig = { ...mailConfig, ...config };
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!mailConfig.host || !mailConfig.user || !mailConfig.password) {
    throw new Error('Mail server not configured');
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

  await transporter.sendMail({
    from: `"${mailConfig.fromName}" <${mailConfig.fromEmail}>`,
    to,
    subject,
    html,
  });
}

export async function testMailConnection(): Promise<boolean> {
  if (!mailConfig.host || !mailConfig.user || !mailConfig.password) {
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.password,
      },
    });

    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Mail connection test failed:', error);
    return false;
  }
}
