"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2, CloudAlert } from "lucide-react";
import { auth, isFirebaseConfigured } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

interface AuthFormProps {
  onLoginSuccess: (email: string) => void;
}

export default function AuthForm({ onLoginSuccess }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    // 1. Firebase authentication path if configured
    

    // 2. Fallback local storage simulation path
    const defaultAdminEmail = "test@example.com";
    const defaultAdminPassword = "Test123";

    if (
      email.toLowerCase().trim() === defaultAdminEmail.toLowerCase() &&
      password === defaultAdminPassword
    ) {
      setSuccess("Logged in successfully! Redirecting...");
      setTimeout(() => {
        onLoginSuccess(defaultAdminEmail);
      }, 1000);
      return;
    }

    const usersStr = localStorage.getItem("pa_admin_users");
    let users = [];
    try {
      users = usersStr ? JSON.parse(usersStr) : [];
    } catch (err) {
      users = [];
    }

    const foundUser = users.find(
      (u: any) => u.email && u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password
    );

    if (foundUser) {
      setSuccess("Logged in successfully! Redirecting...");
      setTimeout(() => {
        onLoginSuccess(foundUser.email);
      }, 1000);
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "480px", margin: "2rem auto 4rem auto" }}>
      {/* Auth Card Container */}
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "var(--border-radius-lg)",
          boxShadow: "var(--shadow-premium)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          overflow: "hidden",
          transition: "var(--transition-smooth)",
        }}
      >
        {/* Firebase Fallback Info Banner */}
        {!isFirebaseConfigured && (
          <div
            style={{
              padding: "0.75rem 1.25rem",
              backgroundColor: "#fffaf0",
              borderBottom: "1.5px solid #feebc8",
              color: "#dd6b20",
              fontSize: "0.825rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <CloudAlert size={16} style={{ flexShrink: 0 }} />
            <span>Firebase not configured. Running in local simulation mode.</span>
          </div>
        )}

        {/* Content Wrapper */}
        <div style={{ padding: "2.5rem 2rem" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--pa-navy)", marginBottom: "0.5rem" }}>
              Admin Sign In
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
              Enter your credentials to access the submission logs.
            </p>
          </div>

          {/* Success & Error Banners */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem",
                marginBottom: "1.5rem",
                backgroundColor: "var(--color-error-bg)",
                border: "1.5px solid var(--color-error)",
                borderRadius: "var(--border-radius-md)",
                color: "var(--color-error)",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem",
                marginBottom: "1.5rem",
                backgroundColor: "var(--color-success-bg)",
                border: "1.5px solid var(--color-success)",
                borderRadius: "var(--border-radius-md)",
                color: "var(--color-success)",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="signin-email">
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={18}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  id="signin-email"
                  type="email"
                  className="form-input"
                  placeholder="test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: "2.75rem" }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signin-password">
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Test123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem", width: "100%" }}>
              <LogIn size={18} />
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
