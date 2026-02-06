import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [ui, setUi] = useState({ showPassword: false, isLocked: false, secondsLeft: 0 });

  const { showPassword, isLocked, secondsLeft } = ui;

  useEffect(() => {
    if (!isLocked || secondsLeft <= 0) {
      if (isLocked && secondsLeft <= 0) {
        setUi((u) => ({ ...u, isLocked: false }));
        toast.success("Account unlocked! Now you can enter your password and login.", {
          position: "top-center",
          autoClose: 5000,
        });
      }
      return;
    }

    const timer = setInterval(
      () => setUi((u) => ({ ...u, secondsLeft: u.secondsLeft - 1 })),
      1000
    );

    return () => clearInterval(timer);
  }, [isLocked, secondsLeft]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    localStorage.clear();

    try {
      const { data } = await api.post("/login/", credentials);
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      const displayName = data.res_username || data.username; 
      localStorage.setItem("username", displayName);
      
      const userRole = (data.role || "user").toLowerCase();
      localStorage.setItem("role", userRole); 

      // Logic: Admin goes to Dashboard, Others to Home
      if (userRole === "admin") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/"; 
      }
    } catch (err: any) {
      const { status, data } = err.response || {};

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

  const onChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCredentials((c) => ({ ...c, [key]: e.target.value }));

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