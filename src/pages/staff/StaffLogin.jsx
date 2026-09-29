import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StaffLogin.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

function StaffLogin() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        staff_id: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("staffToken");

        if (token) {
            navigate("/staff/dashboard", {
                replace: true
            });
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const staffId = form.staff_id.trim();
        const password = form.password;

        if (!staffId || !password) {
            setError(
                "Please enter Staff ID and password."
            );
            return;
        }

        try {
            setLoading(true);

            console.log(
                "Staff Login API:",
                `${API_URL}/api/staff/auth/login`
            );

            const response = await fetch(
                `${API_URL}/api/staff/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        staff_id: staffId,
                        password: password
                    })
                }
            );

            const contentType =
                response.headers.get("content-type") || "";

            let data;

            if (contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();

                console.error(
                    "Staff Login Non-JSON Response:",
                    text
                );

                throw new Error(
                    `Backend returned ${response.status} instead of JSON.`
                );
            }

            console.log(
                "Staff Login Status:",
                response.status
            );

            console.log(
                "Staff Login Response:",
                data
            );

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Invalid Staff ID or password."
                );
            }

            if (!data.token) {
                throw new Error(
                    "Login successful but JWT token was not received from backend."
                );
            }

            localStorage.setItem(
                "staffToken",
                data.token
            );

            localStorage.setItem(
                "staff",
                JSON.stringify(data.staff || {})
            );

            if (data.staff?.photo) {
                localStorage.setItem(
                    "staffPhoto",
                    data.staff.photo
                );
            }

            setSuccess(
                "Staff login successful! Redirecting..."
            );

            setTimeout(() => {
                navigate("/staff/dashboard", {
                    replace: true
                });
            }, 300);

        } catch (err) {
            console.error(
                "Staff Login Error:",
                err
            );

            setError(
                err.message ||
                "Unable to login."
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
                    onSubmit={handleSubmit}
                >

                    <div className="staff-form-group">

                        <label htmlFor="staff-id">
                            Staff ID
                        </label>

                        <input
                            id="staff-id"
                            name="staff_id"
                            type="text"
                            placeholder="Enter Staff ID"
                            value={form.staff_id}
                            onChange={handleChange}
                            autoComplete="username"
                            disabled={loading}
                        />

                    </div>

                    <div className="staff-form-group">

                        <label htmlFor="staff-password">
                            Password
                        </label>

                        <input
                            id="staff-password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            disabled={loading}
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

                    {success && (
                        <div className="staff-login-message success-message">
                            {success}
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