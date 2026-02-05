import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [ui, setUi] = useState({ showPassword: false, isLocked: false, secondsLeft: 0 });

  const { showPassword, isLocked, secondsLeft } = ui;

  // ---------------- TIMER LOGIC ----------------
  // Controls the countdown when the account is in a locked state
  useEffect(() => {
    // Exit if not locked or time has already run out
    if (!isLocked || secondsLeft <= 0) {
      if (isLocked && secondsLeft <= 0) {
        // Unlock account and notify user via Toast
        setUi((u) => ({ ...u, isLocked: false }));
        toast.success("Account unlocked! Now you can enter your password and login.", {
          position: "top-center",
          autoClose: 5000,
        });
      }
      return;
    }

    // Interval to decrement the secondsLeft every 1000ms
    const timer = setInterval(
      () => setUi((u) => ({ ...u, secondsLeft: u.secondsLeft - 1 })),
      1000
    );

    // Cleanup interval on component unmount or state change
    return () => clearInterval(timer);
  }, [isLocked, secondsLeft]);

  // ---------------- LOGIN HANDLER ----------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    // Clear local storage to prevent session conflicts
    localStorage.clear();

    try {
      const { data } = await api.post("/login/", credentials);
      console.log("Backend Response:", data);
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // IMPORTANT: If your backend sends 'res_username', use data.res_username
      // If backend maps it back to 'username', keep it as is.
      const displayName = data.res_username || data.username; 
      localStorage.setItem("username", displayName);
      
      const userRole = (data.role || "user").toLowerCase();
      localStorage.setItem("role", userRole); 

      window.location.href = "/"; 
    } catch (err: any) {
      const { status, data } = err.response || {};

      // if status 403 and backend sends 'is_locked: true' then timer starts
      if (status === 403 && data?.is_locked) {
        setUi((u) => ({
          ...u,
          isLocked: true,
          secondsLeft: data.seconds_left || 120,
        }));
        toast.error("Too many attempts. Account locked.");
      } else {
        toast.error(data?.error || "Invalid login credentials");
      }
    }
  };

  // ---------------- INPUT HANDLER ----------------
  const onChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCredentials((c) => ({ ...c, [key]: e.target.value }));

  // ---------------- UI RENDERING ----------------
  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <ToastContainer position="top-center" autoClose={5000} />

      <div className="card shadow-lg p-4" style={{ width: 400, borderRadius: 15 }}>
        <h2 className="text-center fw-bold mb-4">Login</h2>

        <form onSubmit={handleLogin} autoComplete="off">
          <div className="mb-3">
            <label className="form-label fw-bold">Username</label>
            <input
              className="form-control"
              required
              disabled={isLocked}
              value={credentials.username}
              onChange={onChange("username")}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                required
                disabled={isLocked}
                value={credentials.password}
                onChange={onChange("password")}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={isLocked}
                onClick={() => setUi((u) => ({ ...u, showPassword: !u.showPassword }))}
              >
                {showPassword ? "👁️" : "🧐"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLocked}
            className={`btn w-100 fw-bold py-2 ${
              isLocked ? "btn-secondary" : "btn-primary"
            }`}
          >
            {/* Kept original button text as requested */}
            {isLocked ? "Account Locked" : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="small text-muted">
            New user? <Link to="/register" className="fw-bold">Register here</Link>
          </p>
        </div>

        <div className="text-center mt-2">
          <Link to="/forgot-password" className="small fw-bold">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}