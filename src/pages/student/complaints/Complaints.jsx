import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Complaints.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getPhotoUrl = (photo) => {
    if (!photo) return "";

    const value = String(photo).trim();

    if (
        value.startsWith("data:") ||
        value.startsWith("blob:") ||
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    const normalized = value.replace(/^\/+/, "");

    if (normalized.startsWith("uploads/")) {
        return `${API_URL}/${normalized}`;
    }

    return `${API_URL}/uploads/students/${normalized}`;
};

function Complaints() {
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [complaints] = useState([]);
    const [loading] = useState(false);

    let student = {};

    try {
        student = JSON.parse(localStorage.getItem("student") || "{}");
    } catch {
        student = {};
    }

    const token =
        localStorage.getItem("studentToken") ||
        localStorage.getItem("token");

    const studentPhoto = getPhotoUrl(
        student.photo ||
        student.profile_photo ||
        student.student_photo ||
        student.image
    );

    const studentName =
        student.name ||
        student.student_name ||
        "Student";

    useEffect(() => {
        document.title = "My Complaints | Hostel Management System";
    }, []);

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const goTo = (path) => {
        closeSidebar();
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("studentToken");
        localStorage.removeItem("student");
        navigate("/student/login");
    };

    const getInitial = () => {
        return String(studentName).charAt(0).toUpperCase();
    };

    const getStatusClass = (status) => {
        const value = String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "-");

        if (value.includes("closed")) {
            return "student-complaint-status-success";
        }

        if (
            value.includes("resolution") ||
            value.includes("otp") ||
            value.includes("progress")
        ) {
            return "student-complaint-status-progress";
        }

        if (value.includes("assigned")) {
            return "student-complaint-status-assigned";
        }

        return "student-complaint-status-pending";
    };

    const formatDate = (date) => {
        if (!date) return "-";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "-";
        }

        return parsed.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="student-complaints-page">
            {sidebarOpen && (
                <div
                    className="student-complaints-overlay"
                    onClick={closeSidebar}
                />
            )}

            <aside
                className={`student-complaints-sidebar ${
                    sidebarOpen
                        ? "student-complaints-sidebar-open"
                        : ""
                }`}
            >
                <div className="student-complaints-brand">
                    <div className="student-complaints-brand-icon">
                        🏠
                    </div>

                    <div>
                        <strong>Hostel</strong>
                        <span>Student Portal</span>
                    </div>
                </div>

                <nav className="student-complaints-nav">
                    <button
                        className="student-complaints-nav-item"
                        onClick={() => goTo("/student/dashboard")}
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </button>

                    <button
                        className="student-complaints-nav-item"
                        onClick={() => goTo("/student/profile")}
                    >
                        <span>👤</span>
                        <span>My Profile</span>
                    </button>

                    <button
                        className="student-complaints-nav-item"
                        onClick={() => goTo("/student/my-room")}
                    >
                        <span>🛏️</span>
                        <span>My Room</span>
                    </button>

                    <button
                        className="student-complaints-nav-item"
                        onClick={() => goTo("/student/my-leave")}
                    >
                        <span>📄</span>
                        <span>My Leave</span>
                    </button>

                    <button
                        className="student-complaints-nav-item"
                        onClick={() => goTo("/student/apply-leave")}
                    >
                        <span>➕</span>
                        <span>Apply Leave</span>
                    </button>

                    <button
                        className="student-complaints-nav-item"
                        onClick={() => goTo("/student/gatepass")}
                    >
                        <span>🎫</span>
                        <span>Gate Pass</span>
                    </button>

                    <button className="student-complaints-nav-item student-complaints-nav-active">
                        <span>📩</span>
                        <span>Complaints</span>
                    </button>

                    <button
                        className="student-complaints-nav-item"
                        onClick={() => goTo("/student/fees")}
                    >
                        <span>💰</span>
                        <span>My Fees</span>
                    </button>

                    <button
                        className="student-complaints-nav-item"
                        onClick={() => goTo("/student/notifications")}
                    >
                        <span>🔔</span>
                        <span>Notifications</span>
                    </button>

                    <button
                        className="student-complaints-nav-item"
                        onClick={() => goTo("/student/cricketbox")}
                    >
                        <span>🏏</span>
                        <span>Cricket Box</span>
                    </button>
                </nav>

                <button
                    className="student-complaints-logout"
                    onClick={handleLogout}
                >
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </aside>

            <main className="student-complaints-main">
                <header className="student-complaints-topbar">
                    <button
                        className="student-complaints-hamburger"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        ☰
                    </button>

                    <div className="student-complaints-panel-title">
                        <strong>Hostel Student Panel</strong>
                        <span>My Complaints</span>
                    </div>

                    <div className="student-complaints-profile">
                        {studentPhoto ? (
                            <img
                                src={studentPhoto}
                                alt={studentName}
                            />
                        ) : (
                            <div className="student-complaints-photo-fallback">
                                {getInitial()}
                            </div>
                        )}
                    </div>
                </header>

                <div className="student-complaints-content">
                    <div className="student-complaints-heading">
                        <div>
                            <span className="student-complaints-eyebrow">
                                HOSTEL SERVICES
                            </span>

                            <h1>My Complaints</h1>

                            <p>
                                Raise a complaint and track its resolution
                                status.
                            </p>
                        </div>

                        <button
                            className="student-complaints-new-btn"
                            onClick={() =>
                                navigate("/student/complaints/new")
                            }
                        >
                            <span>+</span>
                            New Complaint
                        </button>
                    </div>

                    <div className="student-complaints-info-grid">
                        <div className="student-complaints-info-card">
                            <div className="student-complaints-info-icon">
                                📩
                            </div>

                            <div>
                                <span>Total Complaints</span>
                                <strong>{complaints.length}</strong>
                            </div>
                        </div>

                        <div className="student-complaints-info-card">
                            <div className="student-complaints-info-icon">
                                🔄
                            </div>

                            <div>
                                <span>In Progress</span>
                                <strong>
                                    {
                                        complaints.filter(
                                            (item) =>
                                                String(item.status || "")
                                                    .toLowerCase()
                                                    .includes("progress")
                                        ).length
                                    }
                                </strong>
                            </div>
                        </div>

                        <div className="student-complaints-info-card">
                            <div className="student-complaints-info-icon">
                                ✅
                            </div>

                            <div>
                                <span>Closed</span>
                                <strong>
                                    {
                                        complaints.filter(
                                            (item) =>
                                                String(item.status || "")
                                                    .toLowerCase()
                                                    .includes("closed")
                                        ).length
                                    }
                                </strong>
                            </div>
                        </div>
                    </div>

                    <section className="student-complaints-section">
                        <div className="student-complaints-section-header">
                            <div>
                                <h2>Complaint History</h2>
                                <p>
                                    Track your submitted hostel complaints.
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="student-complaints-empty">
                                <div className="student-complaints-loader" />
                                <h3>Loading complaints...</h3>
                            </div>
                        ) : complaints.length === 0 ? (
                            <div className="student-complaints-empty">
                                <div className="student-complaints-empty-icon">
                                    📋
                                </div>

                                <h3>No Complaints Yet</h3>

                                <p>
                                    You haven't raised any complaint yet.
                                </p>

                                <button
                                    className="student-complaints-empty-btn"
                                    onClick={() =>
                                        navigate(
                                            "/student/complaints/new"
                                        )
                                    }
                                >
                                    Raise New Complaint
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="student-complaints-desktop-table-wrapper">
                                    <table className="student-complaints-table">
                                        <thead>
                                            <tr>
                                                <th>Complaint ID</th>
                                                <th>Subject</th>
                                                <th>Category</th>
                                                <th>Assigned Staff</th>
                                                <th>Expected Resolution</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {complaints.map((complaint) => (
                                                <tr key={complaint.id}>
                                                    <td>
                                                        <strong>
                                                            {complaint.complaint_code ||
                                                                `CMP-${complaint.id}`}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {complaint.subject ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        {complaint.category ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        <div className="student-complaints-staff">
                                                            {complaint.assigned_staff_photo ? (
                                                                <img
                                                                    src={getPhotoUrl(
                                                                        complaint.assigned_staff_photo
                                                                    )}
                                                                    alt={
                                                                        complaint.assigned_staff_name ||
                                                                        "Staff"
                                                                    }
                                                                />
                                                            ) : (
                                                                <div className="student-complaints-staff-fallback">
                                                                    👤
                                                                </div>
                                                            )}

                                                            <div>
                                                                <strong>
                                                                    {complaint.assigned_staff_name ||
                                                                        "Not Assigned"}
                                                                </strong>

                                                                <span>
                                                                    {complaint.assigned_staff_mobile ||
                                                                        ""}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            complaint.expected_resolution_at
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`student-complaint-status ${getStatusClass(
                                                                complaint.status
                                                            )}`}
                                                        >
                                                            {complaint.status ||
                                                                "Submitted"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <button
                                                            className="student-complaints-view-btn"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/student/complaints/${complaint.id}`
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="student-complaints-mobile-list">
                                    {complaints.map((complaint) => (
                                        <div
                                            className="student-complaint-mobile-card"
                                            key={complaint.id}
                                        >
                                            <div className="student-complaint-mobile-top">
                                                <strong>
                                                    {complaint.complaint_code ||
                                                        `CMP-${complaint.id}`}
                                                </strong>

                                                <span
                                                    className={`student-complaint-status ${getStatusClass(
                                                        complaint.status
                                                    )}`}
                                                >
                                                    {complaint.status ||
                                                        "Submitted"}
                                                </span>
                                            </div>

                                            <h3>
                                                {complaint.subject || "-"}
                                            </h3>

                                            <div className="student-complaint-mobile-details">
                                                <div>
                                                    <span>Category</span>
                                                    <strong>
                                                        {complaint.category ||
                                                            "-"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Expected Resolution</span>
                                                    <strong>
                                                        {formatDate(
                                                            complaint.expected_resolution_at
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Assigned Staff</span>
                                                    <strong>
                                                        {complaint.assigned_staff_name ||
                                                            "Not Assigned"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Staff Mobile</span>
                                                    <strong>
                                                        {complaint.assigned_staff_mobile ||
                                                            "-"}
                                                    </strong>
                                                </div>
                                            </div>

                                            <button
                                                className="student-complaints-mobile-view-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/student/complaints/${complaint.id}`
                                                    )
                                                }
                                            >
                                                View Complaint →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </section>
                </div>

                <footer className="student-complaints-footer">
                    <span>© 2026 Hostel Management System</span>
                    <span>Student Portal</span>
                </footer>
            </main>
        </div>
    );
}

export default Complaints;