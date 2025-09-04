import React, { useState } from "react";
import axios from "axios";
import { FiMail } from "react-icons/fi";
import { RiLockPasswordLine } from "react-icons/ri";
import { RefreshCw, Eye, EyeOff } from "lucide-react";  // thêm Eye, EyeOff
import "../RegisterPage/ForgetPage.css";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [message, setMessage] = useState("");

  // toggle hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/user/forgot-password", { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/user/verify-otp", { email, otp });
      setMessage(res.data.message);
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    // regex password mạnh
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(newPassword)) {
      setMessage("Password must be at least 8 characters, include upper, lower, number, special char");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/user/reset-password", {
        resetToken,
        newPassword,
      });
      setMessage(res.data.message);
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-container">
      <div className="fp-form">
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <h2>Forgot Password</h2>
            <p>Enter your email to receive OTP.</p>
            <div className="fp-inputBox">
              <FiMail className="fp-icon" />
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="fp-btn" disabled={loading}>
              {loading ? <RefreshCw className="fp-spin" /> : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <h2>Enter OTP</h2>
            <p>Check your email for the OTP code.</p>
            <div className="fp-inputBox">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="fp-btn" disabled={loading}>
              {loading ? <RefreshCw className="fp-spin" /> : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <h2>Reset Password</h2>

            {/* new password */}
            <div className="fp-inputBox">
              <RiLockPasswordLine className="fp-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span
                className="fp-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            {/* confirm new password */}
            <div className="fp-inputBox">
              <RiLockPasswordLine className="fp-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                className="fp-eye"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <button type="submit" className="fp-btn" disabled={loading}>
              {loading ? <RefreshCw className="fp-spin" /> : "Reset Password"}
            </button>
          </form>
        )}
      </div>

      {/* Popup hiển thị message */}
      {message && (
        <div className="fp-popup">
          <p>{message}</p>
          <button onClick={() => setMessage("")}>Close</button>
        </div>
      )}
    </div>
  );
};

export default ForgetPassword;
