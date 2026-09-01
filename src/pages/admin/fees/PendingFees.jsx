import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PendingFees.css";

function PendingFees() {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("highest");

    useEffect(() => {
        fetchPendingFees();
    }, []);

    const fetchPendingFees = async () => {
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
                "http://localhost:5000/api/admin/fees/pending",
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
                    "Unable to load pending fees."
                );
                return;
            }

            setStudents(
                Array.isArray(data.students)
                    ? data.students
                    : []
            );
        } catch (err) {
            console.error(
                "Pending Fees Error:",
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

    const filteredStudents = students
        .filter((student) => {
            const searchText =
                search.trim().toLowerCase();

            if (!searchText) {
                return true;
            }

            return (
                String(
                    student.name || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    student.student_id || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    student.mobile || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    student.email || ""
                )
                    .toLowerCase()
                    .includes(searchText)
            );
        })
        .sort((a, b) => {
            const amountA =
                Number(
                    a.pending_amount || 0
                );

            const amountB =
                Number(
                    b.pending_amount || 0
                );

            if (sortBy === "lowest") {
                return amountA - amountB;
            }

            return amountB - amountA;
        });

    const totalPending = students.reduce(
        (total, student) => {
            return (
                total +
                Number(
                    student.pending_amount || 0
                )
            );
        },
        0
    );

    const totalPaid = students.reduce(
        (total, student) => {
            return (
                total +
                Number(
                    student.paid_amount || 0
                )
            );
        },
        0
    );

    if (loading) {
        return (
            <div className="pending-fees-loading">
                <div className="pending-fees-spinner">
                    ⏳
                </div>

                <p>
                    Loading pending fees...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pending-fees-error-page">
                <div className="pending-fees-error-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Pending Fees
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={fetchPendingFees}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="pending-fees-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="pending-fees-sidebar">

                <div className="pending-fees-brand">

                    <div className="pending-fees-brand-icon">
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

                <nav className="pending-fees-nav">

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
                    className="pending-fees-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="pending-fees-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="pending-fees-header">

                    <div>

                        <span>
                            FEES MANAGEMENT
                        </span>

                        <h1>
                            Pending Fees
                        </h1>

                        <p>
                            Monitor students with
                            outstanding hostel fees.
                        </p>

                    </div>

                    <button
                        className="pending-fees-back-btn"
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
                    SUMMARY
                ================================================= */}

                <section className="pending-fees-summary">

                    <div className="pending-summary-card">

                        <div className="pending-summary-icon">
                            ⏳
                        </div>

                        <div>

                            <span>
                                TOTAL PENDING
                            </span>

                            <strong>
                                {formatCurrency(
                                    totalPending
                                )}
                            </strong>

                        </div>

                    </div>

                    <div className="pending-summary-card">

                        <div className="pending-summary-icon paid">
                            💰
                        </div>

                        <div>

                            <span>
                                ALREADY PAID
                            </span>

                            <strong>
                                {formatCurrency(
                                    totalPaid
                                )}
                            </strong>

                        </div>

                    </div>

                    <div className="pending-summary-card">

                        <div className="pending-summary-icon students">
                            👨‍🎓
                        </div>

                        <div>

                            <span>
                                STUDENTS WITH PENDING
                            </span>

                            <strong>
                                {students.length}
                            </strong>

                        </div>

                    </div>

                </section>

                {/* =================================================
                    FILTERS
                ================================================= */}

                <section className="pending-fees-filter">

                    <div className="pending-fees-search">

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
                            placeholder="Search student, ID, mobile or email..."
                        />

                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) =>
                            setSortBy(
                                e.target.value
                            )
                        }
                    >
                        <option value="highest">
                            Highest Pending
                        </option>

                        <option value="lowest">
                            Lowest Pending
                        </option>
                    </select>

                    <button
                        className="pending-fees-refresh"
                        onClick={fetchPendingFees}
                    >
                        ↻ Refresh
                    </button>

                </section>

                {/* =================================================
                    STUDENTS
                ================================================= */}

                <section className="pending-fees-card">

                    <div className="pending-fees-card-header">

                        <div>

                            <span>
                                OUTSTANDING PAYMENTS
                            </span>

                            <h2>
                                Students With Pending Fees
                            </h2>

                        </div>

                        <div className="pending-fees-count">
                            {filteredStudents.length}
                            {" Students"}
                        </div>

                    </div>

                    {filteredStudents.length === 0 ? (

                        <div className="pending-fees-empty">

                            <div className="pending-empty-icon">
                                ✓
                            </div>

                            <h3>
                                No Pending Fees
                            </h3>

                            <p>
                                No students match the
                                current search or all
                                fees are paid.
                            </p>

                        </div>

                    ) : (

                        <div className="pending-students-list">

                            {filteredStudents.map(
                                (student, index) => {

                                    const totalFee =
                                        Number(
                                            student.hostel_fee ||
                                            0
                                        );

                                    const paidAmount =
                                        Number(
                                            student.paid_amount ||
                                            0
                                        );

                                    const pendingAmount =
                                        Number(
                                            student.pending_amount ||
                                            0
                                        );

                                    const percentage =
                                        totalFee > 0
                                            ? Math.min(
                                                (
                                                    paidAmount /
                                                    totalFee
                                                ) *
                                                100,
                                                100
                                            )
                                            : 0;

                                    return (

                                        <article
                                            className="pending-student-card"
                                            key={
                                                student.student_id ||
                                                index
                                            }
                                        >

                                            {/* STUDENT */}

                                            <div className="pending-student-info">

                                                <div className="pending-student-avatar">

                                                    {
                                                        student.name
                                                            ?.charAt(
                                                                0
                                                            )
                                                            ?.toUpperCase() ||
                                                        "S"
                                                    }

                                                </div>

                                                <div>

                                                    <h3>
                                                        {
                                                            student.name ||
                                                            "Unknown Student"
                                                        }
                                                    </h3>

                                                    <span>
                                                        Student ID:{" "}
                                                        {
                                                            student.student_id ||
                                                            "—"
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                            {/* CONTACT */}

                                            <div className="pending-student-contact">

                                                <div>

                                                    <small>
                                                        Mobile
                                                    </small>

                                                    <strong>
                                                        {
                                                            student.mobile ||
                                                            "—"
                                                        }
                                                    </strong>

                                                </div>

                                                <div>

                                                    <small>
                                                        Email
                                                    </small>

                                                    <strong>
                                                        {
                                                            student.email ||
                                                            "—"
                                                        }
                                                    </strong>

                                                </div>

                                            </div>

                                            {/* FEE */}

                                            <div className="pending-student-fee">

                                                <div className="pending-fee-amount">

                                                    <small>
                                                        PENDING
                                                    </small>

                                                    <strong>
                                                        {formatCurrency(
                                                            pendingAmount
                                                        )}
                                                    </strong>

                                                </div>

                                                <div className="pending-fee-progress">

                                                    <div
                                                        className="pending-fee-progress-bar"
                                                        style={{
                                                            width:
                                                                `${percentage}%`
                                                        }}
                                                    />

                                                </div>

                                                <div className="pending-fee-values">

                                                    <span>
                                                        Paid:{" "}
                                                        {formatCurrency(
                                                            paidAmount
                                                        )}
                                                    </span>

                                                    <span>
                                                        Total:{" "}
                                                        {formatCurrency(
                                                            totalFee
                                                        )}
                                                    </span>

                                                </div>

                                            </div>

                                        </article>

                                    );
                                }
                            )}

                        </div>

                    )}

                </section>

                {/* =================================================
                    NOTE
                ================================================= */}

                <div className="pending-fees-note">

                    <span>
                        ℹ️
                    </span>

                    <div>

                        <strong>
                            Admin Fee Access
                        </strong>

                        <p>
                            This page is for monitoring
                            outstanding fees only. Admin
                            does not collect fees from
                            this panel.
                        </p>

                    </div>

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="pending-fees-footer">

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

export default PendingFees;