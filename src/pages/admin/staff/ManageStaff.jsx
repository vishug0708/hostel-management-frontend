import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageStaff.css";

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
    return `${API_URL}/uploads/staff/${normalized}`;
}

function ManageStaff() {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin/login", { replace: true });
            return;
        }
        fetchStaff();
        fetchAdminProfile();
    }, [navigate]);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login", { replace: true });
                return;
            }

            const response = await fetch(`${API_URL}/api/admin/staff`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch staff.");
            }

            setStaff(Array.isArray(data.staff) ? data.staff : []);
        } catch (err) {
            console.error("Fetch Staff Error:", err);
            setError(err.message || "Unable to load staff.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAdminProfile = async () => {
        const token = localStorage.getItem("adminToken");
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/api/admin/profile`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to load admin profile.");
            }

            setAdmin(data.admin);
            localStorage.setItem("admin", JSON.stringify(data.admin));
        } catch (err) {
            console.error("Admin Profile Error:", err);
            const savedAdmin = localStorage.getItem("admin");

            if (savedAdmin) {
                try {
                    setAdmin(JSON.parse(savedAdmin));
                } catch (parseError) {
                    console.error("Admin data parse error:", parseError);
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
        navigate("/admin/login", { replace: true });
    };

    const changeStatus = async (id, status) => {
        try {
            setActionId(id);
            setError("");

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login", { replace: true });
                return;
            }

            const response = await fetch(
                `${API_URL}/api/admin/staff/${id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ status })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || `Failed to ${status === "active" ? "activate" : "deactivate"} staff.`
                );
            }

            setStaff((previous) =>
                previous.map((member) =>
                    member.id === id
                        ? {
                              ...member,
                              status
                          }
                        : member
                )
            );
        } catch (err) {
            console.error("Change Staff Status Error:", err);
            setError(err.message || "Unable to change staff status.");
        } finally {
            setActionId(null);
        }
    };

    const filteredStaff = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return staff.filter((member) => {
            const matchesSearch =
                !searchText ||
                String(member.staff_id || "").toLowerCase().includes(searchText) ||
                String(member.name || "").toLowerCase().includes(searchText) ||
                String(member.email || "").toLowerCase().includes(searchText) ||
                String(member.mobile || "").toLowerCase().includes(searchText) ||
                String(member.role || "").toLowerCase().includes(searchText);

            const currentStatus = String(member.status || "active").toLowerCase();

            const matchesStatus =
                statusFilter === "All" ||
                currentStatus === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [staff, search, statusFilter]);

    const totalStaff = staff.length;
    const activeStaff = staff.filter(
        (member) => String(member.status || "").toLowerCase() === "active"
    ).length;
    const inactiveStaff = staff.filter(
        (member) => String(member.status || "").toLowerCase() === "inactive"
    ).length;

    if (loading) {
        return (
            <div className="manage-staff-loading">
                <div className="manage-staff-spinner">⏳</div>
                <p>Loading staff...</p>
            </div>
        );
    }

    return (
        <div className="manage-staff-page">
            <aside
                className={`manage-staff-sidebar ${
                    mobileMenuOpen ? "mobile-open" : ""
                }`}
            >
                <div className="manage-staff-sidebar-brand">
                    <div className="manage-staff-brand-icon">🏠</div>
                    <div>
                        <strong>Hostel</strong>
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav className="manage-staff-sidebar-nav">
                    <button className="manage-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/dashboard"); }}>
                        <span>📊</span>Dashboard
                    </button>
                    <button className="manage-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/students"); }}>
                        <span>🎓</span>Students
                    </button>
                    <button className="manage-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/rooms"); }}>
                        <span>🛏️</span>Rooms
                    </button>
                    <button className="manage-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/fees"); }}>
                        <span>💳</span>Fees
                    </button>
                    <button className="manage-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/complaints"); }}>
                        <span>📝</span>Complaints
                    </button>
                    <button className="manage-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/cricket-box"); }}>
                        <span>🏏</span>Cricket Box
                    </button>
                    <button className="manage-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/announcements"); }}>
                        <span>📢</span>Announcements
                    </button>
                    <button className="manage-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/reports"); }}>
                        <span>📊</span>Reports
                    </button>
                    <button className="manage-staff-sidebar-item active" onClick={() => { closeMobileMenu(); navigate("/admin/staff"); }}>
                        <span>👨‍💼</span>Staff Management
                    </button>
                    <button className="manage-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/rector"); }}>
                        <span>👨‍🏫</span>Rector Management
                    </button>
                    <button className="manage-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/salary"); }}>
                        <span>💰</span>Salary Management
                    </button>
                    <button className="manage-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/profile"); }}>
                        <span>👤</span>Profile
                    </button>
                </nav>

                <button className="manage-staff-sidebar-logout" onClick={handleLogout}>
                    <span>🚪</span>Logout
                </button>
            </aside>

            {mobileMenuOpen && (
                <div
                    className="manage-staff-mobile-overlay"
                    onClick={closeMobileMenu}
                />
            )}

            <main className="manage-staff-main">
                <div className="manage-staff-mobile-header">
                    <button
                        className="manage-staff-hamburger"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open admin menu"
                    >
                        ☰
                    </button>

                    <div className="manage-staff-mobile-brand">
                        <div className="manage-staff-mobile-brand-icon">🏠</div>
                        <div>
                            <strong>Hostel</strong>
                            <span>Admin Panel</span>
                        </div>
                    </div>

                    <button
                        className="manage-staff-mobile-profile"
                        onClick={() => navigate("/admin/profile")}
                        aria-label="Open profile"
                    >
                        {admin?.photo ? (
                            <img src={getPhotoUrl(admin.photo)} alt="Admin profile" />
                        ) : (
                            "👤"
                        )}
                    </button>
                </div>

                <header className="manage-staff-header">
                    <div>
                        <span>STAFF MANAGEMENT</span>
                        <h1>Manage Staff</h1>
                        <p>Search, edit, activate and deactivate hostel staff.</p>
                    </div>

                    <button
                        className="manage-staff-header-profile"
                        onClick={() => navigate("/admin/profile")}
                        aria-label="Open profile"
                    >
                        {admin?.photo ? (
                            <img src={getPhotoUrl(admin.photo)} alt="Admin profile" />
                        ) : (
                            "👤"
                        )}
                    </button>
                </header>

                <section className="manage-staff-summary">
                    <div className="manage-staff-summary-card">
                        <span>👨‍💼</span>
                        <div>
                            <small>TOTAL STAFF</small>
                            <strong>{totalStaff}</strong>
                        </div>
                    </div>
                    <div className="manage-staff-summary-card active-card">
                        <span>✓</span>
                        <div>
                            <small>ACTIVE</small>
                            <strong>{activeStaff}</strong>
                        </div>
                    </div>
                    <div className="manage-staff-summary-card inactive-card">
                        <span>⏸</span>
                        <div>
                            <small>INACTIVE</small>
                            <strong>{inactiveStaff}</strong>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="manage-staff-error">
                        {error}
                    </div>
                )}

                <section className="manage-staff-toolbar">
                    <div className="manage-staff-search">
                        <span>🔍</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search staff ID, name, email, mobile or role..."
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>

                    <button
                        className="manage-staff-add-button"
                        onClick={() => navigate("/admin/staff/add")}
                    >
                        + Add Staff
                    </button>
                </section>

                <section className="manage-staff-card">
                    <div className="manage-staff-card-header">
                        <div>
                            <span>STAFF LIST</span>
                            <h2>All Staff</h2>
                        </div>
                        <div className="manage-staff-count">
                            {filteredStaff.length} Records
                        </div>
                    </div>

                    {filteredStaff.length === 0 ? (
                        <div className="manage-staff-empty">
                            <div>👨‍💼</div>
                            <h3>No Staff Found</h3>
                            <p>No staff members match the selected filters.</p>
                        </div>
                    ) : (
                        <div className="manage-staff-table-wrapper">
                            <table className="manage-staff-table">
                                <thead>
                                    <tr>
                                        <th>Staff</th>
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Role</th>
                                        <th>Salary</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.map((member) => {
                                        const isActive =
                                            String(member.status || "active").toLowerCase() === "active";

                                        return (
                                            <tr key={member.id}>
                                                <td>
                                                    <div className="manage-staff-person">
                                                        <div className="manage-staff-avatar">
                                                            {member.photo ? (
                                                                <img
                                                                    src={getPhotoUrl(member.photo)}
                                                                    alt={member.name || "Staff"}
                                                                />
                                                            ) : (
                                                                member.name?.charAt(0)?.toUpperCase() || "S"
                                                            )}
                                                        </div>
                                                        <div>
                                                            <strong>{member.name || "Unknown"}</strong>
                                                            <span>{member.staff_id || "—"}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{member.email || "—"}</td>
                                                <td>{member.mobile || "—"}</td>
                                                <td>{member.role || "—"}</td>
                                                <td>₹{Number(member.salary || 0).toLocaleString("en-IN")}</td>
                                                <td>
                                                    <span
                                                        className={`manage-staff-status ${
                                                            isActive ? "active" : "inactive"
                                                        }`}
                                                    >
                                                        {isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="manage-staff-actions">
                                                        <button
                                                            className="manage-staff-edit"
                                                            onClick={() =>
                                                                navigate(`/admin/staff/edit/${member.id}`)
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        {isActive ? (
                                                            <button
                                                                className="manage-staff-deactivate"
                                                                disabled={actionId === member.id}
                                                                onClick={() =>
                                                                    changeStatus(member.id, "inactive")
                                                                }
                                                            >
                                                                {actionId === member.id ? "..." : "Deactivate"}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="manage-staff-activate"
                                                                disabled={actionId === member.id}
                                                                onClick={() =>
                                                                    changeStatus(member.id, "active")
                                                                }
                                                            >
                                                                {actionId === member.id ? "..." : "Activate"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default ManageStaff;
