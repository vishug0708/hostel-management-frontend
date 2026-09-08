import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyCricketBookings.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getPhotoUrl = (photo) => {
    if (!photo) return "";

    const value = String(photo).trim();

    if (
        value.startsWith("data:") ||
        value.startsWith("blob:") ||
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    const normalized = value.replace(/^\/+/, "");

    if (normalized.startsWith("uploads/")) {
        return `${API_URL}/${normalized}`;
    }

    return `${API_URL}/uploads/students/${normalized}`;
};

function MyCricketBookings() {
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    let student = {};

    try {
        student = JSON.parse(localStorage.getItem("student") || "{}");
    } catch {
        student = {};
    }

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("studentToken");

    const studentPhoto = getPhotoUrl(
        student.photo ||
            student.profile_photo ||
            student.student_photo ||
            student.image
    );

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/student/cricket/bookings`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load bookings"
                );
            }

            const bookingList = Array.isArray(data)
                ? data
                : data.bookings || data.data || [];

            setBookings(bookingList);
        } catch (err) {
            setError(
                err.message || "Unable to load cricket bookings"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("studentToken");
        localStorage.removeItem("student");

        navigate("/student/login");
    };

    const goTo = (path) => {
        setSidebarOpen(false);
        navigate(path);
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const formatTime = (time) => {
        if (!time) return "-";
        return String(time).slice(0, 5);
    };

    const getStatusClass = (status) => {
        const value = String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "-");

        if (
            value.includes("confirm") ||
            value.includes("complete") ||
            value.includes("paid")
        ) {
            return "status-success";
        }

        if (
            value.includes("reject") ||
            value.includes("cancel")
        ) {
            return "status-danger";
        }

        return "status-pending";
    };

    return (
        <div className="my-cricket-layout">
            {sidebarOpen && (
                <div
                    className="my-cricket-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`my-cricket-sidebar ${
                    sidebarOpen
                        ? "my-cricket-sidebar-open"
                        : ""
                }`}
            >
                <div className="my-cricket-brand">
                    <div className="my-cricket-brand-icon">
                        🏠
                    </div>

                    <div>
                        <h2>Hostel</h2>
                        <span>Student Portal</span>
                    </div>
                </div>

                <nav className="my-cricket-nav">
                    <button
                        className="my-cricket-nav-item"
                        onClick={() =>
                            goTo("/student/dashboard")
                        }
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </button>

                    <button
                        className="my-cricket-nav-item"
                        onClick={() =>
                            goTo("/student/profile")
                        }
                    >
                        <span>👤</span>
                        <span>My Profile</span>
                    </button>

                    <button
                        className="my-cricket-nav-item"
                        onClick={() =>
                            goTo("/student/room")
                        }
                    >
                        <span>🛏️</span>
                        <span>My Room</span>
                    </button>

                    <button
                        className="my-cricket-nav-item"
                        onClick={() =>
                            goTo("/student/leaves")
                        }
                    >
                        <span>📝</span>
                        <span>My Leave</span>
                    </button>

                    <button
                        className="my-cricket-nav-item"
                        onClick={() =>
                            goTo("/student/apply-leave")
                        }
                    >
                        <span>➕</span>
                        <span>Apply Leave</span>
                    </button>

                    <button
                        className="my-cricket-nav-item"
                        onClick={() =>
                            goTo("/student/gatepass")
                        }
                    >
                        <span>🎫</span>
                        <span>Gate Pass</span>
                    </button>

                    <button
                        className="my-cricket-nav-item"
                        onClick={() =>
                            goTo("/student/complaints")
                        }
                    >
                        <span>📝</span>
                        <span>Complaints</span>
                    </button>

                    <button
                        className="my-cricket-nav-item"
                        onClick={() =>
                            goTo("/student/fees")
                        }
                    >
                        <span>💰</span>
                        <span>My Fees</span>
                    </button>

                    <button
                        className="my-cricket-nav-item"
                        onClick={() =>
                            goTo("/student/notifications")
                        }
                    >
                        <span>🔔</span>
                        <span>Notifications</span>
                    </button>

                    <button
                        className="my-cricket-nav-item active"
                        onClick={() =>
                            goTo("/student/cricketbox")
                        }
                    >
                        <span>🏏</span>
                        <span>Cricket Box</span>
                    </button>
                </nav>

                <button
                    className="my-cricket-logout"
                    onClick={handleLogout}
                >
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </aside>

            <div className="my-cricket-main">
                <header className="my-cricket-topbar">
                    <button
                        className="my-cricket-hamburger"
                        onClick={() =>
                            setSidebarOpen((prev) => !prev)
                        }
                        aria-label="Toggle menu"
                    >
                        ☰
                    </button>

                    <div className="my-cricket-panel-title">
                        <strong>Hostel Student Panel</strong>
                        <span>My Cricket Bookings</span>
                    </div>

                    <div className="my-cricket-profile">
                        {studentPhoto ? (
                            <img
                                src={studentPhoto}
                                alt="Student"
                                onError={(event) => {
                                    event.currentTarget.style.display =
                                        "none";
                                }}
                            />
                        ) : (
                            <div className="my-cricket-photo-fallback">
                                👤
                            </div>
                        )}
                    </div>
                </header>

                <main className="my-cricket-content">
                    <div className="my-cricket-heading">
                        <div>
                            <span>CRICKET BOX</span>
                            <h1>My Cricket Bookings</h1>
                            <p>
                                View and manage your cricket box
                                booking requests.
                            </p>
                        </div>

                        <button
                            className="new-cricket-booking"
                            onClick={() =>
                                navigate(
                                    "/student/cricketbox"
                                )
                            }
                        >
                            + New Booking
                        </button>
                    </div>

                    {error && (
                        <div className="my-cricket-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="my-cricket-loading">
                            <div className="booking-spinner" />
                            <span>Loading bookings...</span>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="my-cricket-empty">
                            <div className="empty-cricket-icon">
                                🏏
                            </div>

                            <h3>No Cricket Bookings</h3>

                            <p>
                                You haven't made any cricket box
                                bookings yet.
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/student/cricket-box"
                                    )
                                }
                            >
                                Book Cricket Box
                            </button>
                        </div>
                    ) : (
                        <div className="my-cricket-table-card">
                            <div className="my-cricket-table-header">
                                <div>
                                    <h3>Booking History</h3>
                                    <span>
                                        {bookings.length} booking
                                        {bookings.length !== 1
                                            ? "s"
                                            : ""}
                                    </span>
                                </div>
                            </div>

                            <div className="my-cricket-table-wrapper">
                                <table className="my-cricket-table">
                                    <thead>
                                        <tr>
                                            <th>Booking ID</th>
                                            <th>Ground</th>
                                            <th>Date</th>
                                            <th>Time Slot</th>
                                            <th>Amount</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {bookings.map(
                                            (booking) => (
                                                <tr
                                                    key={
                                                        booking.id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            #
                                                            {
                                                                booking.id
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <div className="ground-name">
                                                            {booking.ground_name ||
                                                                booking.ground ||
                                                                "-"}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            booking.booking_date
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span className="time-slot">
                                                            {formatTime(
                                                                booking.start_time
                                                            )}{" "}
                                                            -{" "}
                                                            {formatTime(
                                                                booking.end_time
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            ₹
                                                            {Number(
                                                                booking.total_amount ||
                                                                    0
                                                            ).toFixed(
                                                                2
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`booking-status ${getStatusClass(
                                                                booking.payment_status
                                                            )}`}
                                                        >
                                                            {booking.payment_status ||
                                                                "Pending"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`booking-status ${getStatusClass(
                                                                booking.booking_status
                                                            )}`}
                                                        >
                                                            {booking.booking_status ||
                                                                "Pending"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <button
                                                            className="view-booking-btn"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/student/cricket-box/bookings/${booking.id}`
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="my-cricket-mobile-list">
                                {bookings.map(
                                    (booking) => (
                                        <div
                                            className="mobile-booking-card"
                                            key={booking.id}
                                        >
                                            <div className="mobile-booking-top">
                                                <strong>
                                                    Booking #
                                                    {
                                                        booking.id
                                                    }
                                                </strong>

                                                <span
                                                    className={`booking-status ${getStatusClass(
                                                        booking.booking_status
                                                    )}`}
                                                >
                                                    {booking.booking_status ||
                                                        "Pending"}
                                                </span>
                                            </div>

                                            <div className="mobile-booking-details">
                                                <div>
                                                    <span>
                                                        Ground
                                                    </span>
                                                    <strong>
                                                        {booking.ground_name ||
                                                            booking.ground ||
                                                            "-"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Date
                                                    </span>
                                                    <strong>
                                                        {formatDate(
                                                            booking.booking_date
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Time
                                                    </span>
                                                    <strong>
                                                        {formatTime(
                                                            booking.start_time
                                                        )}{" "}
                                                        -{" "}
                                                        {formatTime(
                                                            booking.end_time
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Amount
                                                    </span>
                                                    <strong>
                                                        ₹
                                                        {Number(
                                                            booking.total_amount ||
                                                                0
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </strong>
                                                </div>
                                            </div>

                                            <button
                                                className="mobile-view-booking"
                                                onClick={() =>
                                                    navigate(
                                                        `/student/cricket-box/bookings/${booking.id}`
                                                    )
                                                }
                                            >
                                                View Booking →
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default MyCricketBookings;