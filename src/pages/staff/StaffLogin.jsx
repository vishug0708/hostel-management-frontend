import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StaffLogin.css";

function StaffLogin() {
    const navigate = useNavigate();

    const [staffId, setStaffId] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!staffId || !password) {
            setError("Please enter Staff ID and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/staff/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        staff_id: staffId.trim(),
                        password: password
                    })
                }
            );

            const data = await response.json();

            console.log("Staff Login Response:", data);

            if (!response.ok || !data.success) {
                setError(
                    data.message ||
                    "Invalid Staff ID or password."
                );
                return;
            }

            /*
             * IMPORTANT:
             * Staff authentication is stored in sessionStorage
             * so different browser tabs can maintain separate
             * staff login sessions.
             */

            sessionStorage.setItem(
                "staffToken",
                data.token
            );

            sessionStorage.setItem(
                "staff",
                JSON.stringify(data.staff)
            );

            /*
             * Remove old localStorage Staff session values.
             * This prevents an old Staff login from interfering
             * with the new sessionStorage-based login.
             */

            localStorage.removeItem("staffToken");
            localStorage.removeItem("staff");
            localStorage.removeItem("admin");

            if (
                data.staff &&
                String(data.staff.role || "").trim().toLowerCase() ===
                "cricketbox qr handler"
            ) {
                setMessage(
                    "CricketBox QR Handler login successful! Redirecting..."
                );

                navigate("/staff/cricket-box", {
                    replace: true
                });
            } else {
                setMessage(
                    "Staff login successful! Redirecting..."
                );

                navigate("/staff/dashboard", {
                    replace: true
                });
            }
        } catch (error) {
            console.error(
                "Staff Login Error:",
                error
            );

            setError(
                "Cannot connect to backend server."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="staff-login-page">
            <div className="staff-login-card">

                <div className="staff-login-header">
                    <div className="staff-login-icon">
                        👨‍💼
                    </div>

                    <h1>
                        Staff Login
                    </h1>

                    <p>
                        Hostel Management System
                    </p>
                </div>

                <form
                    className="staff-login-form"
                    onSubmit={handleLogin}
                >

                    <div className="staff-form-group">
                        <label htmlFor="staff-id">
                            Staff ID
                        </label>

                        <input
                            id="staff-id"
                            type="text"
                            placeholder="Enter Staff ID"
                            value={staffId}
                            onChange={(e) =>
                                setStaffId(e.target.value)
                            }
                            autoComplete="username"
                        />
                    </div>

                    <div className="staff-form-group">
                        <label htmlFor="staff-password">
                            Password
                        </label>

                        <input
                            id="staff-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="staff-login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing In..."
                            : "Sign In"
                        }
                    </button>

                    {message && (
                        <div className="staff-login-message success-message">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="staff-login-message error-message">
                            {error}
                        </div>
                    )}

                    <div className="admin-back-home">
                        <Link to="/">
                            ← Back to Home
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default StaffLogin;