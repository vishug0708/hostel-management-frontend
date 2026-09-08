import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./RectorCricketBookingDetails.css";

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

function RectorCricketBookingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [booking, setBooking] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [remark, setRemark] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const rector = getRector();

    useEffect(() => {
        const token = localStorage.getItem("rectorToken");
        if (!token) {
            navigate("/rector/login", { replace: true });
            return;
        }
        fetchDetails(token);
    }, [id, navigate]);

    const fetchDetails = async (token) => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(`${API_URL}/api/rector/cricket-box/bookings/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Unable to load booking.");
            setBooking(data.booking || null);
            setPlayers(Array.isArray(data.players) ? data.players : []);
            setRemark(data.booking?.rector_remark || "");
        } catch (err) {
            console.error("Rector Cricket Booking Details Error:", err);
            setError(err.message || "Unable to load booking.");
        } finally {
            setLoading(false);
        }
    };

    const updateBooking = async (nextStatus) => {
        const token = localStorage.getItem("rectorToken");
        if (!token) return navigate("/rector/login", { replace: true });

        if (nextStatus === "Rejected" && !remark.trim()) {
            setError("Please enter a rejection remark.");
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setSuccess("");
            const response = await fetch(`${API_URL}/api/rector/cricket-box/bookings/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    booking_status: nextStatus,
                    rector_remark: remark.trim()
                })
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Unable to update booking.");
            setSuccess(nextStatus === "Confirmed" ? "Booking approved successfully." : "Booking rejected successfully.");
            await fetchDetails(token);
        } catch (err) {
            console.error("Rector Cricket Booking Update Error:", err);
            setError(err.message || "Unable to update booking.");
        } finally {
            setActionLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("rectorToken");
        localStorage.removeItem("rector");
        navigate("/rector/login", { replace: true });
    };

    const status = booking?.booking_status || "";

    return (
        <div className="rector-cricket-details-page">
            {mobileMenuOpen && <div className="rector-cricket-details-overlay" onClick={() => setMobileMenuOpen(false)} />}
            <aside className={`rector-cricket-details-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
                <div className="rector-cricket-details-brand"><div>🏠</div><section><strong>Hostel</strong><span>Rector Portal</span></section></div>
                <nav>
                    <button onClick={() => navigate("/rector/dashboard")}>📊 Dashboard</button>
                    <button onClick={() => navigate("/rector/rooms")}>🛏️ Rooms</button>
                    <button className="active" onClick={() => navigate("/rector/cricket-box")}>🏏 Cricket Box</button>
                    <button onClick={() => navigate("/rector/leaves")}>📋 Leave Requests</button>
                    <button onClick={() => navigate("/rector/complaints")}>🛠️ Complaints</button>
                </nav>
                <button className="rector-cricket-details-logout" onClick={logout}>🚪 Logout</button>
            </aside>

            <main className="rector-cricket-details-main">
                <header className="rector-cricket-details-topbar">
                    <button className="rector-cricket-details-menu" onClick={() => setMobileMenuOpen(v => !v)}>☰</button>
                    <h1>Hostel Rector Panel</h1>
                    <div className="rector-cricket-details-photo">{rector.photo ? <img src={getRectorPhotoUrl(rector.photo)} alt="Rector" /> : "👤"}</div>
                </header>

                <div className="rector-cricket-details-content">
                    <div className="rector-cricket-details-title">
                        <div><span>CRICKET BOX</span><h2>Booking #{id}</h2><p>Review complete booking information and take action.</p></div>
                        <button onClick={() => navigate("/rector/cricket-box/bookings")}>← All Bookings</button>
                    </div>

                    {loading ? <div className="rector-cricket-details-card">Loading booking...</div> :
                        error && !booking ? <div className="rector-cricket-details-error">{error}</div> :
                        booking && <>
                            {error && <div className="rector-cricket-details-error">{error}</div>}
                            {success && <div className="rector-cricket-details-success">{success}</div>}

                            <section className="rector-cricket-details-grid">
                                <div className="rector-cricket-details-card"><span>BOOKING STATUS</span><strong>{booking.booking_status || "-"}</strong></div>
                                <div className="rector-cricket-details-card"><span>PAYMENT STATUS</span><strong>{booking.payment_status || "-"}</strong></div>
                                <div className="rector-cricket-details-card"><span>TOTAL AMOUNT</span><strong>₹{Number(booking.total_amount || 0).toFixed(2)}</strong></div>
                                <div className="rector-cricket-details-card"><span>GROUND</span><strong>{booking.ground_name || "-"}</strong></div>
                            </section>

                            <section className="rector-cricket-details-panel">
                                <h3>Booking Information</h3>
                                <div className="rector-cricket-details-info-grid">
                                    <div><span>Student</span><strong>{booking.student_name || "-"}</strong></div>
                                    <div><span>Email</span><strong>{booking.student_email || booking.email || "-"}</strong></div>
                                    <div><span>Mobile</span><strong>{booking.student_mobile || booking.mobile || "-"}</strong></div>
                                    <div><span>Booking Date</span><strong>{formatDate(booking.booking_date)}</strong></div>
                                    <div><span>Time Slot</span><strong>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</strong></div>
                                    <div><span>Payment Method</span><strong>{booking.payment_method || "Not Paid"}</strong></div>
                                    <div><span>Transaction ID</span><strong>{booking.transaction_id || "Not Available"}</strong></div>
                                    <div><span>Rector Remark</span><strong>{booking.rector_remark || "No remark"}</strong></div>
                                </div>
                            </section>

                            <section className="rector-cricket-details-panel">
                                <h3>Players ({players.length})</h3>
                                {players.length ? <div className="rector-cricket-player-list">{players.map((player, index) => (
                                    <div className="rector-cricket-player" key={player.id || index}>
                                        <div>{index + 1}</div><section><strong>{player.student_name || "-"}</strong><span>ID: {player.student_id || "-"} · Mobile: {player.mobile || "-"}</span></section>
                                    </div>
                                ))}</div> : <p className="muted">No player information available.</p>}
                            </section>

                            {status === "Pending Approval" && (
                                <section className="rector-cricket-details-panel rector-cricket-approval">
                                    <h3>Rector Decision</h3>
                                    <label>Remark <span>(required for rejection)</span></label>
                                    <textarea value={remark} onChange={e => setRemark(e.target.value)} placeholder="Enter approval note or rejection reason..." />
                                    <div className="rector-cricket-approval-buttons">
                                        <button className="reject" disabled={actionLoading} onClick={() => updateBooking("Rejected")}>{actionLoading ? "Processing..." : "Reject Booking"}</button>
                                        <button className="approve" disabled={actionLoading} onClick={() => updateBooking("Confirmed")}>{actionLoading ? "Processing..." : "Approve Booking"}</button>
                                    </div>
                                </section>
                            )}
                        </>}
                </div>
            </main>
        </div>
    );
}

export default RectorCricketBookingDetails;
