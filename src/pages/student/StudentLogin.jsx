import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentLogin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudentLogin = () => {
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
                `${API_URL}/api/student/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Invalid email or password."
                );
            }

            if (data.token) {
                localStorage.setItem("studentToken", data.token);
            }

            if (data.student) {
                localStorage.setItem(
                    "student",
                    JSON.stringify(data.student)
                );
            }

            navigate("/student/dashboard", {
                replace: true
            });
        } catch (err) {
            console.error("Student Login Error:", err);

            setError(
                err.message || "Unable to login. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="student-login-page">
            <div className="student-login-card">

                {/* HEADER */}
                <div className="student-login-header">

                    <div className="student-login-icon">
                        👨‍🎓
                    </div>

                    <h1>Student Login</h1>

                    <p>Hostel Management System</p>

                </div>

                {/* FORM */}
                <div className="student-login-body">

                    {error && (
                        <div className="student-login-error">
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
                        className="student-login-form"
                        onSubmit={handleSubmit}
                    >

                        {/* EMAIL */}
                        <div className="student-login-field">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="student-login-input-box">

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter student email"
                                    autoComplete="email"
                                    disabled={loading}
                                />

                            </div>

                        </div>

                        {/* PASSWORD */}
                        <div className="student-login-field">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="student-login-input-box">

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
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="student-password-toggle"
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
                            className="student-login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="student-login-spinner"></span>
                                    Signing In...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>

                    </form>

                    {/* DIVIDER */}
                    <div className="student-login-divider"></div>

                    {/* BACK */}
                    <button
                        type="button"
                        className="student-back-home"
                        onClick={() => navigate("/")}
                    >
                        ← Back to Home
                    </button>

                </div>

            </div>
        </div>
    );
};

export default StudentLogin;