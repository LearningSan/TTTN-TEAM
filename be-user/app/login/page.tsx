"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [otp, setOtp] = useState("");
const [step, setStep] = useState<"email" | "otp" | "reset">("email");
const [newPassword, setNewPassword] = useState("");
const [oldPassword, setOldPassword] = useState("");
  useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data === "LOGIN_SUCCESS") {
      console.log("Login success via popup");
      window.location.href = "/dashboard";
    }
  };

  window.addEventListener("message", handleMessage);

  return () => {
    window.removeEventListener("message", handleMessage);
  };
}, []);
  // 🔹 Login thường

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      console.log("Login successful");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      setLoading(false);
    }
  };

  // 🔹 Google login
  const handleGoogleLogin = () => {
  const popup = window.open(
    "/api/auth/google",
    "googleLogin",
    "width=500,height=600"
  );

  if (!popup) {
    alert("Popup bị chặn, vui lòng cho phép popup!");
  }
};
  // 🔹 Facebook login
 const handleFacebookLogin = () => {
  const popup = window.open(
    "/api/auth/facebook",
    "facebookLogin",
    "width=500,height=600"
  );

  if (!popup) {
    alert("Popup bị chặn, vui lòng cho phép popup!");
  }
};
    const handleSendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }

      // 👉 chuyển sang nhập OTP
      setStep("otp");
    } catch (err) {
      setError("Send OTP failed");
    }

    setLoading(false);
  };

 const handleVerifyOTP = async () => {
  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      setError(data.message);
      setLoading(false);
      return;
    }

    // ✅ Chỉ cần qua bước reset
    setStep("reset");

  } catch (err) {
    setError("Verify OTP failed");
  }

  setLoading(false);
};
const handleResetPassword = async () => {
  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      setError(data.message);
      setLoading(false);
      return;
    }

    alert("Đặt mật khẩu mới thành công!");
    setIsForgot(false);

  } catch (err) {
    setError("Reset password failed");
  }

  setLoading(false);
};
  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Login</h2>

      {error && (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "10px",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <hr style={{ margin: "20px 0" }} />

      {/* Google */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#db4437",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        Login with Google
      </button>

      {/* Facebook */}
      <button
        onClick={handleFacebookLogin}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#1877f2",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Login with Facebook
      </button>
       <p
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => {
              setIsForgot(true);
              setStep("email");
            }}
          >
            Forgot password?
          </p>
             {isForgot && (
        <>
          {step === "email" && (
            <>
              <h3>Nhập email để nhận OTP</h3>
              <input
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button onClick={handleSendOTP}>
                {loading ? "Sending..." : "Gửi OTP"}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <h3>Nhập OTP</h3>
              <input
                type="text"
                placeholder="Nhập OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button onClick={handleVerifyOTP}>
                {loading ? "Checking..." : "Xác nhận OTP"}
              </button>
            </>
          )}

          {/* quay lại login */}
          <p
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => setIsForgot(false)}
          >
            Quay lại đăng nhập
          </p>
          {step === "reset" && (
  <>
    <h3>Đổi mật khẩu</h3>

    <input
      type="password"
      placeholder="Mật khẩu cũ"
      value={oldPassword}
      onChange={(e) => setOldPassword(e.target.value)}
    />

    <input
      type="password"
      placeholder="Mật khẩu mới"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
    />

    <button onClick={handleResetPassword}>
      {loading ? "Updating..." : "Cập nhật mật khẩu"}
    </button>
  </>
)}
        </>
      )}
    </div>
    
  );
}