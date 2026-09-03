import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditStaff.css";

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

function EditStaff() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [admin, setAdmin] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [form, setForm] = useState({
        staff_id: "",
        name: "",
        email: "",
        mobile: "",
        password: "",
        role: "",
        status: "active",
        salary: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login", { replace: true });
            return;
        }

        fetchStaff();
        fetchAdminProfile();
    }, [id, navigate]);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login", { replace: true });
                return;
            }

            const response = await fetch(`${API_URL}/api/admin/staff/${id}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch staff.");
            }

            const member = data.staff;

            setForm({
                staff_id: member.staff_id || "",
                name: member.name || "",
                email: member.email || "",
                mobile: member.mobile || "",
                password: "",
                role: member.role || "",
                status: String(member.status || "active").toLowerCase(),
                salary: member.salary ?? ""
            });

            setPhotoPreview(getPhotoUrl(member.photo));
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

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0] || null;

        setPhoto(file);

        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login", { replace: true });
            return;
        }

        if (
            !form.staff_id.trim() ||
            !form.name.trim() ||
            !form.email.trim() ||
            !form.role.trim() ||
            form.salary === ""
        ) {
            setError("Please fill all required fields.");
            return;
        }

        try {
            setSaving(true);

            const body = new FormData();

            body.append("staff_id", form.staff_id.trim());
            body.append("name", form.name.trim());
            body.append("email", form.email.trim());
            body.append("mobile", form.mobile.trim());
            body.append("role", form.role.trim());
            body.append("status", form.status === "inactive" ? "inactive" : "active");
            body.append("salary", form.salary);

            if (form.password) {
                body.append("password", form.password);
            }

            if (photo) {
                body.append("photo", photo);
            }

            const response = await fetch(`${API_URL}/api/admin/staff/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to update staff.");
            }

            setSuccess("Staff updated successfully.");

            if (data.staff) {
                const updatedStaff = data.staff;
                setForm((previous) => ({
                    ...previous,
                    staff_id: updatedStaff.staff_id ?? previous.staff_id,
                    name: updatedStaff.name ?? previous.name,
                    email: updatedStaff.email ?? previous.email,
                    mobile: updatedStaff.mobile ?? previous.mobile,
                    role: updatedStaff.role ?? previous.role,
                    status: updatedStaff.status ?? previous.status,
                    salary: updatedStaff.salary ?? previous.salary,
                    password: ""
                }));

                if (updatedStaff.photo) {
                    setPhotoPreview(getPhotoUrl(updatedStaff.photo));
                }
            }

            setPhoto(null);

            const fileInput = document.getElementById("staff-photo");
            if (fileInput) {
                fileInput.value = "";
            }
        } catch (err) {
            console.error("Edit Staff Error:", err);
            setError(err.message || "Unable to update staff.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="edit-staff-loading">
                <div className="edit-staff-spinner">⏳</div>
                <p>Loading staff...</p>
            </div>
        );
    }

    return (
        <div className="edit-staff-page">
            <aside
                className={`edit-staff-sidebar ${
                    mobileMenuOpen ? "mobile-open" : ""
                }`}
            >
                <div className="edit-staff-sidebar-brand">
                    <div className="edit-staff-brand-icon">🏠</div>
                    <div>
                        <strong>Hostel</strong>
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav className="edit-staff-sidebar-nav">
                    <button className="edit-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/dashboard"); }}>
                        <span>📊</span>Dashboard
                    </button>
                    <button className="edit-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/students"); }}>
                        <span>🎓</span>Students
                    </button>
                    <button className="edit-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/rooms"); }}>
                        <span>🛏️</span>Rooms
                    </button>
                    <button className="edit-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/fees"); }}>
                        <span>💳</span>Fees
                    </button>
                    <button className="edit-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/complaints"); }}>
                        <span>📝</span>Complaints
                    </button>
                    <button className="edit-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/cricket-box"); }}>
                        <span>🏏</span>Cricket Box
                    </button>
                    <button className="edit-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/announcements"); }}>
                        <span>📢</span>Announcements
                    </button>
                    <button className="edit-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/reports"); }}>
                        <span>📊</span>Reports
                    </button>
                    <button className="edit-staff-sidebar-item active" onClick={() => { closeMobileMenu(); navigate("/admin/staff"); }}>
                        <span>👨‍💼</span>Staff Management
                    </button>
                    <button className="edit-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/rector"); }}>
                        <span>👨‍🏫</span>Rector Management
                    </button>
                    <button className="edit-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/salary"); }}>
                        <span>💰</span>Salary Management
                    </button>
                    <button className="edit-staff-sidebar-item" onClick={() => { closeMobileMenu(); navigate("/admin/profile"); }}>
                        <span>👤</span>Profile
                    </button>
                </nav>

                <button className="edit-staff-sidebar-logout" onClick={handleLogout}>
                    <span>🚪</span>Logout
                </button>
            </aside>

            {mobileMenuOpen && (
                <div
                    className="edit-staff-mobile-overlay"
                    onClick={closeMobileMenu}
                />
            )}

            <main className="edit-staff-main">
                <div className="edit-staff-mobile-header">
                    <button
                        className="edit-staff-hamburger"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open admin menu"
                    >
                        ☰
                    </button>

                    <div className="edit-staff-mobile-brand">
                        <div className="edit-staff-mobile-brand-icon">🏠</div>
                        <div>
                            <strong>Hostel</strong>
                            <span>Admin Panel</span>
                        </div>
                    </div>

                    <button
                        className="edit-staff-mobile-profile"
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

                <header className="edit-staff-header">
                    <div>
                        <span>STAFF MANAGEMENT</span>
                        <h1>Edit Staff</h1>
                        <p>Update staff account information.</p>
                    </div>

                    <button
                        className="edit-staff-header-profile"
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

                <section className="edit-staff-card">
                    <div className="edit-staff-card-heading">
                        <div>
                            <span>STAFF INFORMATION</span>
                            <h2>Edit Staff Account</h2>
                        </div>
                    </div>

                    {error && (
                        <div className="edit-staff-message error">{error}</div>
                    )}

                    {success && (
                        <div className="edit-staff-message success">{success}</div>
                    )}

                    <form className="edit-staff-form" onSubmit={handleSubmit}>
                        <div className="edit-staff-photo-section">
                            <div className="edit-staff-photo-preview">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Staff preview" />
                                ) : (
                                    <span>👤</span>
                                )}
                            </div>

                            <div className="edit-staff-photo-content">
                                <label htmlFor="staff-photo">Staff Photo</label>
                                <input
                                    id="staff-photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                                <small>Choose a new photo only if you want to replace the current one.</small>
                            </div>
                        </div>

                        <div className="edit-staff-form-grid">
                            <div className="edit-staff-field">
                                <label htmlFor="staff_id">Staff ID <span>*</span></label>
                                <input
                                    id="staff_id"
                                    name="staff_id"
                                    type="text"
                                    value={form.staff_id}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="edit-staff-field">
                                <label htmlFor="name">Name <span>*</span></label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="edit-staff-field">
                                <label htmlFor="email">Email <span>*</span></label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="edit-staff-field">
                                <label htmlFor="mobile">Mobile</label>
                                <input
                                    id="mobile"
                                    name="mobile"
                                    type="tel"
                                    value={form.mobile}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="edit-staff-field">
                                <label htmlFor="password">New Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>

                            <div className="edit-staff-field">
                                <label htmlFor="role">Role <span>*</span></label>
                                <input
                                    id="role"
                                    name="role"
                                    type="text"
                                    value={form.role}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="edit-staff-field">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="edit-staff-field">
                                <label htmlFor="salary">Monthly Salary <span>*</span></label>
                                <input
                                    id="salary"
                                    name="salary"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.salary}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="edit-staff-form-actions">
                            <button
                                type="button"
                                className="edit-staff-cancel"
                                onClick={() => navigate("/admin/staff")}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="edit-staff-submit"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default EditStaff;
