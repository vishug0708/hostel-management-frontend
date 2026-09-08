import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./RectorCricketBookings.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getRector = () => {
    try {
        return JSON.parse(localStorage.getItem("rector") || "{}");
    } catch {
        return {};
    }
};

const getRectorPhotoUrl = (photo) => {
    if (!photo) return "";
    const value = String(photo).trim();
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) return value;
    return `${API_URL}/uploads/rectors/${value.replace(/^\/+/, "")}`;
};

const formatDate = (date) => {
    if (!date) return "-";
    const value = String(date);
    const parsed = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (time) => time ? String(time).slice(0, 5) : "-";

function RectorCricketBookings() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [status, setStatus] = useState(new URLSearchParams(location.search).get("status") || "All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const rector = getRector();

    useEffect(() => {
        const token = localStorage.getItem("rectorToken");
        if (!token) {
            navigate("/rector/login", { replace: true });
            return;
        }
        fetchBookings(token);
    }, [navigate, status]);

    const fetchBookings = async (token) => {
        try {
            setLoading(true);
            setError("");
            const query = status !== "All" ? `?status=${encodeURIComponent(status)}` : "";
            const response = await fetch(`${API_URL}/api/rector/cricket-box/bookings${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Unable to load bookings.");
            setBookings(Array.isArray(data.bookings) ? data.bookings : []);
        } catch (err) {
            console.error("Rector Cricket Bookings Error:", err);
            setError(err.message || "Unable to load bookings.");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("rectorToken");
        localStorage.removeItem("rector");
        navigate("/rector/login", { replace: true });
    };

    const changeStatus = (value) => {
        setStatus(value);
        navigate(value === "All" ? "/rector/cricket-box/bookings" : `/rector/cricket-box/bookings?status=${encodeURIComponent(value)}`, { replace: true });
    };

    const badgeClass = (value) => String(value || "").toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="rector-cricket-bookings-page">
            {mobileMenuOpen && <div className="rector-cricket-bookings-overlay" onClick={() => setMobileMenuOpen(false)} />}
            <aside className={`rector-cricket-bookings-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
                <div className="rector-cricket-bookings-brand">
                    <div>🏠</div>
                    <section><strong>Hostel</strong><span>Rector Portal</span></section>
                </div>
                <nav>
                    <button onClick={() => navigate("/rector/dashboard")}>📊 Dashboard</button>
                    <button onClick={() => navigate("/rector/rooms")}>🛏️ Rooms</button>
                    <button className="active" onClick={() => navigate("/rector/cricket-box")}>🏏 Cricket Box</button>
                    <button onClick={() => navigate("/rector/leaves")}>📋 Leave Requests</button>
                    <button onClick={() => navigate("/rector/complaints")}>🛠️ Complaints</button>
                </nav>
                <button className="rector-cricket-bookings-logout" onClick={logout}>🚪 Logout</button>
            </aside>

            <main className="rector-cricket-bookings-main">
                <header className="rector-cricket-bookings-topbar">
                    <button className="rector-cricket-bookings-menu" onClick={() => setMobileMenuOpen(v => !v)}>☰</button>
                    <h1>Hostel Rector Panel</h1>
                    <div className="rector-cricket-bookings-photo">
                        {rector.photo ? <img src={getRectorPhotoUrl(rector.photo)} alt="Rector" /> : "👤"}
                    </div>
                </header>

                <div className="rector-cricket-bookings-content">
                    <div className="rector-cricket-bookings-title">
                        <div><span>CRICKET BOX</span><h2>Booking Requests</h2><p>Review and manage student cricket box bookings.</p></div>
                        <button onClick={() => navigate("/rector/cricket-box")}>← Back</button>
                    </div>

                    <div className="rector-cricket-bookings-filters">
                        {["All", "Pending Approval", "Confirmed", "Rejected", "Completed"].map(item => (
                            <button key={item} className={status === item ? "selected" : ""} onClick={() => changeStatus(item)}>{item}</button>
                        ))}
                    </div>

                    {error && <div className="rector-cricket-bookings-error">{error}</div>}

                    <div className="rector-cricket-bookings-table-wrap">
                        {loading ? <div className="rector-cricket-bookings-empty">Loading bookings...</div> :
                            bookings.length === 0 ? <div className="rector-cricket-bookings-empty">No cricket bookings found.</div> :
                            <table>
                                <thead><tr><th>Booking</th><th>Student</th><th>Ground</th><th>Date</th><th>Time</th><th>Amount</th><th>Payment</th><th>Status</th><th>Action</th></tr></thead>
                                <tbody>
                                    {bookings.map(booking => (
                                        <tr key={booking.id || booking.booking_id}>
                                            <td>#{booking.id || booking.booking_id}</td>
                                            <td><strong>{booking.student_name || "-"}</strong><small>{booking.student_email || booking.email || ""}</small></td>
                                            <td>{booking.ground_name || "-"}</td>
                                            <td>{formatDate(booking.booking_date)}</td>
                                            <td>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</td>
                                            <td>₹{Number(booking.total_amount || 0).toFixed(2)}</td>
                                            <td><span className={`status-badge ${badgeClass(booking.payment_status)}`}>{booking.payment_status || "Pending"}</span></td>
                                            <td><span className={`status-badge ${badgeClass(booking.booking_status)}`}>{booking.booking_status || "-"}</span></td>
                                            <td><button className="view-btn" onClick={() => navigate(`/rector/cricket-box/bookings/${booking.id || booking.booking_id}`)}>View</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default RectorCricketBookings;
