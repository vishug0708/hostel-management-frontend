import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {

    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);


    // =====================================================
    // CHECK ADMIN LOGIN
    // =====================================================

    useEffect(() => {

        const token = localStorage.getItem("adminToken");
        const adminData = localStorage.getItem("admin");

        if (!token) {

            navigate("/admin/login", {
                replace: true
            });

            return;
        }

        if (adminData) {

            try {

                setAdmin(
                    JSON.parse(adminData)
                );

            } catch (error) {

                console.error(
                    "Admin data error:",
                    error
                );

            }

        }

    }, [navigate]);


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

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


    return (

        <div className="admin-dashboard">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="admin-sidebar">

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
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        <span>📊</span>
                        Dashboard
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        <span>🎓</span>
                        Students
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate("/admin/rooms")
                        }
                    >
                        <span>🛏️</span>
                        Rooms
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate("/admin/fees")
                        }
                    >
                        <span>💳</span>
                        Fees
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate("/admin/complaints")
                        }
                    >
                        <span>📝</span>
                        Complaints
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate("/admin/announcements")
                        }
                    >
                        <span>📢</span>
                        Announcements
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate("/admin/reports")
                        }
                    >
                        <span>📊</span>
                        Reports
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate("/admin/profile")
                        }
                    >
                        <span>👤</span>
                        Profile
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


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="admin-main">


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
                            👨‍💼
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