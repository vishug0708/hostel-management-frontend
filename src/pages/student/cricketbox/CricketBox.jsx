import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CricketBox.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

function CricketBox() {
    const navigate = useNavigate();

    const [grounds, setGrounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchGrounds = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/api/student/cricket/grounds`
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message ||
                        "Unable to load cricket grounds."
                    );
                }

                setGrounds(data.grounds || []);
            } catch (err) {
                console.error(
                    "Cricket Grounds Error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load cricket grounds."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchGrounds();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("studentToken");
        localStorage.removeItem("student");

        navigate("/student/login", {
            replace: true
        });
    };

    const handleBookNow = (groundId) => {
        navigate(
            `/student/cricket-box/book?ground=${groundId}`
        );
    };

    const handleMyBookings = () => {
        navigate("/student/cricket-box/bookings");
    };

    return (
        <div className="student-cricket-page">

            {/* ================= SIDEBAR ================= */}
            <aside className="student-cricket-sidebar">

                <div className="student-cricket-brand">
                    <div className="student-cricket-brand-icon">
                        🏠
                    </div>

                    <div>
                        <h2>Hostel</h2>
                        <p>Student Portal</p>
                    </div>
                </div>

                <nav className="student-cricket-nav">

                    <button
                        className="student-cricket-nav-item"
                        onClick={() =>
                            navigate("/student/dashboard")
                        }
                    >
                        📊
                        <span>Dashboard</span>
                    </button>

                    <button
                        className="student-cricket-nav-item"
                        onClick={() =>
                            navigate("/student/profile")
                        }
                    >
                        👤
                        <span>My Profile</span>
                    </button>

                    <button
                        className="student-cricket-nav-item"
                        onClick={() =>
                            navigate("/student/room")
                        }
                    >
                        🛏️
                        <span>My Room</span>
                    </button>

                    <button
                        className="student-cricket-nav-item"
                        onClick={() =>
                            navigate("/student/leave")
                        }
                    >
                        📄
                        <span>My Leave</span>
                    </button>

                    <button
                        className="student-cricket-nav-item"
                        onClick={() =>
                            navigate("/student/gatepass")
                        }
                    >
                        🎫
                        <span>Gate Pass</span>
                    </button>

                    <button
                        className="student-cricket-nav-item"
                        onClick={() =>
                            navigate("/student/complaints")
                        }
                    >
                        🛠️
                        <span>Complaints</span>
                    </button>

                    <button
                        className="student-cricket-nav-item"
                        onClick={() =>
                            navigate("/student/fees")
                        }
                    >
                        💰
                        <span>My Fees</span>
                    </button>

                    <button
                        className="student-cricket-nav-item"
                        onClick={() =>
                            navigate("/student/notifications")
                        }
                    >
                        🔔
                        <span>Notifications</span>
                    </button>

                    <button
                        className="student-cricket-nav-item active"
                    >
                        🏏
                        <span>Cricket Box</span>
                    </button>

                </nav>

                <button
                    className="student-cricket-logout"
                    onClick={handleLogout}
                >
                    🚪
                    <span>Logout</span>
                </button>

            </aside>

            {/* ================= MAIN ================= */}
            <main className="student-cricket-main">

                {/* HEADER */}
                <header className="student-cricket-header">

                    <div>
                        <span className="student-cricket-eyebrow">
                            STUDENT PORTAL
                        </span>

                        <h1>Cricket Box</h1>

                        <p>
                            Book a cricket ground and
                            manage your bookings.
                        </p>
                    </div>

                    <button
                        className="student-cricket-my-bookings"
                        onClick={handleMyBookings}
                    >
                        📋 My Bookings
                    </button>

                </header>

                {/* CONTENT */}
                <section className="student-cricket-content">

                    <div className="student-cricket-section-heading">
                        <div>
                            <span>
                                CRICKET FACILITIES
                            </span>

                            <h2>
                                Available Grounds
                            </h2>
                        </div>

                        <span className="student-cricket-ground-count">
                            {grounds.length} Grounds
                        </span>
                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className="student-cricket-message">
                            <div className="student-cricket-loader">
                                ⏳
                            </div>

                            <p>
                                Loading cricket grounds...
                            </p>
                        </div>
                    )}

                    {/* ERROR */}
                    {!loading && error && (
                        <div className="student-cricket-error">
                            <span>⚠️</span>

                            <div>
                                <strong>
                                    Unable to load grounds
                                </strong>

                                <p>
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* EMPTY */}
                    {!loading &&
                        !error &&
                        grounds.length === 0 && (
                            <div className="student-cricket-empty">
                                <div>
                                    🏏
                                </div>

                                <h3>
                                    No Cricket Ground Available
                                </h3>

                                <p>
                                    There are currently no
                                    active cricket grounds
                                    available for booking.
                                </p>
                            </div>
                        )}

                    {/* GROUNDS */}
                    {!loading &&
                        !error &&
                        grounds.length > 0 && (
                            <div className="student-cricket-ground-grid">

                                {grounds.map((ground) => (
                                    <article
                                        className="student-cricket-ground-card"
                                        key={ground.id}
                                    >

                                        <div className="student-cricket-ground-icon">
                                            🏏
                                        </div>

                                        <div className="student-cricket-ground-status">
                                            <span></span>
                                            Available
                                        </div>

                                        <div className="student-cricket-ground-info">

                                            <h3>
                                                {ground.name}
                                            </h3>

                                            <p className="student-cricket-location">
                                                📍{" "}
                                                {ground.location ||
                                                    "Location not specified"}
                                            </p>

                                            <p className="student-cricket-description">
                                                {ground.description ||
                                                    "Cricket ground available for student booking."}
                                            </p>

                                        </div>

                                        <div className="student-cricket-ground-details">

                                            <div>
                                                <span>
                                                    CAPACITY
                                                </span>

                                                <strong>
                                                    {ground.capacity ||
                                                        "N/A"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    PRICE / HOUR
                                                </span>

                                                <strong>
                                                    ₹
                                                    {Number(
                                                        ground.price_per_hour ||
                                                        0
                                                    ).toFixed(2)}
                                                </strong>
                                            </div>

                                        </div>

                                        <div className="student-cricket-ground-time">

                                            <div>
                                                <span>
                                                    OPENING
                                                </span>

                                                <strong>
                                                    {ground.opening_time ||
                                                        "N/A"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    CLOSING
                                                </span>

                                                <strong>
                                                    {ground.closing_time ||
                                                        "N/A"}
                                                </strong>
                                            </div>

                                        </div>

                                        <button
                                            className="student-cricket-book-button"
                                            onClick={() =>
                                                handleBookNow(
                                                    ground.id
                                                )
                                            }
                                        >
                                            Book Now
                                            <span>→</span>
                                        </button>

                                    </article>
                                ))}

                            </div>
                        )}

                </section>

                {/* FOOTER */}
                <footer className="student-cricket-footer">
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
}

export default CricketBox;