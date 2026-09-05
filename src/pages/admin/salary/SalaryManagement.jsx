import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SalaryManagement.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAdminPhotoUrl = (photo) => {
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

    return `${API_URL}/uploads/admins/${normalized}`;
};

const monthName = (month) => {
    if (!month) return "";

    return new Date(
        2026,
        Number(month) - 1,
        1
    ).toLocaleString("en-US", {
        month: "long"
    });
};

const formatMoney = (amount) => {
    const value = Number(amount || 0);

    return `₹${value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

const getModeFromPath = (pathname) => {
    if (pathname.includes("/salary/staff")) return "staff";
    if (pathname.includes("/salary/rector")) return "rector";
    if (pathname.includes("/salary/pending")) return "pending";
    if (pathname.includes("/salary/history")) return "history";
    if (pathname.includes("/salary/slips")) return "slips";

    return "staff";
};

const modeDetails = {
    staff: {
        title: "Staff Salary",
        subtitle: "Manage monthly staff salaries",
        icon: "👨‍💼"
    },
    rector: {
        title: "Rector Salary",
        subtitle: "Manage monthly rector salaries",
        icon: "👨‍🏫"
    },
    pending: {
        title: "Pending Salary",
        subtitle: "View unpaid staff and rector salaries",
        icon: "⏳"
    },
    history: {
        title: "Payment History",
        subtitle: "View completed salary payments",
        icon: "📜"
    },
    slips: {
        title: "Salary Slips",
        subtitle: "View and print salary payment slips",
        icon: "🧾"
    }
};

export default function SalaryManagement() {
    const navigate = useNavigate();
    const location = useLocation();

    const mode = getModeFromPath(location.pathname);
    const details = modeDetails[mode];

    const [admin, setAdmin] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");

    const [selectedSalary, setSelectedSalary] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);

    const [paymentForm, setPaymentForm] = useState({
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: "RazorpayX",
        transaction_reference: "",
        remarks: ""
    });

    const [paying, setPaying] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login", { replace: true });
            return;
        }

        const savedAdmin = localStorage.getItem("admin");

        if (savedAdmin) {
            try {
                setAdmin(JSON.parse(savedAdmin));
            } catch (err) {
                console.error("Admin data parse error:", err);
            }
        }

        loadAdminProfile();
    }, [navigate]);

    useEffect(() => {
        loadSalaries();
    }, [mode]);

    const loadAdminProfile = async () => {
        const token = localStorage.getItem("adminToken");

        if (!token) return;

        try {
            const response = await fetch(
                `${API_URL}/api/admin/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                setAdmin(data.admin);
                localStorage.setItem(
                    "admin",
                    JSON.stringify(data.admin)
                );
            }
        } catch (err) {
            console.error(
                "Admin Profile Error:",
                err
            );
        }
    };

    const loadSalaries = async () => {
        const token = localStorage.getItem("adminToken");

        if (!token) return;

        try {
            setLoading(true);
            setError("");

            let endpoint =
                `${API_URL}/api/admin/salary`;

            if (mode === "staff") {
                endpoint =
                    `${API_URL}/api/admin/salary/staff`;
            }

            if (mode === "rector") {
                endpoint =
                    `${API_URL}/api/admin/salary/rector`;
            }

            if (mode === "pending") {
                endpoint =
                    `${API_URL}/api/admin/salary/pending`;
            }

            if (mode === "history" || mode === "slips") {
                endpoint =
                    `${API_URL}/api/admin/salary/history`;
            }

            const response = await fetch(
                endpoint,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to load salary records."
                );
            }

            setSalaries(data.salaries || []);

        } catch (err) {
            console.error(
                "Salary Load Error:",
                err
            );

            setError(
                err.message ||
                "Unable to load salary records."
            );
        } finally {
            setLoading(false);
        }
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    const nav = (path) => {
        closeMobileMenu();
        setError("");
        setSuccess("");
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        navigate("/admin/login", {
            replace: true
        });
    };

    const filteredSalaries = useMemo(() => {
        const query = search.trim().toLowerCase();

        return salaries.filter((salary) => {
            const matchesSearch =
                !query ||
                String(
                    salary.person_name || ""
                )
                    .toLowerCase()
                    .includes(query) ||
                String(
                    salary.person_code || ""
                )
                    .toLowerCase()
                    .includes(query) ||
                String(
                    salary.person_type || ""
                )
                    .toLowerCase()
                    .includes(query) ||
                String(
                    salary.payment_method || ""
                )
                    .toLowerCase()
                    .includes(query) ||
                String(
                    salary.transaction_reference || ""
                )
                    .toLowerCase()
                    .includes(query);

            const matchesMonth =
                !month ||
                Number(salary.salary_month) ===
                    Number(month);

            const matchesYear =
                !year ||
                Number(salary.salary_year) ===
                    Number(year);

            return (
                matchesSearch &&
                matchesMonth &&
                matchesYear
            );
        });
    }, [
        salaries,
        search,
        month,
        year
    ]);

    const totalAmount = useMemo(() => {
        return filteredSalaries.reduce(
            (total, salary) =>
                total +
                Number(
                    salary.monthly_salary || 0
                ),
            0
        );
    }, [filteredSalaries]);

    const pendingAmount = useMemo(() => {
        return filteredSalaries
            .filter(
                (salary) =>
                    salary.payment_status ===
                    "pending"
            )
            .reduce(
                (total, salary) =>
                    total +
                    Number(
                        salary.monthly_salary || 0
                    ),
                0
            );
    }, [filteredSalaries]);

    const paidAmount = useMemo(() => {
        return filteredSalaries
            .filter(
                (salary) =>
                    salary.payment_status ===
                    "paid"
            )
            .reduce(
                (total, salary) =>
                    total +
                    Number(
                        salary.monthly_salary || 0
                    ),
                0
            );
    }, [filteredSalaries]);

    const openPayModal = (salary) => {
        setSelectedSalary(salary);

        setPaymentForm({
            payment_date:
                new Date()
                    .toISOString()
                    .slice(0, 10),
            payment_method: "RazorpayX",
            transaction_reference: "",
            remarks: ""
        });

        setError("");
        setSuccess("");
        setShowPayModal(true);
    };

    const closePayModal = () => {
        if (paying) return;

        setShowPayModal(false);
        setSelectedSalary(null);
    };

    const handlePaymentChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setPaymentForm(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );
    };

    const markAsPaid = async (event) => {
        event.preventDefault();

        if (!selectedSalary) return;

        const token =
            localStorage.getItem(
                "adminToken"
            );

        if (!token) {
            navigate("/admin/login", {
                replace: true
            });
            return;
        }

        try {
            setPaying(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/admin/salary/${selectedSalary.id}/pay`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`
                    },
                    body: JSON.stringify(
                        paymentForm
                    )
                }
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    "Unable to mark salary as paid."
                );
            }

            setShowPayModal(false);
            setSelectedSalary(null);

            setSuccess(
                "Salary marked as paid successfully."
            );

            await loadSalaries();

        } catch (err) {
            console.error(
                "Salary Payment Error:",
                err
            );

            setError(
                err.message ||
                "Unable to process salary payment."
            );
        } finally {
            setPaying(false);
        }
    };

    const printSlip = (salary) => {
        const printWindow =
            window.open(
                "",
                "_blank",
                "width=800,height=900"
            );

        if (!printWindow) {
            setError(
                "Please allow pop-ups to print the salary slip."
            );
            return;
        }

        const personType =
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
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 40px;
                        color: #111827;
                    }
                    .slip {
                        max-width: 700px;
                        margin: auto;
                        border: 1px solid #d1d5db;
                        padding: 35px;
                    }
                    h1 {
                        margin: 0 0 8px;
                        text-align: center;
                        font-size: 25px;
                    }
                    .subtitle {
                        text-align: center;
                        color: #6b7280;
                        margin-bottom: 30px;
                    }
                    .row {
                        display: flex;
                        justify-content: space-between;
                        padding: 11px 0;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .label {
                        font-weight: 600;
                    }
                    .amount {
                        font-size: 24px;
                        font-weight: 700;
                        margin: 25px 0;
                        text-align: center;
                    }
                    .paid {
                        text-align: center;
                        font-weight: 700;
                        margin-bottom: 25px;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        font-size: 12px;
                        color: #6b7280;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                        .slip {
                            border: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="slip">
                    <h1>HOSTEL MANAGEMENT SYSTEM</h1>
                    <div class="subtitle">
                        Salary Payment Slip
                    </div>

                    <div class="row">
                        <span class="label">
                            Person Type
                        </span>
                        <span>
                            ${personType}
                        </span>
                    </div>

                    <div class="row">
                        <span class="label">
                            ID
                        </span>
                        <span>
                            ${salary.person_code || "-"}
                        </span>
                    </div>

                    <div class="row">
                        <span class="label">
                            Name
                        </span>
                        <span>
                            ${salary.person_name || "-"}
                        </span>
                    </div>

                    <div class="row">
                        <span class="label">
                            Salary Month
                        </span>
                        <span>
                            ${monthName(salary.salary_month)}
                            ${salary.salary_year || ""}
                        </span>
                    </div>

                    <div class="amount">
                        ${formatMoney(salary.monthly_salary)}
                    </div>

                    <div class="paid">
                        PAYMENT STATUS:
                        ${(salary.payment_status || "").toUpperCase()}
                    </div>

                    <div class="row">
                        <span class="label">
                            Payment Date
                        </span>
                        <span>
                            ${salary.payment_date || "-"}
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

    const clearFilters = () => {
        setSearch("");
        setMonth("");
        setYear("");
    };

    return (
        <div className="salary-page">

            {/* SIDEBAR */}

            <aside
                className={`salary-sidebar ${
                    mobileMenuOpen
                        ? "mobile-open"
                        : ""
                }`}
            >

                <div className="salary-sidebar-brand">
                    <div className="salary-brand-icon">
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

                <nav className="salary-sidebar-nav">

                    <button
                        onClick={() =>
                            nav(
                                "/admin/dashboard"
                            )
                        }
                    >
                        <span>📊</span>
                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            nav(
                                "/admin/students"
                            )
                        }
                    >
                        <span>🎓</span>
                        Students
                    </button>

                    <button
                        onClick={() =>
                            nav(
                                "/admin/rooms"
                            )
                        }
                    >
                        <span>🛏️</span>
                        Rooms
                    </button>

                    <button
                        onClick={() =>
                            nav(
                                "/admin/fees"
                            )
                        }
                    >
                        <span>💳</span>
                        Fees
                    </button>

                    <button
                        onClick={() =>
                            nav(
                                "/admin/complaints"
                            )
                        }
                    >
                        <span>📝</span>
                        Complaints
                    </button>

                    <button
                        onClick={() =>
                            nav(
                                "/admin/cricket-box"
                            )
                        }
                    >
                        <span>🏏</span>
                        Cricket Box
                    </button>

                    <button
                        onClick={() =>
                            nav(
                                "/admin/announcements"
                            )
                        }
                    >
                        <span>📢</span>
                        Announcements
                    </button>

                    <button
                        onClick={() =>
                            nav(
                                "/admin/reports"
                            )
                        }
                    >
                        <span>📊</span>
                        Reports
                    </button>

                    <button
                        onClick={() =>
                            nav(
                                "/admin/staff"
                            )
                        }
                    >
                        <span>👨‍💼</span>
                        Staff Management
                    </button>

                    <button
                        onClick={() =>
                            nav(
                                "/admin/rectors"
                            )
                        }
                    >
                        <span>👨‍🏫</span>
                        Rector Management
                    </button>

                    <button className="active">
                        <span>💰</span>
                        Salary Management
                    </button>

                    <button
                        onClick={() =>
                            nav(
                                "/admin/profile"
                            )
                        }
                    >
                        <span>👤</span>
                        Profile
                    </button>

                </nav>

                <button
                    className="salary-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>

            {mobileMenuOpen && (
                <div
                    className="salary-overlay"
                    onClick={
                        closeMobileMenu
                    }
                />
            )}

            {/* MAIN */}

            <main className="salary-main">

                <header className="salary-topbar">

                    <button
                        className="salary-hamburger"
                        onClick={() =>
                            setMobileMenuOpen(
                                true
                            )
                        }
                    >
                        ☰
                    </button>

                    <div className="salary-page-heading">
                        <h1>
                            {details.icon}{" "}
                            {details.title}
                        </h1>

                        <p>
                            {details.subtitle}
                        </p>
                    </div>

                    <button
                        className="salary-admin-profile"
                        onClick={() =>
                            navigate(
                                "/admin/profile"
                            )
                        }
                    >
                        {admin?.photo ? (
                            <img
                                src={getAdminPhotoUrl(
                                    admin.photo
                                )}
                                alt="Admin"
                            />
                        ) : (
                            "👤"
                        )}
                    </button>

                </header>

                {/* TABS */}

                <div className="salary-tabs">

                    <button
                        className={
                            mode === "staff"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            nav(
                                "/admin/salary/staff"
                            )
                        }
                    >
                        👨‍💼 Staff Salary
                    </button>

                    <button
                        className={
                            mode === "rector"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            nav(
                                "/admin/salary/rector"
                            )
                        }
                    >
                        👨‍🏫 Rector Salary
                    </button>

                    <button
                        className={
                            mode === "pending"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            nav(
                                "/admin/salary/pending"
                            )
                        }
                    >
                        ⏳ Pending Salary
                    </button>

                    <button
                        className={
                            mode === "history"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            nav(
                                "/admin/salary/history"
                            )
                        }
                    >
                        📜 Payment History
                    </button>

                    <button
                        className={
                            mode === "slips"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            nav(
                                "/admin/salary/slips"
                            )
                        }
                    >
                        🧾 Salary Slips
                    </button>

                </div>

                {/* MESSAGES */}

                {error && (
                    <div className="salary-alert error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="salary-alert success">
                        {success}
                    </div>
                )}

                {/* STATS */}

                <section className="salary-stats">

                    <div className="salary-stat-card">
                        <div>
                            <span>
                                Total Records
                            </span>
                            <strong>
                                {
                                    filteredSalaries.length
                                }
                            </strong>
                        </div>
                        <div className="stat-icon">
                            📋
                        </div>
                    </div>

                    <div className="salary-stat-card">
                        <div>
                            <span>
                                Total Salary
                            </span>
                            <strong>
                                {formatMoney(
                                    totalAmount
                                )}
                            </strong>
                        </div>
                        <div className="stat-icon">
                            💰
                        </div>
                    </div>

                    <div className="salary-stat-card">
                        <div>
                            <span>
                                Paid
                            </span>
                            <strong>
                                {formatMoney(
                                    paidAmount
                                )}
                            </strong>
                        </div>
                        <div className="stat-icon">
                            ✅
                        </div>
                    </div>

                    <div className="salary-stat-card">
                        <div>
                            <span>
                                Pending
                            </span>
                            <strong>
                                {formatMoney(
                                    pendingAmount
                                )}
                            </strong>
                        </div>
                        <div className="stat-icon">
                            ⏳
                        </div>
                    </div>

                </section>

                {/* FILTERS */}

                <section className="salary-filter-card">

                    <input
                        type="text"
                        placeholder="Search name, ID, type or transaction..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                    <select
                        value={month}
                        onChange={(event) =>
                            setMonth(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            All Months
                        </option>

                        {Array.from(
                            { length: 12 },
                            (_, index) => (
                                <option
                                    key={index + 1}
                                    value={
                                        index + 1
                                    }
                                >
                                    {monthName(
                                        index + 1
                                    )}
                                </option>
                            )
                        )}
                    </select>

                    <input
                        type="number"
                        placeholder="Year"
                        value={year}
                        onChange={(event) =>
                            setYear(
                                event.target.value
                            )
                        }
                    />

                    <button
                        className="clear-filter-btn"
                        onClick={
                            clearFilters
                        }
                    >
                        Clear
                    </button>

                    <button
                        className="refresh-salary-btn"
                        onClick={
                            loadSalaries
                        }
                    >
                        ↻ Refresh
                    </button>

                </section>

                {/* TABLE */}

                <section className="salary-table-card">

                    <div className="salary-table-header">
                        <div>
                            <h2>
                                {details.title}
                            </h2>

                            <p>
                                {
                                    filteredSalaries.length
                                } records found
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="salary-loading">
                            Loading salary records...
                        </div>
                    ) : filteredSalaries.length ===
                      0 ? (
                        <div className="salary-empty">
                            <div>
                                💰
                            </div>

                            <h3>
                                No salary records found
                            </h3>

                            <p>
                                No records match the
                                selected filters.
                            </p>
                        </div>
                    ) : (
                        <div className="salary-table-wrap">

                            <table>

                                <thead>
                                    <tr>
                                        <th>
                                            Person
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Salary Month
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
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredSalaries.map(
                                        (salary) => (
                                            <tr
                                                key={
                                                    salary.id
                                                }
                                            >

                                                <td>
                                                    <div className="salary-person">
                                                        <strong>
                                                            {
                                                                salary.person_name ||
                                                                "-"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                salary.person_code ||
                                                                "-"
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`person-type ${
                                                            salary.person_type
                                                        }`}
                                                    >
                                                        {salary.person_type ===
                                                        "rector"
                                                            ? "Rector"
                                                            : "Staff"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong>
                                                        {monthName(
                                                            salary.salary_month
                                                        )}
                                                    </strong>

                                                    <span className="year-text">
                                                        {
                                                            salary.salary_year
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong className="salary-amount">
                                                        {formatMoney(
                                                            salary.monthly_salary
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`payment-status ${
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
                                                    {
                                                        salary.payment_date ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        salary.payment_method ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    <span className="reference-text">
                                                        {
                                                            salary.transaction_reference ||
                                                            "-"
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="salary-actions">

                                                        {salary.payment_status ===
                                                            "pending" &&
                                                            mode !==
                                                                "history" &&
                                                            mode !==
                                                                "slips" && (
                                                                <button
                                                                    className="pay-btn"
                                                                    onClick={() =>
                                                                        openPayModal(
                                                                            salary
                                                                        )
                                                                    }
                                                                >
                                                                    Pay
                                                                </button>
                                                            )}

                                                        {salary.payment_status ===
                                                            "paid" && (
                                                            <button
                                                                className="slip-btn"
                                                                onClick={() =>
                                                                    printSlip(
                                                                        salary
                                                                    )
                                                                }
                                                            >
                                                                🧾 Slip
                                                            </button>
                                                        )}

                                                    </div>
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

            {/* PAYMENT MODAL */}

            {showPayModal &&
                selectedSalary && (
                    <div className="salary-modal-overlay">

                        <div className="salary-pay-modal">

                            <button
                                className="salary-modal-close"
                                onClick={
                                    closePayModal
                                }
                            >
                                ×
                            </button>

                            <div className="salary-modal-icon">
                                💰
                            </div>

                            <h2>
                                Pay Salary
                            </h2>

                            <p className="modal-description">
                                {selectedSalary.person_name}
                                {" — "}
                                {monthName(
                                    selectedSalary.salary_month
                                )}{" "}
                                {
                                    selectedSalary.salary_year
                                }
                            </p>

                            <div className="modal-salary-amount">
                                {formatMoney(
                                    selectedSalary.monthly_salary
                                )}
                            </div>

                            <form
                                onSubmit={
                                    markAsPaid
                                }
                            >

                                <label>
                                    Payment Date
                                    <input
                                        type="date"
                                        name="payment_date"
                                        value={
                                            paymentForm.payment_date
                                        }
                                        onChange={
                                            handlePaymentChange
                                        }
                                        required
                                    />
                                </label>

                                <label>
                                    Payment Method
                                    <select
                                        name="payment_method"
                                        value={
                                            paymentForm.payment_method
                                        }
                                        onChange={
                                            handlePaymentChange
                                        }
                                    >
                                        <option value="RazorpayX">
                                            RazorpayX
                                        </option>
                                        <option value="Bank Transfer">
                                            Bank Transfer
                                        </option>
                                        <option value="Cash">
                                            Cash
                                        </option>
                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>
                                </label>

                                <label>
                                    Transaction / Reference Number
                                    <input
                                        type="text"
                                        name="transaction_reference"
                                        placeholder="Enter reference number"
                                        value={
                                            paymentForm.transaction_reference
                                        }
                                        onChange={
                                            handlePaymentChange
                                        }
                                    />
                                </label>

                                <label>
                                    Remarks
                                    <textarea
                                        name="remarks"
                                        placeholder="Optional remarks"
                                        value={
                                            paymentForm.remarks
                                        }
                                        onChange={
                                            handlePaymentChange
                                        }
                                        rows="3"
                                    />
                                </label>

                                <div className="salary-modal-actions">

                                    <button
                                        type="button"
                                        className="cancel-pay-btn"
                                        onClick={
                                            closePayModal
                                        }
                                        disabled={
                                            paying
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="confirm-pay-btn"
                                        disabled={
                                            paying
                                        }
                                    >
                                        {paying
                                            ? "Processing..."
                                            : "Mark as Paid"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )}

        </div>
    );
}