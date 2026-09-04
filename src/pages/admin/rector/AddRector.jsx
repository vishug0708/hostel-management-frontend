import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddRector.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAdminPhotoUrl = (photo) => {
    if (!photo) return "";
    const value = String(photo).trim();
    if (value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }
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
        phone: "",
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

    const nav = (path) => {
        setMobileMenuOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        navigate("/admin/login", { replace: true });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const selected = e.target.files?.[0] || null;
        setFile(selected);
        setPhotoPreview(selected ? URL.createObjectURL(selected) : "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.rector_id.trim() || !form.name.trim() || !form.email.trim() || !form.password.trim() || !form.role.trim() || form.salary === "") {
            setError("Please fill all required fields.");
            return;
        }

        try {
            setSaving(true);

            const body = new FormData();
            body.append("rector_id", form.rector_id.trim());
            body.append("name", form.name.trim());
            body.append("email", form.email.trim());
            body.append("phone", form.phone.trim());
            body.append("password", form.password);
            body.append("role", form.role.trim());
            body.append("status", form.status);
            body.append("salary", form.salary);

            if (file) body.append("photo", file);

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

                <button className="rector-page-logout" onClick={handleLogout}>🚪 Logout</button>
            </aside>

            {mobileMenuOpen && <div className="rector-overlay" onClick={() => setMobileMenuOpen(false)} />}

            <main>
                <div className="rector-mobile-header">
                    <button className="rector-mobile-menu" onClick={() => setMobileMenuOpen(true)}>☰</button>
                    <div className="rector-mobile-title">Add Rector</div>
                    <button className="rector-mobile-profile" onClick={() => navigate("/admin/profile")}>
                        {admin?.photo ? <img src={getAdminPhotoUrl(admin.photo)} alt="Admin" /> : "👤"}
                    </button>
                </div>

                <div className="rector-page-intro">
                    <div>
                        <span>RECTOR INFORMATION</span>
                        <h1>Add New Rector</h1>
                        <p>Create a new rector account for the hostel.</p>
                    </div>
                    <button className="rector-top-profile" onClick={() => navigate("/admin/profile")}>
                        {admin?.photo ? <img src={getAdminPhotoUrl(admin.photo)} alt="Admin profile" /> : "👤"}
                    </button>
                </div>

                <section className="rector-card">
                    <form onSubmit={handleSubmit}>
                        <div className="rector-photo-box">
                            <div className="rector-photo-preview">
                                {photoPreview ? <img src={photoPreview} alt="Rector" /> : <span>👨‍🏫</span>}
                            </div>
                            <div className="rector-photo-info">
                                <strong>Rector Photo</strong>
                                <div className="rector-photo-file-row">
                                    <label className="rector-file-btn">
                                        Choose File
                                        <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handlePhotoChange} />
                                    </label>
                                    <span>{file ? file.name : "No file chosen"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rector-line" />

                        <div className="rector-form-grid">
                            <label>
                                Rector ID <b>*</b>
                                <input name="rector_id" value={form.rector_id} onChange={handleChange} placeholder="Enter rector ID" required />
                            </label>

                            <label>
                                Name <b>*</b>
                                <input name="name" value={form.name} onChange={handleChange} placeholder="Enter rector name" required />
                            </label>

                            <label>
                                Email <b>*</b>
                                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter rector email" required />
                            </label>

                            <label>
                                Mobile
                                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Enter mobile number" />
                            </label>

                            <label>
                                Password <b>*</b>
                                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter password" required />
                            </label>

                            <label>
                                Role <b>*</b>
                                <input name="role" value={form.role} onChange={handleChange} placeholder="Enter rector role" required />
                            </label>

                            <label>
                                Status
                                <div className="rector-status">Active</div>
                            </label>

                            <label>
                                Monthly Salary <b>*</b>
                                <input name="salary" type="number" min="0" step="0.01" value={form.salary} onChange={handleChange} placeholder="Enter monthly salary" required />
                            </label>
                        </div>

                        {error && <div className="rector-error">{error}</div>}

                        <div className="rector-line rector-bottom-line" />

                        <div className="rector-actions">
                            <button type="button" onClick={() => navigate("/admin/rectors")} disabled={saving}>Cancel</button>
                            <button type="submit" disabled={saving}>{saving ? "Adding..." : "Add Rector"}</button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}
