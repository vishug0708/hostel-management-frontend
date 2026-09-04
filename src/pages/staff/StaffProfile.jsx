import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffProfile.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getPhotoUrl(photo) {
    if (!photo) return "";
    const value = String(photo).trim();
    if (value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http://") || value.startsWith("https://")) return value;
    const normalized = value.replace(/^\/+/, "");
    if (normalized.startsWith("uploads/")) return `${API_URL}/${normalized}`;
    return `${API_URL}/uploads/staff/${normalized}`;
}

function StaffProfile() {
    const navigate = useNavigate();
    const photoInputRef = useRef(null);
    const [staff, setStaff] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("staffToken");

        if (!token) {
            navigate("/staff/login", {
                replace: true
            });
            return;
        }

        const fetchStaffProfile = async () => {
            try {
                const response = await fetch(`${API_URL}/api/staff/profile`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Unable to load staff profile."
                    );
                }

                const staffData = data.staff;

                setStaff(staffData);
                setPhotoPreview(getPhotoUrl(staffData?.photo));

                localStorage.setItem(
                    "staff",
                    JSON.stringify(staffData)
                );
            } catch (error) {
                console.error("Staff Profile Error:", error);

                const savedStaff = localStorage.getItem("staff");

                if (savedStaff) {
                    try {
                        const savedData = JSON.parse(savedStaff);
                        setStaff(savedData);
                        setPhotoPreview(getPhotoUrl(savedData?.photo));
                    } catch (parseError) {
                        console.error(
                            "Staff data parse error:",
                            parseError
                        );
                        setError("Unable to load staff profile.");
                    }
                } else {
                    setError("Unable to load staff profile.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStaffProfile();
    }, [navigate]);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    const handleChange = (e) => {
        setStaff({ ...staff, [e.target.name]: e.target.value });
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
        const token = localStorage.getItem("staffToken");
        if (!token) {
            navigate("/staff/login");
            return;
        }
        try {
            setSaving(true);
            const body = new FormData();
            body.append("name", staff.name || "");
            body.append("email", staff.email || "");
            body.append("phone", staff.phone || "");
            if (photoFile) body.append("photo", photoFile);

            const response = await fetch(`${API_URL}/api/staff/profile`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                setError(data.message || "Profile update failed.");
                return;
            }

            const updatedStaff = data.staff || { ...staff, photo: data.photo || staff.photo };
            setStaff(updatedStaff);
            setPhotoPreview(getPhotoUrl(updatedStaff.photo));
            setPhotoFile(null);
            if (photoInputRef.current) photoInputRef.current.value = "";

            const oldStaff = JSON.parse(localStorage.getItem("staff") || "{}");
            localStorage.setItem("staff", JSON.stringify({ ...oldStaff, ...updatedStaff }));
            setMessage("Profile updated successfully.");
        } catch (err) {
            console.error("Update Staff Profile Error:", err);
            setError("Cannot connect to backend server.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("staffToken");
        localStorage.removeItem("staff");
        navigate("/staff/login", { replace: true });
    };

    if (loading) {
        return (
            <div className="staff-profile-loading">
                <div className="profile-loader">⏳</div>
                <p>Loading staff profile...</p>
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="staff-profile-error">
                <div className="profile-error-icon">⚠️</div>
                <h2>Unable to Load Profile</h2>
                <p>{error || "Staff profile not found."}</p>
                <button onClick={() => navigate("/staff/dashboard")}>Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="staff-profile-page">
            <aside className={`staff-profile-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
                <div className="staff-profile-brand">
                    <div className="profile-brand-icon">🏠</div>
                    <div><strong>Hostel</strong><span>Staff Panel</span></div>
                </div>
                <nav className="staff-profile-nav">
                    <button onClick={() => { closeMobileMenu(); navigate("/staff/dashboard"); }}>📊 Dashboard</button>
                    <button onClick={() => { closeMobileMenu(); navigate("/staff/students"); }}>🎓 Students</button>
                    <button onClick={() => { closeMobileMenu(); navigate("/staff/rooms"); }}>🛏️ Rooms</button>
                    <button onClick={() => { closeMobileMenu(); navigate("/staff/fees"); }}>💳 Fees</button>
                    <button onClick={() => { closeMobileMenu(); navigate("/staff/complaints"); }}>📝 Complaints</button>
                    <button onClick={() => { closeMobileMenu(); navigate("/staff/cricket-box"); }}>🏏 Cricket Box</button>
                    <button onClick={() => { closeMobileMenu(); navigate("/staff/announcements"); }}>📢 Announcements</button>
                    <button onClick={() => { closeMobileMenu(); navigate("/staff/reports"); }}>📊 Reports</button>
                    <button className="active" onClick={closeMobileMenu}>👤 Profile</button>
                </nav>
                <button className="profile-logout" onClick={handleLogout}>🚪 Logout</button>
            </aside>

            {mobileMenuOpen && <div className="staff-mobile-overlay" onClick={closeMobileMenu} />}

            <main className="staff-profile-main">
                <div className="staff-mobile-header">
                    <div className="staff-mobile-left">
                        <button className="staff-mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>☰</button>
                        <div className="staff-mobile-brand">
                            <div className="staff-mobile-brand-icon">🏠</div>
                            <div><strong>Hostel</strong><span>Staff Panel</span></div>
                        </div>
                    </div>
                    <button className="staff-mobile-profile-btn" onClick={() => navigate("/staff/profile")}>
                        {staff.photo ? <img src={getPhotoUrl(staff.photo)} alt="Staff profile" /> : "👤"}
                    </button>
                </div>

                <header className="staff-profile-header">
                    <div>
                        <span>ADMINISTRATION</span>
                        <h1>Staff Profile</h1>
                        <p>View and manage your staffistrator account information.</p>
                    </div>
                    <button className="profile-header-avatar" onClick={() => photoInputRef.current?.click()} title="Change profile photo">
                        {photoPreview ? <img src={photoPreview} alt="Staff profile" /> : "👤"}
                    </button>
                </header>

                <section className="staff-profile-container">
                    <div className="staff-profile-card">
                        <div className="staff-profile-top">
                            <div className="staff-profile-avatar-wrap">
                                <button type="button" className="staff-profile-avatar" onClick={() => photoInputRef.current?.click()} title="Upload profile photo">
                                    {photoPreview ? <img src={photoPreview} alt="Staff profile" /> : "👨‍💼"}
                                    <span className="avatar-camera">📷</span>
                                </button>
                                <input ref={photoInputRef} className="profile-photo-input" type="file" accept="image/*" onChange={handlePhotoChange} />
                                <button type="button" className="upload-photo-btn" onClick={() => photoInputRef.current?.click()}>
                                    {photoFile ? "Change Photo" : "Upload Photo"}
                                </button>
                                <small>JPG, PNG, WEBP • Max 5 MB</small>
                            </div>
                            <div className="staff-profile-identity">
                                <h2>{staff.name}</h2>
                                <p>Staffistrator</p>
                                <span>Staff ID: #{staff.id}</span>
                            </div>
                        </div>

                        <form className="staff-profile-form" onSubmit={handleSubmit}>
                            <div className="profile-form-grid">
                                <div className="profile-form-group">
                                    <label>Full Name</label>
                                    <input type="text" name="name" value={staff.name || ""} onChange={handleChange} placeholder="Enter your name" required />
                                </div>
                                <div className="profile-form-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" value={staff.email || ""} onChange={handleChange} placeholder="Enter your email" required />
                                </div>
                                <div className="profile-form-group">
                                    <label>Phone Number</label>
                                    <input type="text" name="phone" value={staff.phone || ""} onChange={handleChange} placeholder="Enter phone number" required />
                                </div>
                            </div>

                            <div className="profile-password-info">
                                <span>🔒</span>
                                <div><strong>Password</strong><p>Your password is protected and cannot be viewed here.</p></div>
                                <button type="button" onClick={() => navigate("/staff/change-password")}>Change Password</button>
                            </div>

                            {message && <div className="profile-success">✓ {message}</div>}
                            {error && <div className="profile-error">⚠ {error}</div>}

                            <div className="profile-form-actions">
                                <button type="button" className="cancel-profile-btn" onClick={() => navigate("/staff/dashboard")}>Cancel</button>
                                <button type="submit" className="save-profile-btn" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                            </div>
                        </form>
                    </div>
                    <button className="back-dashboard-btn" onClick={() => navigate("/staff/dashboard")}>← Dashboard</button>
                </section>

                <footer className="staff-profile-footer">
                    <span>© 2026 Hostel Management System</span>
                    <span>Staff Panel</span>
                </footer>
            </main>
        </div>
    );
}

export default StaffProfile;
