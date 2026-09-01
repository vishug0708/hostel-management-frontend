import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StudentFeeDetails.css";

function StudentFeeDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [student, setStudent] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (id) {
            fetchStudentFeeDetails();
        }
    }, [id]);

    const fetchStudentFeeDetails = async () => {
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
                `http://localhost:5000/api/admin/fees/student/${id}`,
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
                    "Unable to load student fee details."
                );
                return;
            }

            setStudent(data.student || null);
            setPayments(
                Array.isArray(data.payments)
                    ? data.payments
                    : []
            );
        } catch (err) {
            console.error(
                "Student Fee Details Error:",
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

    const getStatusClass = (status) => {
        return String(status || "pending")
            .toLowerCase()
            .replace(/\s+/g, "-");
    };

    if (loading) {
        return (
            <div className="student-fee-details-loading">
                <div className="student-fee-details-spinner">
                    ⏳
                </div>

                <p>
                    Loading student fee details...
                </p>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="student-fee-details-error-page">
                <div className="student-fee-details-error-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Student
                </h2>

                <p>
                    {error ||
                        "Student fee details not found."}
                </p>

                <button
                    onClick={() =>
                        navigate(
                            "/admin/fees"
                        )
                    }
                >
                    ← Back to Fees
                </button>
            </div>
        );
    }

    const totalFee = Number(
        student.hostel_fee || 0
    );

    const paidAmount = Number(
        student.paid_amount || 0
    );

    const pendingAmount = Math.max(
        totalFee - paidAmount,
        0
    );

    const paidPercentage =
        totalFee > 0
            ? Math.min(
                (paidAmount / totalFee) * 100,
                100
            )
            : 0;

    const isFullyPaid =
        pendingAmount <= 0;

    return (
        <div className="student-fee-details-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="student-fee-details-sidebar">

                <div className="student-fee-details-brand">

                    <div className="student-fee-details-brand-icon">
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

                <nav className="student-fee-details-nav">

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
                    className="student-fee-details-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="student-fee-details-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="student-fee-details-header">

                    <div>

                        <span>
                            FEES MANAGEMENT
                        </span>

                        <h1>
                            Student Fee Details
                        </h1>

                        <p>
                            Complete fee information
                            and payment history.
                        </p>

                    </div>

                    <button
                        className="student-fee-details-back-btn"
                        onClick={() =>
                            navigate(
                                "/admin/fees"
                            )
                        }
                    >
                        ← Fees Dashboard
                    </button>

                </header>

                {/* =================================================
                    STUDENT PROFILE
                ================================================= */}

                <section className="student-fee-profile-card">

                    <div className="student-fee-profile-avatar">

                        {student.photo ? (

                            <img
                                src={
                                    student.photo.startsWith(
                                        "http"
                                    )
                                        ? student.photo
                                        : `http://localhost:5000/uploads/${student.photo}`
                                }
                                alt={
                                    student.name ||
                                    "Student"
                                }
                                onError={(e) => {
                                    e.currentTarget.style.display =
                                        "none";

                                    e.currentTarget
                                        .nextElementSibling
                                        .style.display =
                                        "flex";
                                }}
                            />

                        ) : null}

                        <div
                            className="student-fee-profile-fallback"
                            style={{
                                display:
                                    student.photo
                                        ? "none"
                                        : "flex"
                            }}
                        >
                            {student.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "S"}
                        </div>

                    </div>

                    <div className="student-fee-profile-info">

                        <span>
                            STUDENT
                        </span>

                        <h2>
                            {student.name ||
                                "Unknown Student"}
                        </h2>

                        <p>
                            Student ID:{" "}
                            {student.id ||
                                "—"}
                        </p>

                    </div>

                    <div className="student-fee-profile-contact">

                        <div>
                            <small>
                                Mobile
                            </small>

                            <strong>
                                {student.mobile ||
                                    "—"}
                            </strong>
                        </div>

                        <div>
                            <small>
                                Email
                            </small>

                            <strong>
                                {student.email ||
                                    "—"}
                            </strong>
                        </div>

                        <div>
                            <small>
                                Room
                            </small>

                            <strong>
                                {student.room_id
                                    ? `Room ${student.room_id}`
                                    : "—"}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* =================================================
                    FEE SUMMARY
                ================================================= */}

                <section className="student-fee-summary">

                    <div className="student-fee-summary-card total">

                        <div className="student-fee-summary-icon">
                            💰
                        </div>

                        <div>

                            <span>
                                TOTAL FEE
                            </span>

                            <strong>
                                {formatCurrency(
                                    totalFee
                                )}
                            </strong>

                        </div>

                    </div>

                    <div className="student-fee-summary-card paid">

                        <div className="student-fee-summary-icon">
                            ✓
                        </div>

                        <div>

                            <span>
                                PAID
                            </span>

                            <strong>
                                {formatCurrency(
                                    paidAmount
                                )}
                            </strong>

                        </div>

                    </div>

                    <div className="student-fee-summary-card pending">

                        <div className="student-fee-summary-icon">
                            ⏳
                        </div>

                        <div>

                            <span>
                                PENDING
                            </span>

                            <strong>
                                {formatCurrency(
                                    pendingAmount
                                )}
                            </strong>

                        </div>

                    </div>

                    <div className="student-fee-summary-card status">

                        <div className="student-fee-summary-icon">
                            {isFullyPaid
                                ? "✓"
                                : "!"}
                        </div>

                        <div>

                            <span>
                                PAYMENT STATUS
                            </span>

                            <strong>
                                {isFullyPaid
                                    ? "Paid"
                                    : "Pending"}
                            </strong>

                        </div>

                    </div>

                </section>

                {/* =================================================
                    PAYMENT PROGRESS
                ================================================= */}

                <section className="student-fee-progress-card">

                    <div className="student-fee-progress-header">

                        <div>

                            <span>
                                PAYMENT PROGRESS
                            </span>

                            <h2>
                                Fee Payment Overview
                            </h2>

                        </div>

                        <strong>
                            {paidPercentage.toFixed(1)}%
                        </strong>

                    </div>

                    <div className="student-fee-progress-bar">

                        <div
                            className="student-fee-progress"
                            style={{
                                width:
                                    `${paidPercentage}%`
                            }}
                        />

                    </div>

                    <div className="student-fee-progress-values">

                        <span>
                            Paid:{" "}
                            {formatCurrency(
                                paidAmount
                            )}
                        </span>

                        <span>
                            Remaining:{" "}
                            {formatCurrency(
                                pendingAmount
                            )}
                        </span>

                        <span>
                            Total:{" "}
                            {formatCurrency(
                                totalFee
                            )}
                        </span>

                    </div>

                </section>

                {/* =================================================
                    PAYMENT HISTORY
                ================================================= */}

                <section className="student-payment-history-card">

                    <div className="student-payment-history-header">

                        <div>

                            <span>
                                PAYMENT HISTORY
                            </span>

                            <h2>
                                Student Payments
                            </h2>

                            <p>
                                All recorded payments
                                made by this student.
                            </p>

                        </div>

                        <div className="student-payment-count">
                            {payments.length}
                            {" Payments"}
                        </div>

                    </div>

                    {payments.length === 0 ? (

                        <div className="student-payment-empty">

                            <div>
                                💳
                            </div>

                            <h3>
                                No Payment Records
                            </h3>

                            <p>
                                No fee payment has been
                                recorded for this student.
                            </p>

                        </div>

                    ) : (

                        <div className="student-payment-table-wrapper">

                            <table className="student-payment-table">

                                <thead>

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Payment Method
                                        </th>

                                        <th>
                                            Payment Date
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {payments.map(
                                        (payment, index) => (

                                            <tr
                                                key={
                                                    payment.id ||
                                                    index
                                                }
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>

                                                    <strong className="student-payment-amount">
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
                                                            `student-payment-status ${getStatusClass(
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
                    NOTE
                ================================================= */}

                <div className="student-fee-details-note">

                    <span>
                        ℹ️
                    </span>

                    <div>

                        <strong>
                            Admin Fee Access
                        </strong>

                        <p>
                            This page is for viewing and
                            monitoring student fee records.
                            Admin does not collect fees
                            from this panel.
                        </p>

                    </div>

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="student-fee-details-footer">

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

export default StudentFeeDetails;