import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RectorLogin.css";

function RectorLogin() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/rector/login`,
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
                    data.message ||
                    "Invalid email or password."
                );
            }

            localStorage.setItem(
                "rectorToken",
                `rector-${data.rector.id}`
            );

            localStorage.setItem(
                "rector",
                JSON.stringify(data.rector)
            );

            navigate("/rector/dashboard", {
                replace: true
            });
        } catch (err) {
            console.error(
                "Rector Login Error:",
                err
            );

            setError(
                err.message ||
                "Unable to connect to backend server."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rector-login-page">

            <div className="rector-login-card">

                <div className="rector-login-header">

                    <div className="rector-login-icon">
                        👨‍🏫
                    </div>

                    <h1>
                        Rector Login
                    </h1>

                    <p>
                        Hostel Management System
                    </p>

                </div>

                <div className="rector-login-body">

                    {error && (
                        <div className="rector-login-error">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="rector-login-field">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter rector email"
                                autoComplete="email"
                            />

                        </div>

                        <div className="rector-login-field">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="rector-password-wrapper">

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    className="rector-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "🙈"
                                        : "👁️"}
                                </button>

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="rector-login-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing In..."
                                : "Sign In"}
                        </button>

                    </form>

                    <div className="rector-login-divider"></div>

                    <button
                        className="rector-back-home"
                        onClick={() => navigate("/")}
                    >
                        ← Back to Home
                    </button>

                </div>

            </div>

        </div>
    );
}

export default RectorLogin;
