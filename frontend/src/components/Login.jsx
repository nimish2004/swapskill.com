import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData, setToken } from "../redux/userSlice";
import { FaExchangeAlt } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError("Please fill in both fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "https://swapskill-com.onrender.com/api/auth/login",
        { email: trimmedEmail, password: trimmedPassword },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      const { token, user } = res.data;
      dispatch(setToken(token));
      dispatch(setUserData(user));
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-primary)" }}>

      {/* Background glow */}
      <div style={{
        position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 300, borderRadius: "50%",
        background: "radial-gradient(ellipse, #7c6af718 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none"
      }} />

      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <FaExchangeAlt style={{ color: "var(--accent)", fontSize: 20 }} />
            <span className="grad-text" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>SwapSkill</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Sign in to your account</p>
        </div>

        <div className="ss-card p-8" style={{ borderRadius: 20 }}>
          {error && (
            <div style={{
              background: "#ff5c5c12", border: "1px solid #ff5c5c25", borderRadius: 10,
              padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "var(--red)"
            }}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ss-input"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ss-input"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: 15, borderRadius: 10, marginTop: 8, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
