import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProfile.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getPhotoUrl(photo) {
    if (!photo) return "";
    const value = String(photo).trim();
    if (value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http://") || value.startsWith("https://")) return value;
    const normalized = value.replace(/^\/+/, "");
    if (normalized.startsWith("uploads/")) return `${API_URL}/${normalized}`;
    return `${API_URL}/uploads/admins/${normalized}`;
}

function AdminProfile() {
    const navigate = useNavigate();
    const photoInputRef = useRef(null);
    const [admin, setAdmin] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login", {
                replace: true
            });
            return;
        }

        const fetchAdminProfile = async () => {
            try {
                const response = await fetch(`${API_URL}/api/admin/profile`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Unable to load admin profile."
                    );
                }

                const adminData = data.admin;

                setAdmin(adminData);

                // Latest admin data save in localStorage
                localStorage.setItem(
                    "admin",
                    JSON.stringify(adminData)
                );
            } catch (error) {
                console.error("Admin Profile Error:", error);

                // Fallback to localStorage
                const savedAdmin = localStorage.getItem("admin");

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

        fetchAdminProfile();
    }, [navigate]);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    const handleChange = (e) => {
        setAdmin({ ...admin, [e.target.name]: e.target.value });
        setMessage("");
        setError("");
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setMessage("");
        setError("");
        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            e.target.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Photo size must be 5 MB or less.");
            e.target.value = "";
            return;
        }
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin/login");
            return;
        }
        try {
            setSaving(true);
            const body = new FormData();
            body.append("name", admin.name || "");
            body.append("email", admin.email || "");
            body.append("phone", admin.phone || "");
            if (photoFile) body.append("photo", photoFile);

            const response = await fetch(`${API_URL}/api/admin/profile`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                setError(data.message || "Profile update failed.");
                return;
            }

            const updatedAdmin = data.admin || { ...admin, photo: data.photo || admin.photo };
            setAdmin(updatedAdmin);
            setPhotoPreview(getPhotoUrl(updatedAdmin.photo));
            setPhotoFile(null);
            if (photoInputRef.current) photoInputRef.current.value = "";

            const oldAdmin = JSON.parse(localStorage.getItem("admin") || "{}");
            localStorage.setItem("admin", JSON.stringify({ ...oldAdmin, ...updatedAdmin }));
            setMessage("Profile updated successfully.");
        } catch (err) {
            console.error("Update Admin Profile Error:", err);
            setError("Cannot connect to backend server.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        navigate("/admin/login", { replace: true });
    };

    if (loading) {
        return (
            <div className="admin-profile-loading">
                <div className="profile-loader">⏳</div>
                <p>Loading admin profile...</p>
            </div>
        );
    }

    if (!admin) {
        return (
            <div className="admin-profile-error">
                <div className="profile-error-icon">⚠️</div>
                <h2>Unable to Load Profile</h2>
                <p>{error || "Admin profile not found."}</p>
                <button onClick={() => navigate("/admin/dashboard")}>Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="admin-profile-page">
            <aside className={`admin-profile-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
                <div className="admin-profile-brand">
                    <div className="profile-brand-icon">🏠</div>
                    <div><strong>Hostel</strong><span>Admin Panel</span></div>
                </div>
                <nav className="admin-profile-nav">
                    <button onClick={() => { closeMobileMenu(); navigate("/admin/dashboard"); }}>📊 Dashboard</button>
                    <button onClick={() => { closeMobileMenu(); navigate("/admin/students"); }}>🎓 Students</button>
                    <button onClick={() => { closeMobileMenu(); navigate("/admin/rooms"); }}>🛏️ Rooms</button>
                    <button onClick={() => { closeMobileMenu(); navigate("/admin/fees"); }}>💳 Fees</button>
                    <button onClick={() => { closeMobileMenu(); navigate("/admin/complaints"); }}>📝 Complaints</button>
                    <button onClick={() => { closeMobileMenu(); navigate("/admin/cricket-box"); }}>🏏 Cricket Box</button>
                    <button onClick={() => { closeMobileMenu(); navigate("/admin/announcements"); }}>📢 Announcements</button>
                    <button onClick={() => { closeMobileMenu(); navigate("/admin/reports"); }}>📊 Reports</button>
                    <button className="active" onClick={closeMobileMenu}>👤 Profile</button>
                </nav>
                <button className="profile-logout" onClick={handleLogout}>🚪 Logout</button>
            </aside>

            {mobileMenuOpen && <div className="admin-mobile-overlay" onClick={closeMobileMenu} />}

            <main className="admin-profile-main">
                <div className="admin-mobile-header">
                    <div className="admin-mobile-left">
                        <button className="admin-mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>☰</button>
                        <div className="admin-mobile-brand">
                            <div className="admin-mobile-brand-icon">🏠</div>
                            <div><strong>Hostel</strong><span>Admin Panel</span></div>
                        </div>
                    </div>
                    <button className="admin-mobile-profile-btn" onClick={() => navigate("/admin/profile")}>
                        {admin.photo ? <img src={getPhotoUrl(admin.photo)} alt="Admin profile" /> : "👤"}
                    </button>
                </div>

                <header className="admin-profile-header">
                    <div>
                        <span>ADMINISTRATION</span>
                        <h1>Admin Profile</h1>
                        <p>View and manage your administrator account information.</p>
                    </div>
                    <button className="profile-header-avatar" onClick={() => photoInputRef.current?.click()} title="Change profile photo">
                        {photoPreview ? <img src={photoPreview} alt="Admin profile" /> : "👤"}
                    </button>
                </header>

                <section className="admin-profile-container">
                    <div className="admin-profile-card">
                        <div className="admin-profile-top">
                            <div className="admin-profile-avatar-wrap">
                                <button type="button" className="admin-profile-avatar" onClick={() => photoInputRef.current?.click()} title="Upload profile photo">
                                    {photoPreview ? <img src={photoPreview} alt="Admin profile" /> : "👨‍💼"}
                                    <span className="avatar-camera">📷</span>
                                </button>
                                <input ref={photoInputRef} className="profile-photo-input" type="file" accept="image/*" onChange={handlePhotoChange} />
                                <button type="button" className="upload-photo-btn" onClick={() => photoInputRef.current?.click()}>
                                    {photoFile ? "Change Photo" : "Upload Photo"}
                                </button>
                                <small>JPG, PNG, WEBP • Max 5 MB</small>
                            </div>
                            <div className="admin-profile-identity">
                                <h2>{admin.name}</h2>
                                <p>Administrator</p>
                                <span>Admin ID: #{admin.id}</span>
                            </div>
                        </div>

                        <form className="admin-profile-form" onSubmit={handleSubmit}>
                            <div className="profile-form-grid">
                                <div className="profile-form-group">
                                    <label>Full Name</label>
                                    <input type="text" name="name" value={admin.name || ""} onChange={handleChange} placeholder="Enter your name" required />
                                </div>
                                <div className="profile-form-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" value={admin.email || ""} onChange={handleChange} placeholder="Enter your email" required />
                                </div>
                                <div className="profile-form-group">
                                    <label>Phone Number</label>
                                    <input type="text" name="phone" value={admin.phone || ""} onChange={handleChange} placeholder="Enter phone number" required />
                                </div>
                            </div>

                            <div className="profile-password-info">
                                <span>🔒</span>
                                <div><strong>Password</strong><p>Your password is protected and cannot be viewed here.</p></div>
                                <button type="button" onClick={() => navigate("/admin/change-password")}>Change Password</button>
                            </div>

                            {message && <div className="profile-success">✓ {message}</div>}
                            {error && <div className="profile-error">⚠ {error}</div>}

                            <div className="profile-form-actions">
                                <button type="button" className="cancel-profile-btn" onClick={() => navigate("/admin/dashboard")}>Cancel</button>
                                <button type="submit" className="save-profile-btn" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                            </div>
                        </form>
                    </div>
                    <button className="back-dashboard-btn" onClick={() => navigate("/admin/dashboard")}>← Dashboard</button>
                </section>

                <footer className="admin-profile-footer">
                    <span>© 2026 Hostel Management System</span>
                    <span>Admin Panel</span>
                </footer>
            </main>
        </div>
    );
}

export default AdminProfile;
