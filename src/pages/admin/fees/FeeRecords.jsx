import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FeeRecords.css";

function FeeRecords() {
    const navigate = useNavigate();

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchFeeRecords();
    }, []);

    const fetchFeeRecords = async () => {
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
                "http://localhost:5000/api/admin/fees/payment-history",
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
                    "Unable to load fee records."
                );
                return;
            }

            setRecords(
                Array.isArray(data.payments)
                    ? data.payments
                    : []
            );
        } catch (err) {
            console.error(
                "Fee Records Error:",
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

    const filteredRecords = records.filter(
        (record) => {
            const searchText =
                search.trim().toLowerCase();

            const matchesSearch =
                !searchText ||
                String(
                    record.student_name || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    record.student_id || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    record.room_id || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    record.payment_method || ""
                )
                    .toLowerCase()
                    .includes(searchText);

            const recordStatus =
                String(
                    record.status || ""
                ).toLowerCase();

            const matchesStatus =
                statusFilter === "all" ||
                recordStatus ===
                    statusFilter.toLowerCase();

            return (
                matchesSearch &&
                matchesStatus
            );
        }
    );

    const totalAmount = filteredRecords.reduce(
        (total, record) => {
            const status =
                String(
                    record.status || ""
                ).toLowerCase();

            if (
                status === "paid" ||
                status === "success" ||
                status === "completed"
            ) {
                return (
                    total +
                    Number(
                        record.amount || 0
                    )
                );
            }

            return total;
        },
        0
    );

    if (loading) {
        return (
            <div className="fee-records-loading">
                <div className="fee-records-spinner">
                    ⏳
                </div>

                <p>
                    Loading fee records...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fee-records-error-page">
                <div className="fee-records-error-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Fee Records
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={fetchFeeRecords}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="fee-records-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="fee-records-sidebar">

                <div className="fee-records-brand">

                    <div className="fee-records-brand-icon">
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

                <nav className="fee-records-nav">

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
                    className="fee-records-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="fee-records-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="fee-records-header">

                    <div>

                        <span>
                            FEES MANAGEMENT
                        </span>

                        <h1>
                            Fee Records
                        </h1>

                        <p>
                            View and monitor all student
                            fee payment records.
                        </p>

                    </div>

                    <button
                        className="fee-records-back-btn"
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

                <section className="fee-records-summary">

                    <div className="fee-records-summary-card">

                        <span>
                            TOTAL RECORDS
                        </span>

                        <strong>
                            {filteredRecords.length}
                        </strong>

                    </div>

                    <div className="fee-records-summary-card">

                        <span>
                            TOTAL PAID
                        </span>

                        <strong>
                            {formatCurrency(
                                totalAmount
                            )}
                        </strong>

                    </div>

                    <div className="fee-records-summary-card">

                        <span>
                            SHOWING
                        </span>

                        <strong>
                            {filteredRecords.length}
                            {" / "}
                            {records.length}
                        </strong>

                    </div>

                </section>

                {/* =================================================
                    FILTERS
                ================================================= */}

                <section className="fee-records-filter-card">

                    <div className="fee-records-search">

                        <span>
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search student, ID, room..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
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
                        <option value="all">
                            All Status
                        </option>

                        <option value="paid">
                            Paid
                        </option>

                        <option value="success">
                            Success
                        </option>

                        <option value="completed">
                            Completed
                        </option>

                        <option value="pending">
                            Pending
                        </option>

                        <option value="failed">
                            Failed
                        </option>

                    </select>

                    <button
                        className="fee-records-refresh-btn"
                        onClick={fetchFeeRecords}
                    >
                        ↻ Refresh
                    </button>

                </section>

                {/* =================================================
                    RECORDS TABLE
                ================================================= */}

                <section className="fee-records-card">

                    <div className="fee-records-card-header">

                        <div>

                            <span>
                                PAYMENT HISTORY
                            </span>

                            <h2>
                                Fee Payment Records
                            </h2>

                        </div>

                        <div className="fee-records-count">
                            {filteredRecords.length}
                            {" Records"}
                        </div>

                    </div>

                    {filteredRecords.length === 0 ? (

                        <div className="fee-records-empty">

                            <div className="fee-records-empty-icon">
                                💳
                            </div>

                            <h3>
                                No Fee Records Found
                            </h3>

                            <p>
                                No payment records match
                                your current search or filter.
                            </p>

                        </div>

                    ) : (

                        <div className="fee-records-table-wrapper">

                            <table className="fee-records-table">

                                <thead>

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Room
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

                                    {filteredRecords.map(
                                        (record, index) => (

                                            <tr
                                                key={
                                                    record.id ||
                                                    index
                                                }
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>

                                                    <div className="fee-record-student">

                                                        <div className="fee-record-student-avatar">

                                                            {
                                                                record.student_name
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
                                                                    record.student_name ||
                                                                    "Unknown Student"
                                                                }
                                                            </strong>

                                                            <small>
                                                                Student ID:{" "}
                                                                {
                                                                    record.student_id ||
                                                                    "—"
                                                                }
                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td>
                                                    {record.room_id
                                                        ? `Room ${record.room_id}`
                                                        : "—"}
                                                </td>

                                                <td>

                                                    <strong className="fee-record-amount">

                                                        {formatCurrency(
                                                            record.amount
                                                        )}

                                                    </strong>

                                                </td>

                                                <td>
                                                    {
                                                        record.payment_method ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        record.payment_date
                                                    )}
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `fee-record-status ${getStatusClass(
                                                                record.status
                                                            )}`
                                                        }
                                                    >
                                                        {
                                                            record.status ||
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
                    INFO
                ================================================= */}

                <div className="fee-records-note">

                    <span>
                        ℹ️
                    </span>

                    <div>

                        <strong>
                            Admin Access
                        </strong>

                        <p>
                            These records are for monitoring
                            and verification only. Admin does
                            not collect fees from this panel.
                        </p>

                    </div>

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="fee-records-footer">

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

export default FeeRecords;