import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SecurityDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SecurityDashboard = () => {
    const navigate = useNavigate();

    const [security, setSecurity] = useState(null);
    const [stats, setStats] = useState({
        totalGatePasses: 0,
        activeGatePasses: 0,
        studentsOutside: 0,
        completedGatePasses: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const savedSecurity = localStorage.getItem("security");

            if (!savedSecurity) {
                setError("Security session not found. Please login again.");
                return;
            }

            const securityData = JSON.parse(savedSecurity);

            setSecurity(securityData);

            const response = await fetch(
                `${API_URL}/api/security/dashboard/${securityData.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "securityToken"
                        )}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch security dashboard."
                );
            }

            if (data.security) {
                setSecurity(data.security);

                localStorage.setItem(
                    "security",
                    JSON.stringify(data.security)
                );
            }

            if (data.stats) {
                setStats(data.stats);
            }

        } catch (err) {
            console.error("Security Dashboard Error:", err);

            setError(
                err.message || "Failed to fetch security dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("securityToken");
        localStorage.removeItem("security");

        navigate("/security/login", {
            replace: true
        });
    };

    const getPhotoUrl = () => {
        if (!security?.photo) {
            return null;
        }

        if (security.photo.startsWith("http")) {
            return security.photo;
        }

        return `${API_URL}/${security.photo.replace(/^\/+/, "")}`;
    };

    return (
        <div className="security-dashboard-page">

            {/* SIDEBAR */}

            <aside className="security-sidebar">

                <div className="security-sidebar-brand">

                    <div className="security-brand-icon">
                        🛡️
                    </div>

                    <div>
                        <h2>Security</h2>
                        <span>Hostel Management</span>
                    </div>

                </div>

                <nav className="security-sidebar-nav">

                    <button
                        className="security-nav-item active"
                        onClick={() =>
                            navigate("/security/dashboard")
                        }
                    >
                        📊
                        <span>Dashboard</span>
                    </button>

                    <button
                        className="security-nav-item"
                        onClick={() =>
                            navigate("/security/gatepass/scan")
                        }
                    >
                        📷
                        <span>Scan Gate Pass</span>
                    </button>

                    <button
                        className="security-nav-item"
                        onClick={() =>
                            navigate("/security/gatepass/exit")
                        }
                    >
                        🚪
                        <span>Allow Exit</span>
                    </button>

                    <button
                        className="security-nav-item"
                        onClick={() =>
                            navigate("/security/gatepass/entry")
                        }
                    >
                        ↩️
                        <span>Allow Entry</span>
                    </button>

                    <button
                        className="security-nav-item"
                        onClick={() =>
                            navigate("/security/profile")
                        }
                    >
                        👤
                        <span>Profile</span>
                    </button>

                </nav>

                <button
                    className="security-logout-button"
                    onClick={handleLogout}
                >
                    🚪
                    <span>Logout</span>
                </button>

            </aside>


            {/* MAIN CONTENT */}

            <main className="security-dashboard-main">

                {/* TOP BAR */}

                <div className="security-dashboard-topbar">

                    {/* PROFILE CARD - TOP LEFT */}

                    <div className="security-profile-card">

                        <div className="security-profile-photo">

                            {getPhotoUrl() ? (
                                <img
                                    src={getPhotoUrl()}
                                    alt="Security"
                                />
                            ) : (
                                <span>🛡️</span>
                            )}

                        </div>

                        <div className="security-profile-info">

                            <strong>
                                {security?.name ||
                                    security?.username ||
                                    "Security"}
                            </strong>

                            <span>
                                Security Guard
                            </span>

                        </div>

                    </div>

                    <button
                        className="security-refresh-button"
                        onClick={fetchDashboard}
                    >
                        ↻ Refresh
                    </button>

                </div>


                {/* PAGE HEADER */}

                <div className="security-page-header">

                    <div>
                        <span className="security-eyebrow">
                            SECURITY PORTAL
                        </span>

                        <h1>Dashboard</h1>

                        <p>
                            Manage gate pass entry and exit activities.
                        </p>
                    </div>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="security-dashboard-error">

                        <span>⚠️</span>

                        <span>{error}</span>

                        <button
                            onClick={() => setError("")}
                        >
                            ×
                        </button>

                    </div>
                )}


                {/* STATS */}

                <div className="security-stats-grid">

                    <div className="security-stat-card">

                        <div className="security-stat-icon blue">
                            🎫
                        </div>

                        <div>
                            <span>Total Gate Passes</span>

                            <strong>
                                {loading
                                    ? "..."
                                    : stats.totalGatePasses}
                            </strong>
                        </div>

                    </div>


                    <div className="security-stat-card">

                        <div className="security-stat-icon green">
                            ✅
                        </div>

                        <div>
                            <span>Active Gate Passes</span>

                            <strong>
                                {loading
                                    ? "..."
                                    : stats.activeGatePasses}
                            </strong>
                        </div>

                    </div>


                    <div className="security-stat-card">

                        <div className="security-stat-icon orange">
                            🚶
                        </div>

                        <div>
                            <span>Students Outside</span>

                            <strong>
                                {loading
                                    ? "..."
                                    : stats.studentsOutside}
                            </strong>
                        </div>

                    </div>


                    <div className="security-stat-card">

                        <div className="security-stat-icon purple">
                            ✔️
                        </div>

                        <div>
                            <span>Completed Passes</span>

                            <strong>
                                {loading
                                    ? "..."
                                    : stats.completedGatePasses}
                            </strong>
                        </div>

                    </div>

                </div>


                {/* QUICK ACTIONS */}

                <section className="security-section">

                    <div className="security-section-header">

                        <div>
                            <span>GATE PASS MANAGEMENT</span>
                            <h2>Quick Actions</h2>
                        </div>

                    </div>


                    <div className="security-action-grid">

                        <button
                            className="security-action-card"
                            onClick={() =>
                                navigate("/security/gatepass/scan")
                            }
                        >

                            <div className="security-action-icon">
                                📷
                            </div>

                            <div>
                                <h3>Scan Gate Pass</h3>
                                <p>
                                    Scan student's QR code.
                                </p>
                            </div>

                            <span>→</span>

                        </button>


                        <button
                            className="security-action-card"
                            onClick={() =>
                                navigate("/security/gatepass/exit")
                            }
                        >

                            <div className="security-action-icon">
                                🚪
                            </div>

                            <div>
                                <h3>Allow Exit</h3>
                                <p>
                                    Verify and allow hostel exit.
                                </p>
                            </div>

                            <span>→</span>

                        </button>


                        <button
                            className="security-action-card"
                            onClick={() =>
                                navigate("/security/gatepass/entry")
                            }
                        >

                            <div className="security-action-icon">
                                ↩️
                            </div>

                            <div>
                                <h3>Allow Entry</h3>
                                <p>
                                    Mark student back in hostel.
                                </p>
                            </div>

                            <span>→</span>

                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
};

export default SecurityDashboard;