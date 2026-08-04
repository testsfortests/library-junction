import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmail(toEmail, otp, fullName) {
  await transporter.sendMail({
    from: `"Member Mate" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your Member Mate account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1C2541;">Member Mate</h2>
        <p>Hi ${fullName},</p>
        <p>Your verification code is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1C2541;">${otp}</p>
        <p style="color: #6B7280; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}