import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP & New Password
  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/send-otp/', { email });
      toast.success(res.data.message);
      setStep(2); // Move to the next step
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send OTP");
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/reset-password/', { email, otp, new_password: newPassword });
      toast.success(res.data.message);
      setTimeout(() => navigate('/login'), 3000); // Redirect to login after success
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to reset password");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <ToastContainer position="top-center" />
      <div className="card shadow-lg p-4" style={{ width: '400px', borderRadius: '15px' }}>
        <h2 className="text-center fw-bold mb-4">Reset Password</h2>
        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <p className="text-muted small text-center">Enter your registered email to receive a 6-digit OTP.</p>
            <div className="mb-3">
              <label className="form-label fw-bold">Email Address</label>
              <input 
                type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary w-100 fw-bold">Send OTP</button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <p className="text-muted small text-center">Enter the OTP sent to your email and your new password.</p>
            <div className="mb-3">
              <label className="form-label fw-bold">OTP Code</label>
              <input type="text" className="form-control" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">New Password</label>
              <input type="password" className="form-control" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-success w-100 fw-bold">Update Password</button>
          </form>
        )}
        
        <div className="text-center mt-3">
          <button className="btn btn-link btn-sm" onClick={() => navigate('/login')}>Back to Login</button>
        </div>
      </div>
    </div>
  );
}