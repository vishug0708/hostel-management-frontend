import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./VerifyOtp.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const VerifyOtp = () => {
    const navigate = useNavigate();
    const { gatePassId } = useParams();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(60);

    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    const handleNavigation = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("student");
        navigate("/student/login", { replace: true });
    };

    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        setError("");
        setMessage("");

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, event) => {
        if (
            event.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            inputRefs.current[index - 1]?.focus();
        }

        if (
            event.key === "ArrowLeft" &&
            index > 0
        ) {
            inputRefs.current[index - 1]?.focus();
        }

        if (
            event.key === "ArrowRight" &&
            index < 5
        ) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();

        const pastedData = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pastedData) return;

        const newOtp = [...otp];

        pastedData.split("").forEach((digit, index) => {
            newOtp[index] = digit;
        });

        setOtp(newOtp);

        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleVerify = async (event) => {
        event.preventDefault();

        const otpValue = otp.join("");

        if (otpValue.length !== 6) {
            setError("Please enter the complete 6-digit OTP.");
            return;
        }

        if (!gatePassId) {
            setError("Gate pass ID is missing.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/api/student/gatepass/verify-otp/${gatePassId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        otp: otpValue
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "OTP verification failed."
                );
            }

            setMessage(
                data.message ||
                "OTP verified successfully."
            );

            setTimeout(() => {
                navigate("/student/gatepass");
            }, 1200);
        } catch (err) {
            console.error("OTP Verification Error:", err);
            setError(
                err.message ||
                "Failed to verify OTP."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0 || resending) return;

        if (!gatePassId) {
            setError("Gate pass ID is missing.");
            return;
        }

        try {
            setResending(true);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/api/student/gatepass/resend-otp/${gatePassId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to resend OTP."
                );
            }

            setMessage(
                data.message ||
                "A new OTP has been sent to the parent's email."
            );

            setOtp(["", "", "", "", "", ""]);
            setCountdown(60);

            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        } catch (err) {
            console.error("Resend OTP Error:", err);
            setError(
                err.message ||
                "Failed to resend OTP."
            );
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="verify-otp-page">
            <button type="button" className="student-mobile-menu-button" onClick={() => setMenuOpen(true)} aria-label="Open student menu">☰</button>

            <div className={`student-mobile-overlay ${menuOpen ? "show" : ""}`} onClick={() => setMenuOpen(false)} />

            <aside className={`student-sidebar ${menuOpen ? "mobile-open" : ""}`}>
                <div className="student-sidebar-brand">
                    <div className="student-brand-icon">🏠</div>
                    <div><h2>Hostel</h2><span>Student Portal</span></div>
                    <button type="button" className="student-mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close student menu">×</button>
                </div>

                <nav className="student-sidebar-nav">
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() => handleNavigation("/student/dashboard")}
                    >
                        📊
                        <span>Dashboard</span>
                    </button>
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() => handleNavigation("/student/profile")}
                    >
                        👤
                        <span>My Profile</span>
                    </button>
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() => handleNavigation("/student/room")}
                    >
                        🛏️
                        <span>My Room</span>
                    </button>
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() => handleNavigation("/student/leave")}
                    >
                        📄
                        <span>My Leave</span>
                    </button>
                    <button
                        type="button"
                        className="student-nav-item active"
                        onClick={() => handleNavigation("/student/gatepass")}
                    >
                        🎫
                        <span>Gate Pass</span>
                    </button>
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() => handleNavigation("/student/complaints")}
                    >
                        🛠️
                        <span>Complaints</span>
                    </button>
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() => handleNavigation("/student/fees")}
                    >
                        💰
                        <span>My Fees</span>
                    </button>
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() => handleNavigation("/student/notifications")}
                    >
                        🔔
                        <span>Notifications</span>
                    </button>
                </nav>

                <button
                    type="button"
                    className="student-logout-button"
                    onClick={handleLogout}
                >
                    🚪
                    <span>Logout</span>
                </button>
            </aside>

            <main className="verify-otp-main">
                <div className="verify-mobile-topbar">
                    <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open student menu">☰</button>
                    <div><strong>Hostel</strong><span>Student Portal</span></div>
                    <span>🔐</span>
                </div>

            <div className="verify-otp-card">
                <div className="verify-otp-header">
                    <div className="verify-otp-icon">
                        🔐
                    </div>

                    <h1>Verify OTP</h1>

                    <p>
                        Hostel Management System
                    </p>
                </div>

                <div className="verify-otp-body">
                    <div className="verify-otp-title">
                        <h2>Parent Verification</h2>

                        <p>
                            Enter the 6-digit OTP sent to
                            your parent's email address.
                        </p>
                    </div>

                    {error && (
                        <div className="verify-error">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {message && (
                        <div className="verify-success">
                            <span>✓</span>
                            <span>{message}</span>
                        </div>
                    )}

                    <form onSubmit={handleVerify}>
                        <label className="otp-label">
                            ENTER OTP
                        </label>

                        <div
                            className="otp-input-container"
                            onPaste={handlePaste}
                        >
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(element) => {
                                        inputRefs.current[index] =
                                            element;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(event) =>
                                        handleChange(
                                            index,
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={(event) =>
                                        handleKeyDown(
                                            index,
                                            event
                                        )
                                    }
                                    className="otp-input"
                                    autoComplete="one-time-code"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="verify-otp-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Verifying..."
                                : "✓ Verify OTP"}
                        </button>
                    </form>

                    <div className="resend-section">
                        <p>
                            Didn't receive the OTP?
                        </p>

                        {countdown > 0 ? (
                            <span className="resend-timer">
                                Resend OTP in {countdown}s
                            </span>
                        ) : (
                            <button
                                type="button"
                                className="resend-button"
                                onClick={handleResend}
                                disabled={resending}
                            >
                                {resending
                                    ? "Sending..."
                                    : "Resend OTP"}
                            </button>
                        )}
                    </div>

                    <div className="verify-note">
                        <span>🔒</span>
                        <p>
                            OTP verification confirms
                            parent authorization for this
                            gate pass request.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="back-gatepass-button"
                        onClick={() =>
                            navigate(
                                "/student/gatepass"
                            )
                        }
                    >
                        ← Back to Gate Pass
                    </button>
                </div>
            </div>
            </main>
        </div>
    );
};

export default VerifyOtp;