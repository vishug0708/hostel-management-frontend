import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./MyProfile.css";

const MyProfile = () => {
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const API_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000";

    const getStudentId = () => {
        const studentData = localStorage.getItem("student");

        if (studentData) {
            try {
                const data = JSON.parse(studentData);
                return data?.id || null;
            } catch (error) {
                console.error("Invalid student data:", error);
            }
        }

        return (
            localStorage.getItem("studentId") ||
            localStorage.getItem("student_id")
        );
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const studentId = getStudentId();

            if (!studentId) {
                setError(
                    "Student session not found. Please login again."
                );
                setLoading(false);
                return;
            }

            const response = await fetch(
                `${API_URL}/api/student/profile/${studentId}`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Failed to fetch profile."
                );
            }

            setStudent(data.student);

            localStorage.setItem(
                "student",
                JSON.stringify(data.student)
            );

        } catch (err) {
            console.error(
                "Student Profile Error:",
                err
            );

            setError(
                err.message ||
                "Failed to load profile."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("studentId");
        localStorage.removeItem("student_id");
        localStorage.removeItem("student");
        localStorage.removeItem("studentToken");

        navigate("/student/login", {
            replace: true
        });
    };

    const getInitials = (name) => {
        if (!name) {
            return "S";
        }

        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    const getPhotoUrl = () => {
        if (!student?.photo) {
            return "";
        }

        if (student.photo.startsWith("http")) {
            return student.photo;
        }

        return `${API_URL}/${student.photo}`;
    };

    if (loading) {
        return (
            <div className="student-profile-layout">

                <aside className="student-profile-sidebar">

                    <div className="student-profile-brand">
                        <div className="student-profile-brand-icon">
                            🏠
                        </div>

                        <div>
                            <h2>Hostel</h2>
                            <p>Student Portal</p>
                        </div>
                    </div>

                </aside>

                <main className="student-profile-main">

                    <div className="profile-loading">
                        <div className="profile-spinner"></div>
                        <p>Loading profile...</p>
                    </div>

                </main>

            </div>
        );
    }

    return (
        <div className="student-profile-layout">

            {/* ================= SIDEBAR ================= */}

            <aside className="student-profile-sidebar">

                <div className="student-profile-brand">

                    <div className="student-profile-brand-icon">
                        🏠
                    </div>

                    <div>
                        <h2>Hostel</h2>
                        <p>Student Portal</p>
                    </div>

                </div>

                <nav className="student-profile-nav">

                    <NavLink
                        to="/student/dashboard"
                        className={({ isActive }) =>
                            `student-profile-nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        📊
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/student/profile"
                        className={({ isActive }) =>
                            `student-profile-nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        👤
                        <span>My Profile</span>
                    </NavLink>

                    <NavLink
                        to="/student/room"
                        className={({ isActive }) =>
                            `student-profile-nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        🛏️
                        <span>My Room</span>
                    </NavLink>

                    <NavLink
                        to="/student/leave"
                        className={({ isActive }) =>
                            `student-profile-nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        📄
                        <span>My Leave</span>
                    </NavLink>

                    <NavLink
                        to="/student/leave/apply"
                        className={({ isActive }) =>
                            `student-profile-nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        ➕
                        <span>Apply Leave</span>
                    </NavLink>

                    <NavLink
                        to="/student/gate-pass"
                        className={({ isActive }) =>
                            `student-profile-nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        🎫
                        <span>Gate Pass</span>
                    </NavLink>

                    <NavLink
                        to="/student/complaints"
                        className={({ isActive }) =>
                            `student-profile-nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        🛠️
                        <span>Complaints</span>
                    </NavLink>

                    <NavLink
                        to="/student/fees"
                        className={({ isActive }) =>
                            `student-profile-nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        💰
                        <span>My Fees</span>
                    </NavLink>

                    <NavLink
                        to="/student/notifications"
                        className={({ isActive }) =>
                            `student-profile-nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        🔔
                        <span>Notifications</span>
                    </NavLink>

                </nav>

                <button
                    className="student-profile-logout"
                    onClick={handleLogout}
                >
                    🚪
                    <span>Logout</span>
                </button>

            </aside>

            {/* ================= MAIN ================= */}

            <main className="student-profile-main">

                {/* HEADER */}

                <div className="student-profile-header">

                    <div>
                        <p className="student-profile-label">
                            STUDENT PROFILE
                        </p>

                        <h1>My Profile</h1>

                        <p className="student-profile-description">
                            View your personal and hostel information.
                        </p>
                    </div>

                    <div className="student-profile-header-actions">

                        <button
                            className="profile-refresh-btn"
                            onClick={fetchProfile}
                        >
                            ↻ Refresh
                        </button>

                        <button
                            className="profile-edit-btn"
                            onClick={() =>
                                navigate(
                                    "/student/profile/edit"
                                )
                            }
                        >
                            ✏️ Edit Profile
                        </button>

                    </div>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="student-profile-alert">

                        <span>⚠️</span>

                        <p>{error}</p>

                        <button
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {student && (
                    <>

                        {/* PROFILE TOP CARD */}

                        <section className="student-profile-card">

                            <div className="student-profile-top">

                                <div className="student-profile-photo">

                                    {getPhotoUrl() ? (
                                        <img
                                            src={getPhotoUrl()}
                                            alt={
                                                student.name ||
                                                "Student"
                                            }
                                        />
                                    ) : (
                                        <span>
                                            {getInitials(
                                                student.name
                                            )}
                                        </span>
                                    )}

                                </div>

                                <div className="student-profile-identity">

                                    <p>STUDENT</p>

                                    <h2>
                                        {student.name ||
                                            "Student"}
                                    </h2>

                                    <span>
                                        Student ID:{" "}
                                        {student.id ||
                                            "—"}
                                    </span>

                                </div>

                                <div className="student-active-badge">
                                    <span></span>
                                    Active
                                </div>

                            </div>

                        </section>

                        {/* PERSONAL INFORMATION */}

                        <section className="student-profile-info-card">

                            <div className="student-profile-section-header">

                                <div>
                                    <p>
                                        PERSONAL INFORMATION
                                    </p>

                                    <h2>
                                        Contact Details
                                    </h2>
                                </div>

                            </div>

                            <div className="student-profile-info-grid">

                                <div className="student-profile-info-item">

                                    <span>
                                        👤 FULL NAME
                                    </span>

                                    <strong>
                                        {student.name ||
                                            "—"}
                                    </strong>

                                </div>

                                <div className="student-profile-info-item">

                                    <span>
                                        🆔 STUDENT ID
                                    </span>

                                    <strong>
                                        {student.id ||
                                            "—"}
                                    </strong>

                                </div>

                                <div className="student-profile-info-item">

                                    <span>
                                        📧 EMAIL ADDRESS
                                    </span>

                                    <strong>
                                        {student.email ||
                                            "—"}
                                    </strong>

                                </div>

                                <div className="student-profile-info-item">

                                    <span>
                                        📱 MOBILE NUMBER
                                    </span>

                                    <strong>
                                        {student.mobile ||
                                            "—"}
                                    </strong>

                                </div>

                                <div className="student-profile-info-item">

                                    <span>
                                        👨‍👩‍👦 PARENT EMAIL
                                    </span>

                                    <strong>
                                        {student.parent_email ||
                                            "—"}
                                    </strong>

                                </div>

                            </div>

                        </section>

                        {/* ACADEMIC INFORMATION */}

                        <section className="student-profile-info-card">

                            <div className="student-profile-section-header">

                                <div>
                                    <p>
                                        ACADEMIC INFORMATION
                                    </p>

                                    <h2>
                                        College Details
                                    </h2>
                                </div>

                            </div>

                            <div className="student-profile-info-grid">

                                <div className="student-profile-info-item">

                                    <span>
                                        🏫 COLLEGE
                                    </span>

                                    <strong>
                                        {student.college ||
                                            "—"}
                                    </strong>

                                </div>

                                <div className="student-profile-info-item">

                                    <span>
                                        📚 COURSE
                                    </span>

                                    <strong>
                                        {student.course ||
                                            "—"}
                                    </strong>

                                </div>

                            </div>

                        </section>

                        {/* HOSTEL INFORMATION */}

                        <section className="student-profile-info-card">

                            <div className="student-profile-section-header">

                                <div>
                                    <p>
                                        HOSTEL INFORMATION
                                    </p>

                                    <h2>
                                        Residence Details
                                    </h2>
                                </div>

                            </div>

                            <div className="student-profile-info-grid">

                                <div className="student-profile-info-item">

                                    <span>
                                        🏠 HOSTEL
                                    </span>

                                    <strong>
                                        {student.hostel ||
                                            "—"}
                                    </strong>

                                </div>

                                <div className="student-profile-info-item">

                                    <span>
                                        💰 HOSTEL FEE
                                    </span>

                                    <strong>
                                        {student.hostel_fee !==
                                        null &&
                                        student.hostel_fee !==
                                        undefined
                                            ? `₹ ${student.hostel_fee}`
                                            : "—"}
                                    </strong>

                                </div>

                            </div>

                        </section>

                    </>
                )}

                <footer className="student-profile-footer">

                    <span>
                        © 2026 Hostel Management System
                    </span>

                    <span>
                        Student Portal
                    </span>

                </footer>

            </main>

        </div>
    );
};

export default MyProfile;