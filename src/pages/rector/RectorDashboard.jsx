import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RectorDashboard.css";

function RectorDashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalStudents: 0,
        pendingLeaves: 0,
        pendingComplaints: 0,
        pendingBookings: 0,
        allocatedRooms: 0,
        availableRooms: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const token = localStorage.getItem("rectorToken");

        if (!token) {
            navigate("/rector/login", {
                replace: true
            });
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/rector/dashboard",
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
                    "Unable to load dashboard."
                );
            }

            setStats({
                totalStudents:
                    data.stats?.totalStudents || 0,
                pendingLeaves:
                    data.stats?.pendingLeaves || 0,
                pendingComplaints:
                    data.stats?.pendingComplaints || 0,
                pendingBookings:
                    data.stats?.pendingBookings || 0,
                allocatedRooms:
                    data.stats?.allocatedRooms || 0,
                availableRooms:
                    data.stats?.availableRooms || 0
            });
        } catch (err) {
            console.error(
                "Rector Dashboard Error:",
                err
            );

            setError(
                err.message ||
                "Cannot connect to backend server."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("rectorToken");
        localStorage.removeItem("rector");

        navigate("/rector/login", {
            replace: true
        });
    };

    return (
        <div className="rector-dashboard-page">

            {/* SIDEBAR */}

            <aside className="rector-dashboard-sidebar">

                <div className="rector-dashboard-brand">

                    <div className="rector-dashboard-brand-icon">
                        🏠
                    </div>

                    <div>
                        <strong>
                            Hostel
                        </strong>

                        <span>
                            Rector Portal
                        </span>
                    </div>

                </div>

                <nav className="rector-dashboard-nav">

                    <button className="active">
                        📊 Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/rooms"
                            )
                        }
                    >
                        🛏️ Manage Rooms
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/rector/gatepass"
                            )
                        }
                    >
                        🎫 Gate Pass
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/rector/leaves"
                            )
                        }
                    >
                        📝 Leave Requests
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/complaints"
                            )
                        }
                    >
                        🛠️ Complaints
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/cricket-box"
                            )
                        }
                    >
                        🏏 Cricket Box
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/attendance"
                            )
                        }
                    >
                        📅 Attendance
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/profile"
                            )
                        }
                    >
                        👤 Profile
                    </button>

                </nav>

                <button
                    className="rector-dashboard-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>

            {/* MAIN */}

            <main className="rector-dashboard-main">

                {/* HEADER */}

                <header className="rector-dashboard-header">

                    <div>

                        <span>
                            RECTOR PORTAL
                        </span>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Manage hostel operations
                            and pending requests.
                        </p>

                    </div>

                    <button
                        className="rector-dashboard-refresh"
                        onClick={
                            fetchDashboardData
                        }
                    >
                        ↻ Refresh
                    </button>

                </header>

                {/* ERROR */}

                {error && (

                    <div className="rector-dashboard-error">

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

                {/* STAT CARDS */}

                <section className="rector-dashboard-stats">

                    <div className="rector-stat-card">

                        <div className="rector-stat-icon students">
                            🎓
                        </div>

                        <div>
                            <span>
                                TOTAL STUDENTS
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : stats.totalStudents}
                            </strong>
                        </div>

                    </div>

                    <div className="rector-stat-card">

                        <div className="rector-stat-icon rooms">
                            🛏️
                        </div>

                        <div>
                            <span>
                                ALLOCATED ROOMS
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : stats.allocatedRooms}
                            </strong>
                        </div>

                    </div>

                    <div className="rector-stat-card">

                        <div className="rector-stat-icon leaves">
                            📋
                        </div>

                        <div>
                            <span>
                                PENDING LEAVES
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : stats.pendingLeaves}
                            </strong>
                        </div>

                    </div>

                    <div className="rector-stat-card">

                        <div className="rector-stat-icon complaints">
                            🛠️
                        </div>

                        <div>
                            <span>
                                PENDING COMPLAINTS
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : stats.pendingComplaints}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* SECONDARY STATS */}

                <section className="rector-dashboard-secondary">

                    <div className="rector-secondary-card">

                        <div>
                            <span>
                                CRICKET BOX REQUESTS
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : stats.pendingBookings}
                            </strong>
                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/rector/cricket-box"
                                )
                            }
                        >
                            View Requests →
                        </button>

                    </div>

                    <div className="rector-secondary-card">

                        <div>
                            <span>
                                AVAILABLE ROOMS
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : stats.availableRooms}
                            </strong>
                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/rector/rooms"
                                )
                            }
                        >
                            Manage Rooms →
                        </button>

                    </div>

                </section>

                {/* QUICK ACTIONS */}

                <section className="rector-dashboard-section">

                    <div className="rector-section-heading">

                        <div>
                            <span>
                                QUICK ACTIONS
                            </span>

                            <h2>
                                Rector Operations
                            </h2>
                        </div>

                    </div>

                    <div className="rector-quick-actions">

                        <button
                            onClick={() =>
                                navigate(
                                    "/rector/rooms"
                                )
                            }
                        >
                            <span>
                                🛏️
                            </span>

                            <div>
                                <strong>
                                    Room Allocation
                                </strong>

                                <small>
                                    Allocate or
                                    deallocate student
                                    rooms
                                </small>
                            </div>

                            <b>
                                →
                            </b>
                        </button>



                        <button
                            onClick={() =>
                                navigate(
                                    "/rector/leaves"
                                )
                            }
                        >
                            <span>
                                📝
                            </span>

                            <div>
                                <strong>
                                    Leave Requests
                                </strong>

                                <small>
                                    Review student
                                    leave requests
                                </small>
                            </div>

                            <b>
                                →
                            </b>
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/rector/complaints"
                                )
                            }
                        >
                            <span>
                                🛠️
                            </span>

                            <div>
                                <strong>
                                    Complaints
                                </strong>

                                <small>
                                    Monitor hostel
                                    complaints
                                </small>
                            </div>

                            <b>
                                →
                            </b>
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/rector/cricket-box"
                                )
                            }
                        >
                            <span>
                                🏏
                            </span>

                            <div>
                                <strong>
                                    Cricket Box
                                </strong>

                                <small>
                                    Approve booking
                                    requests
                                </small>
                            </div>

                            <b>
                                →
                            </b>
                        </button>

                    </div>

                </section>

                {/* PENDING SUMMARY */}

                <section className="rector-dashboard-section">

                    <div className="rector-section-heading">

                        <div>
                            <span>
                                ATTENTION REQUIRED
                            </span>

                            <h2>
                                Pending Requests
                            </h2>
                        </div>

                    </div>

                    <div className="rector-pending-grid">

                        <div
                            className="rector-pending-card"
                            onClick={() =>
                                navigate(
                                    "/rector/leaves"
                                )
                            }
                        >

                            <div className="rector-pending-icon">
                                📝
                            </div>

                            <div>
                                <strong>
                                    Leave Requests
                                </strong>

                                <p>
                                    {
                                        stats.pendingLeaves
                                    } pending
                                </p>
                            </div>

                            <span>
                                →
                            </span>

                        </div>

                        <div
                            className="rector-pending-card"
                            onClick={() =>
                                navigate(
                                    "/rector/cricket-box"
                                )
                            }
                        >

                            <div className="rector-pending-icon">
                                🏏
                            </div>

                            <div>
                                <strong>
                                    Cricket Bookings
                                </strong>

                                <p>
                                    {
                                        stats.pendingBookings
                                    } pending
                                </p>
                            </div>

                            <span>
                                →
                            </span>

                        </div>

                        <div
                            className="rector-pending-card"
                            onClick={() =>
                                navigate(
                                    "/rector/complaints"
                                )
                            }
                        >

                            <div className="rector-pending-icon">
                                🛠️
                            </div>

                            <div>
                                <strong>
                                    Complaints
                                </strong>

                                <p>
                                    {
                                        stats.pendingComplaints
                                    } pending
                                </p>
                            </div>

                            <span>
                                →
                            </span>

                        </div>

                    </div>

                </section>

                {/* FOOTER */}

                <footer className="rector-dashboard-footer">

                    <span>
                        © 2026 Hostel Management System
                    </span>

                    <span>
                        Rector Portal
                    </span>

                </footer>

            </main>

        </div>
    );
}

export default RectorDashboard; 