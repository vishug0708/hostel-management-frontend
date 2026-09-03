import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffDashboard.css";

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

function StaffDashboard() {
    const navigate = useNavigate();
    const [staff, setStaff] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("staffToken");

        if (!token) {
            navigate("/staff/login", { replace: true });
            return;
        }

        const savedStaff = localStorage.getItem("staff");

        if (savedStaff) {
            try {
                setStaff(JSON.parse(savedStaff));
            } catch (error) {
                console.error("Staff data parse error:", error);
            }
        }

        fetchProfile();
    }, [navigate]);

    const fetchProfile = async () => {
        const token = localStorage.getItem("staffToken");

        try {
            const response = await fetch(`${API_URL}/api/staff/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                handleLogout();
                return;
            }

            const data = await response.json();

            if (response.ok && data.success) {
                setStaff(data.staff);
                localStorage.setItem("staff", JSON.stringify(data.staff));

                if (data.staff?.photo) {
                    localStorage.setItem("staffPhoto", getPhotoUrl(data.staff.photo));
                }
            }
        } catch (error) {
            console.error("Staff Profile Error:", error);
        }
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    const handleLogout = () => {
        localStorage.removeItem("staffToken");
        localStorage.removeItem("staff");
        localStorage.removeItem("staffPhoto");
        navigate("/staff/login", { replace: true });
    };

    const profilePhoto = getPhotoUrl(staff?.photo) || localStorage.getItem("staffPhoto");

    return (
        <div className="staff-dashboard-page">
            <aside className={`staff-dashboard-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
                <div className="staff-dashboard-brand">
                    <div className="staff-dashboard-brand-icon">🏠</div>
                    <div>
                        <strong>Hostel</strong>
                        <span>Staff Panel</span>
                    </div>
                </div>

                <nav className="staff-dashboard-nav">
                    <button className="staff-dashboard-nav-item active" onClick={() => { closeMobileMenu(); navigate("/staff/dashboard"); }}>
                        <span>📊</span>Dashboard
                    </button>
                    <button className="staff-dashboard-nav-item" onClick={() => { closeMobileMenu(); navigate("/staff/profile"); }}>
                        <span>👤</span>My Profile
                    </button>
                    <button className="staff-dashboard-nav-item" onClick={() => { closeMobileMenu(); navigate("/staff/attendance"); }}>
                        <span>📅</span>Attendance
                    </button>
                    <button className="staff-dashboard-nav-item" onClick={() => { closeMobileMenu(); navigate("/staff/complaints"); }}>
                        <span>📝</span>Complaints
                    </button>
                    <button className="staff-dashboard-nav-item" onClick={() => { closeMobileMenu(); navigate("/staff/announcements"); }}>
                        <span>📢</span>Announcements
                    </button>
                </nav>

                <button className="staff-dashboard-logout" onClick={handleLogout}>
                    <span>🚪</span>Logout
                </button>
            </aside>

            {mobileMenuOpen && (
                <div className="staff-dashboard-overlay" onClick={closeMobileMenu} />
            )}

            <main className="staff-dashboard-main">
                <div className="staff-dashboard-mobile-header">
                    <button className="staff-dashboard-hamburger" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
                        ☰
                    </button>
                    <div className="staff-dashboard-mobile-brand">
                        <div className="staff-dashboard-brand-icon">🏠</div>
                        <div>
                            <strong>Hostel</strong>
                            <span>Staff Panel</span>
                        </div>
                    </div>
                    <button className="staff-dashboard-mobile-profile" onClick={() => navigate("/staff/profile")}>
                        {profilePhoto ? <img src={profilePhoto} alt="Staff profile" /> : "👤"}
                    </button>
                </div>

                <header className="staff-dashboard-header">
                    <div>
                        <span>STAFF DASHBOARD</span>
                        <h1>Welcome, {staff?.name || "Staff"}</h1>
                        <p>Manage your hostel responsibilities from one place.</p>
                    </div>
                    <button className="staff-dashboard-header-profile" onClick={() => navigate("/staff/profile")}>
                        {profilePhoto ? <img src={profilePhoto} alt="Staff profile" /> : "👤"}
                    </button>
                </header>

                <section className="staff-dashboard-welcome">
                    <div>
                        <span>STAFF ACCOUNT</span>
                        <h2>{staff?.name || "Staff Member"}</h2>
                        <p>{staff?.role || "Staff"} {staff?.staff_id ? `• ${staff.staff_id}` : ""}</p>
                    </div>
                    <div className="staff-dashboard-status">
                        <span className="dot"></span>
                        {String(staff?.status || "active").toLowerCase() === "active" ? "Active" : "Inactive"}
                    </div>
                </section>

                <section className="staff-dashboard-cards">
                    <button onClick={() => navigate("/staff/profile")}>
                        <span>👤</span>
                        <strong>My Profile</strong>
                        <small>View your account information</small>
                    </button>
                    <button onClick={() => navigate("/staff/attendance")}>
                        <span>📅</span>
                        <strong>Attendance</strong>
                        <small>Check attendance information</small>
                    </button>
                    <button onClick={() => navigate("/staff/complaints")}>
                        <span>📝</span>
                        <strong>Complaints</strong>
                        <small>View assigned complaints</small>
                    </button>
                    <button onClick={() => navigate("/staff/announcements")}>
                        <span>📢</span>
                        <strong>Announcements</strong>
                        <small>View hostel announcements</small>
                    </button>
                </section>
            </main>
        </div>
    );
}

export default StaffDashboard;
