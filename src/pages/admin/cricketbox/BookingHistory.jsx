import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BookingHistory.css";

function BookingHistory() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        fetchBookingHistory();
    }, []);

    const fetchBookingHistory = async () => {
        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login", {
                replace: true
            });
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/admin/cricket-bookings/history",
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
                    "Unable to load booking history."
                );
            }

            setBookings(
                Array.isArray(data.bookings)
                    ? data.bookings
                    : []
            );
        } catch (err) {
            console.error(
                "Booking History Error:",
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

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return date;
        }

        return value.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const formatTime = (time) => {
        if (!time) {
            return "—";
        }

        const parts = String(time).split(":");
        const hour = Number(parts[0]);
        const minute = parts[1] || "00";

        if (Number.isNaN(hour)) {
            return time;
        }

        const period =
            hour >= 12 ? "PM" : "AM";

        const formattedHour =
            hour % 12 || 12;

        return `${formattedHour}:${minute} ${period}`;
    };

    const getBookingStatusClass = (status) => {
        const value = String(
            status || ""
        ).toLowerCase();

        if (value.includes("confirm")) {
            return "confirmed";
        }

        if (value.includes("pending")) {
            return "pending";
        }

        if (value.includes("reject")) {
            return "rejected";
        }

        if (value.includes("complete")) {
            return "completed";
        }

        return "default";
    };

    const getPaymentStatusClass = (status) => {
        const value = String(
            status || ""
        ).toLowerCase();

        if (value === "paid") {
            return "paid";
        }

        if (value.includes("refund")) {
            return "refund";
        }

        if (value === "failed") {
            return "failed";
        }

        return "payment-pending";
    };

    const filteredBookings = bookings.filter(
        (booking) => {
            const searchText =
                search.trim().toLowerCase();

            const matchesSearch =
                !searchText ||
                String(
                    booking.student_name || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    booking.ground_name || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    booking.booking_id ||
                    booking.id ||
                    ""
                )
                    .toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "All" ||
                String(
                    booking.booking_status || ""
                ).toLowerCase() ===
                    statusFilter.toLowerCase();

            return (
                matchesSearch &&
                matchesStatus
            );
        }
    );

    const totalBookings =
        bookings.length;

    const confirmedBookings =
        bookings.filter(
            (booking) =>
                String(
                    booking.booking_status ||
                    ""
                ).toLowerCase() ===
                "confirmed"
        ).length;

    const pendingBookings =
        bookings.filter(
            (booking) =>
                String(
                    booking.booking_status ||
                    ""
                ).toLowerCase() ===
                "pending approval"
        ).length;

    const completedBookings =
        bookings.filter(
            (booking) =>
                String(
                    booking.booking_status ||
                    ""
                ).toLowerCase() ===
                "completed"
        ).length;

    const handleLogout = () => {
        localStorage.removeItem(
            "adminToken"
        );

        localStorage.removeItem(
            "admin"
        );

        navigate("/admin/login", {
            replace: true
        });
    };

    return (
        <div className="booking-history-page">

            {/* SIDEBAR */}

            <aside className="booking-history-sidebar">

                <div className="booking-history-brand">

                    <div className="booking-history-brand-icon">
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

                <nav className="booking-history-nav">

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/dashboard"
                            )
                        }
                    >
                        📊 Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/students"
                            )
                        }
                    >
                        🎓 Students
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/rooms"
                            )
                        }
                    >
                        🛏️ Rooms
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/fees"
                            )
                        }
                    >
                        💰 Fees
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/complaints"
                            )
                        }
                    >
                        📝 Complaints
                    </button>

                    <button
                        className="active"
                        onClick={() =>
                            navigate(
                                "/admin/cricket-box"
                            )
                        }
                    >
                        🏏 Cricket Box
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/profile"
                            )
                        }
                    >
                        👤 Profile
                    </button>

                </nav>

                <button
                    className="booking-history-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>

            {/* MAIN */}

            <main className="booking-history-main">

                {/* HEADER */}

                <header className="booking-history-header">

                    <div>

                        <span>
                            CRICKET BOX MANAGEMENT
                        </span>

                        <h1>
                            Booking History
                        </h1>

                        <p>
                            View all cricket box
                            booking records.
                        </p>

                    </div>

                    <button
                        className="booking-history-back"
                        onClick={() =>
                            navigate(
                                "/admin/cricket-box"
                            )
                        }
                    >
                        ← Back to Grounds
                    </button>

                </header>

                {/* STATISTICS */}

                <section className="booking-history-stats">

                    <div className="booking-history-stat-card">

                        <div className="booking-history-stat-icon">
                            📋
                        </div>

                        <div>
                            <span>
                                TOTAL BOOKINGS
                            </span>

                            <strong>
                                {totalBookings}
                            </strong>
                        </div>

                    </div>

                    <div className="booking-history-stat-card">

                        <div className="booking-history-stat-icon confirmed-icon">
                            ✓
                        </div>

                        <div>
                            <span>
                                CONFIRMED
                            </span>

                            <strong>
                                {confirmedBookings}
                            </strong>
                        </div>

                    </div>

                    <div className="booking-history-stat-card">

                        <div className="booking-history-stat-icon pending-icon">
                            ⏳
                        </div>

                        <div>
                            <span>
                                PENDING
                            </span>

                            <strong>
                                {pendingBookings}
                            </strong>
                        </div>

                    </div>

                    <div className="booking-history-stat-card">

                        <div className="booking-history-stat-icon completed-icon">
                            🏆
                        </div>

                        <div>
                            <span>
                                COMPLETED
                            </span>

                            <strong>
                                {completedBookings}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* TOOLBAR */}

                <section className="booking-history-toolbar">

                    <div className="booking-history-search">

                        <span>
                            🔍
                        </span>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search student, ground or booking ID..."
                        />

                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="All">
                            All Status
                        </option>

                        <option value="Pending Approval">
                            Pending Approval
                        </option>

                        <option value="Confirmed">
                            Confirmed
                        </option>

                        <option value="Rejected">
                            Rejected
                        </option>

                        <option value="Completed">
                            Completed
                        </option>
                    </select>

                    <button
                        className="booking-history-refresh"
                        onClick={
                            fetchBookingHistory
                        }
                    >
                        ↻ Refresh
                    </button>

                </section>

                {/* ERROR */}

                {error && (

                    <div className="booking-history-error">

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

                {/* TABLE */}

                <section className="booking-history-table-card">

                    <div className="booking-history-table-header">

                        <div>
                            <h2>
                                Booking Records
                            </h2>

                            <p>
                                {filteredBookings.length}
                                {" records found"}
                            </p>
                        </div>

                    </div>

                    {loading ? (

                        <div className="booking-history-state">

                            <div>
                                ⏳
                            </div>

                            <h3>
                                Loading Booking History...
                            </h3>

                            <p>
                                Please wait while
                                records are loading.
                            </p>

                        </div>

                    ) : filteredBookings.length === 0 ? (

                        <div className="booking-history-state">

                            <div>
                                🏏
                            </div>

                            <h3>
                                No Booking Records
                            </h3>

                            <p>
                                No cricket box
                                bookings match
                                your search.
                            </p>

                        </div>

                    ) : (

                        <div className="booking-history-table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            BOOKING
                                        </th>

                                        <th>
                                            STUDENT
                                        </th>

                                        <th>
                                            GROUND
                                        </th>

                                        <th>
                                            DATE
                                        </th>

                                        <th>
                                            TIME SLOT
                                        </th>

                                        <th>
                                            AMOUNT
                                        </th>

                                        <th>
                                            PAYMENT
                                        </th>

                                        <th>
                                            STATUS
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredBookings.map(
                                        (booking) => (

                                            <tr
                                                key={
                                                    booking.id
                                                }
                                            >

                                                <td>

                                                    <strong className="booking-history-id">
                                                        #
                                                        {
                                                            booking.booking_id ||
                                                            booking.id
                                                        }
                                                    </strong>

                                                </td>

                                                <td>

                                                    <div className="booking-history-student">

                                                        <div className="booking-history-student-avatar">
                                                            {
                                                                String(
                                                                    booking.student_name ||
                                                                    "S"
                                                                )
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()
                                                            }
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    booking.student_name ||
                                                                    "Unknown Student"
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    booking.student_email ||
                                                                    "—"
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td>

                                                    <strong>
                                                        {
                                                            booking.ground_name ||
                                                            "Unknown Ground"
                                                        }
                                                    </strong>

                                                </td>

                                                <td>
                                                    {
                                                        formatDate(
                                                            booking.booking_date
                                                        )
                                                    }
                                                </td>

                                                <td>

                                                    <span className="booking-history-time">
                                                        {
                                                            formatTime(
                                                                booking.start_time
                                                            )
                                                        }

                                                        {" - "}

                                                        {
                                                            formatTime(
                                                                booking.end_time
                                                            )
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <strong className="booking-history-amount">
                                                        ₹
                                                        {
                                                            Number(
                                                                booking.total_amount ||
                                                                0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )
                                                        }
                                                    </strong>

                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `booking-history-payment ${getPaymentStatusClass(
                                                                booking.payment_status
                                                            )}`
                                                        }
                                                    >
                                                        {
                                                            booking.payment_status ||
                                                            "Pending"
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `booking-history-status ${getBookingStatusClass(
                                                                booking.booking_status
                                                            )}`
                                                        }
                                                    >
                                                        {
                                                            booking.booking_status ||
                                                            "Unknown"
                                                        }
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

                {/* FOOTER */}

                <footer className="booking-history-footer">

                    <span>
                        © 2026 Hostel Management System
                    </span>

                    <span>
                        Admin Panel
                    </span>

                </footer>

            </main>

        </div>
    );
}

export default BookingHistory;