import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SecurityLogin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SecurityLogin = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!formData.password) {
            setError("Please enter your password.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/security/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: formData.email.trim(),
                        password: formData.password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Invalid email or password."
                );
            }

            if (data.token) {
                localStorage.setItem("securityToken", data.token);
            }

            if (data.security) {
                localStorage.setItem(
                    "security",
                    JSON.stringify(data.security)
                );
            }

            navigate("/security/dashboard", {
                replace: true
            });
        } catch (err) {
            console.error("Security Login Error:", err);

            setError(
                err.message ||
                "Unable to login. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="security-login-page">
            <div className="security-login-card">

                {/* HEADER */}
                <div className="security-login-header">
                    <div className="security-login-icon">
                        🛡️
                    </div>

                    <h1>Security Login</h1>
                    <p>Hostel Management System</p>
                </div>

                {/* FORM BODY */}
                <div className="security-login-body">

                    {error && (
                        <div className="security-login-error">
                            <span>⚠️</span>

                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={() => setError("")}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <form
                        className="security-login-form"
                        onSubmit={handleSubmit}
                    >

                        {/* EMAIL */}
                        <div className="security-login-field">
                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="security-login-input-box">
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter security email"
                                    autoComplete="username"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="security-login-field">
                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="security-login-input-box">
                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter security password"
                                    autoComplete="current-password"
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="security-password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    disabled={loading}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {/* LOGIN BUTTON */}
                        <button
                            type="submit"
                            className="security-login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="security-login-spinner"></span>
                                    Signing In...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* DIVIDER */}
                    <div className="security-login-divider"></div>

                    {/* BACK HOME */}
                    <button
                        type="button"
                        className="security-back-home"
                        onClick={() => navigate("/")}
                    >
                        ← Back to Home
                    </button>

                </div>
            </div>
        </div>
    );
};

export default SecurityLogin;