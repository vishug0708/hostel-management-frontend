import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FeesDashboard.css";

function FeesDashboard() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [stats, setStats] = useState({
        totalFees: 0,
        collectedFees: 0,
        pendingFees: 0,
        monthlyCollection: 0,
        totalStudents: 0,
        paidStudents: 0,
        pendingStudents: 0
    });

    const [recentPayments, setRecentPayments] = useState([]);

    useEffect(() => {
        fetchFeesDashboard();
    }, []);

    const fetchFeesDashboard = async () => {
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
                "http://localhost:5000/api/admin/fees/dashboard",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(
                    data.message ||
                    "Unable to load fees dashboard."
                );
                return;
            }

            setStats({
                totalFees: data.stats?.totalFees || 0,
                collectedFees:
                    data.stats?.collectedFees || 0,
                pendingFees:
                    data.stats?.pendingFees || 0,
                monthlyCollection:
                    data.stats?.monthlyCollection || 0,
                totalStudents:
                    data.stats?.totalStudents || 0,
                paidStudents:
                    data.stats?.paidStudents || 0,
                pendingStudents:
                    data.stats?.pendingStudents || 0
            });

            setRecentPayments(
                Array.isArray(data.recentPayments)
                    ? data.recentPayments
                    : []
            );
        } catch (err) {
            console.error(
                "Fees Dashboard Error:",
                err
            );

            setError(
                "Cannot connect to backend server."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");

        navigate("/admin/login", {
            replace: true
        });
    };

    const formatCurrency = (amount) => {
        return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const getPaymentStatusClass = (status) => {
        return String(status || "pending")
            .toLowerCase()
            .replace(/\s+/g, "-");
    };

    const collectionPercentage =
        stats.totalFees > 0
            ? Math.min(
                (stats.collectedFees /
                    stats.totalFees) *
                    100,
                100
            )
            : 0;

    if (loading) {
        return (
            <div className="fees-dashboard-loading">
                <div className="fees-dashboard-spinner">
                    ⏳
                </div>

                <p>
                    Loading fees dashboard...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fees-dashboard-error-page">
                <div className="fees-dashboard-error-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Fees Dashboard
                </h2>

                <p>{error}</p>

                <button
                    onClick={fetchFeesDashboard}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="fees-dashboard-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="fees-dashboard-sidebar">

                <div className="fees-dashboard-brand">
                    <div className="fees-dashboard-brand-icon">
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

                <nav className="fees-dashboard-nav">

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
                        className="active"
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
                                "/admin/profile"
                            )
                        }
                    >
                        👤 Profile
                    </button>

                </nav>

                <button
                    className="fees-dashboard-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="fees-dashboard-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="fees-dashboard-header">

                    <div>
                        <span>
                            FEES MANAGEMENT
                        </span>

                        <h1>
                            Fees Dashboard
                        </h1>

                        <p>
                            Monitor hostel fee payments,
                            pending fees and collection.
                        </p>
                    </div>

                    <button
                        className="fees-dashboard-refresh-btn"
                        onClick={fetchFeesDashboard}
                    >
                        ↻ Refresh
                    </button>

                </header>

                {/* =================================================
                    SUMMARY CARDS
                ================================================= */}

                <section className="fees-summary-grid">

                    <div className="fees-summary-card total">

                        <div className="fees-summary-icon">
                            💰
                        </div>

                        <div>
                            <span>
                                TOTAL FEES
                            </span>

                            <h2>
                                {formatCurrency(
                                    stats.totalFees
                                )}
                            </h2>

                            <p>
                                Expected fee amount
                            </p>
                        </div>

                    </div>

                    <div className="fees-summary-card collected">

                        <div className="fees-summary-icon">
                            ✓
                        </div>

                        <div>
                            <span>
                                TOTAL COLLECTED
                            </span>

                            <h2>
                                {formatCurrency(
                                    stats.collectedFees
                                )}
                            </h2>

                            <p>
                                Successfully paid
                            </p>
                        </div>

                    </div>

                    <div className="fees-summary-card pending">

                        <div className="fees-summary-icon">
                            ⏳
                        </div>

                        <div>
                            <span>
                                PENDING FEES
                            </span>

                            <h2>
                                {formatCurrency(
                                    stats.pendingFees
                                )}
                            </h2>

                            <p>
                                Amount remaining
                            </p>
                        </div>

                    </div>

                    <div className="fees-summary-card monthly">

                        <div className="fees-summary-icon">
                            📅
                        </div>

                        <div>
                            <span>
                                THIS MONTH
                            </span>

                            <h2>
                                {formatCurrency(
                                    stats.monthlyCollection
                                )}
                            </h2>

                            <p>
                                Current month collection
                            </p>
                        </div>

                    </div>

                </section>

                {/* =================================================
                    COLLECTION OVERVIEW
                ================================================= */}

                <section className="fees-overview-card">

                    <div className="fees-overview-header">

                        <div>
                            <span>
                                COLLECTION OVERVIEW
                            </span>

                            <h2>
                                Fee Collection Status
                            </h2>
                        </div>

                        <strong>
                            {collectionPercentage.toFixed(1)}%
                        </strong>

                    </div>

                    <div className="fees-progress-bar">

                        <div
                            className="fees-progress"
                            style={{
                                width:
                                    `${collectionPercentage}%`
                            }}
                        />

                    </div>

                    <div className="fees-progress-info">

                        <span>
                            Collected:{" "}
                            {formatCurrency(
                                stats.collectedFees
                            )}
                        </span>

                        <span>
                            Pending:{" "}
                            {formatCurrency(
                                stats.pendingFees
                            )}
                        </span>

                    </div>

                </section>

                {/* =================================================
                    STUDENT FEE STATUS
                ================================================= */}

                <section className="student-fee-status-card">

                    <div className="student-fee-status-header">

                        <div>
                            <span>
                                STUDENT PAYMENT STATUS
                            </span>

                            <h2>
                                Student Fee Overview
                            </h2>
                        </div>

                    </div>

                    <div className="student-fee-status-grid">

                        <div className="student-fee-status-item">

                            <div className="status-item-icon">
                                👨‍🎓
                            </div>

                            <div>
                                <span>
                                    TOTAL STUDENTS
                                </span>

                                <strong>
                                    {stats.totalStudents}
                                </strong>
                            </div>

                        </div>

                        <div className="student-fee-status-item paid">

                            <div className="status-item-icon">
                                ✓
                            </div>

                            <div>
                                <span>
                                    FULLY PAID
                                </span>

                                <strong>
                                    {stats.paidStudents}
                                </strong>
                            </div>

                        </div>

                        <div className="student-fee-status-item pending">

                            <div className="status-item-icon">
                                ⏳
                            </div>

                            <div>
                                <span>
                                    PENDING
                                </span>

                                <strong>
                                    {stats.pendingStudents}
                                </strong>
                            </div>

                        </div>

                    </div>

                </section>

                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <section className="fees-quick-actions">

                    <div className="fees-section-title">

                        <div>
                            <span>
                                MANAGEMENT
                            </span>

                            <h2>
                                Fee Management
                            </h2>

                            <p>
                                View and manage fee records.
                            </p>
                        </div>

                    </div>

                    <div className="fees-action-grid">

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/fees/records"
                                )
                            }
                        >
                            <span>
                                📜
                            </span>

                            <div>
                                <strong>
                                    Payment History
                                </strong>

                                <small>
                                    View all payments
                                </small>
                            </div>

                            <b>
                                →
                            </b>
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/fees/pending"
                                )
                            }
                        >
                            <span>
                                ⏳
                            </span>

                            <div>
                                <strong>
                                    Pending Fees
                                </strong>

                                <small>
                                    View pending payments
                                </small>
                            </div>

                            <b>
                                →
                            </b>
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    (`/admin/fees/panding`)
                                )
                            }
                        >
                            <span>
                                👨‍🎓
                            </span>

                            <div>
                                <strong>
                                    Student Fee Details
                                </strong>

                                <small>
                                    View student-wise fees
                                </small>
                            </div>

                            <b>
                                →
                            </b>
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/fees/receipts"
                                )
                            }
                        >
                            <span>
                                🧾
                            </span>

                            <div>
                                <strong>
                                    Receipts
                                </strong>

                                <small>
                                    View payment receipts
                                </small>
                            </div>

                            <b>
                                →
                            </b>
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/fees/reports"
                                )
                            }
                        >
                            <span>
                                📈
                            </span>

                            <div>
                                <strong>
                                    Fee Reports
                                </strong>

                                <small>
                                    Analyze fee collection
                                </small>
                            </div>

                            <b>
                                →
                            </b>
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/fees/payments"
                                )
                            }
                        >
                            <span>
                                💳
                            </span>

                            <div>
                                <strong>
                                    Manage Payments
                                </strong>

                                <small>
                                    Verify payment records
                                </small>
                            </div>

                            <b>
                                →
                            </b>
                        </button>

                    </div>

                </section>

                {/* =================================================
                    RECENT PAYMENTS
                ================================================= */}

                <section className="recent-payments-card">

                    <div className="recent-payments-header">

                        <div>
                            <span>
                                RECENT ACTIVITY
                            </span>

                            <h2>
                                Recent Payments
                            </h2>

                            <p>
                                Latest fee payment records.
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/fees/payment-history"
                                )
                            }
                        >
                            View All →
                        </button>

                    </div>

                    {recentPayments.length === 0 ? (

                        <div className="no-payments">

                            <div>
                                💳
                            </div>

                            <h3>
                                No Recent Payments
                            </h3>

                            <p>
                                Payment records will appear
                                here when students make payments.
                            </p>

                        </div>

                    ) : (

                        <div className="recent-payments-table-wrapper">

                            <table className="recent-payments-table">

                                <thead>

                                    <tr>
                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Method
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Status
                                        </th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {recentPayments.map(
                                        (payment, index) => (

                                            <tr
                                                key={
                                                    payment.id ||
                                                    index
                                                }
                                            >

                                                <td>

                                                    <div className="payment-student">

                                                        <div className="payment-student-avatar">
                                                            {
                                                                payment.student_name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    ?.toUpperCase() ||
                                                                "S"
                                                            }
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    payment.student_name ||
                                                                    "Unknown Student"
                                                                }
                                                            </strong>

                                                            <small>
                                                                ID #
                                                                {
                                                                    payment.student_id ||
                                                                    "—"
                                                                }
                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td>

                                                    <strong className="payment-amount">
                                                        {formatCurrency(
                                                            payment.amount
                                                        )}
                                                    </strong>

                                                </td>

                                                <td>
                                                    {
                                                        payment.payment_method ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        payment.payment_date
                                                    )}
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `payment-status ${getPaymentStatusClass(
                                                                payment.status
                                                            )}`
                                                        }
                                                    >
                                                        {
                                                            payment.status ||
                                                            "Pending"
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

                {/* =================================================
                    INFO NOTE
                ================================================= */}

                <div className="fees-dashboard-note">

                    <span>
                        ℹ️
                    </span>

                    <div>

                        <strong>
                            Admin Fee Access
                        </strong>

                        <p>
                            Admin can monitor payments,
                            verify records, view receipts
                            and generate reports. Fee
                            collection is not performed
                            from the Admin panel.
                        </p>

                    </div>

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="fees-dashboard-footer">

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

export default FeesDashboard;