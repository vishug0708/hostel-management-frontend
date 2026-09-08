import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "./CricketBookingDetails.css";

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

function CricketBookingDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [booking, setBooking] = useState(null);
    const [players, setPlayers] = useState([]);
    const [qr, setQr] = useState(null);

    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState("");
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
        fetchBookingDetails();
    }, [id]);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/student/cricket/bookings/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load booking details"
                );
            }

            const bookingData =
                data.booking || data.data || data;

            setBooking(bookingData);

            if (Array.isArray(data.players)) {
                setPlayers(data.players);
            } else if (Array.isArray(bookingData.players)) {
                setPlayers(bookingData.players);
            }

            if (data.qr) {
                setQr(data.qr);
            }
        } catch (err) {
            setError(
                err.message ||
                "Unable to load booking details"
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchQr = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/student/cricket/bookings/${id}/qr`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                setQr(data.qr || data.data || data);
            }
        } catch {
            // QR is optional until generated after approval/payment
        }
    };

    useEffect(() => {
        if (booking) {
            fetchQr();
        }
    }, [booking]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const existingScript = document.querySelector(
                'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
            );

            if (existingScript) {
                existingScript.addEventListener("load", () => resolve(true), {
                    once: true
                });
                existingScript.addEventListener("error", () => resolve(false), {
                    once: true
                });
                return;
            }

            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };


    const handlePayment = async () => {
        if (!booking || paymentLoading) return;

        setPaymentMessage("");
        setError("");

        if (booking.booking_status !== "Confirmed") {
            setError("Payment is available only after Rector approval.");
            return;
        }

        if (booking.payment_status === "Paid") {
            setPaymentMessage("This booking is already paid.");
            return;
        }

        try {
            setPaymentLoading(true);

            const orderResponse = await fetch(
                `${API_URL}/api/student/cricket/bookings/${id}/payment/order`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const orderData = await orderResponse.json();

            if (!orderResponse.ok || !orderData.success) {
                throw new Error(
                    orderData.message ||
                    "Unable to create Razorpay payment order."
                );
            }

            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded || !window.Razorpay) {
                throw new Error(
                    "Razorpay Checkout could not be loaded. Please check your internet connection."
                );
            }

            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency || "INR",
                name: "Hostel Management System",
                description: `Cricket Box Booking #${id}`,
                order_id: orderData.order_id,
                prefill: {
                    name: orderData.student?.name || student.name || "",
                    email: orderData.student?.email || student.email || "",
                    contact:
                        orderData.student?.mobile ||
                        student.mobile ||
                        ""
                },
                theme: {
                    color: "#134e4a"
                },
                handler: async (response) => {
                    try {
                        const verifyResponse = await fetch(
                            `${API_URL}/api/student/cricket/bookings/${id}/payment/verify`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    razorpay_order_id:
                                        response.razorpay_order_id,
                                    razorpay_payment_id:
                                        response.razorpay_payment_id,
                                    razorpay_signature:
                                        response.razorpay_signature
                                })
                            }
                        );

                        const verifyData = await verifyResponse.json();

                        if (!verifyResponse.ok || !verifyData.success) {
                            throw new Error(
                                verifyData.message ||
                                "Payment verification failed."
                            );
                        }

                        setPaymentMessage(
                            "Payment successful and verified."
                        );
                        await fetchBookingDetails();
                    } catch (verifyError) {
                        setError(
                            verifyError.message ||
                            "Payment verification failed."
                        );
                    } finally {
                        setPaymentLoading(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setPaymentLoading(false);
                        setPaymentMessage("Payment window closed.");
                    }
                }
            };

            const razorpayCheckout = new window.Razorpay(options);

            razorpayCheckout.on("payment.failed", (response) => {
                setPaymentLoading(false);
                setError(
                    response?.error?.description ||
                    "Razorpay payment failed."
                );
            });

            razorpayCheckout.open();
        } catch (paymentError) {
            console.error("Razorpay Payment Error:", paymentError);
            setError(
                paymentError.message ||
                "Unable to start Razorpay payment."
            );
            setPaymentLoading(false);
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

        const value = String(date).trim();

        const parsedDate = value.includes("T")
            ? new Date(value)
            : new Date(`${value}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
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
            value.includes("paid") ||
            value.includes("active")
        ) {
            return "details-status-success";
        }

        if (
            value.includes("reject") ||
            value.includes("cancel") ||
            value.includes("expire")
        ) {
            return "details-status-danger";
        }

        return "details-status-pending";
    };

    if (loading) {
        return (
            <div className="cricket-details-layout">
                <div className="cricket-details-loading">
                    <div className="details-spinner" />
                    <span>
                        Loading booking details...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="cricket-details-layout">
            {sidebarOpen && (
                <div
                    className="cricket-details-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`cricket-details-sidebar ${sidebarOpen
                        ? "cricket-details-sidebar-open"
                        : ""
                    }`}
            >
                <div className="cricket-details-brand">
                    <div className="cricket-details-brand-icon">
                        🏠
                    </div>

                    <div>
                        <h2>Hostel</h2>
                        <span>Student Portal</span>
                    </div>
                </div>

                <nav className="cricket-details-nav">
                    <button
                        className="cricket-details-nav-item"
                        onClick={() =>
                            goTo("/student/dashboard")
                        }
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </button>

                    <button
                        className="cricket-details-nav-item"
                        onClick={() =>
                            goTo("/student/profile")
                        }
                    >
                        <span>👤</span>
                        <span>My Profile</span>
                    </button>

                    <button
                        className="cricket-details-nav-item"
                        onClick={() =>
                            goTo("/student/room")
                        }
                    >
                        <span>🛏️</span>
                        <span>My Room</span>
                    </button>

                    <button
                        className="cricket-details-nav-item"
                        onClick={() =>
                            goTo("/student/leaves")
                        }
                    >
                        <span>📝</span>
                        <span>My Leave</span>
                    </button>

                    <button
                        className="cricket-details-nav-item"
                        onClick={() =>
                            goTo("/student/apply-leave")
                        }
                    >
                        <span>➕</span>
                        <span>Apply Leave</span>
                    </button>

                    <button
                        className="cricket-details-nav-item"
                        onClick={() =>
                            goTo("/student/gatepass")
                        }
                    >
                        <span>🎫</span>
                        <span>Gate Pass</span>
                    </button>

                    <button
                        className="cricket-details-nav-item"
                        onClick={() =>
                            goTo("/student/complaints")
                        }
                    >
                        <span>📝</span>
                        <span>Complaints</span>
                    </button>

                    <button
                        className="cricket-details-nav-item"
                        onClick={() =>
                            goTo("/student/fees")
                        }
                    >
                        <span>💰</span>
                        <span>My Fees</span>
                    </button>

                    <button
                        className="cricket-details-nav-item"
                        onClick={() =>
                            goTo("/student/notifications")
                        }
                    >
                        <span>🔔</span>
                        <span>Notifications</span>
                    </button>

                    <button
                        className="cricket-details-nav-item active"
                        onClick={() =>
                            goTo("/student/cricketbox")
                        }
                    >
                        <span>🏏</span>
                        <span>Cricket Box</span>
                    </button>
                </nav>

                <button
                    className="cricket-details-logout"
                    onClick={handleLogout}
                >
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </aside>

            <div className="cricket-details-main">
                <header className="cricket-details-topbar">
                    <button
                        className="cricket-details-hamburger"
                        onClick={() =>
                            setSidebarOpen((prev) => !prev)
                        }
                        aria-label="Toggle menu"
                    >
                        ☰
                    </button>

                    <div className="cricket-details-panel-title">
                        <strong>Hostel Student Panel</strong>
                        <span>
                            Cricket Booking Details
                        </span>
                    </div>

                    <div className="cricket-details-profile">
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
                            <div className="cricket-details-photo-fallback">
                                👤
                            </div>
                        )}
                    </div>
                </header>

                <main className="cricket-details-content">
                    <div className="cricket-details-heading">
                        <div>
                            <span>CRICKET BOX</span>
                            <h1>Booking Details</h1>
                            <p>
                                View complete information about
                                your cricket box booking.
                            </p>
                        </div>

                        <button
                            className="details-back-btn"
                            onClick={() =>
                                navigate(
                                    "/student/cricket-box/bookings"
                                )
                            }
                        >
                            ← My Bookings
                        </button>
                    </div>

                    {error && (
                        <div className="cricket-details-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {!booking ? (
                        <div className="cricket-details-empty">
                            <div>🏏</div>
                            <h3>Booking Not Found</h3>
                            <p>
                                This booking could not be found.
                            </p>
                            <button
                                onClick={() =>
                                    navigate(
                                        "/student/cricket-box/bookings"
                                    )
                                }
                            >
                                Back to Bookings
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="booking-overview-card">
                                <div className="booking-overview-left">
                                    <div className="overview-cricket-icon">
                                        🏏
                                    </div>

                                    <div>
                                        <span className="overview-label">
                                            BOOKING ID
                                        </span>

                                        <h2>
                                            #
                                            {booking.id}
                                        </h2>

                                        <p>
                                            Created{" "}
                                            {booking.created_at
                                                ? new Date(
                                                    booking.created_at
                                                ).toLocaleDateString(
                                                    "en-IN"
                                                )
                                                : "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="overview-statuses">
                                    <div>
                                        <span>
                                            Booking Status
                                        </span>

                                        <strong
                                            className={`details-status ${getStatusClass(
                                                booking.booking_status
                                            )}`}
                                        >
                                            {booking.booking_status ||
                                                "Pending"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Payment Status
                                        </span>

                                        <strong
                                            className={`details-status ${getStatusClass(
                                                booking.payment_status
                                            )}`}
                                        >
                                            {booking.payment_status ||
                                                "Pending"}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="cricket-details-grid">
                                <section className="details-info-card">
                                    <div className="details-card-title">
                                        <div>🏟️</div>
                                        <div>
                                            <h3>Ground Details</h3>
                                            <span>
                                                Booking location
                                            </span>
                                        </div>
                                    </div>

                                    <div className="details-info-list">
                                        <div>
                                            <span>
                                                Ground Name
                                            </span>
                                            <strong>
                                                {booking.ground_name ||
                                                    booking.ground ||
                                                    booking.name ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Location
                                            </span>
                                            <strong>
                                                {booking.location ||
                                                    "-"}
                                            </strong>
                                        </div>
                                    </div>
                                </section>

                                <section className="details-info-card">
                                    <div className="details-card-title">
                                        <div>📅</div>
                                        <div>
                                            <h3>
                                                Schedule
                                            </h3>
                                            <span>
                                                Booking date and
                                                time
                                            </span>
                                        </div>
                                    </div>

                                    <div className="details-info-list">
                                        <div>
                                            <span>
                                                Booking Date
                                            </span>
                                            <strong>
                                                {formatDate(
                                                    booking.booking_date
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Time Slot
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
                                    </div>
                                </section>

                                <section className="details-info-card">
                                    <div className="details-card-title">
                                        <div>💰</div>
                                        <div>
                                            <h3>
                                                Payment Details
                                            </h3>
                                            <span>
                                                Booking payment
                                                information
                                            </span>
                                        </div>
                                    </div>

                                    <div className="details-info-list">
                                        <div>
                                            <span>
                                                Total Amount
                                            </span>
                                            <strong className="amount-value">
                                                ₹
                                                {Number(
                                                    booking.total_amount ||
                                                    0
                                                ).toFixed(2)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Payment Method
                                            </span>
                                            <strong>
                                                {booking.payment_method ||
                                                    "Not Paid"}
                                            </strong>
                                        </div>

                                        {booking.transaction_id && (
                                            <div>
                                                <span>
                                                    Transaction ID
                                                </span>
                                                <strong>
                                                    {
                                                        booking.transaction_id
                                                    }
                                                </strong>
                                            </div>
                                        )}
                                    </div>

                                    {booking.booking_status === "Confirmed" &&
                                        booking.payment_status !== "Paid" && (
                                            <div className="cricket-payment-action">
                                                <button
                                                    type="button"
                                                    className="cricket-pay-now-btn"
                                                    onClick={handlePayment}
                                                    disabled={paymentLoading}
                                                >
                                                    {paymentLoading
                                                        ? "Processing Payment..."
                                                        : `Pay ₹${Number(
                                                            booking.total_amount ||
                                                            0
                                                        ).toFixed(2)} with Razorpay`}
                                                </button>
                                                <small>
                                                    Test Mode • No real money will be deducted.
                                                </small>
                                            </div>
                                        )}

                                    {booking.payment_status === "Paid" && (
                                        <div className="cricket-payment-success">
                                            ✓ Payment completed successfully.
                                        </div>
                                    )}

                                    {paymentMessage && (
                                        <div className="cricket-payment-message">
                                            {paymentMessage}
                                        </div>
                                    )}
                                </section>

                                <section className="details-info-card">
                                    <div className="details-card-title">
                                        <div>👥</div>
                                        <div>
                                            <h3>
                                                Players
                                            </h3>
                                            <span>
                                                Players included in
                                                this booking
                                            </span>
                                        </div>
                                    </div>

                                    <div className="players-list">
                                        {players.length === 0 ? (
                                            <div className="no-players">
                                                No player details
                                                available.
                                            </div>
                                        ) : (
                                            players.map(
                                                (
                                                    player,
                                                    index
                                                ) => (
                                                    <div
                                                        className="player-detail"
                                                        key={
                                                            player.id ||
                                                            index
                                                        }
                                                    >
                                                        <div className="player-avatar">
                                                            {index +
                                                                1}
                                                        </div>

                                                        <div className="player-detail-info">
                                                            <strong>
                                                                {
                                                                    player.student_name
                                                                }
                                                            </strong>

                                                            {player.student_id && (
                                                                <span>
                                                                    ID:{" "}
                                                                    {
                                                                        player.student_id
                                                                    }
                                                                </span>
                                                            )}

                                                            {player.mobile && (
                                                                <span>
                                                                    📱{" "}
                                                                    {
                                                                        player.mobile
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        )}
                                    </div>
                                </section>
                            </div>

                            {booking.rector_remark && (
                                <section className="rector-remark-card">
                                    <div className="remark-icon">
                                        ℹ️
                                    </div>

                                    <div>
                                        <strong>
                                            Rector Remark
                                        </strong>
                                        <p>
                                            {
                                                booking.rector_remark
                                            }
                                        </p>
                                    </div>
                                </section>
                            )}

                            <section className="qr-details-card">
                                <div className="qr-card-icon">
                                    {qr ? "📱" : "🔐"}
                                </div>

                                <div className="qr-card-content">
                                    <h3>Booking QR Code</h3>

                                    {qr ? (
                                        <>
                                            <p className="qr-available-text">
                                                Your QR code is
                                                available for
                                                verification.
                                            </p>

                                            <div className="booking-qr-display">
                                                <QRCodeSVG
                                                    value={qr.qr_token}
                                                    size={220}
                                                    level="H"
                                                    includeMargin={true}
                                                />
                                            </div>

                                            <div className="qr-status-row">
                                                <span>
                                                    QR Status
                                                </span>

                                                <strong
                                                    className={`details-status ${getStatusClass(
                                                        qr.qr_status
                                                    )}`}
                                                >
                                                    {qr.qr_status ||
                                                        "Active"}
                                                </strong>
                                            </div>

                                            {qr.expires_at && (
                                                <div className="qr-expiry">
                                                    Expires:{" "}
                                                    {new Date(
                                                        qr.expires_at
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <p>
                                                QR code will be
                                                generated after
                                                payment and Rector
                                                approval.
                                            </p>

                                            <span className="qr-pending">
                                                QR Not Generated Yet
                                            </span>
                                        </>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default CricketBookingDetails;