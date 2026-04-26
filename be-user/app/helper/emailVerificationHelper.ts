import { getVerificationByToken, markVerificationUsed } from "../lib/email_verification";
import { activateUser } from "../lib/user";
import nodemailer from "nodemailer";

export async function verifyEmailToken(token: string) {
  try {
    const record = await getVerificationByToken(token);

    if (!record) {
      return { success: false, message: "Invalid token" };
    }

    if (record.used_at) {
      return { success: false, message: "Token already used" };
    }

    const now = new Date();
    const expires = new Date(record.expires_at);

    if (now > expires) {
      return { success: false, message: "Token expired" };
    }

    await activateUser (record.user_id);

    await markVerificationUsed(record.verify_id);
    return {
      success: true,
      message: "Email verified successfully",
    };
  } catch (error) {
    console.error("verifyEmailToken error:", error);
    throw new Error("Failed to verify email");
  }
}


export async function   sendVerifyEmail(email: string, token: string) {
  const transporter = await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verifyLink = `${process.env.BASE_URL}/api/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Xác thực tài khoản của bạn",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <h2 style="color: #333;">Xác thực Email</h2>
          
          <p style="color: #555; font-size: 14px;">
            Cảm ơn bạn đã đăng ký tài khoản 🎉 <br/>
            Vui lòng nhấn nút bên dưới để xác thực email của bạn.
          </p>

          <a href="${verifyLink}" 
            style="
              display: inline-block;
              margin-top: 20px;
              padding: 12px 24px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
            ">
            Xác thực ngay
          </a>

          <p style="margin-top: 25px; font-size: 12px; color: #999;">
            Link này sẽ hết hạn sau 15 phút.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

          <p style="font-size: 12px; color: #999;">
            Nếu nút không hoạt động, hãy copy link bên dưới:
          </p>

          <p style="word-break: break-all; font-size: 12px; color: #555;">
            ${verifyLink}
          </p>

        </div>
      </div>
      `,
    });

  } catch (error) {
    console.error("sendVerifyEmail error:", error);
    throw new Error("Failed to send verify email");
  }
}