import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  await transporter.sendMail({
    from: '"Pentu Market" <support@pentu.com>',
    to: email,
    subject: 'Код подтверждения для входа в Pentu',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Подтверждение авторизации</h2>
        <p>Ваш код подтверждения:</p>
        <h1 style="color: #2563eb; letter-spacing: 6px; font-size: 32px;">${code}</h1>
        <p>Код действителен в течение 10 минут.</p>
      </div>
    `,
  });
}