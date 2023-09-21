import * as nodemailer from 'nodemailer';

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASS,
    },
  });

  const mailOptions = {
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('이메일 전송에 실패했습니다.', error);
    throw error;
  }
}

export default sendEmail;
