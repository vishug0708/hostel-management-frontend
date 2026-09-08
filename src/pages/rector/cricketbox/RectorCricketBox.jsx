import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RectorCricketBox.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function RectorCricketBox() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({
        pending: 0,
        confirmed: 0,
        rejected: 0,
        completed: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const rector = (() => {
        try {
            return JSON.parse(localStorage.getItem("rector") || "{}");
        } catch {
            return {};
        }
    })();

    useEffect(() => {
        const token = localStorage.getItem("rectorToken");

        if (!token) {
            navigate("/rector/login", { replace: true });
            return;
        }

        fetchCricketStats(token);
    }, [navigate]);

    const fetchCricketStats = async (token) => {
        try {
            setLoading(true);
            setError("");

            /*
             * This page is frontend-ready for the Rector Cricket Box API.
             * The booking approval API will be connected in the next step.
             * Until then the page safely shows zero counts.
             */
            const response = await fetch(
                `${API_URL}/api/rector/cricket-box/stats`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                setStats({
                    pending: 0,
                    confirmed: 0,
                    rejected: 0,
                    completed: 0
                });
                return;
            }

            const data = await response.json();

            if (data.success) {
                setStats({
                    pending: Number(data.stats?.pending || 0),
                    confirmed: Number(data.stats?.confirmed || 0),
                    rejected: Number(data.stats?.rejected || 0),
                    completed: Number(data.stats?.completed || 0)
                });
            }
        } catch (err) {
            console.error("Rector Cricket Box Stats Error:", err);
            setError("");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("rectorToken");
        localStorage.removeItem("rector");
        navigate("/rector/login", { replace: true });
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <div className="rector-cricket-page">
            {mobileMenuOpen && (
                <div
                    className="rector-cricket-overlay"
                    onClick={closeMobileMenu}
                />
            )}

            <aside
                className={`rector-cricket-sidebar ${
                    mobileMenuOpen ? "mobile-open" : ""
                }`}
            >
                <div className="rector-cricket-brand">
                    <div className="rector-cricket-brand-icon">🏠</div>
                    <div>
                        <strong>Hostel</strong>
                        <span>Rector Portal</span>
                    </div>
                </div>

                <nav className="rector-cricket-nav">
                    <button
                        onClick={() => {
                            navigate("/rector/dashboard");
                            closeMobileMenu();
                        }}
                    >
                        📊 Dashboard
                    </button>

                    <button
                        onClick={() => {
                            navigate("/rector/rooms");
                            closeMobileMenu();
                        }}
                    >
                        🛏️ Rooms
                    </button>

                    <button
                        className="active"
                        onClick={() => {
                            navigate("/rector/cricket-box");
                            closeMobileMenu();
                        }}
                    >
                        🏏 Cricket Box
                    </button>

                    <button
                        onClick={() => {
                            navigate("/rector/leaves");
                            closeMobileMenu();
                        }}
                    >
                        📋 Leave Requests
                    </button>

                    <button
                        onClick={() => {
                            navigate("/rector/complaints");
                            closeMobileMenu();
                        }}
                    >
                        🛠️ Complaints
                    </button>
                </nav>

                <button
                    className="rector-cricket-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>
            </aside>

            <main className="rector-cricket-main">
                <header className="rector-cricket-topbar">
                    <button
                        className="rector-cricket-menu-btn"
                        onClick={() =>
                            setMobileMenuOpen((previous) => !previous)
                        }
                        aria-label="Open menu"
                    >
                        ☰
                    </button>

                    <h1>Hostel Rector Panel</h1>

                    <div className="rector-cricket-profile">
                        <div className="rector-cricket-profile-photo">
                            {rector.photo ? (
                                <img
                                    src={
                                        String(rector.photo).startsWith("http")
                                            ? rector.photo
                                            : `${API_URL}/uploads/rectors/${String(
                                                  rector.photo
                                              ).replace(/^\/+/, "")}`
                                    }
                                    alt="Rector"
                                />
                            ) : (
                                "👤"
                            )}
                        </div>
                    </div>
                </header>

                <div className="rector-cricket-content">
                    <div className="rector-cricket-heading">
                        <div>
                            <span>RECTOR OPERATIONS</span>
                            <h2>Cricket Box Management</h2>
                            <p>
                                Review student cricket box booking requests
                                and manage their approval status.
                            </p>
                        </div>

                        <button
                            className="rector-cricket-primary-btn"
                            onClick={() =>
                                navigate("/rector/cricket-box/bookings")
                            }
                        >
                            View All Bookings →
                        </button>
                    </div>

                    {error && (
                        <div className="rector-cricket-error">{error}</div>
                    )}

                    <section className="rector-cricket-stats">
                        <div className="rector-cricket-stat-card">
                            <div className="rector-cricket-stat-icon pending">
                                ⏳
                            </div>
                            <div>
                                <span>PENDING APPROVAL</span>
                                <strong>{loading ? "—" : stats.pending}</strong>
                            </div>
                        </div>

                        <div className="rector-cricket-stat-card">
                            <div className="rector-cricket-stat-icon confirmed">
                                ✓
                            </div>
                            <div>
                                <span>CONFIRMED</span>
                                <strong>
                                    {loading ? "—" : stats.confirmed}
                                </strong>
                            </div>
                        </div>

                        <div className="rector-cricket-stat-card">
                            <div className="rector-cricket-stat-icon rejected">
                                ✕
                            </div>
                            <div>
                                <span>REJECTED</span>
                                <strong>
                                    {loading ? "—" : stats.rejected}
                                </strong>
                            </div>
                        </div>

                        <div className="rector-cricket-stat-card">
                            <div className="rector-cricket-stat-icon completed">
                                🏏
                            </div>
                            <div>
                                <span>COMPLETED</span>
                                <strong>
                                    {loading ? "—" : stats.completed}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <section className="rector-cricket-actions">
                        <div className="rector-cricket-section-title">
                            <span>BOOKING MANAGEMENT</span>
                            <h3>Cricket Box Requests</h3>
                        </div>

                        <div className="rector-cricket-action-grid">
                            <button
                                className="rector-cricket-action-card"
                                onClick={() =>
                                    navigate(
                                        "/rector/cricket-box/bookings?status=Pending%20Approval"
                                    )
                                }
                            >
                                <div>⏳</div>
                                <section>
                                    <strong>Pending Requests</strong>
                                    <p>
                                        Review new student booking requests
                                        waiting for approval.
                                    </p>
                                </section>
                                <b>→</b>
                            </button>

                            <button
                                className="rector-cricket-action-card"
                                onClick={() =>
                                    navigate(
                                        "/rector/cricket-box/bookings?status=Confirmed"
                                    )
                                }
                            >
                                <div>✓</div>
                                <section>
                                    <strong>Confirmed Bookings</strong>
                                    <p>
                                        View bookings approved by the Rector
                                        and waiting for payment.
                                    </p>
                                </section>
                                <b>→</b>
                            </button>

                            <button
                                className="rector-cricket-action-card"
                                onClick={() =>
                                    navigate(
                                        "/rector/cricket-box/bookings?status=Completed"
                                    )
                                }
                            >
                                <div>🏏</div>
                                <section>
                                    <strong>Completed Bookings</strong>
                                    <p>
                                        Check previously completed cricket box
                                        bookings.
                                    </p>
                                </section>
                                <b>→</b>
                            </button>
                        </div>
                    </section>

                    <section className="rector-cricket-info">
                        <div className="rector-cricket-info-icon">ℹ️</div>
                        <div>
                            <strong>Approval Flow</strong>
                            <p>
                                Student creates a booking → Rector reviews the
                                request → Rector approves or rejects → Student
                                completes payment → QR code becomes available
                                after successful payment.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default RectorCricketBox;
