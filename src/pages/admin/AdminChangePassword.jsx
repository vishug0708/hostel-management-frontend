import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminChangePassword.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminChangePassword() {

    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        // =================================================
        // CHECK TOKEN
        // =================================================

        const token = localStorage.getItem("adminToken");

        if (!token) {

            navigate("/admin/login", {
                replace: true
            });

            return;
        }


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            setError(
                "Please fill all password fields."
            );

            return;
        }


        if (newPassword.length < 6) {

            setError(
                "New password must be at least 6 characters."
            );

            return;
        }


        if (newPassword !== confirmPassword) {

            setError(
                "New password and confirm password do not match."
            );

            return;
        }


        if (currentPassword === newPassword) {

            setError(
                "New password must be different from current password."
            );

            return;
        }


        try {

            setLoading(true);


            // =================================================
            // API REQUEST
            // =================================================

            const response = await fetch(
                `${API_URL}/api/admin/change-password`,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        currentPassword,

                        newPassword,

                        confirmPassword

                    })

                }
            );


            const data = await response.json();


            // =================================================
            // ERROR
            // =================================================

            if (!response.ok || !data.success) {

                setError(
                    data.message ||
                    "Password change failed."
                );

                return;
            }


            // =================================================
            // SUCCESS
            // =================================================

            setMessage(
                "Password changed successfully."
            );


            // Clear fields

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");


            // Redirect

            setTimeout(() => {

                navigate("/admin/dashboard");

            }, 1200);


        } catch (err) {

            console.error(
                "Change Password Error:",
                err
            );

            setError(
                "Cannot connect to backend server."
            );

        } finally {

            setLoading(false);

        }

    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };


    return (

        <div className="admin-change-password-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className={`change-password-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>

                <div className="change-password-brand">

                    <div className="change-brand-icon">
                        🏠
                    </div>

                    <div>

                        <strong>
                            Hostel
                        </strong>

                        <span>
                            Admin Panel
                        </span>

                    </div>

                </div>


                <nav className="change-password-nav">

                    <button
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/dashboard");
                        }}
                    >
                        📊 Dashboard
                    </button>

                    <button
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/students");
                        }}
                    >
                        🎓 Students
                    </button>

                    <button
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/rooms");
                        }}
                    >
                        🛏️ Rooms
                    </button>

                    <button
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/fees");
                        }}
                    >
                        💳 Fees
                    </button>

                    <button
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/complaints");
                        }}
                    >
                        📝 Complaints
                    </button>

                    <button
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/cricket-box");
                        }}
                    >
                        🏏 Cricket Box
                    </button>

                    <button
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/announcements");
                        }}
                    >
                        📢 Announcements
                    </button>

                    <button
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/reports");
                        }}
                    >
                        📊 Reports
                    </button>

                    <button
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/profile");
                        }}
                    >
                        👤 Profile
                    </button>

                </nav>

                <button
                    className="change-password-logout"
                    onClick={() => {

                        localStorage.removeItem(
                            "adminToken"
                        );

                        localStorage.removeItem(
                            "admin"
                        );

                        navigate("/admin/login", {
                            replace: true
                        });

                    }}
                >
                    🚪 Logout
                </button>

            </aside>

            {mobileMenuOpen && (
                <div
                    className="admin-mobile-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="change-password-main">

                <div className="admin-mobile-header">

                    <div className="admin-mobile-left">

                        <button
                            className="admin-mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            ☰
                        </button>

                        <div className="admin-mobile-brand">

                            <div className="admin-mobile-brand-icon">
                                🏠
                            </div>

                            <div>
                                <strong>Hostel</strong>
                                <span>Admin Panel</span>
                            </div>

                        </div>

                    </div>

                    <button
                        className="admin-mobile-profile-btn"
                        onClick={() => navigate("/admin/profile")}
                    >
                        👤
                    </button>

                </div>


                {/* HEADER */}

                <header className="change-password-header">

                    <div>

                        <span>
                            ACCOUNT SECURITY
                        </span>

                        <h1>
                            Change Password
                        </h1>

                        <p>
                            Keep your administrator account
                            secure by using a strong password.
                        </p>

                    </div>

                    <button
                        className="password-back-btn"
                        onClick={() =>
                            navigate("/admin/profile")
                        }
                    >
                        ← Profile
                    </button>

                </header>


                {/* CONTENT */}

                <section className="change-password-container">


                    {/* PASSWORD CARD */}

                    <div className="change-password-card">

                        <div className="change-password-card-header">

                            <div className="security-icon">
                                🔐
                            </div>

                            <div>

                                <h2>
                                    Update Password
                                </h2>

                                <p>
                                    Enter your current password
                                    and choose a new password.
                                </p>

                            </div>

                        </div>


                        <form
                            className="change-password-form"
                            onSubmit={handleSubmit}
                        >


                            {/* CURRENT PASSWORD */}

                            <div className="password-form-group">

                                <label>
                                    Current Password
                                </label>

                                <div className="password-input-wrapper">

                                    <input
                                        type={
                                            showCurrent
                                                ? "text"
                                                : "password"
                                        }
                                        value={currentPassword}
                                        onChange={(e) =>
                                            setCurrentPassword(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter current password"
                                        autoComplete="current-password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCurrent(
                                                !showCurrent
                                            )
                                        }
                                    >
                                        {showCurrent
                                            ? "🙈"
                                            : "👁️"
                                        }
                                    </button>

                                </div>

                            </div>


                            {/* NEW PASSWORD */}

                            <div className="password-form-group">

                                <label>
                                    New Password
                                </label>

                                <div className="password-input-wrapper">

                                    <input
                                        type={
                                            showNew
                                                ? "text"
                                                : "password"
                                        }
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter new password"
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNew(
                                                !showNew
                                            )
                                        }
                                    >
                                        {showNew
                                            ? "🙈"
                                            : "👁️"
                                        }
                                    </button>

                                </div>

                                <small>
                                    Minimum 6 characters
                                </small>

                            </div>


                            {/* CONFIRM PASSWORD */}

                            <div className="password-form-group">

                                <label>
                                    Confirm New Password
                                </label>

                                <div className="password-input-wrapper">

                                    <input
                                        type={
                                            showConfirm
                                                ? "text"
                                                : "password"
                                        }
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Confirm new password"
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirm(
                                                !showConfirm
                                            )
                                        }
                                    >
                                        {showConfirm
                                            ? "🙈"
                                            : "👁️"
                                        }
                                    </button>

                                </div>

                            </div>


                            {/* SECURITY TIPS */}

                            <div className="password-tips">

                                <strong>
                                    🛡️ Password Tips
                                </strong>

                                <ul>

                                    <li>
                                        Use at least 6 characters.
                                    </li>

                                    <li>
                                        Avoid using easily guessed
                                        passwords.
                                    </li>

                                    <li>
                                        Never share your password.
                                    </li>

                                </ul>

                            </div>


                            {/* SUCCESS */}

                            {message && (

                                <div className="password-success">
                                    ✓ {message}
                                </div>

                            )}


                            {/* ERROR */}

                            {error && (

                                <div className="password-error">
                                    ⚠ {error}
                                </div>

                            )}


                            {/* BUTTONS */}

                            <div className="password-actions">

                                <button
                                    type="button"
                                    className="password-cancel-btn"
                                    onClick={() =>
                                        navigate(
                                            "/admin/profile"
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="password-save-btn"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Updating..."
                                        : "Update Password"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>


                    {/* SECURITY SIDE CARD */}

                    <div className="security-info-card">

                        <div className="security-info-icon">
                            🛡️
                        </div>

                        <h3>
                            Account Security
                        </h3>

                        <p>
                            Your password is securely protected
                            using password hashing on the backend.
                        </p>

                        <div className="security-status">

                            <span>
                                ●
                            </span>

                            Secure Connection

                        </div>

                    </div>

                </section>


                {/* FOOTER */}

                <footer className="change-password-footer">

                    <span>
                        © 2026 Hostel Management System
                    </span>

                    <span>
                        Admin Panel
                    </span>

                </footer>

            </main>

        </div>

    );

}

export default AdminChangePassword;