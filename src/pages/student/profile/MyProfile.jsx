import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./MyProfile.css";

const MyProfile = () => {
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [menuOpen, setMenuOpen] = useState(false);

    const sidebarRef = useRef(null);
    const mobileMenuButtonRef = useRef(null);

    useEffect(() => {
        document.body.classList.toggle(
            "myprofile-menu-open",
            menuOpen
        );

        if (!menuOpen) {
            return () => {
                document.body.classList.remove("myprofile-menu-open");
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
            document.body.classList.remove("myprofile-menu-open");
        };
    }, [menuOpen]);


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
        const savedStudent = localStorage.getItem("student");

        if (savedStudent) {
            try {
                setStudent(JSON.parse(savedStudent));
            } catch (error) {
                console.error("Invalid saved student data:", error);
            }
        }

        fetchProfile();
    }, []);

    const handleNavigation = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

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

        const normalizedPhoto = String(student.photo).replace(/^\/+/, "");

        if (normalizedPhoto.startsWith("uploads/")) {
            return `${API_URL}/${normalizedPhoto}`;
        }

        return `${API_URL}/uploads/students/${normalizedPhoto}`;
    };

    const profilePhoto = getPhotoUrl();

    if (loading) {
        return (
            <div className="myprofile-layout">

            <header className="myprofile-mobile-header">
                <div className="myprofile-mobile-left">
                    <button
                        ref={mobileMenuButtonRef}
                        type="button"
                        className="myprofile-mobile-menu"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label={
                            menuOpen
                                ? "Close student menu"
                                : "Open student menu"
                        }
                    >
                        ☰
                    </button>

                    <div className="myprofile-mobile-brand">
                        <div className="myprofile-mobile-brand-icon">🏠</div>
                        <div>
                            <strong>Hostel</strong>
                            <span>Student Portal</span>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="myprofile-mobile-photo"
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
                    className="myprofile-mobile-overlay"
                    onPointerDown={() => setMenuOpen(false)}
                />
            )}

            <aside
                ref={sidebarRef}
                className={`myprofile-sidebar ${menuOpen ? "mobile-open" : ""}`}
            >
                <div className="myprofile-brand">
                    <div className="myprofile-brand-icon">🏠</div>
                    <div>
                        <strong>Hostel</strong>
                        <span>Student Portal</span>
                    </div>
                </div>

                <nav className="myprofile-nav">
                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/dashboard")}
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item active"
                        onClick={() => handleNavigation("/student/profile")}
                    >
                        <span>👤</span>
                        <span>My Profile</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/room")}
                    >
                        <span>🛏️</span>
                        <span>My Room</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/leave")}
                    >
                        <span>📄</span>
                        <span>My Leave</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/leave/apply")}
                    >
                        <span>➕</span>
                        <span>Apply Leave</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/gatepass")}
                    >
                        <span>🎫</span>
                        <span>Gate Pass</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/complaints")}
                    >
                        <span>🛠️</span>
                        <span>Complaints</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/fees")}
                    >
                        <span>💰</span>
                        <span>My Fees</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/cricketbox")}
                    >
                        <span>🏏</span>
                        <span>Cricket Box</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/notifications")}
                    >
                        <span>🔔</span>
                        <span>Notifications</span>
                    </button>
                </nav>

                <button
                    type="button"
                    className="myprofile-logout"
                    onClick={handleLogout}
                >
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </aside>

            <main className="myprofile-main">
                <div className="myprofile-desktop-photo">
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


                    <div className="profile-loading">
                        <div className="profile-spinner"></div>
                        <p>Loading profile...</p>
                    </div>

                </main>

            </div>
        );
    }

    return (
        <div className="myprofile-layout">

            <header className="myprofile-mobile-header">
                <div className="myprofile-mobile-left">
                    <button
                        ref={mobileMenuButtonRef}
                        type="button"
                        className="myprofile-mobile-menu"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label={
                            menuOpen
                                ? "Close student menu"
                                : "Open student menu"
                        }
                    >
                        ☰
                    </button>

                    <div className="myprofile-mobile-brand">
                        <div className="myprofile-mobile-brand-icon">🏠</div>
                        <div>
                            <strong>Hostel</strong>
                            <span>Student Portal</span>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="myprofile-mobile-photo"
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
                    className="myprofile-mobile-overlay"
                    onPointerDown={() => setMenuOpen(false)}
                />
            )}

            <aside
                ref={sidebarRef}
                className={`myprofile-sidebar ${menuOpen ? "mobile-open" : ""}`}
            >
                <div className="myprofile-brand">
                    <div className="myprofile-brand-icon">🏠</div>
                    <div>
                        <strong>Hostel</strong>
                        <span>Student Portal</span>
                    </div>
                </div>

                <nav className="myprofile-nav">
                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/dashboard")}
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item active"
                        onClick={() => handleNavigation("/student/profile")}
                    >
                        <span>👤</span>
                        <span>My Profile</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/room")}
                    >
                        <span>🛏️</span>
                        <span>My Room</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/leave")}
                    >
                        <span>📄</span>
                        <span>My Leave</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/leave/apply")}
                    >
                        <span>➕</span>
                        <span>Apply Leave</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/gatepass")}
                    >
                        <span>🎫</span>
                        <span>Gate Pass</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/complaints")}
                    >
                        <span>🛠️</span>
                        <span>Complaints</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/fees")}
                    >
                        <span>💰</span>
                        <span>My Fees</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/cricketbox")}
                    >
                        <span>🏏</span>
                        <span>Cricket Box</span>
                    </button>

                    <button
                        type="button"
                        className="myprofile-nav-item"
                        onClick={() => handleNavigation("/student/notifications")}
                    >
                        <span>🔔</span>
                        <span>Notifications</span>
                    </button>
                </nav>

                <button
                    type="button"
                    className="myprofile-logout"
                    onClick={handleLogout}
                >
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </aside>

            <main className="myprofile-main">
                <div className="myprofile-desktop-photo">
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


                {/* HEADER */}

                <div className="myprofile-header">

                    <div>
                        <p className="myprofile-label">
                            STUDENT PROFILE
                        </p>

                        <h1>My Profile</h1>

                        <p className="myprofile-description">
                            View your personal and hostel information.
                        </p>
                    </div>

                    <div className="myprofile-header-actions">

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
                    <div className="myprofile-alert">

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

                        <section className="myprofile-card">

                            <div className="myprofile-top">

                                <div className="myprofile-photo">

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

                                <div className="myprofile-identity">

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

                                <div className="myprofile-active-badge">
                                    <span></span>
                                    Active
                                </div>

                            </div>

                        </section>

                        {/* PERSONAL INFORMATION */}

                        <section className="myprofile-info-card">

                            <div className="myprofile-section-header">

                                <div>
                                    <p>
                                        PERSONAL INFORMATION
                                    </p>

                                    <h2>
                                        Contact Details
                                    </h2>
                                </div>

                            </div>

                            <div className="myprofile-info-grid">

                                <div className="myprofile-info-item">

                                    <span>
                                        👤 FULL NAME
                                    </span>

                                    <strong>
                                        {student.name ||
                                            "—"}
                                    </strong>

                                </div>

                                <div className="myprofile-info-item">

                                    <span>
                                        🆔 STUDENT ID
                                    </span>

                                    <strong>
                                        {student.id ||
                                            "—"}
                                    </strong>

                                </div>

                                <div className="myprofile-info-item">

                                    <span>
                                        📧 EMAIL ADDRESS
                                    </span>

                                    <strong>
                                        {student.email ||
                                            "—"}
                                    </strong>

                                </div>

                                <div className="myprofile-info-item">

                                    <span>
                                        📱 MOBILE NUMBER
                                    </span>

                                    <strong>
                                        {student.mobile ||
                                            "—"}
                                    </strong>

                                </div>

                                <div className="myprofile-info-item">

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

                        <section className="myprofile-info-card">

                            <div className="myprofile-section-header">

                                <div>
                                    <p>
                                        ACADEMIC INFORMATION
                                    </p>

                                    <h2>
                                        College Details
                                    </h2>
                                </div>

                            </div>

                            <div className="myprofile-info-grid">

                                <div className="myprofile-info-item">

                                    <span>
                                        🏫 COLLEGE
                                    </span>

                                    <strong>
                                        {student.college ||
                                            "—"}
                                    </strong>

                                </div>

                                <div className="myprofile-info-item">

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

                        <section className="myprofile-info-card">

                            <div className="myprofile-section-header">

                                <div>
                                    <p>
                                        HOSTEL INFORMATION
                                    </p>

                                    <h2>
                                        Residence Details
                                    </h2>
                                </div>

                            </div>

                            <div className="myprofile-info-grid">

                                <div className="myprofile-info-item">

                                    <span>
                                        🏠 HOSTEL
                                    </span>

                                    <strong>
                                        {student.hostel ||
                                            "—"}
                                    </strong>

                                </div>

                                <div className="myprofile-info-item">

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

                <footer className="myprofile-footer">

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