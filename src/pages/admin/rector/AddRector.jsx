import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddRector.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAdminPhotoUrl = (photo) => {
    if (!photo) return "";
    const value = String(photo).trim();
    if (
        value.startsWith("data:") ||
        value.startsWith("blob:") ||
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) return value;
    const normalized = value.replace(/^\/+/, "");
    if (normalized.startsWith("uploads/")) return `${API_URL}/${normalized}`;
    return `${API_URL}/uploads/admins/${normalized}`;
};

export default function AddRector() {
    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        rector_id: "",
        name: "",
        email: "",
        mobile: "",
        password: "",
        role: "Rector",
        status: "active",
        salary: ""
    });

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
    }, [navigate]);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    const nav = (path) => {
        closeMobileMenu();
        navigate(path);
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
        const selectedFile = event.target.files?.[0] || null;

        setFile(selectedFile);

        if (selectedFile) {
            setPhotoPreview(URL.createObjectURL(selectedFile));
        } else {
            setPhotoPreview("");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (
            !form.rector_id.trim() ||
            !form.name.trim() ||
            !form.email.trim() ||
            !form.password.trim() ||
            !form.role.trim() ||
            form.salary === ""
        ) {
            setError("Please fill all required fields.");
            return;
        }

        try {
            setSaving(true);

            const body = new FormData();

            body.append("rector_id", form.rector_id.trim());
            body.append("name", form.name.trim());
            body.append("email", form.email.trim());
            body.append("mobile", form.mobile.trim());
            body.append("password", form.password);
            body.append("role", form.role.trim());
            body.append("status", form.status);
            body.append("salary", form.salary);

            if (file) {
                body.append("photo", file);
            }

            const response = await fetch(`${API_URL}/api/admin/rectors`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`
                },
                body
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to add rector.");
            }

            navigate("/admin/rectors");
        } catch (err) {
            console.error("Add Rector Error:", err);
            setError(err.message || "Unable to add rector.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rector-page">
            <aside className={`rector-page-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
                <div className="rector-page-brand">
                    <div className="rector-brand-icon">🏠</div>
                    <div>
                        <strong>Hostel</strong>
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav>
                    <button onClick={() => nav("/admin/dashboard")}>📊 Dashboard</button>
                    <button onClick={() => nav("/admin/students")}>🎓 Students</button>
                    <button onClick={() => nav("/admin/rooms")}>🛏️ Rooms</button>
                    <button onClick={() => nav("/admin/fees")}>💳 Fees</button>
                    <button onClick={() => nav("/admin/complaints")}>📝 Complaints</button>
                    <button onClick={() => nav("/admin/cricket-box")}>🏏 Cricket Box</button>
                    <button onClick={() => nav("/admin/announcements")}>📢 Announcements</button>
                    <button onClick={() => nav("/admin/reports")}>📊 Reports</button>
                    <button onClick={() => nav("/admin/staff")}>👨‍💼 Staff Management</button>
                    <button className="active" onClick={() => nav("/admin/rectors")}>👨‍🏫 Rector Management</button>
                    <button onClick={() => nav("/admin/salary")}>💰 Salary Management</button>
                    <button onClick={() => nav("/admin/profile")}>👤 Profile</button>
                </nav>

                <button className="rector-page-logout" onClick={handleLogout}>
                    🚪 Logout
                </button>
            </aside>

            {mobileMenuOpen && (
                <div className="rector-overlay" onClick={closeMobileMenu} />
            )}

            <main>
                <div className="rector-mobile-header">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        ☰
                    </button>

                    <div className="rector-mobile-brand">
                        <strong>Hostel</strong>
                        <span>Admin Panel</span>
                    </div>

                    <button
                        onClick={() => navigate("/admin/profile")}
                        aria-label="Open profile"
                    >
                        {admin?.photo ? (
                            <img
                                src={getAdminPhotoUrl(admin.photo)}
                                alt="Admin"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            "👤"
                        )}
                    </button>
                </div>

                <header className="rector-header">
                    <div>
                        <span>RECTOR INFORMATION</span>
                        <h1>Add New Rector</h1>
                        <p>Create a new rector account for the hostel.</p>
                    </div>

                    <button
                        className="rector-top-profile"
                        onClick={() => navigate("/admin/profile")}
                        aria-label="Open admin profile"
                    >
                        {admin?.photo ? (
                            <img
                                src={getAdminPhotoUrl(admin.photo)}
                                alt="Admin profile"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            "👤"
                        )}
                    </button>
                </header>

                <section className="rector-card">
                    <form onSubmit={handleSubmit}>
                        <div className="rector-photo-section">
                            <div className="rector-photo-preview">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Rector preview" />
                                ) : (
                                    <span>👨‍🏫</span>
                                )}
                            </div>

                            <div className="rector-photo-content">
                                <strong>Rector Photo</strong>
                                <label className="rector-file-button">
                                    Choose File
                                    <input
                                        id="rector-photo"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handlePhotoChange}
                                    />
                                </label>
                                <span className="rector-file-name">
                                    {file ? file.name : "No file chosen"}
                                </span>
                            </div>
                        </div>

                        <div className="rector-divider" />

                        <div className="rector-form-grid">
                            <label>
                                Rector ID <em>*</em>
                                <input
                                    name="rector_id"
                                    value={form.rector_id}
                                    onChange={handleChange}
                                    placeholder="Enter rector ID"
                                    required
                                />
                            </label>

                            <label>
                                Name <em>*</em>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter rector name"
                                    required
                                />
                            </label>

                            <label>
                                Email <em>*</em>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter rector email"
                                    required
                                />
                            </label>

                            <label>
                                Mobile
                                <input
                                    name="mobile"
                                    value={form.mobile}
                                    onChange={handleChange}
                                    placeholder="Enter mobile number"
                                />
                            </label>

                            <label>
                                Password <em>*</em>
                                <input
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    required
                                />
                            </label>

                            <label>
                                Role <em>*</em>
                                <input
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    placeholder="Enter rector role"
                                    required
                                />
                            </label>

                            <label>
                                Status
                                <div className="rector-status-box">Active</div>
                            </label>

                            <label>
                                Monthly Salary <em>*</em>
                                <input
                                    name="salary"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.salary}
                                    onChange={handleChange}
                                    placeholder="Enter monthly salary"
                                    required
                                />
                            </label>
                        </div>

                        {error && <div className="rector-error">{error}</div>}

                        <div className="rector-bottom-divider" />

                        <div className="rector-actions">
                            <button
                                type="button"
                                onClick={() => navigate("/admin/rectors")}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button type="submit" disabled={saving}>
                                {saving ? "Adding..." : "Add Rector"}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}
