import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditRector.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getPhotoUrl = (photo) => {
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
    if (normalized.startsWith("uploads/")) return `${API_URL}/${normalized}`;
    if (normalized.startsWith("rectors/")) return `${API_URL}/uploads/${normalized}`;
    return `${API_URL}/uploads/rectors/${normalized}`;
};

function EditRector() {
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
        rector_id: "",
        name: "",
        email: "",
        mobile: "",
        password: "",
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

        loadRector();
    }, [id, navigate]);

    const loadRector = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/api/admin/rectors/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to load rector.");
            }

            const rector = data.rector;

            setForm({
                rector_id: rector.rector_id || "",
                name: rector.name || "",
                email: rector.email || "",
                mobile: rector.phone || rector.mobile || "",
                password: "",
                status: String(rector.status || "active").toLowerCase(),
                salary: rector.salary ?? ""
            });

            setPhotoPreview(getPhotoUrl(rector.photo));
        } catch (err) {
            console.error("Load Rector Error:", err);
            setError(err.message || "Unable to load rector.");
        } finally {
            setLoading(false);
        }
    };

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

        if (!form.rector_id.trim() || !form.name.trim() || !form.email.trim() || form.salary === "") {
            setError("Please fill all required fields.");
            return;
        }

        try {
            setSaving(true);

            const body = new FormData();
            body.append("rector_id", form.rector_id.trim());
            body.append("name", form.name.trim());
            body.append("email", form.email.trim());
            body.append("phone", form.mobile.trim());
            body.append("status", form.status);
            body.append("salary", form.salary);

            if (form.password.trim()) {
                body.append("password", form.password);
            }

            if (photo) {
                body.append("photo", photo);
            }

            const response = await fetch(`${API_URL}/api/admin/rectors/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`
                },
                body
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to update rector.");
            }

            setSuccess("Rector updated successfully.");

            if (data.rector) {
                setForm((previous) => ({
                    ...previous,
                    rector_id: data.rector.rector_id ?? previous.rector_id,
                    name: data.rector.name ?? previous.name,
                    email: data.rector.email ?? previous.email,
                    mobile: data.rector.mobile ?? previous.mobile,
                    status: data.rector.status ?? previous.status,
                    salary: data.rector.salary ?? previous.salary,
                    password: ""
                }));

                if (data.rector.photo) {
                    setPhotoPreview(getPhotoUrl(data.rector.photo));
                }
            }

            setPhoto(null);
            const input = document.getElementById("rector-photo");
            if (input) input.value = "";
        } catch (err) {
            console.error("Update Rector Error:", err);
            setError(err.message || "Unable to update rector.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="rector-loading">
                <div>⏳</div>
                <p>Loading rector...</p>
            </div>
        );
    }

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
                    <button className="active" onClick={() => nav("/admin/rectors")}>👨‍🏫 Rector Management</button>
                    <button onClick={() => nav("/admin/staff")}>👨‍💼 Staff Management</button>
                    <button onClick={() => nav("/admin/profile")}>👤 Profile</button>
                </nav>

                <button className="rector-page-logout" onClick={handleLogout}>🚪 Logout</button>
            </aside>

            {mobileMenuOpen && (
                <div className="rector-overlay" onClick={closeMobileMenu} />
            )}

            <main>
                <div className="rector-mobile-header">
                    <button onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">☰</button>
                    <strong>Rector Management</strong>
                    <button onClick={() => navigate("/admin/profile")} aria-label="Open profile">
                        {admin?.photo ? <img src={getPhotoUrl(admin.photo)} alt="Admin" /> : "👤"}
                    </button>
                </div>

                <header className="rector-header">
                    <div>
                        <span>RECTOR MANAGEMENT</span>
                        <h1>Edit Rector</h1>
                        <p>Update rector account information.</p>
                    </div>
                    <button className="rector-top-profile" onClick={() => navigate("/admin/profile")} aria-label="Open profile">
                        {admin?.photo ? <img src={getPhotoUrl(admin.photo)} alt="Admin profile" /> : "👤"}
                    </button>
                </header>

                <section className="rector-card">
                    <form onSubmit={handleSubmit}>

                        <div className="rector-edit-photo-box">
                            <div className="rector-edit-photo-preview">
                                {photoPreview ? <img src={photoPreview} alt="Rector preview" /> : <span>👨‍🏫</span>}
                            </div>
                            <div className="rector-edit-photo-info">
                                <strong>Rector Photo</strong>
                                <label className="rector-file-btn">
                                    Choose File
                                    <input id="rector-photo" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handlePhotoChange} />
                                </label>
                                <span>{photo ? photo.name : "No file chosen"}</span>
                            </div>
                        </div>

                        <div className="rector-line rector-photo-line" />

                        <div className="rector-form-grid">
                            <label>
                                Rector ID *
                                <input name="rector_id" value={form.rector_id} onChange={handleChange} required />
                            </label>

                            <label>
                                Full Name *
                                <input name="name" value={form.name} onChange={handleChange} required />
                            </label>

                            <label>
                                Email *
                                <input name="email" type="email" value={form.email} onChange={handleChange} required />
                            </label>

                            <label>
                                Mobile
                                <input name="mobile" value={form.mobile} onChange={handleChange} />
                            </label>

                            <label>
                                New Password
                                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current password" />
                            </label>

                            <label>
                                Status
                                <select name="status" value={form.status} onChange={handleChange}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </label>

                            <label>
                                Monthly Salary *
                                <input name="salary" type="number" min="0" step="0.01" value={form.salary} onChange={handleChange} required />
                            </label>
                        </div>

                        {error && <div className="rector-error">{error}</div>}
                        {success && <div className="rector-success">{success}</div>}

                        <div className="rector-actions">
                            <button type="button" onClick={() => navigate("/admin/rectors")} disabled={saving}>Cancel</button>
                            <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default EditRector;
