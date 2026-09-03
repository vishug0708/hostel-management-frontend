import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewComplaints.css";

function ViewComplaints() {
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
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
                `${API_URL}/api/admin/complaints`,
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
                    "Unable to load complaints."
                );
            }

            setComplaints(
                Array.isArray(data.complaints)
                    ? data.complaints
                    : []
            );
        } catch (err) {
            console.error(
                "Complaints Error:",
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

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");

        navigate("/admin/login", {
            replace: true
        });
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
        return String(status || "Pending")
            .toLowerCase()
            .replace(/\s+/g, "-");
    };

    const filteredComplaints = useMemo(() => {
        const searchText =
            search.trim().toLowerCase();

        return complaints.filter((complaint) => {
            const matchesSearch =
                !searchText ||
                String(
                    complaint.id || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    complaint.student_name || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    complaint.student_id || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    complaint.subject || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    complaint.description || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    complaint.staff_name || ""
                )
                    .toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "All" ||
                String(
                    complaint.status || ""
                ).toLowerCase() ===
                statusFilter.toLowerCase();

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        complaints,
        search,
        statusFilter
    ]);

    const totalComplaints =
        complaints.length;

    const pendingComplaints =
        complaints.filter(
            (complaint) =>
                String(
                    complaint.status || ""
                ).toLowerCase() === "pending"
        ).length;

    const inProgressComplaints =
        complaints.filter(
            (complaint) =>
                String(
                    complaint.status || ""
                ).toLowerCase() ===
                "in progress"
        ).length;

    const resolvedComplaints =
        complaints.filter(
            (complaint) =>
                String(
                    complaint.status || ""
                ).toLowerCase() === "resolved"
        ).length;

    if (loading) {
        return (
            <div className="view-complaints-loading">
                <div className="view-complaints-spinner">
                    ⏳
                </div>

                <p>
                    Loading complaints...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="view-complaints-error-page">
                <div className="view-complaints-error-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Complaints
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={fetchComplaints}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="view-complaints-page">

            {/* SIDEBAR */}

            <aside className="view-complaints-sidebar">

                <div className="view-complaints-brand">

                    <div className="view-complaints-brand-icon">
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

                <nav className="view-complaints-nav">

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
                        className="active"
                        onClick={() =>
                            navigate(
                                "/admin/complaints"
                            )
                        }
                    >
                        📝 Complaints
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
                    className="view-complaints-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>

            {/* MAIN */}

            <main className="view-complaints-main">

                {/* HEADER */}

                <header className="view-complaints-header">

                    <div>

                        <span>
                            COMPLAINT MANAGEMENT
                        </span>

                        <h1>
                            View Complaints
                        </h1>

                        <p>
                            Monitor student complaints
                            and their current status.
                        </p>

                    </div>

                    <button
                        className="view-complaints-refresh"
                        onClick={fetchComplaints}
                    >
                        ↻ Refresh
                    </button>

                </header>

                {/* SUMMARY */}

                <section className="view-complaints-summary">

                    <div className="complaint-summary-card">

                        <div className="complaint-summary-icon total">
                            📝
                        </div>

                        <div>
                            <span>
                                TOTAL COMPLAINTS
                            </span>

                            <strong>
                                {totalComplaints}
                            </strong>
                        </div>

                    </div>

                    <div className="complaint-summary-card">

                        <div className="complaint-summary-icon pending">
                            ⏳
                        </div>

                        <div>
                            <span>
                                PENDING
                            </span>

                            <strong>
                                {pendingComplaints}
                            </strong>
                        </div>

                    </div>

                    <div className="complaint-summary-card">

                        <div className="complaint-summary-icon progress">
                            🔧
                        </div>

                        <div>
                            <span>
                                IN PROGRESS
                            </span>

                            <strong>
                                {inProgressComplaints}
                            </strong>
                        </div>

                    </div>

                    <div className="complaint-summary-card">

                        <div className="complaint-summary-icon resolved">
                            ✓
                        </div>

                        <div>
                            <span>
                                RESOLVED
                            </span>

                            <strong>
                                {resolvedComplaints}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* FILTER */}

                <section className="view-complaints-filters">

                    <div className="complaint-search">

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
                            placeholder="Search complaint, student, ID, subject or staff..."
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

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="In Progress">
                            In Progress
                        </option>

                        <option value="Resolved">
                            Resolved
                        </option>

                    </select>

                </section>

                {/* COMPLAINTS */}

                <section className="view-complaints-card">

                    <div className="view-complaints-card-header">

                        <div>

                            <span>
                                STUDENT COMPLAINTS
                            </span>

                            <h2>
                                All Complaints
                            </h2>

                        </div>

                        <div className="view-complaints-count">
                            {filteredComplaints.length}
                            {" Records"}
                        </div>

                    </div>

                    {filteredComplaints.length === 0 ? (

                        <div className="view-complaints-empty">

                            <div className="view-complaints-empty-icon">
                                ✓
                            </div>

                            <h3>
                                No Complaints Found
                            </h3>

                            <p>
                                No complaints match
                                the selected filters.
                            </p>

                        </div>

                    ) : (

                        <div className="complaints-table-wrapper">

                            <table className="complaints-table">

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Room
                                        </th>

                                        <th>
                                            Complaint
                                        </th>

                                        <th>
                                            Assigned Staff
                                        </th>

                                        <th>
                                            Complaint Date
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredComplaints.map(
                                        (complaint) => (

                                            <tr
                                                key={
                                                    complaint.id
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        #
                                                        {
                                                            complaint.id
                                                        }
                                                    </strong>
                                                </td>

                                                <td>

                                                    <div className="complaint-student">

                                                        <div className="complaint-student-avatar">
                                                            {
                                                                complaint.student_name
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
                                                                    complaint.student_name ||
                                                                    "Unknown"
                                                                }
                                                            </strong>

                                                            <span>
                                                                ID:{" "}
                                                                {
                                                                    complaint.student_id ||
                                                                    "—"
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td>
                                                    {
                                                        complaint.room_no ||
                                                        complaint.room_id ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>

                                                    <div className="complaint-subject">

                                                        <strong>
                                                            {
                                                                complaint.subject ||
                                                                "No Subject"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                complaint.description
                                                                    ? complaint.description.length >
                                                                      70
                                                                        ? `${complaint.description.substring(
                                                                            0,
                                                                            70
                                                                        )}...`
                                                                        : complaint.description
                                                                    : "No description"
                                                            }
                                                        </span>

                                                    </div>

                                                </td>

                                                <td>

                                                    <div className="assigned-staff">

                                                        <strong>
                                                            {
                                                                complaint.staff_name ||
                                                                complaint.assigned_staff_name ||
                                                                "Not Assigned"
                                                            }
                                                        </strong>

                                                        {complaint.staff_role && (
                                                            <span>
                                                                {
                                                                    complaint.staff_role
                                                                }
                                                            </span>
                                                        )}

                                                    </div>

                                                </td>

                                                <td>
                                                    {formatDate(
                                                        complaint.complaint_date ||
                                                        complaint.created_at
                                                    )}
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `complaint-status ${getStatusClass(
                                                                complaint.status
                                                            )}`
                                                        }
                                                    >
                                                        {
                                                            complaint.status ||
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

                {/* ADMIN NOTE */}

                <div className="view-complaints-note">

                    <span>
                        ℹ️
                    </span>

                    <div>

                        <strong>
                            Admin Access
                        </strong>

                        <p>
                            Admin can only monitor
                            complaints and view their
                            current status. Complaint
                            resolution is handled by the
                            assigned staff member.
                        </p>

                    </div>

                </div>

                {/* FOOTER */}

                <footer className="view-complaints-footer">

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

export default ViewComplaints;