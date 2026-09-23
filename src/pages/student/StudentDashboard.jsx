import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudentDashboard = () => {
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [room, setRoom] = useState(null);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const sidebarRef = useRef(null);
    const mobileMenuButtonRef = useRef(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    useEffect(() => {
        document.body.classList.toggle(
            "student-dashboard-menu-open",
            mobileMenuOpen
        );

        return () => {
            document.body.classList.remove(
                "student-dashboard-menu-open"
            );
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        if (!mobileMenuOpen) {
            return;
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
                setMobileMenuOpen(false);
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
        };
    }, [mobileMenuOpen]);

    const fetchDashboard = async () => {
        const token = localStorage.getItem("studentToken");
        const storedStudent = localStorage.getItem("student");

        if (!token) {
            navigate("/student/login", {
                replace: true
            });
            return;
        }

        try {
            if (storedStudent) {
                setStudent(JSON.parse(storedStudent));
            }

            const studentData = storedStudent
                ? JSON.parse(storedStudent)
                : null;

            if (!studentData?.id) {
                setLoading(false);
                return;
            }

            const response = await fetch(
                `${API_URL}/api/student/dashboard/${studentData.id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Failed to load dashboard."
                );
            }

            setStudent(data.student || studentData);
            setRoom(data.room || null);
            setLeaveRequests(
                data.leaveRequests || []
            );

            localStorage.setItem(
                "student",
                JSON.stringify(
                    data.student || studentData
                )
            );

        } catch (err) {
            console.error(
                "Student Dashboard Error:",
                err
            );

            setError(
                err.message ||
                "Unable to load dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setMobileMenuOpen(false);
        localStorage.removeItem("studentToken");
        localStorage.removeItem("student");

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

    const handleNavigation = (path) => {
        setMobileMenuOpen(false);
        navigate(path);
    };

    const getStatusClass = (status) => {
        if (!status) {
            return "";
        }

        return String(status)
            .toLowerCase()
            .replace(/\s+/g, "-");
    };

    return (
        <div className="student-dashboard-page">

            {/* ================= SIDEBAR ================= */}
            <aside
                ref={sidebarRef}
                className={`student-dashboard-sidebar ${
                    mobileMenuOpen
                        ? "mobile-open"
                        : ""
                }`}
            >

                <div className="student-dashboard-brand">

                    <div className="student-dashboard-brand-icon">
                        🏠
                    </div>

                    <div>
                        <strong>
                            Hostel
                        </strong>

                        <span>
                            Student Portal
                        </span>
                    </div>

                </div>

                <nav className="student-dashboard-nav">

                    <button
                        className="active"
                        onClick={() =>
                            handleNavigation("/student/dashboard")
                        }
                    >
                        📊 Dashboard
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("/student/profile")
                        }
                    >
                        👤 My Profile
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("/student/room")
                        }
                    >
                        🛏️ My Room
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("/student/leaves")
                        }
                    >
                        📝 My Leave
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("/student/apply-leave")
                        }
                    >
                        ➕ Apply Leave
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("/student/gatepass")
                        }
                    >
                        🚪 Gate Pass
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("/student/complaints")
                        }
                    >
                        🛠️ Complaints
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("/student/fees")
                        }
                    >
                        💰 My Fees
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("/student/cricket-box/bookings")
                        }
                    >
                        🏏 Cricket Box
                    </button>

                    <button
                        onClick={() =>
                            handleNavigation("/student/notifications")
                        }
                    >
                        🔔 Notifications
                    </button>

                </nav>

                <button
                    className="student-dashboard-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>

            {mobileMenuOpen && (
                <div
                    className="student-dashboard-mobile-overlay"
                    onPointerDown={() =>
                        setMobileMenuOpen(false)
                    }
                    onClick={() =>
                        setMobileMenuOpen(false)
                    }
                />
            )}

            {/* ================= MAIN ================= */}
            <main className="student-dashboard-main">

                <div className="student-dashboard-mobile-topbar">

                    <button
                        ref={mobileMenuButtonRef}
                        type="button"
                        className="student-dashboard-mobile-menu-btn"
                        onClick={() =>
                            setMobileMenuOpen((open) => !open)
                        }
                        aria-label={
                            mobileMenuOpen
                                ? "Close student menu"
                                : "Open student menu"
                        }
                    >
                        ☰
                    </button>

                    <div className="student-dashboard-mobile-brand">
                        <div className="student-dashboard-mobile-brand-icon">
                            🏠
                        </div>

                        <div>
                            <strong>
                                Hostel
                            </strong>

                            <span>
                                Student Portal
                            </span>
                        </div>
                    </div>

                    <div className="student-dashboard-mobile-photo">
                        {getPhotoUrl() ? (
                            <img
                                src={getPhotoUrl()}
                                alt="Student"
                            />
                        ) : (
                            <span>
                                {getInitials(
                                    student?.name
                                )}
                            </span>
                        )}
                    </div>

                </div>

                {/* HEADER */}
                <header className="student-dashboard-header">

                    <div>

                        <span className="student-dashboard-eyebrow">
                            STUDENT PORTAL
                        </span>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Welcome back! Here's your hostel overview.
                        </p>

                    </div>

                    <div className="student-dashboard-header-actions">

                        <button
                            className="student-dashboard-refresh"
                            onClick={fetchDashboard}
                        >
                            ↻ Refresh
                        </button>

                        <div className="student-dashboard-profile-photo">
                            {getPhotoUrl() ? (
                                <img
                                    src={getPhotoUrl()}
                                    alt="Student"
                                />
                            ) : (
                                <span>
                                    {getInitials(
                                        student?.name
                                    )}
                                </span>
                            )}
                        </div>

                    </div>

                </header>

                {/* ERROR */}
                {error && (
                    <div className="student-dashboard-error">

                        <span>
                            ⚠️
                        </span>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {/* WELCOME CARD */}
                <section className="student-welcome-card">

                    <div className="student-welcome-content">

                        <div className="student-welcome-avatar">
                            {getInitials(
                                student?.name
                            )}
                        </div>

                        <div>

                            <span>
                                GOOD TO SEE YOU
                            </span>

                            <h2>
                                Hello,{" "}
                                {loading
                                    ? "Student"
                                    : student?.name ||
                                      "Student"}
                                ! 👋
                            </h2>

                            <p>
                                {student?.email ||
                                    "Welcome to your student portal."}
                            </p>

                        </div>

                    </div>

                    <div className="student-welcome-status">

                        <span className="student-online-dot"></span>

                        Active Student

                    </div>

                </section>

                {/* STAT CARDS */}
                <section className="student-dashboard-stats">

                    <div className="student-stat-card">

                        <div className="student-stat-icon room">
                            🛏️
                        </div>

                        <div>

                            <span>
                                MY ROOM
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : room?.room_no ||
                                      room?.room_number ||
                                      "Not Assigned"}
                            </strong>

                            <small>
                                {room
                                    ? `Bed ${room.bed_no || "—"}`
                                    : "No room allocated"}
                            </small>

                        </div>

                    </div>

                    <div className="student-stat-card">

                        <div className="student-stat-icon leave">
                            📝
                        </div>

                        <div>

                            <span>
                                LEAVE REQUESTS
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : leaveRequests.length}
                            </strong>

                            <small>
                                Total requests
                            </small>

                        </div>

                    </div>

                    <div className="student-stat-card">

                        <div className="student-stat-icon status">
                            🟢
                        </div>

                        <div>

                            <span>
                                ACCOUNT STATUS
                            </span>

                            <strong>
                                {student?.status ||
                                    "Active"}
                            </strong>

                            <small>
                                Student account
                            </small>

                        </div>

                    </div>

                    <div className="student-stat-card">

                        <div className="student-stat-icon hostel">
                            🏠
                        </div>

                        <div>

                            <span>
                                HOSTEL
                            </span>

                            <strong>
                                {room?.hostel_name ||
                                    student?.hostel_name ||
                                    "Virtuous"}
                            </strong>

                            <small>
                                Hostel residence
                            </small>

                        </div>

                    </div>

                </section>

                {/* MAIN GRID */}
                <section className="student-dashboard-grid">

                    {/* ROOM CARD */}
                    <div className="student-dashboard-panel">

                        <div className="student-panel-header">

                            <div>

                                <span>
                                    ROOM INFORMATION
                                </span>

                                <h2>
                                    My Room
                                </h2>

                            </div>

                            <button
                                onClick={() =>
                                    navigate("/student/room")
                                }
                            >
                                View →
                            </button>

                        </div>

                        {room ? (
                            <div className="student-room-content">

                                <div className="student-room-number">

                                    <span>
                                        ROOM
                                    </span>

                                    <strong>
                                        {room.room_no ||
                                            room.room_number ||
                                            "—"}
                                    </strong>

                                    <small>
                                        Block{" "}
                                        {room.block || "—"}
                                    </small>

                                </div>

                                <div className="student-room-details">

                                    <div>
                                        <span>
                                            🛏️ BED
                                        </span>

                                        <strong>
                                            Bed{" "}
                                            {room.bed_no ||
                                                room.bedNo ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            🏢 BLOCK
                                        </span>

                                        <strong>
                                            {room.block ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            📅 ALLOCATED
                                        </span>

                                        <strong>
                                            {room.allocation_date ||
                                                "—"}
                                        </strong>
                                    </div>

                                </div>

                            </div>
                        ) : (
                            <div className="student-no-room">

                                <div>
                                    🛏️
                                </div>

                                <h3>
                                    No Room Allocated
                                </h3>

                                <p>
                                    Your room and bed details will
                                    appear here after allocation.
                                </p>

                            </div>
                        )}

                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="student-dashboard-panel">

                        <div className="student-panel-header">

                            <div>

                                <span>
                                    QUICK ACTIONS
                                </span>

                                <h2>
                                    What would you like to do?
                                </h2>

                            </div>

                        </div>

                        <div className="student-quick-actions">

                            <button
                                onClick={() =>
                                    navigate("/student/apply-leave")
                                }
                            >
                                <span>📝</span>
                                <div>
                                    <strong>
                                        Apply Leave
                                    </strong>
                                    <small>
                                        Submit a new leave request
                                    </small>
                                </div>
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/student/gatepass")
                                }
                            >
                                <span>🚪</span>
                                <div>
                                    <strong>
                                        Gate Pass
                                    </strong>
                                    <small>
                                        Apply or view gate pass
                                    </small>
                                </div>
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/student/complaints")
                                }
                            >
                                <span>🛠️</span>
                                <div>
                                    <strong>
                                        Complaint
                                    </strong>
                                    <small>
                                        Report a hostel issue
                                    </small>
                                </div>
                            </button>

                        </div>

                    </div>

                </section>

                {/* LEAVE REQUESTS */}
                <section className="student-dashboard-panel student-leave-panel">

                    <div className="student-panel-header">

                        <div>

                            <span>
                                RECENT ACTIVITY
                            </span>

                            <h2>
                                Leave Requests
                            </h2>

                        </div>

                        <button
                            onClick={() =>
                                navigate("/student/leaves")
                            }
                        >
                            View All →
                        </button>

                    </div>

                    {leaveRequests.length === 0 ? (
                        <div className="student-no-leaves">

                            <div>
                                📋
                            </div>

                            <p>
                                No leave requests found.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/student/apply-leave")
                                }
                            >
                                Apply for Leave
                            </button>

                        </div>
                    ) : (
                        <div className="student-leave-list">

                            {leaveRequests
                                .slice(0, 5)
                                .map((leave) => (
                                    <div
                                        className="student-leave-row"
                                        key={leave.id}
                                    >

                                        <div className="student-leave-icon">
                                            📝
                                        </div>

                                        <div className="student-leave-info">

                                            <strong>
                                                {leave.leave_type ||
                                                    "Leave Request"}
                                            </strong>

                                            <span>
                                                {leave.from_date ||
                                                    "—"}{" "}
                                                →{" "}
                                                {leave.to_date ||
                                                    "—"}
                                            </span>

                                        </div>

                                        <span
                                            className={`student-leave-status ${getStatusClass(
                                                leave.status
                                            )}`}
                                        >
                                            {leave.status ||
                                                "Pending"}
                                        </span>

                                    </div>
                                ))}

                        </div>
                    )}

                </section>

                {/* FOOTER */}
                <footer className="student-dashboard-footer">

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

export default StudentDashboard;