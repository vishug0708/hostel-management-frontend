import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffLogin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getPhotoUrl(photo) {
    if (!photo) return "";
    const value = String(photo).trim();
    if (
        value.startsWith("data:") ||
        value.startsWith("blob:") ||
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) return value;
    const normalized = value.replace(/^\/+/, "");
    if (normalized.startsWith("uploads/")) return `${API_URL}/${normalized}`;
    return `${API_URL}/uploads/staff/${normalized}`;
}

function StaffLogin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ staff_id: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("staffToken");
        if (token) navigate("/staff/dashboard", { replace: true });
    }, [navigate]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!form.staff_id.trim() || !form.password) {
            setError("Please enter Staff ID and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/api/staff/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    staff_id: form.staff_id.trim(),
                    password: form.password
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Invalid Staff ID or password.");
            }

            localStorage.setItem("staffToken", data.token);
            localStorage.setItem("staff", JSON.stringify(data.staff));

            if (data.staff?.photo) {
                localStorage.setItem("staffPhoto", getPhotoUrl(data.staff.photo));
            }

            navigate("/staff/dashboard", { replace: true });
        } catch (err) {
            console.error("Staff Login Error:", err);
            setError(err.message || "Unable to login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="staff-login-page">
            <div className="staff-login-left">
                <div className="staff-login-brand">
                    <div className="staff-login-logo">🏠</div>
                    <div>
                        <strong>Hostel Management</strong>
                        <span>Staff Portal</span>
                    </div>
                </div>

                <div className="staff-login-intro">
                    <span>STAFF PORTAL</span>
                    <h1>Welcome Back</h1>
                    <p>Sign in to manage your hostel responsibilities and staff activities.</p>
                </div>

                <div className="staff-login-features">
                    <div><b>✓</b><span>Secure staff access</span></div>
                    <div><b>✓</b><span>Manage assigned activities</span></div>
                    <div><b>✓</b><span>Access your staff profile</span></div>
                </div>
            </div>

            <div className="staff-login-right">
                <form className="staff-login-card" onSubmit={handleSubmit}>
                    <div className="staff-login-mobile-logo">👨‍💼</div>
                    <span className="staff-login-label">STAFF LOGIN</span>
                    <h2>Sign in to your account</h2>
                    <p className="staff-login-subtitle">Enter your Staff ID and password to continue.</p>

                    {error && <div className="staff-login-error">{error}</div>}

                    <div className="staff-login-field">
                        <label htmlFor="staff_id">Staff ID</label>
                        <input
                            id="staff_id"
                            name="staff_id"
                            type="text"
                            value={form.staff_id}
                            onChange={handleChange}
                            placeholder="Enter Staff ID"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="staff-login-field">
                        <label htmlFor="password">Password</label>
                        <div className="staff-login-password">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    <button className="staff-login-submit" type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Login"}
                    </button>

                    <button
                        type="button"
                        className="staff-login-back"
                        onClick={() => navigate("/")}
                    >
                        ← Back to Home
                    </button>
                </form>
            </div>
        </div>
    );
}

export default StaffLogin;
