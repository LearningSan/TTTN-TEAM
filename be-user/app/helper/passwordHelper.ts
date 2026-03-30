import { createPassword_Reset } from "../lib/password_reset";
import nodemailer from "nodemailer";
import { getUser } from "../lib/user";
import { checkOTP } from "../lib/password_reset";
import { findSocialByUserId } from "../lib/social_account";
import bcrypt from "bcrypt"
import { updatePassword } from "../lib/user";
export async function generateOTP(length = 6) {
    return Math.floor(Math.random() * Math.pow(10, length))
        .toString()
        .padStart(length, '0');
}

export async function sendMail(email: string) {
    const user = await getUser(email);
    if (!user) {
      return { message: "Email doesn't exist" };

    }
 
  try {
     const otp = await generateOTP();
    await createPassword_Reset(user.user_id, otp);
    await sendOTPEmail(email, otp);
  } catch (error) {
    console.error(error);
    return {
      message: "OTP fail to send"
    };
  }

  return { message: "OTP sent" };
}

export async function sendOTPEmail(to: string, otp: string) {
  const transporter =await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: "OTP Reset Password",
      text: `Mã OTP của bạn là: ${otp} (hết hạn 5 phút)`,
    });

    console.log(" Mail sent:", info);
  } catch (err) {
    console.error("Send mail error:", err);
    throw err;
  }
}

export async function verifyOTP(email: string, otp: string) {
  let user = await getUser(email);

  if (!user) {
    return { success: false, message: "Email doesn't exist" };
  }

  let { user_id } = user;
  const result = await checkOTP(user_id, otp);

  return result;
}
export async function resetPassword(
  email: string,
  newPassword: string
) {
  try {
    const user = await getUser(email);

    if (!user) {
      return { success: false, message: "Email doesn't exist" };
    }

    const isFirstTime = !user.password_hash;

    const hashed = await bcrypt.hash(newPassword, 10);

    await updatePassword(user.user_id, hashed);

    return {
      success: true,
      message: isFirstTime
        ? "Tạo mật khẩu lần đầu thành công"
        : "Đặt mật khẩu mới thành công"
    };

  } catch (error) {
    console.error("resetPassword error:", error);
    return {
      success: false,
      message: "Server error"
    };
  }
}