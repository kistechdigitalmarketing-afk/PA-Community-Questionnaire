"use client";

import React, { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

interface AuthFormProps {
  onLoginSuccess: (email: string) => void;
}

export default function AuthForm({ onLoginSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error/Success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initialize default admin user in localStorage if not exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const existingUsersStr = localStorage.getItem("pa_admin_users");
        let users = existingUsersStr ? JSON.parse(existingUsersStr) : [];
        if (!Array.isArray(users)) {
          users = [];
        }
        const hasDefaultAdmin = users.some(
          (u: any) => u.email && u.email.toLowerCase() === "admin@possibilitiesafrica.org"
        );
        if (!hasDefaultAdmin) {
          users.push({
            name: "Default Admin",
            email: "admin@possibilitiesafrica.org",
            password: "admin123",
          });
          localStorage.setItem("pa_admin_users", JSON.stringify(users));
        }
      } catch (e) {
        // Fallback write if parsing fails
        localStorage.setItem(
          "pa_admin_users",
          JSON.stringify([
            {
              name: "Default Admin",
              email: "admin@possibilitiesafrica.org",
              password: "admin123",
            },
          ])
        );
      }
    }
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    // Direct foolproof check for the default admin credentials
    const defaultAdminEmail = "admin@possibilitiesafrica.org";
    const defaultAdminPassword = "admin123";

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

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const usersStr = localStorage.getItem("pa_admin_users");
    const users = usersStr ? JSON.parse(usersStr) : [];

    const emailExists = users.some(
      (u: any) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      setError("An account with this email already exists.");
      return;
    }

    // Register user
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem("pa_admin_users", JSON.stringify(users));

    setSuccess("Account registered successfully! Switching to sign in...");
    
    // Clear inputs and switch to sign in after 1.5s
    setTimeout(() => {
      setName("");
      setEmail(newUser.email); // Auto-fill registered email
      setPassword("");
      setConfirmPassword("");
      setMode("signin");
      setSuccess("");
    }, 1500);
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
        {/* Toggle Mode Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)" }}>
          <button
            onClick={() => {
              setMode("signin");
              setError("");
              setSuccess("");
            }}
            style={{
              flex: 1,
              padding: "1.25rem",
              fontSize: "1.05rem",
              fontWeight: 700,
              backgroundColor: mode === "signin" ? "transparent" : "rgba(244, 246, 248, 0.5)",
              color: mode === "signin" ? "var(--pa-blue)" : "var(--text-muted)",
              border: "none",
              borderBottom: mode === "signin" ? "3px solid var(--pa-blue)" : "3px solid transparent",
              cursor: "pointer",
              transition: "var(--transition-smooth)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <LogIn size={18} />
            Sign In
          </button>
          <button
            onClick={() => {
              setMode("signup");
              setError("");
              setSuccess("");
            }}
            style={{
              flex: 1,
              padding: "1.25rem",
              fontSize: "1.05rem",
              fontWeight: 700,
              backgroundColor: mode === "signup" ? "transparent" : "rgba(244, 246, 248, 0.5)",
              color: mode === "signup" ? "var(--pa-blue)" : "var(--text-muted)",
              border: "none",
              borderBottom: mode === "signup" ? "3px solid var(--pa-blue)" : "3px solid transparent",
              cursor: "pointer",
              transition: "var(--transition-smooth)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <UserPlus size={18} />
            Sign Up
          </button>
        </div>

        {/* Content Wrapper */}
        <div style={{ padding: "2.5rem 2rem" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--pa-navy)", marginBottom: "0.5rem" }}>
              {mode === "signin" ? "Admin Sign In" : "Create Admin Account"}
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
              {mode === "signin"
                ? "Enter your credentials to access the submission logs."
                : "Register a new administrative account to view and export reports."}
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

          {/* Forms */}
          {mode === "signin" ? (
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
                    placeholder="admin@possibilitiesafrica.org"
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
                    placeholder="••••••••"
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
          ) : (
            <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-name">
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User
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
                    id="signup-name"
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: "2.75rem" }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">
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
                    id="signup-email"
                    type="email"
                    className="form-input"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: "2.75rem" }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-password">
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
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="•••••••• (Min. 6 characters)"
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

              <div className="form-group">
                <label className="form-label" htmlFor="signup-confirm-password">
                  Confirm Password
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
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem", width: "100%" }}>
                <UserPlus size={18} />
                Create Account
              </button>
            </form>
          )}

          {/* Quick Test Demo Credentials Banner */}
          <div
            style={{
              marginTop: "2.5rem",
              padding: "1.25rem",
              backgroundColor: "var(--pa-yellow-light)",
              border: "1.5px dashed var(--pa-yellow)",
              borderRadius: "var(--border-radius-md)",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontSize: "0.85rem",
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--pa-navy)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              💡 Quick Testing Credentials:
            </div>
            <div style={{ color: "var(--text-main)" }}>
              You can sign up a custom account, or use our pre-configured admin login:
              <div style={{ marginTop: "0.5rem", fontFamily: "monospace", background: "rgba(255,255,255,0.7)", padding: "0.5rem", borderRadius: "4px" }}>
                <strong>Email:</strong> admin@possibilitiesafrica.org<br/>
                <strong>Password:</strong> admin123
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
