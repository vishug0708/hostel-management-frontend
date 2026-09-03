import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewComplaints.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getPhotoUrl(photo) {
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
}

function ViewComplaints() {
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        fetchComplaints();
        fetchAdminProfile();
    }, []);

    const fetchAdminProfile = async () => {
        const token = localStorage.getItem("adminToken");

        if (!token) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/admin/profile`,
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
                    data.message || "Unable to load admin profile."
                );
            }

            const adminData = data.admin;

            setAdmin(adminData);

            localStorage.setItem(
                "admin",
                JSON.stringify(adminData)
            );
        } catch (error) {
            console.error(
                "Admin Profile Error:",
                error
            );

            const savedAdmin =
                localStorage.getItem("admin");

            if (savedAdmin) {
                try {
                    setAdmin(JSON.parse(savedAdmin));
                } catch (parseError) {
                    console.error(
                        "Admin data parse error:",
                        parseError
                    );
                }
            }
        }
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
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
            <aside
                className={`view-complaints-sidebar ${mobileMenuOpen ? "view-complaints-sidebar-open" : ""
                    }`}
            >
                <div className="view-complaints-sidebar-brand">
                    <div className="view-complaints-brand-icon">
                        🏠
                    </div>

                    <div>
                        <strong>Hostel</strong>
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav className="view-complaints-sidebar-nav">
                    <button
                        className="view-complaints-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/dashboard");
                        }}
                    >
                        <span>📊</span>
                        Dashboard
                    </button>

                    <button
                        className="view-complaints-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/students");
                        }}
                    >
                        <span>🎓</span>
                        Students
                    </button>

                    <button
                        className="view-complaints-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/rooms");
                        }}
                    >
                        <span>🛏️</span>
                        Rooms
                    </button>

                    <button
                        className="view-complaints-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/fees");
                        }}
                    >
                        <span>💳</span>
                        Fees
                    </button>

                    <button
                        className="view-complaints-sidebar-item active"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/complaints");
                        }}
                    >
                        <span>📝</span>
                        Complaints
                    </button>

                    <button
                        className="view-complaints-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/cricket-box");
                        }}
                    >
                        <span>🏏</span>
                        Cricket Box
                    </button>

                    <button
                        className="view-complaints-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/announcements");
                        }}
                    >
                        <span>📢</span>
                        Announcements
                    </button>

                    <button
                        className="view-complaints-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/reports");
                        }}
                    >
                        <span>📊</span>
                        Reports
                    </button>

                    <button
                        className="view-complaints-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/profile");
                        }}
                    >
                        <span>👤</span>
                        Profile
                    </button>
                </nav>

                <button
                    className="view-complaints-sidebar-logout"
                    onClick={handleLogout}
                >
                    <span>🚪</span>
                    Logout
                </button>
            </aside>



            {mobileMenuOpen && (
                <div
                    className="admin-mobile-overlay"
                    onClick={closeMobileMenu}
                />
            )}


            {/* MAIN */}

            <main className="view-complaints-main">

                {/* MOBILE HEADER */}
                <div className="view-complaints-mobile-header">
                    <button
                        className="view-complaints-hamburger"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open complaints menu"
                    >
                        ☰
                    </button>

                    <div className="view-complaints-mobile-brand">
                        <div className="view-complaints-mobile-brand-icon">
                            🏠
                        </div>

                        <div>
                            <strong>Hostel</strong>
                            <span>Admin Panel</span>
                        </div>
                    </div>

                    <button
                        className="view-complaints-mobile-profile"
                        onClick={() => navigate("/admin/profile")}
                        aria-label="Open profile"
                    >
                        {admin?.photo ? (
                            <img
                                src={getPhotoUrl(admin.photo)}
                                alt="Admin profile"
                            />
                        ) : (
                            "👤"
                        )}
                    </button>
                </div>

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