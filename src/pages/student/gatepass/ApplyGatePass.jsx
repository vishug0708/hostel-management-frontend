import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ApplyGatePass.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ApplyGatePass = () => {
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);

    const [formData, setFormData] = useState({
        destination: "",
        purpose: "",
        out_date: "",
        return_date: "",
        out_time: "",
        return_time: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    const sidebarRef = useRef(null);
    const mobileMenuButtonRef = useRef(null);

    useEffect(() => {
        document.body.classList.toggle(
            "applygatepass-menu-open",
            menuOpen
        );

        if (!menuOpen) {
            return () => {
                document.body.classList.remove("applygatepass-menu-open");
            };
        }

        const handleOutsidePointer = (event) => {
            const sidebar = sidebarRef.current;
            const menuButton = mobileMenuButtonRef.current;

            if (
                sidebar &&
                !sidebar.contains(event.target) &&
                menuButton &&
                !menuButton.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener(
            "pointerdown",
            handleOutsidePointer,
            true
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsidePointer,
                true
            );
            document.body.classList.remove("applygatepass-menu-open");
        };
    }, [menuOpen]);


    useEffect(() => {
        const savedStudent = localStorage.getItem("student");

        if (!savedStudent) {
            setError("Student session not found. Please login again.");
            return;
        }

        try {
            setStudent(JSON.parse(savedStudent));
        } catch (err) {
            console.error("Student session error:", err);
            setError("Invalid student session. Please login again.");
        }
    }, []);

    const getProfilePhoto = () => {
        if (!student?.photo) {
            return "";
        }

        const photo = String(student.photo).trim();

        if (
            photo.startsWith("data:") ||
            photo.startsWith("blob:") ||
            photo.startsWith("http://") ||
            photo.startsWith("https://")
        ) {
            return photo;
        }

        const normalizedPhoto = photo.replace(/^\/+/, "");

        if (normalizedPhoto.startsWith("uploads/")) {
            return `${API_URL}/${normalizedPhoto}`;
        }

        return `${API_URL}/uploads/students/${normalizedPhoto}`;
    };

    const profilePhoto = getProfilePhoto();

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.destination.trim()) {
            setError("Please enter your destination.");
            return;
        }

        if (!formData.purpose.trim()) {
            setError("Please enter the purpose of your gate pass.");
            return;
        }

        if (!formData.out_date) {
            setError("Please select exit date.");
            return;
        }

        if (!formData.return_date) {
            setError("Please select return date.");
            return;
        }

        if (!formData.out_time) {
            setError("Please select exit time.");
            return;
        }

        if (!formData.return_time) {
            setError("Please select return time.");
            return;
        }

        const exitDateTime = new Date(
            `${formData.out_date}T${formData.out_time}`
        );
        const returnDateTime = new Date(
            `${formData.return_date}T${formData.return_time}`
        );

        if (returnDateTime <= exitDateTime) {
            setError("Return date and time must be after exit date and time.");
            return;
        }

        if (formData.return_date < formData.out_date) {
            setError("Return date cannot be before exit date.");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("studentToken");

            if (!student?.id) {
                throw new Error("Student session not found. Please login again.");
            }

            const response = await fetch(
                `${API_URL}/api/student/gatepass/apply`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token
                            ? {
                                  Authorization: `Bearer ${token}`
                              }
                            : {})
                    },
                    body: JSON.stringify({
                        student_id: student.id,
                        destination: formData.destination.trim(),
                        purpose: formData.purpose.trim(),
                        out_date: formData.out_date,
                        return_date: formData.return_date,
                        out_time: formData.out_time,
                        return_time: formData.return_time
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to submit gate pass request."
                );
            }

            setSuccess(
                data.message ||
                    "Gate pass request submitted successfully. OTP has been sent to your parent."
            );

            setFormData({
                destination: "",
                purpose: "",
                out_date: "",
                return_date: "",
                out_time: "",
                return_time: ""
            });

            // OTP verification page
            if (data.gate_pass_id || data.id) {
                const gatePassId = data.gate_pass_id || data.id;

                setTimeout(() => {
                    navigate(`/student/gatepass/verify-otp/${gatePassId}`);
                }, 1000);
            }

        } catch (err) {
            console.error("Apply Gate Pass Error:", err);

            setError(
                err.message || "Failed to submit gate pass request."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleNavigation = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("student");

        navigate("/student/login", {
            replace: true
        });
    };

    return (
        <div className="applygatepass-page">

            <header className="applygatepass-mobile-header">
                <div className="applygatepass-mobile-left">
                    <button
                        ref={mobileMenuButtonRef}
                        type="button"
                        className="applygatepass-mobile-menu"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label={
                            menuOpen
                                ? "Close student menu"
                                : "Open student menu"
                        }
                    >
                        ☰
                    </button>

                    <div className="applygatepass-mobile-brand">
                        <div className="applygatepass-mobile-brand-icon">🏠</div>
                        <div>
                            <strong>Hostel</strong>
                            <span>Student Portal</span>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="applygatepass-mobile-photo"
                    onClick={() => navigate("/student/profile")}
                    aria-label="Open student profile"
                >
                    {profilePhoto ? (
                        <img
                            src={profilePhoto}
                            alt="Student profile"
                            onError={(event) => {
                                event.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        "👤"
                    )}
                </button>
            </header>

            {menuOpen && (
                <div
                    className="applygatepass-mobile-overlay"
                    onPointerDown={() => setMenuOpen(false)}
                />
            )}

            <aside
                ref={sidebarRef}
                className={`applygatepass-sidebar ${menuOpen ? "mobile-open" : ""}`}
            >
                <div className="applygatepass-brand">
                    <div className="applygatepass-brand-icon">🏠</div>
                    <div>
                        <strong>Hostel</strong>
                        <span>Student Portal</span>
                    </div>
                </div>

                <nav className="applygatepass-nav">
                    <button
                        type="button"
                        className="applygatepass-nav-item"
                        onClick={() => handleNavigation("/student/dashboard")}
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </button>

                    <button
                        type="button"
                        className="applygatepass-nav-item"
                        onClick={() => handleNavigation("/student/profile")}
                    >
                        <span>👤</span>
                        <span>My Profile</span>
                    </button>

                    <button
                        type="button"
                        className="applygatepass-nav-item"
                        onClick={() => handleNavigation("/student/room")}
                    >
                        <span>🛏️</span>
                        <span>My Room</span>
                    </button>

                    <button
                        type="button"
                        className="applygatepass-nav-item"
                        onClick={() => handleNavigation("/student/leave")}
                    >
                        <span>📄</span>
                        <span>My Leave</span>
                    </button>

                    <button
                        type="button"
                        className="applygatepass-nav-item"
                        onClick={() => handleNavigation("/student/leave/apply")}
                    >
                        <span>➕</span>
                        <span>Apply Leave</span>
                    </button>

                    <button
                        type="button"
                        className="applygatepass-nav-item active"
                        onClick={() => handleNavigation("/student/gatepass")}
                    >
                        <span>🎫</span>
                        <span>Gate Pass</span>
                    </button>

                    <button
                        type="button"
                        className="applygatepass-nav-item"
                        onClick={() => handleNavigation("/student/complaints")}
                    >
                        <span>🛠️</span>
                        <span>Complaints</span>
                    </button>

                    <button
                        type="button"
                        className="applygatepass-nav-item"
                        onClick={() => handleNavigation("/student/fees")}
                    >
                        <span>💰</span>
                        <span>My Fees</span>
                    </button>

                    <button
                        type="button"
                        className="applygatepass-nav-item"
                        onClick={() => handleNavigation("/student/cricketbox")}
                    >
                        <span>🏏</span>
                        <span>Cricket Box</span>
                    </button>

                    <button
                        type="button"
                        className="applygatepass-nav-item"
                        onClick={() => handleNavigation("/student/notifications")}
                    >
                        <span>🔔</span>
                        <span>Notifications</span>
                    </button>
                </nav>

                <button
                    type="button"
                    className="applygatepass-logout"
                    onClick={handleLogout}
                >
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </aside>

            <main className="applygatepass-main">
                <div className="applygatepass-desktop-photo">
                    <button
                        type="button"
                        onClick={() => navigate("/student/profile")}
                        aria-label="Open student profile"
                    >
                        {profilePhoto ? (
                            <img
                                src={profilePhoto}
                                alt="Student profile"
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            "👤"
                        )}
                    </button>
                </div>

                <div className="apply-mobile-topbar">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open student menu"
                    >
                        ☰
                    </button>
                    <div>
                        <strong>Hostel</strong>
                        <span>Student Portal</span>
                    </div>
                    <span>🎫</span>
                </div>

                {/* HEADER */}

                <div className="applygatepass-header">

                    <div>
                        <span className="applygatepass-eyebrow">
                            GATE PASS
                        </span>

                        <h1>Apply Gate Pass</h1>

                        <p>
                            Submit a gate pass request for going outside
                            the hostel.
                        </p>
                    </div>

                    <button
                        className="applygatepass-back"
                        onClick={() => handleNavigation("/student/gatepass")}
                    >
                        ← My Gate Pass
                    </button>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="applygatepass-alert error">

                        <span>⚠️</span>

                        <span>{error}</span>

                        <button
                            onClick={() => setError("")}
                        >
                            ×
                        </button>

                    </div>
                )}


                {/* SUCCESS */}

                {success && (
                    <div className="applygatepass-alert success">

                        <span>✓</span>

                        <span>{success}</span>

                        <button
                            onClick={() => setSuccess("")}
                        >
                            ×
                        </button>

                    </div>
                )}


                {/* FORM CARD */}

                <section className="applygatepass-card">

                    <div className="applygatepass-card-header">

                        <div className="applygatepass-card-icon">
                            🎫
                        </div>

                        <div>
                            <h2>Gate Pass Request</h2>

                            <p>
                                Fill in the details for your outing.
                            </p>
                        </div>

                    </div>


                    <form
                        className="applygatepass-form"
                        onSubmit={handleSubmit}
                    >

                        {/* STUDENT INFORMATION */}

                        <div className="applygatepass-section">

                            <div className="applygatepass-section-title">
                                👤 Student Information
                            </div>

                            <div className="applygatepass-student-box">

                                <div className="applygatepass-student-avatar">
                                    {student?.photo ? (
                                        <img
                                            src={
                                                student.photo.startsWith(
                                                    "http"
                                                )
                                                    ? student.photo
                                                    : `${API_URL}/${student.photo.replace(
                                                          /^\/+/,
                                                          ""
                                                      )}`
                                            }
                                            alt="Student"
                                        />
                                    ) : (
                                        "👨‍🎓"
                                    )}
                                </div>

                                <div className="applygatepass-student-info">

                                    <strong>
                                        {student?.name || "Student"}
                                    </strong>

                                    <span>
                                        {student?.email ||
                                            "Student email"}
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* DESTINATION */}

                        <div className="applygatepass-section">

                            <div className="applygatepass-section-title">
                                📍 Gate Pass Details
                            </div>

                            <div className="applygatepass-field">

                                <label>
                                    Destination
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="destination"
                                    value={formData.destination}
                                    onChange={handleChange}
                                    placeholder="Enter destination"
                                    maxLength={255}
                                />

                            </div>


                            <div className="applygatepass-field">

                                <label>
                                    Purpose
                                    <span>*</span>
                                </label>

                                <textarea
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    placeholder="Enter reason for going outside"
                                    rows="4"
                                    maxLength={500}
                                />

                            </div>


                            <div className="applygatepass-row">

                                <div className="applygatepass-field">

                                    <label>
                                        Exit Date
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="date"
                                        name="out_date"
                                        value={formData.out_date}
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="applygatepass-field">

                                    <label>
                                        Return Date
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="date"
                                        name="return_date"
                                        value={formData.return_date}
                                        min={
                                            formData.out_date ||
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>


                            <div className="applygatepass-row">

                                <div className="applygatepass-field">

                                    <label>
                                        Exit Time
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="time"
                                        name="out_time"
                                        value={formData.out_time}
                                        onChange={handleChange}
                                    />

                                </div>

                                <div className="applygatepass-field">

                                    <label>
                                        Return Time
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="time"
                                        name="return_time"
                                        value={formData.return_time}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                        </div>


                        {/* PARENT VERIFICATION */}

                        <div className="applygatepass-parent-box">

                            <div className="applygatepass-parent-icon">
                                ✉️
                            </div>

                            <div>

                                <strong>
                                    Parent Verification Required
                                </strong>

                                <p>
                                    An OTP will be sent to your registered
                                    parent's email after submitting this
                                    request.
                                </p>

                            </div>

                        </div>


                        {/* SUBMIT */}

                        <div className="applygatepass-form-footer">

                            <button
                                type="button"
                                className="applygatepass-cancel"
                                onClick={() =>
                                    navigate("/student/gatepass")
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="applygatepass-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Submitting..."
                                    : "Submit Gate Pass"}
                            </button>

                        </div>

                    </form>

                </section>

            </main>

        </div>
    );
};

export default ApplyGatePass;