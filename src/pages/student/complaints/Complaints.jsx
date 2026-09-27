import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Complaints.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const menuItems = [
    { label: "Dashboard", icon: "📊", path: "/student/dashboard" },
    { label: "My Profile", icon: "👤", path: "/student/profile" },
    { label: "My Room", icon: "🛏️", path: "/student/room" },
    { label: "My Leave", icon: "📝", path: "/student/leaves" },
    { label: "Apply Leave", icon: "➕", path: "/student/apply-leave" },
    { label: "Gate Pass", icon: "🎫", path: "/student/gatepass" },
    { label: "Complaints", icon: "📩", path: "/student/complaints" },
    { label: "My Fees", icon: "💰", path: "/student/fees" },
    { label: "Cricket Box", icon: "🏏", path: "/student/cricket-box/bookings" },
    { label: "Notifications", icon: "🔔", path: "/student/notifications" }
];

const getPhotoUrl = (photo) => {
    if (!photo) return "";
    const value = String(photo).trim();
    if (value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http://") || value.startsWith("https://")) return value;
    const normalized = value.replace(/^\/+/, "");
    if (normalized.startsWith("uploads/")) return `${API_URL}/${normalized}`;
    return `${API_URL}/uploads/students/${normalized}`;
};

const getStatusClass = (status) => {
    const value = String(status || "Submitted").toLowerCase();
    if (value === "closed") return "closed";
    if (value.includes("otp") || value.includes("resolution") || value.includes("progress")) return "progress";
    if (value.includes("assigned")) return "assigned";
    return "submitted";
};

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const Complaints = () => {
    const navigate = useNavigate();
    const sidebarRef = useRef(null);
    const mobileMenuButtonRef = useRef(null);
    const [student, setStudent] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        document.title = "My Complaints | Hostel Management System";
        fetchComplaints();
    }, []);

    useEffect(() => {
        document.body.classList.toggle("student-complaints-menu-open", mobileMenuOpen);
        return () => document.body.classList.remove("student-complaints-menu-open");
    }, [mobileMenuOpen]);

    useEffect(() => {
        if (!mobileMenuOpen) return;
        const handleOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && mobileMenuButtonRef.current && !mobileMenuButtonRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener("pointerdown", handleOutside, true);
        return () => document.removeEventListener("pointerdown", handleOutside, true);
    }, [mobileMenuOpen]);

    const getToken = () => localStorage.getItem("studentToken") || localStorage.getItem("token");

    const getStudentId = (studentData) => studentData?.id || studentData?.student_id || null;

    const fetchComplaints = async () => {
        const token = getToken();
        const storedStudent = localStorage.getItem("student");
        let studentData = null;
        try {
            studentData = storedStudent ? JSON.parse(storedStudent) : null;
        } catch {
            studentData = null;
        }
        setStudent(studentData);

        const studentId = getStudentId(studentData);
        if (!token || !studentId) {
            setLoading(false);
            setError("Student login session not found. Please login again.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const response = await fetch(`${API_URL}/api/student/complaints/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.status === 401) {
                localStorage.removeItem("studentToken");
                localStorage.removeItem("token");
                localStorage.removeItem("student");
                navigate("/student/login", { replace: true });
                return;
            }
            if (!response.ok || !data.success) throw new Error(data.message || "Failed to load complaints.");
            setComplaints(Array.isArray(data.complaints) ? data.complaints : []);
        } catch (err) {
            console.error("Student Complaints Error:", err);
            setError(err.message || "Unable to load complaints.");
        } finally {
            setLoading(false);
        }
    };

    const navigateTo = (path) => {
        setMobileMenuOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        setMobileMenuOpen(false);
        localStorage.removeItem("studentToken");
        localStorage.removeItem("token");
        localStorage.removeItem("student");
        navigate("/student/login", { replace: true });
    };

    const total = complaints.length;
    const inProgress = complaints.filter((item) => ["Assigned", "In Progress", "Resolution Pending", "OTP Verification"].includes(item.status)).length;
    const closed = complaints.filter((item) => item.status === "Closed").length;
    const photo = getPhotoUrl(student?.photo);
    const initials = String(student?.name || "Student").split(" ").map((part) => part.charAt(0)).join("").substring(0, 2).toUpperCase();

    return (
        <div className="student-complaints-page">
            <aside ref={sidebarRef} className={`student-dashboard-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
                <div className="student-dashboard-brand">
                    <div className="student-dashboard-brand-icon">🏠</div>
                    <div>
                        <strong>Hostel</strong>
                        <span>Student Portal</span>
                    </div>
                </div>
                <nav className="student-dashboard-nav">
                    {menuItems.map((item) => (
                        <button key={item.path} className={item.label === "Complaints" ? "active" : ""} onClick={() => navigateTo(item.path)}>
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <button className="student-dashboard-logout" onClick={handleLogout}>
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </aside>

            {mobileMenuOpen && <div className="student-dashboard-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}

            <main className="student-complaints-main">
                <div className="student-dashboard-mobile-topbar">
                    <button ref={mobileMenuButtonRef} type="button" className="student-dashboard-mobile-menu-btn" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Open student menu">☰</button>
                    <div className="student-dashboard-mobile-brand">
                        <div className="student-dashboard-mobile-brand-icon">🏠</div>
                        <div><strong>Hostel</strong><span>Student Portal</span></div>
                    </div>
                    <div className="student-dashboard-mobile-photo">
                        {photo ? <img src={photo} alt="Student" /> : <span>{initials}</span>}
                    </div>
                </div>

                <header className="student-complaints-header">
                    <div>
                        <span className="student-complaints-eyebrow">HOSTEL SERVICES</span>
                        <h1>My Complaints</h1>
                        <p>Raise a complaint and track its resolution status.</p>
                    </div>
                    <div className="student-complaints-header-actions">
                        <button className="student-complaints-refresh" onClick={fetchComplaints}>↻ Refresh</button>
                        <button className="student-complaints-new-button" onClick={() => navigateTo("/student/complaints/new")}>＋ New Complaint</button>
                        <div className="student-complaints-profile">
                            {photo ? <img src={photo} alt="Student" /> : <span>{initials}</span>}
                        </div>
                    </div>
                </header>

                <section className="student-complaints-content">
                    {error && <div className="student-complaints-error">⚠️ <span>{error}</span><button onClick={fetchComplaints}>Retry</button></div>}

                    <div className="student-complaints-stats">
                        <div className="student-complaints-stat-card"><div className="stat-icon">📩</div><div><span>Total Complaints</span><strong>{total}</strong></div></div>
                        <div className="student-complaints-stat-card"><div className="stat-icon">🔄</div><div><span>In Progress</span><strong>{inProgress}</strong></div></div>
                        <div className="student-complaints-stat-card"><div className="stat-icon">✅</div><div><span>Closed</span><strong>{closed}</strong></div></div>
                    </div>

                    <section className="student-complaints-card">
                        <div className="student-complaints-card-header">
                            <div><h2>Complaint History</h2><p>Track your submitted hostel complaints.</p></div>
                            <button className="student-complaints-new-button compact" onClick={() => navigateTo("/student/complaints/new")}>＋ New Complaint</button>
                        </div>

                        {loading ? (
                            <div className="student-complaints-empty"><div className="student-complaints-loader" /><h3>Loading Complaints</h3><p>Please wait while your complaint history is loaded.</p></div>
                        ) : complaints.length === 0 ? (
                            <div className="student-complaints-empty"><div className="student-complaints-empty-icon">📋</div><h3>No Complaints Yet</h3><p>You haven't raised any complaint yet.</p><button onClick={() => navigateTo("/student/complaints/new")}>Raise New Complaint</button></div>
                        ) : (
                            <div className="student-complaints-list">
                                <div className="student-complaints-table-wrap">
                                    <table>
                                        <thead><tr><th>Complaint</th><th>Category</th><th>Assigned Staff</th><th>Expected Resolution</th><th>Status</th><th>Action</th></tr></thead>
                                        <tbody>
                                            {complaints.map((complaint) => (
                                                <tr key={complaint.id}>
                                                    <td><strong>{complaint.complaint_code || `#${complaint.id}`}</strong><span>{complaint.subject}</span><small>{formatDate(complaint.created_at)}</small></td>
                                                    <td>{complaint.category || "-"}</td>
                                                    <td><strong>{complaint.assigned_staff_name || "Not assigned"}</strong><span>{complaint.assigned_staff_role || "-"}</span></td>
                                                    <td>{complaint.expected_resolution_at ? formatDate(complaint.expected_resolution_at) : "Not set"}</td>
                                                    <td><span className={`student-complaint-status ${getStatusClass(complaint.status)}`}>{complaint.status || "Submitted"}</span></td>
                                                    <td><button className="student-complaints-view-button" onClick={() => navigateTo(`/student/complaints/view/${complaint.id}`)}>View</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="student-complaints-mobile-list">
                                    {complaints.map((complaint) => (
                                        <article key={complaint.id} className="student-complaint-mobile-card">
                                            <div className="mobile-card-top"><strong>{complaint.complaint_code || `#${complaint.id}`}</strong><span className={`student-complaint-status ${getStatusClass(complaint.status)}`}>{complaint.status || "Submitted"}</span></div>
                                            <h3>{complaint.subject}</h3>
                                            <p>{complaint.category || "-"}</p>
                                            <div><span>Assigned Staff</span><strong>{complaint.assigned_staff_name || "Not assigned"}</strong></div>
                                            <div><span>Expected Resolution</span><strong>{complaint.expected_resolution_at ? formatDate(complaint.expected_resolution_at) : "Not set"}</strong></div>
                                            <button onClick={() => navigateTo(`/student/complaints/view/${complaint.id}`)}>View Complaint</button>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </section>
                <footer className="student-complaints-footer"><span>© 2026 Hostel Management System</span><span>Student Portal</span></footer>
            </main>
        </div>
    );
};

export default Complaints;
