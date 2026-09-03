import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddStaff.css";

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

function AddStaff() {
    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login", { replace: true });
            return;
        }

        fetchAdminProfile();
    }, [navigate]);

    const fetchAdminProfile = async () => {
        const token = localStorage.getItem("adminToken");

        if (!token) return;

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
        } else {
            setPhotoPreview("");
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
            !form.password ||
            !form.role.trim() ||
            !form.salary
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
            body.append("password", form.password);
            body.append("role", form.role.trim());
            body.append("status", "active");
            body.append("salary", form.salary);

            if (photo) {
                body.append("photo", photo);
            }

            const response = await fetch(
                `${API_URL}/api/admin/staff`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to add staff."
                );
            }

            setSuccess("Staff added successfully.");

            setForm({
                staff_id: "",
                name: "",
                email: "",
                mobile: "",
                password: "",
                role: "",
                status: "active",
                salary: ""
            });

            setPhoto(null);
            setPhotoPreview("");

            const fileInput =
                document.getElementById("staff-photo");

            if (fileInput) {
                fileInput.value = "";
            }
        } catch (err) {
            console.error("Add Staff Error:", err);
            setError(err.message || "Unable to add staff.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="add-staff-page">
            <aside
                className={`add-staff-sidebar ${
                    mobileMenuOpen ? "mobile-open" : ""
                }`}
            >
                <div className="add-staff-sidebar-brand">
                    <div className="add-staff-brand-icon">🏠</div>
                    <div>
                        <strong>Hostel</strong>
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav className="add-staff-sidebar-nav">
                    <button
                        className="add-staff-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/dashboard");
                        }}
                    >
                        <span>📊</span>
                        Dashboard
                    </button>

                    <button
                        className="add-staff-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/students");
                        }}
                    >
                        <span>🎓</span>
                        Students
                    </button>

                    <button
                        className="add-staff-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/rooms");
                        }}
                    >
                        <span>🛏️</span>
                        Rooms
                    </button>

                    <button
                        className="add-staff-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/fees");
                        }}
                    >
                        <span>💳</span>
                        Fees
                    </button>

                    <button
                        className="add-staff-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/complaints");
                        }}
                    >
                        <span>📝</span>
                        Complaints
                    </button>

                    <button
                        className="add-staff-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/cricket-box");
                        }}
                    >
                        <span>🏏</span>
                        Cricket Box
                    </button>

                    <button
                        className="add-staff-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/announcements");
                        }}
                    >
                        <span>📢</span>
                        Announcements
                    </button>

                    <button
                        className="add-staff-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/reports");
                        }}
                    >
                        <span>📊</span>
                        Reports
                    </button>

                    <button
                        className="add-staff-sidebar-item active"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/staff");
                        }}
                    >
                        <span>👨‍💼</span>
                        Staff Management
                    </button>

                    <button
                        className="add-staff-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/rector");
                        }}
                    >
                        <span>👨‍🏫</span>
                        Rector Management
                    </button>

                    <button
                        className="add-staff-sidebar-item"
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/admin/salary");
                        }}
                    >
                        <span>💰</span>
                        Salary Management
                    </button>

                    <button
                        className="add-staff-sidebar-item"
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
                    className="add-staff-sidebar-logout"
                    onClick={handleLogout}
                >
                    <span>🚪</span>
                    Logout
                </button>
            </aside>

            {mobileMenuOpen && (
                <div
                    className="add-staff-mobile-overlay"
                    onClick={closeMobileMenu}
                />
            )}

            <main className="add-staff-main">
                <div className="add-staff-mobile-header">
                    <button
                        className="add-staff-hamburger"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open admin menu"
                    >
                        ☰
                    </button>

                    <div className="add-staff-mobile-brand">
                        <div className="add-staff-mobile-brand-icon">🏠</div>
                        <div>
                            <strong>Hostel</strong>
                            <span>Admin Panel</span>
                        </div>
                    </div>

                    <button
                        className="add-staff-mobile-profile"
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

                <header className="add-staff-header">
                    <div>
                        <span>STAFF MANAGEMENT</span>
                        <h1>Add Staff</h1>
                        <p>Create a new staff account for the hostel.</p>
                    </div>

                    <button
                        className="add-staff-header-profile"
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
                </header>

                <section className="add-staff-card">
                    <div className="add-staff-card-heading">
                        <div>
                            <span>STAFF INFORMATION</span>
                            <h2>Add New Staff</h2>
                        </div>
                    </div>

                    {error && (
                        <div className="add-staff-message error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="add-staff-message success">
                            {success}
                        </div>
                    )}

                    <form
                        className="add-staff-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="add-staff-photo-section">
                            <div className="add-staff-photo-preview">
                                {photoPreview ? (
                                    <img
                                        src={photoPreview}
                                        alt="Staff preview"
                                    />
                                ) : (
                                    <span>👤</span>
                                )}
                            </div>

                            <div className="add-staff-photo-content">
                                <label htmlFor="staff-photo">
                                    Staff Photo
                                </label>
                                <input
                                    id="staff-photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                            </div>
                        </div>

                        <div className="add-staff-form-grid">
                            <div className="add-staff-field">
                                <label htmlFor="staff_id">
                                    Staff ID <span>*</span>
                                </label>
                                <input
                                    id="staff_id"
                                    name="staff_id"
                                    type="text"
                                    value={form.staff_id}
                                    onChange={handleChange}
                                    placeholder="Enter staff ID"
                                    required
                                />
                            </div>

                            <div className="add-staff-field">
                                <label htmlFor="name">
                                    Name <span>*</span>
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter staff name"
                                    required
                                />
                            </div>

                            <div className="add-staff-field">
                                <label htmlFor="email">
                                    Email <span>*</span>
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter staff email"
                                    required
                                />
                            </div>

                            <div className="add-staff-field">
                                <label htmlFor="mobile">
                                    Mobile
                                </label>
                                <input
                                    id="mobile"
                                    name="mobile"
                                    type="tel"
                                    value={form.mobile}
                                    onChange={handleChange}
                                    placeholder="Enter mobile number"
                                />
                            </div>

                            <div className="add-staff-field">
                                <label htmlFor="password">
                                    Password <span>*</span>
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    required
                                />
                            </div>

                            <div className="add-staff-field">
                                <label htmlFor="role">
                                    Role <span>*</span>
                                </label>
                                <input
                                    id="role"
                                    name="role"
                                    type="text"
                                    value={form.role}
                                    onChange={handleChange}
                                    placeholder="Enter staff role"
                                    required
                                />
                            </div>

                            <div className="add-staff-field">
                                <label htmlFor="status">
                                    Status
                                </label>
                                <input
                                    id="status"
                                    type="text"
                                    value="Active"
                                    readOnly
                                />
                            </div>

                            <div className="add-staff-field">
                                <label htmlFor="salary">
                                    Monthly Salary <span>*</span>
                                </label>
                                <input
                                    id="salary"
                                    name="salary"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.salary}
                                    onChange={handleChange}
                                    placeholder="Enter monthly salary"
                                    required
                                />
                            </div>
                        </div>

                        <div className="add-staff-form-actions">
                            <button
                                type="button"
                                className="add-staff-cancel"
                                onClick={() => navigate("/admin/staff")}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="add-staff-submit"
                                disabled={saving}
                            >
                                {saving ? "Adding..." : "Add Staff"}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default AddStaff;
