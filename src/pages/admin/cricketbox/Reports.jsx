import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Reports.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAdminPhotoUrl = (photo) => {
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
    return `${API_URL}/uploads/admins/${normalized}`;
};


function Reports() {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("admin") || "{}");
        } catch {
            return {};
        }
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [report, setReport] = useState({
        summary: {
            totalBookings: 0,
            confirmedBookings: 0,
            pendingBookings: 0,
            completedBookings: 0,
            totalRevenue: 0,
            paidRevenue: 0
        },
        groundReport: [],
        dailyReport: [],
        grounds: []
    });

    const [filters, setFilters] = useState({
        from_date: "",
        to_date: "",
        ground_id: "",
        status: ""
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login", { replace: true });
                return;
            }

            const params = new URLSearchParams();

            if (filters.from_date) {
                params.append("from_date", filters.from_date);
            }

            if (filters.to_date) {
                params.append("to_date", filters.to_date);
            }

            if (filters.ground_id) {
                params.append("ground_id", filters.ground_id);
            }

            if (filters.status) {
                params.append("status", filters.status);
            }

            const response = await fetch(
                `${API_URL}/api/admin/cricket-reports?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch cricket reports."
                );
            }

            setReport({
                summary: data.summary || {
                    totalBookings: 0,
                    confirmedBookings: 0,
                    pendingBookings: 0,
                    completedBookings: 0,
                    totalRevenue: 0,
                    paidRevenue: 0
                },
                groundReport: data.groundReport || [],
                dailyReport: data.dailyReport || [],
                grounds: data.grounds || []
            });
        } catch (err) {
            console.error("Cricket Reports Error:", err);
            setError(
                err.message || "Cannot connect to backend server."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApply = () => {
        fetchReports();
    };

    const handleReset = () => {
        setFilters({
            from_date: "",
            to_date: "",
            ground_id: "",
            status: ""
        });

        setTimeout(() => {
            fetchReports();
        }, 0);
    };

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    };

    const totalGroundBookings = useMemo(() => {
        return report.groundReport.reduce(
            (total, item) =>
                total + Number(item.total_bookings || 0),
            0
        );
    }, [report.groundReport]);

    const bookingPercentage = (value) => {
        if (!totalGroundBookings) return 0;

        return Math.round(
            (Number(value || 0) / totalGroundBookings) * 100
        );
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <div className="cricket-reports-page">

            {/* SIDEBAR */}
            <aside className="cricket-reports-sidebar">
                <div className="cricket-reports-brand">
                    <div className="cricket-reports-logo">
                        🏠
                    </div>

                    <div>
                        <h2>Hostel</h2>
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav className="cricket-reports-nav">
                    <button onClick={() => navigate("/admin/dashboard")}>
                        📊 Dashboard
                    </button>

                    <button onClick={() => navigate("/admin/students")}>
                        🎓 Students
                    </button>

                    <button onClick={() => navigate("/admin/rooms")}>
                        🛏️ Rooms
                    </button>

                    <button onClick={() => navigate("/admin/fees")}>
                        💰 Fees
                    </button>

                    <button onClick={() => navigate("/admin/complaints")}>
                        📝 Complaints
                    </button>

                    <button
                        className="active"
                        onClick={() => navigate("/admin/cricket-box")}
                    >
                        🏏 Cricket Box
                    </button>

                    <button onClick={() => navigate("/admin/profile")}>
                        👤 Profile
                    </button>
                </nav>

                <button
                    className="cricket-reports-logout"
                    onClick={() => {
                        localStorage.removeItem("adminToken");
                        localStorage.removeItem("admin");
                        navigate("/admin/login", {
                            replace: true
                        });
                    }}
                >
                    🚪 Logout
                </button>
            </aside>

            {/* MAIN */}
            <main className="cricket-reports-main">

                <div className="admin-mobile-header">
                    <div className="admin-mobile-left">
                        <button className="admin-mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">☰</button>
                        <div className="admin-mobile-brand">
                            <div className="admin-mobile-brand-icon">🏠</div>
                            <div><strong>Hostel</strong><span>Admin Panel</span></div>
                        </div>
                    </div>
                    <button className="admin-mobile-profile-btn" onClick={() => navigate("/admin/profile")} aria-label="Open profile">
                        {getAdminPhotoUrl(admin?.photo) ? <img src={getAdminPhotoUrl(admin?.photo)} alt="Admin" /> : "👤"}
                    </button>
                </div>

                {/* HEADER */}
                <header className="cricket-reports-header">
                    <div>
                        <span className="cricket-reports-eyebrow">
                            CRICKET BOX MANAGEMENT
                        </span>

                        <h1>Cricket Box Reports</h1>

                        <p>
                            Analyze bookings, revenue and ground
                            performance.
                        </p>
                    </div>

                    <button
                        className="cricket-reports-back"
                        onClick={() =>
                            navigate("/admin/cricket-box")
                        }
                    >
                        ← Back to Grounds
                    </button>
                    <div className="admin-page-user">
                        <button className="admin-page-user-button" onClick={() => navigate("/admin/profile")} aria-label="Open admin profile">
                            {getAdminPhotoUrl(admin?.photo) ? <img src={getAdminPhotoUrl(admin?.photo)} alt="Admin" /> : <span>👤</span>}
                        </button>
                    </div>
                </header>

                {/* FILTERS */}
                <section className="cricket-reports-filters">

                    <div className="cricket-reports-filter-title">
                        <div>
                            <h3>Report Filters</h3>
                            <p>
                                Select a date range, ground or booking status.
                            </p>
                        </div>
                    </div>

                    <div className="cricket-reports-filter-grid">

                        <div>
                            <label>From Date</label>
                            <input
                                type="date"
                                name="from_date"
                                value={filters.from_date}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div>
                            <label>To Date</label>
                            <input
                                type="date"
                                name="to_date"
                                value={filters.to_date}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div>
                            <label>Ground</label>
                            <select
                                name="ground_id"
                                value={filters.ground_id}
                                onChange={handleFilterChange}
                            >
                                <option value="">
                                    All Grounds
                                </option>

                                {report.grounds.map((ground) => (
                                    <option
                                        key={ground.id}
                                        value={ground.id}
                                    >
                                        {ground.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <option value="">
                                    All Status
                                </option>
                                <option value="Pending">
                                    Pending
                                </option>
                                <option value="Confirmed">
                                    Confirmed
                                </option>
                                <option value="Completed">
                                    Completed
                                </option>
                                <option value="Cancelled">
                                    Cancelled
                                </option>
                            </select>
                        </div>

                    </div>

                    <div className="cricket-reports-filter-actions">
                        <button
                            className="report-apply-btn"
                            onClick={handleApply}
                            disabled={loading}
                        >
                            🔍 Apply Filters
                        </button>

                        <button
                            className="report-reset-btn"
                            onClick={handleReset}
                        >
                            ↻ Reset
                        </button>
</div>
                </section>

                {/* ERROR */}
                {error && (
                    <div className="cricket-reports-error">
                        <span>⚠️</span>
                        <p>{error}</p>

                        <button onClick={fetchReports}>
                            Try Again
                        </button>
                    </div>
                )}

                {/* SUMMARY CARDS */}
                <section className="cricket-reports-summary">

                    <div className="report-card">
                        <div className="report-card-icon blue">
                            📋
                        </div>

                        <div>
                            <span>Total Bookings</span>
                            <strong>
                                {report.summary.totalBookings}
                            </strong>
                        </div>
                    </div>

                    <div className="report-card">
                        <div className="report-card-icon green">
                            ✓
                        </div>

                        <div>
                            <span>Confirmed</span>
                            <strong>
                                {report.summary.confirmedBookings}
                            </strong>
                        </div>
                    </div>

                    <div className="report-card">
                        <div className="report-card-icon yellow">
                            ⏳
                        </div>

                        <div>
                            <span>Pending</span>
                            <strong>
                                {report.summary.pendingBookings}
                            </strong>
                        </div>
                    </div>

                    <div className="report-card">
                        <div className="report-card-icon purple">
                            🏆
                        </div>

                        <div>
                            <span>Completed</span>
                            <strong>
                                {report.summary.completedBookings}
                            </strong>
                        </div>
                    </div>

                    <div className="report-card revenue-card">
                        <div className="report-card-icon green">
                            ₹
                        </div>

                        <div>
                            <span>Total Revenue</span>
                            <strong>
                                {formatCurrency(
                                    report.summary.totalRevenue
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="report-card">
                        <div className="report-card-icon teal">
                            💳
                        </div>

                        <div>
                            <span>Paid Revenue</span>
                            <strong>
                                {formatCurrency(
                                    report.summary.paidRevenue
                                )}
                            </strong>
                        </div>
                    </div>

                </section>

                {/* GROUND REPORT */}
                <section className="cricket-report-panel">

                    <div className="cricket-report-panel-header">
                        <div>
                            <span>GROUND PERFORMANCE</span>
                            <h2>Ground-wise Booking Report</h2>
                        </div>
                    </div>

                    {loading ? (
                        <div className="cricket-report-loading">
                            Loading report...
                        </div>
                    ) : report.groundReport.length === 0 ? (
                        <div className="cricket-report-empty">
                            <div>🏏</div>
                            <h3>No Booking Data</h3>
                            <p>
                                No cricket bookings match your selected filters.
                            </p>
                        </div>
                    ) : (
                        <div className="cricket-report-table-wrapper">
                            <table className="cricket-report-table">
                                <thead>
                                    <tr>
                                        <th>Ground</th>
                                        <th>Bookings</th>
                                        <th>Confirmed</th>
                                        <th>Completed</th>
                                        <th>Revenue</th>
                                        <th>Share</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {report.groundReport.map((ground) => (
                                        <tr key={ground.ground_id}>
                                            <td>
                                                <div className="ground-name">
                                                    <span>🏏</span>
                                                    <div>
                                                        <strong>
                                                            {ground.ground_name}
                                                        </strong>

                                                        <small>
                                                            {ground.location ||
                                                                "Location not available"}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <strong>
                                                    {ground.total_bookings}
                                                </strong>
                                            </td>

                                            <td>
                                                {ground.confirmed_bookings}
                                            </td>

                                            <td>
                                                {ground.completed_bookings}
                                            </td>

                                            <td className="revenue-text">
                                                {formatCurrency(
                                                    ground.revenue
                                                )}
                                            </td>

                                            <td>
                                                <div className="share-cell">
                                                    <div className="share-bar">
                                                        <div
                                                            className="share-fill"
                                                            style={{
                                                                width: `${bookingPercentage(
                                                                    ground.total_bookings
                                                                )}%`
                                                            }}
                                                        />
                                                    </div>

                                                    <span>
                                                        {bookingPercentage(
                                                            ground.total_bookings
                                                        )}
                                                        %
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </section>

                {/* DAILY REPORT */}
                <section className="cricket-report-panel">

                    <div className="cricket-report-panel-header">
                        <div>
                            <span>BOOKING ACTIVITY</span>
                            <h2>Daily Booking Report</h2>
                        </div>
                    </div>

                    {report.dailyReport.length === 0 ? (
                        <div className="cricket-report-empty compact">
                            <div>📅</div>
                            <p>No daily booking data available.</p>
                        </div>
                    ) : (
                        <div className="cricket-report-table-wrapper">
                            <table className="cricket-report-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Bookings</th>
                                        <th>Confirmed</th>
                                        <th>Completed</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {report.dailyReport.map((day) => (
                                        <tr key={day.booking_date}>
                                            <td>
                                                {new Date(
                                                    `${day.booking_date}T00:00:00`
                                                ).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric"
                                                    }
                                                )}
                                            </td>

                                            <td>
                                                {day.total_bookings}
                                            </td>

                                            <td>
                                                {day.confirmed_bookings}
                                            </td>

                                            <td>
                                                {day.completed_bookings}
                                            </td>

                                            <td className="revenue-text">
                                                {formatCurrency(
                                                    day.revenue
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </section>

                <footer className="cricket-reports-footer">
                    <span>
                        © 2026 Hostel Management System
                    </span>

                    <span>
                        Cricket Box Reports
                    </span>
                </footer>

            </main>
        </div>
    );
}

export default Reports
                <aside className="cricket-reports-sidebar {mobileMenuOpen ? "mobile-open" : ""}">
                    <div className="cricket-reports-brand">
                        <div className="cricket-reports-brand-icon">🏠</div>
                        <div><strong>Hostel</strong><span>Admin Panel</span></div>
                    </div>
                    <nav className="cricket-reports-nav">
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/dashboard"); }}>📊 Dashboard</button>
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/students"); }}>🎓 Students</button>
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/rooms"); }}>🛏️ Rooms</button>
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/fees"); }}>💳 Fees</button>
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/complaints"); }}>📝 Complaints</button>
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/cricket-box"); }}>🏏 Cricket Box</button>
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/announcements"); }}>📢 Announcements</button>
                        <button className="active" onClick={() => { closeMobileMenu(); navigate("/admin/reports"); }}>📊 Reports</button>
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/profile"); }}>👤 Profile</button>
                    </nav>
                    <button className="cricket-reports-logout" onClick={handleLogout}>🚪 Logout</button>
                </aside>
                {mobileMenuOpen && (
                    <div className="admin-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
                )}
            {/* MAIN */}
            <main className="cricket-reports-main">

                {/* HEADER */}
                <header className="cricket-reports-header">
                    <div>
                        <span className="cricket-reports-eyebrow">
                            CRICKET BOX MANAGEMENT
                        </span>

                        <h1>Cricket Box Reports</h1>

                        <p>
                            Analyze bookings, revenue and ground
                            performance.
                        </p>
                    </div>

                    <button
                        className="cricket-reports-back"
                        onClick={() =>
                            navigate("/admin/cricket-box")
                        }
                    >
                        ← Back to Grounds
                    </button>
                </header>

                {/* FILTERS */}
                <section className="cricket-reports-filters">

                    <div className="cricket-reports-filter-title">
                        <div>
                            <h3>Report Filters</h3>
                            <p>
                                Select a date range, ground or booking status.
                            </p>
                        </div>
                    </div>

                    <div className="cricket-reports-filter-grid">

                        <div>
                            <label>From Date</label>
                            <input
                                type="date"
                                name="from_date"
                                value={filters.from_date}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div>
                            <label>To Date</label>
                            <input
                                type="date"
                                name="to_date"
                                value={filters.to_date}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div>
                            <label>Ground</label>
                            <select
                                name="ground_id"
                                value={filters.ground_id}
                                onChange={handleFilterChange}
                            >
                                <option value="">
                                    All Grounds
                                </option>

                                {report.grounds.map((ground) => (
                                    <option
                                        key={ground.id}
                                        value={ground.id}
                                    >
                                        {ground.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <option value="">
                                    All Status
                                </option>
                                <option value="Pending">
                                    Pending
                                </option>
                                <option value="Confirmed">
                                    Confirmed
                                </option>
                                <option value="Completed">
                                    Completed
                                </option>
                                <option value="Cancelled">
                                    Cancelled
                                </option>
                            </select>
                        </div>

                    </div>

                    <div className="cricket-reports-filter-actions">
                        <button
                            className="report-apply-btn"
                            onClick={handleApply}
                            disabled={loading}
                        >
                            🔍 Apply Filters
                        </button>

                        <button
                            className="report-reset-btn"
                            onClick={handleReset}
                        >
                            ↻ Reset
                        </button>
</div>
                </section>

                {/* ERROR */}
                {error && (
                    <div className="cricket-reports-error">
                        <span>⚠️</span>
                        <p>{error}</p>

                        <button onClick={fetchReports}>
                            Try Again
                        </button>
                    </div>
                )}

                {/* SUMMARY CARDS */}
                <section className="cricket-reports-summary">

                    <div className="report-card">
                        <div className="report-card-icon blue">
                            📋
                        </div>

                        <div>
                            <span>Total Bookings</span>
                            <strong>
                                {report.summary.totalBookings}
                            </strong>
                        </div>
                    </div>

                    <div className="report-card">
                        <div className="report-card-icon green">
                            ✓
                        </div>

                        <div>
                            <span>Confirmed</span>
                            <strong>
                                {report.summary.confirmedBookings}
                            </strong>
                        </div>
                    </div>

                    <div className="report-card">
                        <div className="report-card-icon yellow">
                            ⏳
                        </div>

                        <div>
                            <span>Pending</span>
                            <strong>
                                {report.summary.pendingBookings}
                            </strong>
                        </div>
                    </div>

                    <div className="report-card">
                        <div className="report-card-icon purple">
                            🏆
                        </div>

                        <div>
                            <span>Completed</span>
                            <strong>
                                {report.summary.completedBookings}
                            </strong>
                        </div>
                    </div>

                    <div className="report-card revenue-card">
                        <div className="report-card-icon green">
                            ₹
                        </div>

                        <div>
                            <span>Total Revenue</span>
                            <strong>
                                {formatCurrency(
                                    report.summary.totalRevenue
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="report-card">
                        <div className="report-card-icon teal">
                            💳
                        </div>

                        <div>
                            <span>Paid Revenue</span>
                            <strong>
                                {formatCurrency(
                                    report.summary.paidRevenue
                                )}
                            </strong>
                        </div>
                    </div>

                </section>

                {/* GROUND REPORT */}
                <section className="cricket-report-panel">

                    <div className="cricket-report-panel-header">
                        <div>
                            <span>GROUND PERFORMANCE</span>
                            <h2>Ground-wise Booking Report</h2>
                        </div>
                    </div>

                    {loading ? (
                        <div className="cricket-report-loading">
                            Loading report...
                        </div>
                    ) : report.groundReport.length === 0 ? (
                        <div className="cricket-report-empty">
                            <div>🏏</div>
                            <h3>No Booking Data</h3>
                            <p>
                                No cricket bookings match your selected filters.
                            </p>
                        </div>
                    ) : (
                        <div className="cricket-report-table-wrapper">
                            <table className="cricket-report-table">
                                <thead>
                                    <tr>
                                        <th>Ground</th>
                                        <th>Bookings</th>
                                        <th>Confirmed</th>
                                        <th>Completed</th>
                                        <th>Revenue</th>
                                        <th>Share</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {report.groundReport.map((ground) => (
                                        <tr key={ground.ground_id}>
                                            <td>
                                                <div className="ground-name">
                                                    <span>🏏</span>
                                                    <div>
                                                        <strong>
                                                            {ground.ground_name}
                                                        </strong>

                                                        <small>
                                                            {ground.location ||
                                                                "Location not available"}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <strong>
                                                    {ground.total_bookings}
                                                </strong>
                                            </td>

                                            <td>
                                                {ground.confirmed_bookings}
                                            </td>

                                            <td>
                                                {ground.completed_bookings}
                                            </td>

                                            <td className="revenue-text">
                                                {formatCurrency(
                                                    ground.revenue
                                                )}
                                            </td>

                                            <td>
                                                <div className="share-cell">
                                                    <div className="share-bar">
                                                        <div
                                                            className="share-fill"
                                                            style={{
                                                                width: `${bookingPercentage(
                                                                    ground.total_bookings
                                                                )}%`
                                                            }}
                                                        />
                                                    </div>

                                                    <span>
                                                        {bookingPercentage(
                                                            ground.total_bookings
                                                        )}
                                                        %
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </section>

                {/* DAILY REPORT */}
                <section className="cricket-report-panel">

                    <div className="cricket-report-panel-header">
                        <div>
                            <span>BOOKING ACTIVITY</span>
                            <h2>Daily Booking Report</h2>
                        </div>
                    </div>

                    {report.dailyReport.length === 0 ? (
                        <div className="cricket-report-empty compact">
                            <div>📅</div>
                            <p>No daily booking data available.</p>
                        </div>
                    ) : (
                        <div className="cricket-report-table-wrapper">
                            <table className="cricket-report-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Bookings</th>
                                        <th>Confirmed</th>
                                        <th>Completed</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {report.dailyReport.map((day) => (
                                        <tr key={day.booking_date}>
                                            <td>
                                                {new Date(
                                                    `${day.booking_date}T00:00:00`
                                                ).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric"
                                                    }
                                                )}
                                            </td>

                                            <td>
                                                {day.total_bookings}
                                            </td>

                                            <td>
                                                {day.confirmed_bookings}
                                            </td>

                                            <td>
                                                {day.completed_bookings}
                                            </td>

                                            <td className="revenue-text">
                                                {formatCurrency(
                                                    day.revenue
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </section>

                <footer className="cricket-reports-footer">
                    <span>
                        © 2026 Hostel Management System
                    </span>

                    <span>
                        Cricket Box Reports
                    </span>
                </footer>

            </main>
        </div>
    );
}

export default Reports;