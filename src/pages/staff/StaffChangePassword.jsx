import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffChangePassword.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function StaffChangePassword() {

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

        const token = localStorage.getItem("staffToken");

        if (!token) {

            navigate("/staff/login", {
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
                `${API_URL}/api/staff/change-password`,
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

                navigate("/staff/dashboard");

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

        <div className="staff-staff-change-password-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className={`staff-change-password-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>

                <div className="staff-change-password-brand">

                    <div className="change-brand-icon">
                        🏠
                    </div>

                    <div>

                        <strong>
                            Hostel
                        </strong>

                        <span>
                            Staff Panel
                        </span>

                    </div>

                </div>


                <nav className="staff-change-password-nav">

                    <button 
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/staff/dashboard");
                        }}>
                        <span>📊</span>Dashboard
                    </button>

                    <button 
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/staff/profile");
                        }}>
                        <span>👤</span>My Profile
                    </button>

                    <button
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/staff/attendance");
                        }}>
                        <span>📅</span>Attendance
                    </button>

                    <button 
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/staff/complaints");
                        }}>
                        <span>📝</span>Complaints
                    </button>

                    <button 
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/staff/announcements");
                        }}>
                        <span>📢</span>Announcements
                    </button>

                    <button className="active"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/staff/change-password");
                        }}>
                        <span>🔐</span>Change Password
                    </button>

                </nav>

                <button
                    className="staff-change-password-logout"
                    onClick={() => {

                        localStorage.removeItem(
                            "staffToken"
                        );

                        localStorage.removeItem(
                            "staff"
                        );

                        navigate("/staff/login", {
                            replace: true
                        });

                    }}
                >
                    🚪 Logout
                </button>

            </aside>

            {mobileMenuOpen && (
                <div
                    className="staff-mobile-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="staff-change-password-main">

                <div className="staff-mobile-header">

                    <div className="staff-mobile-left">

                        <button
                            className="staff-mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            ☰
                        </button>

                        <div className="staff-mobile-brand">

                            <div className="staff-mobile-brand-icon">
                                🏠
                            </div>

                            <div>
                                <strong>Hostel</strong>
                                <span>Staff Panel</span>
                            </div>

                        </div>

                    </div>

                    <button
                        className="staff-mobile-profile-btn"
                        onClick={() => navigate("/staff/profile")}
                    >
                        👤
                    </button>

                </div>


                {/* HEADER */}

                <header className="staff-change-password-header">

                    <div>

                        <span>
                            ACCOUNT SECURITY
                        </span>

                        <h1>
                            Change Password
                        </h1>

                        <p>
                            Keep your staffistrator account
                            secure by using a strong password.
                        </p>

                    </div>

                    <button
                        className="password-back-btn"
                        onClick={() =>
                            navigate("/staff/profile")
                        }
                    >
                        ← Profile
                    </button>

                </header>


                {/* CONTENT */}

                <section className="staff-change-password-container">


                    {/* PASSWORD CARD */}

                    <div className="staff-change-password-card">

                        <div className="staff-change-password-card-header">

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
                            className="staff-change-password-form"
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
                                            "/staff/profile"
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

                <footer className="staff-change-password-footer">

                    <span>
                        © 2026 Hostel Management System
                    </span>

                    <span>
                        Staff Panel
                    </span>

                </footer>

            </main>

        </div>

    );

}

export default StaffChangePassword;