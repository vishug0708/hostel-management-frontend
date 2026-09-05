import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MySalary.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const getUserType = () => {
    const staffToken = localStorage.getItem("staffToken");
    const rectorToken = localStorage.getItem("rectorToken");

    if (staffToken) return "staff";
    if (rectorToken) return "rector";

    return null;
};

const getMonthName = (month) => {
    if (!month) return "-";

    return new Date(
        2026,
        Number(month) - 1,
        1
    ).toLocaleString("en-US", {
        month: "long"
    });
};

const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;
};

const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

function MySalary() {
    const navigate = useNavigate();

    const [userType, setUserType] = useState(null);
    const [user, setUser] = useState(null);

    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedSalary, setSelectedSalary] =
        useState(null);

    useEffect(() => {
        const type = getUserType();

        if (!type) {
            navigate("/", {
                replace: true
            });
            return;
        }

        setUserType(type);

        const storageKey =
            type === "staff"
                ? "staff"
                : "rector";

        const savedUser =
            localStorage.getItem(storageKey);

        if (savedUser) {
            try {
                setUser(
                    JSON.parse(savedUser)
                );
            } catch (err) {
                console.error(
                    "User parse error:",
                    err
                );
            }
        }

        loadSalary(type);
    }, [navigate]);

    const loadSalary = async (type = userType) => {
        if (!type) return;

        const token =
            type === "staff"
                ? localStorage.getItem(
                      "staffToken"
                  )
                : localStorage.getItem(
                      "rectorToken"
                  );

        if (!token) {
            navigate("/", {
                replace: true
            });
            return;
        }

        try {
            setLoading(true);
            setError("");

            const endpoint =
                type === "staff"
                    ? `${API_URL}/api/staff/salary`
                    : `${API_URL}/api/rector/salary`;

            const response = await fetch(
                endpoint,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (
                response.status === 401
            ) {
                handleLogout(type);
                return;
            }

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    "Unable to load salary information."
                );
            }

            setSalaries(
                data.salaries || []
            );

        } catch (err) {
            console.error(
                "Salary Load Error:",
                err
            );

            setError(
                err.message ||
                "Unable to load salary information."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = (type = userType) => {
        if (type === "staff") {
            localStorage.removeItem(
                "staffToken"
            );
            localStorage.removeItem(
                "staff"
            );
            localStorage.removeItem(
                "staffPhoto"
            );

            navigate("/staff/login", {
                replace: true
            });

            return;
        }

        localStorage.removeItem(
            "rectorToken"
        );
        localStorage.removeItem(
            "rector"
        );

        navigate("/rector/login", {
            replace: true
        });
    };

    const currentSalary = useMemo(() => {
        if (!salaries.length) return null;

        const now = new Date();

        const currentMonth =
            now.getMonth() + 1;

        const currentYear =
            now.getFullYear();

        return (
            salaries.find(
                (salary) =>
                    Number(
                        salary.salary_month
                    ) === currentMonth &&
                    Number(
                        salary.salary_year
                    ) === currentYear
            ) ||
            salaries[0]
        );
    }, [salaries]);

    const paidCount = salaries.filter(
        (salary) =>
            salary.payment_status ===
            "paid"
    ).length;

    const pendingCount =
        salaries.filter(
            (salary) =>
                salary.payment_status ===
                "pending"
        ).length;

    const printSlip = (salary) => {
        if (!salary) return;

        const printWindow =
            window.open(
                "",
                "_blank",
                "width=800,height=900"
            );

        if (!printWindow) {
            setError(
                "Please allow pop-ups to download the salary slip."
            );
            return;
        }

        const type =
            salary.person_type ===
            "rector"
                ? "Rector"
                : "Staff";

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Salary Slip</title>

                <style>
                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        padding: 40px;
                        font-family: Arial, sans-serif;
                        color: #111827;
                        background: #fff;
                    }

                    .salary-slip {
                        width: 100%;
                        max-width: 720px;
                        margin: auto;
                        border: 1px solid #d1d5db;
                        padding: 35px;
                    }

                    .heading {
                        text-align: center;
                        margin-bottom: 30px;
                    }

                    .heading h1 {
                        margin: 0;
                        font-size: 25px;
                    }

                    .heading p {
                        margin: 7px 0 0;
                        color: #64748b;
                        font-size: 14px;
                    }

                    .person {
                        text-align: center;
                        margin-bottom: 25px;
                    }

                    .person h2 {
                        margin: 0;
                        font-size: 20px;
                    }

                    .person p {
                        margin: 5px 0 0;
                        color: #64748b;
                    }

                    .amount {
                        margin: 25px 0;
                        text-align: center;
                        font-size: 30px;
                        font-weight: 700;
                    }

                    .status {
                        text-align: center;
                        font-size: 15px;
                        font-weight: 700;
                        margin-bottom: 25px;
                    }

                    .row {
                        display: flex;
                        justify-content: space-between;
                        gap: 20px;
                        padding: 12px 0;
                        border-bottom: 1px solid #e5e7eb;
                    }

                    .label {
                        font-weight: 600;
                    }

                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        color: #64748b;
                        font-size: 11px;
                    }

                    @media print {
                        body {
                            padding: 0;
                        }

                        .salary-slip {
                            border: 0;
                        }
                    }
                </style>
            </head>

            <body>

                <div class="salary-slip">

                    <div class="heading">
                        <h1>
                            HOSTEL MANAGEMENT SYSTEM
                        </h1>

                        <p>
                            Salary Payment Slip
                        </p>
                    </div>

                    <div class="person">
                        <h2>
                            ${salary.person_name || "-"}
                        </h2>

                        <p>
                            ${type} •
                            ${salary.person_code || "-"}
                        </p>
                    </div>

                    <div class="row">
                        <span class="label">
                            Salary Month
                        </span>

                        <span>
                            ${getMonthName(
                                salary.salary_month
                            )}
                            ${salary.salary_year || ""}
                        </span>
                    </div>

                    <div class="amount">
                        ${formatMoney(
                            salary.monthly_salary
                        )}
                    </div>

                    <div class="status">
                        PAYMENT STATUS:
                        ${(salary.payment_status || "")
                            .toUpperCase()}
                    </div>

                    <div class="row">
                        <span class="label">
                            Payment Date
                        </span>

                        <span>
                            ${formatDate(
                                salary.payment_date
                            )}
                        </span>
                    </div>

                    <div class="row">
                        <span class="label">
                            Payment Method
                        </span>

                        <span>
                            ${salary.payment_method || "-"}
                        </span>
                    </div>

                    <div class="row">
                        <span class="label">
                            Transaction Reference
                        </span>

                        <span>
                            ${salary.transaction_reference || "-"}
                        </span>
                    </div>

                    <div class="row">
                        <span class="label">
                            Remarks
                        </span>

                        <span>
                            ${salary.remarks || "-"}
                        </span>
                    </div>

                    <div class="footer">
                        This is a computer generated salary payment slip.
                    </div>

                </div>

            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
        }, 300);
    };

    if (!userType) {
        return (
            <div className="my-salary-loading">
                Loading...
            </div>
        );
    }

    const isStaff =
        userType === "staff";

    return (
        <div className="my-salary-page">

            <header className="my-salary-header">

                <button
                    className="back-button"
                    onClick={() =>
                        navigate(
                            isStaff
                                ? "/staff/dashboard"
                                : "/rector/dashboard"
                        )
                    }
                >
                    ← Dashboard
                </button>

                <div className="my-salary-title">
                    <div className="my-salary-icon">
                        💰
                    </div>

                    <div>
                        <h1>
                            My Salary
                        </h1>

                        <p>
                            {isStaff
                                ? "Staff Salary"
                                : "Rector Salary"}
                        </p>
                    </div>
                </div>

                <div className="my-salary-user">
                    <strong>
                        {user?.name || "User"}
                    </strong>

                    <span>
                        {isStaff
                            ? user?.staff_id
                            : user?.rector_id}
                    </span>
                </div>

            </header>

            <main className="my-salary-content">

                {error && (
                    <div className="salary-error">
                        {error}
                    </div>
                )}

                {/* CURRENT MONTH */}

                <section className="current-salary-card">

                    <div className="current-salary-left">

                        <span className="section-label">
                            CURRENT MONTH SALARY
                        </span>

                        <h2>
                            {currentSalary
                                ? getMonthName(
                                      currentSalary.salary_month
                                  )
                                : "-"}{" "}
                            {currentSalary?.salary_year || ""}
                        </h2>

                        <strong className="current-amount">
                            {formatMoney(
                                currentSalary?.monthly_salary
                            )}
                        </strong>

                        {currentSalary && (
                            <span
                                className={`large-status ${
                                    currentSalary.payment_status
                                }`}
                            >
                                {currentSalary.payment_status ===
                                "paid"
                                    ? "✓ Salary Paid"
                                    : "⏳ Salary Pending"}
                            </span>
                        )}

                    </div>

                    <div className="current-salary-right">
                        <div className="salary-icon-large">
                            💰
                        </div>
                    </div>

                </section>

                {/* SUMMARY */}

                <section className="salary-summary">

                    <div className="summary-card">
                        <span>
                            Total Records
                        </span>

                        <strong>
                            {salaries.length}
                        </strong>
                    </div>

                    <div className="summary-card">
                        <span>
                            Paid Months
                        </span>

                        <strong>
                            {paidCount}
                        </strong>
                    </div>

                    <div className="summary-card">
                        <span>
                            Pending Months
                        </span>

                        <strong>
                            {pendingCount}
                        </strong>
                    </div>

                </section>

                {/* HISTORY */}

                <section className="salary-history-card">

                    <div className="history-heading">
                        <div>
                            <h2>
                                Salary History
                            </h2>

                            <p>
                                Your monthly salary payment records
                            </p>
                        </div>

                        <button
                            className="refresh-button"
                            onClick={() =>
                                loadSalary()
                            }
                        >
                            ↻ Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="salary-loading">
                            Loading salary history...
                        </div>
                    ) : salaries.length === 0 ? (
                        <div className="salary-empty">
                            <div>
                                💰
                            </div>

                            <h3>
                                No salary records found
                            </h3>

                            <p>
                                Salary records will appear here
                                once they are created.
                            </p>
                        </div>
                    ) : (
                        <div className="salary-history-table-wrap">

                            <table>

                                <thead>
                                    <tr>
                                        <th>
                                            Month
                                        </th>

                                        <th>
                                            Monthly Salary
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Payment Date
                                        </th>

                                        <th>
                                            Payment Method
                                        </th>

                                        <th>
                                            Reference
                                        </th>

                                        <th>
                                            Slip
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {salaries.map(
                                        (salary) => (
                                            <tr
                                                key={
                                                    salary.id
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        {getMonthName(
                                                            salary.salary_month
                                                        )}
                                                    </strong>

                                                    <span className="salary-year">
                                                        {
                                                            salary.salary_year
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong className="history-amount">
                                                        {formatMoney(
                                                            salary.monthly_salary
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`history-status ${
                                                            salary.payment_status
                                                        }`}
                                                    >
                                                        {salary.payment_status ===
                                                        "paid"
                                                            ? "Paid"
                                                            : "Pending"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        salary.payment_date
                                                    )}
                                                </td>

                                                <td>
                                                    {
                                                        salary.payment_method ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        salary.transaction_reference ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>

                                                    {salary.payment_status ===
                                                        "paid" && (
                                                        <button
                                                            className="download-slip-button"
                                                            onClick={() =>
                                                                printSlip(
                                                                    salary
                                                                )
                                                            }
                                                        >
                                                            🧾 Slip
                                                        </button>
                                                    )}

                                                    {salary.payment_status ===
                                                        "pending" && (
                                                        <span className="not-available">
                                                            Not Available
                                                        </span>
                                                    )}

                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>

            </main>

            {/* DETAIL MODAL */}

            {selectedSalary && (
                <div
                    className="salary-detail-overlay"
                    onClick={() =>
                        setSelectedSalary(
                            null
                        )
                    }
                >
                    <div
                        className="salary-detail-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <button
                            className="close-modal"
                            onClick={() =>
                                setSelectedSalary(
                                    null
                                )
                            }
                        >
                            ×
                        </button>

                        <h2>
                            Salary Details
                        </h2>

                        <div className="detail-amount">
                            {formatMoney(
                                selectedSalary.monthly_salary
                            )}
                        </div>

                        <div className="detail-row">
                            <span>
                                Month
                            </span>

                            <strong>
                                {getMonthName(
                                    selectedSalary.salary_month
                                )}{" "}
                                {
                                    selectedSalary.salary_year
                                }
                            </strong>
                        </div>

                        <div className="detail-row">
                            <span>
                                Status
                            </span>

                            <strong>
                                {selectedSalary.payment_status}
                            </strong>
                        </div>

                        <div className="detail-row">
                            <span>
                                Payment Date
                            </span>

                            <strong>
                                {formatDate(
                                    selectedSalary.payment_date
                                )}
                            </strong>
                        </div>

                        <div className="detail-row">
                            <span>
                                Payment Method
                            </span>

                            <strong>
                                {
                                    selectedSalary.payment_method ||
                                    "-"
                                }
                            </strong>
                        </div>

                        <div className="detail-row">
                            <span>
                                Reference
                            </span>

                            <strong>
                                {
                                    selectedSalary.transaction_reference ||
                                    "-"
                                }
                            </strong>
                        </div>

                        {selectedSalary.payment_status ===
                            "paid" && (
                            <button
                                className="modal-slip-button"
                                onClick={() =>
                                    printSlip(
                                        selectedSalary
                                    )
                                }
                            >
                                🧾 Download Salary Slip
                            </button>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
}

export default MySalary;