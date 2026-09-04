import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


function AdminDashboard() {

    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getPhotoUrl = (photo) => {
        if (!photo) return "";
        const value = String(photo).trim();
        if (value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http://") || value.startsWith("https://")) return value;
        const normalized = value.replace(/^\/+/, "");
        if (normalized.startsWith("uploads/")) return `${API_URL}/${normalized}`;
        return `${API_URL}/uploads/admins/${normalized}`;
    };


    // =====================================================
    // CHECK ADMIN LOGIN
    // =====================================================

    useEffect(() => {
        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login", {
                replace: true
            });
            return;
        }

        const loadAdminProfile = async () => {
            try {
                const response = await fetch(`${API_URL}/api/admin/profile`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load admin profile");
                }

                const adminData = data.admin || data;

                setAdmin(adminData);

                localStorage.setItem(
                    "admin",
                    JSON.stringify(adminData)
                );
            } catch (error) {
                console.error("Admin profile loading error:", error);

                const savedAdmin = localStorage.getItem("admin");

                if (savedAdmin) {
                    try {
                        setAdmin(JSON.parse(savedAdmin));
                    } catch (parseError) {
                        console.error("Admin data error:", parseError);
                    }
                }
            }
        };

        loadAdminProfile();
    }, [navigate]);

    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {
        setMobileMenuOpen(false);

        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");

        navigate("/admin/login", {
            replace: true
        });
    };


    // =====================================================
    // DASHBOARD CARDS
    // =====================================================

    const dashboardCards = [

        {
            icon: "🎓",
            title: "Students",
            value: "0",
            description: "Manage hostel students",
            path: "/admin/students"
        },

        {
            icon: "🛏️",
            title: "Rooms",
            value: "0",
            description: "Manage hostel rooms",
            path: "/admin/rooms"
        },

        {
            icon: "💳",
            title: "Pending Fees",
            value: "₹0",
            description: "Fees awaiting payment",
            path: "/admin/fees/pending"
        },

        {
            icon: "🎫",
            title: "Gatepasses",
            value: "0",
            description: "Gatepass requests",
            path: "/admin/gatepasses"
        },

        {
            icon: "📢",
            title: "Complaints",
            value: "0",
            description: "Pending complaints",
            path: "/admin/complaints"
        },

        {
            icon: "🔔",
            title: "Announcements",
            value: "0",
            description: "Manage announcements",
            path: "/admin/announcements"
        }

    ];

    // =====================================================
    // MOBILE MENU
    // =====================================================

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };



    return (

        <div className="admin-dashboard">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className={`admin-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>

                <div className="admin-sidebar-brand">

                    <div className="admin-brand-icon">
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


                {/* NAVIGATION */}



                <nav className="admin-sidebar-nav">


                    <button
                        className="sidebar-item active"
                        onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/admin/dashboard");
                        }}
                    >
                        <span>📊</span>
                        Dashboard
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/admin/students");
                        }}
                    >
                        <span>🎓</span>
                        Students
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/admin/rooms");
                        }}
                    >
                        <span>🛏️</span>
                        Rooms
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/admin/fees");
                        }}
                    >
                        <span>💳</span>
                        Fees
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/admin/complaints");
                        }}
                    >
                        <span>📝</span>
                        Complaints
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/admin/cricket-box");
                        }}
                    >
                        <span>🏏</span>
                        Cricket Box
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/admin/announcements");
                        }}
                    >
                        <span>📢</span>
                        Announcements
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/admin/reports");
                        }}
                    >
                        <span>📊</span>
                        Reports
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/admin/profile");
                        }}
                    >
                        <span>👤</span>
                        Profile
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/admin/staff");
                        }}
                    >
                        <span>🧑‍💻</span>
                        Staff
                    </button>

                    <button
                        className="sidebar-item"
                        onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/admin/rectors");
                        }}
                    >
                        <span>🧑‍💻</span>
                        Rector
                    </button>


                </nav>


                {/* LOGOUT */}

                <button
                    className="admin-logout"
                    onClick={handleLogout}
                >
                    <span>🚪</span>
                    Logout
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

            <main className="admin-main">

                {/* MOBILE TOP HEADER */}
                <div className="admin-mobile-header">
                    <div className="admin-mobile-left">
                        <button
                            className="admin-mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open menu"
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
                        aria-label="Open profile"
                    >
                        {admin?.photo ? (
                            <img
                                src={getPhotoUrl(admin.photo)}
                                alt="Admin profile"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                        ) : (
                            "👤"
                        )}
                    </button>
                </div>


                {/* TOPBAR */}

                <header className="admin-topbar">

                    <div>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Welcome back to your hostel
                            management panel.
                        </p>

                    </div>


                    <div className="admin-user">

                        <div className="admin-user-avatar">
                            {admin?.photo ? (
                                <img
                                    src={getPhotoUrl(admin.photo)}
                                    alt="Admin profile"
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                            ) : (
                                "👨‍💼"
                            )}
                        </div>

                        <div className="admin-user-info">

                            <strong>
                                {admin?.name || "Administrator"}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                    </div>

                </header>


                {/* WELCOME BANNER */}

                <section className="admin-welcome">

                    <div>

                        <span>
                            ADMINISTRATION PANEL
                        </span>

                        <h2>
                            Welcome,{" "}
                            {admin?.name || "Administrator"} 👋
                        </h2>

                        <p>
                            Manage students, rooms, fees and
                            hostel operations from one place.
                        </p>

                    </div>

                    <div className="welcome-icon">
                        🏢
                    </div>

                </section>


                {/* STAT CARDS */}

                <section className="admin-stat-grid">

                    {dashboardCards.map(
                        (card, index) => (

                            <button
                                key={index}
                                className="admin-stat-card"
                                onClick={() =>
                                    navigate(card.path)
                                }
                            >

                                <div className="stat-card-top">

                                    <div className="stat-icon">
                                        {card.icon}
                                    </div>

                                    <span>
                                        →
                                    </span>

                                </div>

                                <strong className="stat-value">
                                    {card.value}
                                </strong>

                                <h3>
                                    {card.title}
                                </h3>

                                <p>
                                    {card.description}
                                </p>

                            </button>

                        )
                    )}

                </section>


                {/* QUICK ACTIONS */}

                <section className="admin-section">

                    <div className="admin-section-heading">

                        <div>

                            <span>
                                QUICK ACTIONS
                            </span>

                            <h2>
                                Manage Hostel
                            </h2>

                        </div>

                    </div>


                    <div className="quick-actions">

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/students/add"
                                )
                            }
                        >
                            <span>➕</span>
                            <strong>
                                Add Student
                            </strong>
                            <small>
                                Register new student
                            </small>
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/rooms/add"
                                )
                            }
                        >
                            <span>🛏️</span>
                            <strong>
                                Add Room
                            </strong>
                            <small>
                                Create hostel room
                            </small>
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/rooms/allocate"
                                )
                            }
                        >
                            <span>🔑</span>
                            <strong>
                                Allocate Room
                            </strong>
                            <small>
                                Allocate student room
                            </small>
                        </button>


                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/fees/collect"
                                )
                            }
                        >
                            <span>💰</span>
                            <strong>
                                Collect Fee
                            </strong>
                            <small>
                                Record student payment
                            </small>
                        </button>

                    </div>

                </section>


                {/* RECENT ACTIVITY */}

                <section className="admin-section">

                    <div className="admin-section-heading">

                        <div>

                            <span>
                                RECENT ACTIVITY
                            </span>

                            <h2>
                                Latest Updates
                            </h2>

                        </div>

                        <button>
                            View All
                        </button>

                    </div>


                    <div className="activity-card">

                        <div className="empty-activity">

                            <div>
                                📋
                            </div>

                            <h3>
                                No recent activity
                            </h3>

                            <p>
                                Recent hostel activities will
                                appear here.
                            </p>

                        </div>

                    </div>

                </section>


                {/* FOOTER */}

                <footer className="admin-dashboard-footer">

                    <p>
                        © 2026 Hostel Management System
                    </p>

                    <span>
                        Admin Panel
                    </span>

                </footer>

            </main>

        </div>

    );

}

export default AdminDashboard;