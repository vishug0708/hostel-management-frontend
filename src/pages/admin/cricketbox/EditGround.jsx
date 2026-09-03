import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditGround.css";

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


function EditGround() {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("admin") || "{}");
        } catch {
            return {};
        }
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { id } = useParams();

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        description: "",
        capacity: "",
        price_per_hour: "",
        opening_time: "",
        closing_time: "",
        slot_duration: "60",
        status: "Active"
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchGround();
    }, [id]);

    const fetchGround = async () => {
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
                `${API_URL}/api/admin/cricket-grounds/${id}`,
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
                    "Unable to load cricket ground."
                );
            }

            const ground = data.ground;

            setFormData({
                name: ground.name || "",
                location: ground.location || "",
                description:
                    ground.description || "",
                capacity:
                    ground.capacity ?? "",
                price_per_hour:
                    ground.price_per_hour ?? "",
                opening_time:
                    ground.opening_time
                        ? String(
                            ground.opening_time
                        ).substring(0, 5)
                        : "",
                closing_time:
                    ground.closing_time
                        ? String(
                            ground.closing_time
                        ).substring(0, 5)
                        : "",
                slot_duration:
                    String(
                        ground.slot_duration || 60
                    ),
                status:
                    ground.status || "Active"
            });
        } catch (err) {
            console.error(
                "Fetch Ground Error:",
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login", {
                replace: true
            });
            return;
        }

        if (!formData.name.trim()) {
            setError(
                "Ground name is required."
            );
            return;
        }

        if (
            formData.price_per_hour === "" ||
            Number(formData.price_per_hour) < 0
        ) {
            setError(
                "Please enter a valid price per hour."
            );
            return;
        }

        if (
            formData.capacity !== "" &&
            Number(formData.capacity) <= 0
        ) {
            setError(
                "Capacity must be greater than 0."
            );
            return;
        }

        if (
            !formData.opening_time ||
            !formData.closing_time
        ) {
            setError(
                "Opening time and closing time are required."
            );
            return;
        }

        if (
            formData.opening_time >=
            formData.closing_time
        ) {
            setError(
                "Closing time must be after opening time."
            );
            return;
        }

        if (
            !formData.slot_duration ||
            Number(formData.slot_duration) <= 0
        ) {
            setError(
                "Please select a valid slot duration."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/admin/cricket-grounds/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name:
                            formData.name.trim(),
                        location:
                            formData.location.trim(),
                        description:
                            formData.description.trim(),
                        capacity:
                            formData.capacity === ""
                                ? null
                                : Number(
                                    formData.capacity
                                ),
                        price_per_hour:
                            Number(
                                formData.price_per_hour
                            ),
                        opening_time:
                            formData.opening_time,
                        closing_time:
                            formData.closing_time,
                        slot_duration:
                            Number(
                                formData.slot_duration
                            ),
                        status:
                            formData.status
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to update cricket ground."
                );
            }

            alert(
                "Cricket ground updated successfully."
            );

            navigate("/admin/cricket-box");
        } catch (err) {
            console.error(
                "Update Ground Error:",
                err
            );

            setError(
                err.message ||
                "Cannot connect to backend server."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");

        navigate("/admin/login", {
            replace: true
        });
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    if (loading) {

    return (
            <div className="edit-ground-loading">
                <div className="edit-ground-loading-icon">
                    🏏
                </div>

                <h2>
                    Loading Ground...
                </h2>

                <p>
                    Please wait while ground
                    details are loading.
                </p>
            </div>
        );
    }

    return (
        <div className="edit-ground-page">

            {/* SIDEBAR */}

            <aside className={`edit-ground-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>

                <div className="edit-ground-brand">

                    <div className="edit-ground-brand-icon">
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

                <nav className="edit-ground-nav">

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
                        onClick={() =>
                            navigate(
                                "/admin/complaints"
                            )
                        }
                    >
                        📝 Complaints
                    </button>

                    <button
                        className="active"
                        onClick={() =>
                            navigate(
                                "/admin/cricket-box"
                            )
                        }
                    >
                        🏏 Cricket Box
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/announcements"
                            )
                        }
                    >
                        📢 Announcements
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/reports"
                            )
                        }
                    >
                        📊 Reports
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
                    className="edit-ground-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>

                {mobileMenuOpen && (
                    <div
                        className="admin-mobile-overlay"
                        onClick={closeMobileMenu}
                    />
                )}

            {/* MAIN */}

            <main className="edit-ground-main">

                <div className="admin-mobile-header">
                    <div className="admin-mobile-left">
                        <button className="admin-mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">☰</button>
                        <div className="admin-mobile-brand">
                            <div className="admin-mobile-brand-icon">🏠</div>
                            <div><strong>Hostel</strong><span>Admin Panel</span></div>
                        </div>
                    </div>
                    <button className="admin-mobile-profile-btn" onClick={() => navigate("/admin/profile")} aria-label="Open profile">
                        {getAdminPhotoUrl(admin?.photo) ? <img src={getAdminPhotoUrl(admin?.photo)} alt="Admin" /> : "👤"}
                    </button>
                </div>

                {/* HEADER */}

                <header className="edit-ground-header">

                    <div>

                        <span>
                            CRICKET BOX MANAGEMENT
                        </span>

                        <h1>
                            Edit Cricket Ground
                        </h1>

                        <p>
                            Update ground details,
                            pricing and booking slots.
                        </p>

                    </div>

                    <button
                        className="edit-ground-back"
                        onClick={() =>
                            navigate(
                                "/admin/cricket-box"
                            )
                        }
                    >
                        ← Back to Grounds
                    </button>

                    <div className="admin-page-user">
                        <button className="admin-page-user-button" onClick={() => navigate("/admin/profile")} aria-label="Open admin profile">
                            {getAdminPhotoUrl(admin?.photo) ? <img src={getAdminPhotoUrl(admin?.photo)} alt="Admin" /> : <span>👤</span>}
                        </button>
                    </div>
                </header>

                {/* ERROR */}

                {error && (

                    <div className="edit-ground-error">

                        <span>
                            ⚠️
                        </span>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>

                    </div>

                )}

                {/* FORM */}

                <form
                    className="edit-ground-form"
                    onSubmit={handleSubmit}
                >

                    <div className="edit-ground-form-header">

                        <div className="edit-ground-form-icon">
                            ✏️
                        </div>

                        <div>

                            <h2>
                                Ground Information
                            </h2>

                            <p>
                                Update the details of
                                this cricket box.
                            </p>

                        </div>

                    </div>

                    {/* BASIC INFORMATION */}

                    <div className="edit-ground-section">

                        <h3>
                            Basic Information
                        </h3>

                        <div className="edit-ground-fields">

                            <div className="edit-ground-field">

                                <label>
                                    Ground / Box Name
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={
                                        formData.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Cricket Box A"
                                    required
                                />

                            </div>

                            <div className="edit-ground-field">

                                <label>
                                    Location
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={
                                        formData.location
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Main Hostel Ground"
                                />

                            </div>

                            <div className="edit-ground-field full">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter ground or cricket box description..."
                                    rows="4"
                                />

                            </div>

                        </div>

                    </div>

                    {/* CAPACITY AND PRICE */}

                    <div className="edit-ground-section">

                        <h3>
                            Capacity & Pricing
                        </h3>

                        <div className="edit-ground-fields">

                            <div className="edit-ground-field">

                                <label>
                                    Capacity
                                </label>

                                <input
                                    type="number"
                                    name="capacity"
                                    value={
                                        formData.capacity
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. 12"
                                    min="1"
                                />

                                <small>
                                    Maximum players
                                </small>

                            </div>

                            <div className="edit-ground-field">

                                <label>
                                    Price Per Hour
                                    <span>*</span>
                                </label>

                                <div className="edit-ground-price-input">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        name="price_per_hour"
                                        value={
                                            formData.price_per_hour
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="500"
                                        min="0"
                                        step="0.01"
                                        required
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* TIMINGS */}

                    <div className="edit-ground-section">

                        <h3>
                            Booking Timings
                        </h3>

                        <div className="edit-ground-fields">

                            <div className="edit-ground-field">

                                <label>
                                    Opening Time
                                    <span>*</span>
                                </label>

                                <input
                                    type="time"
                                    name="opening_time"
                                    value={
                                        formData.opening_time
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            <div className="edit-ground-field">

                                <label>
                                    Closing Time
                                    <span>*</span>
                                </label>

                                <input
                                    type="time"
                                    name="closing_time"
                                    value={
                                        formData.closing_time
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            <div className="edit-ground-field">

                                <label>
                                    Slot Duration
                                    <span>*</span>
                                </label>

                                <select
                                    name="slot_duration"
                                    value={
                                        formData.slot_duration
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >
                                    <option value="30">
                                        30 Minutes
                                    </option>

                                    <option value="60">
                                        1 Hour
                                    </option>

                                    <option value="90">
                                        1.5 Hours
                                    </option>

                                    <option value="120">
                                        2 Hours
                                    </option>
                                </select>

                                <small>
                                    Available slots are
                                    generated automatically.
                                </small>

                            </div>

                        </div>

                    </div>

                    {/* STATUS */}

                    <div className="edit-ground-section">

                        <h3>
                            Ground Status
                        </h3>

                        <div className="edit-ground-status-options">

                            <label
                                className={
                                    formData.status ===
                                    "Active"
                                        ? "selected"
                                        : ""
                                }
                            >

                                <input
                                    type="radio"
                                    name="status"
                                    value="Active"
                                    checked={
                                        formData.status ===
                                        "Active"
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                <span className="status-dot active-dot">
                                </span>

                                <div>
                                    <strong>
                                        Active
                                    </strong>

                                    <small>
                                        Students can book
                                        this ground.
                                    </small>
                                </div>

                            </label>

                            <label
                                className={
                                    formData.status ===
                                    "Inactive"
                                        ? "selected"
                                        : ""
                                }
                            >

                                <input
                                    type="radio"
                                    name="status"
                                    value="Inactive"
                                    checked={
                                        formData.status ===
                                        "Inactive"
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                <span className="status-dot inactive-dot">
                                </span>

                                <div>
                                    <strong>
                                        Inactive
                                    </strong>

                                    <small>
                                        Students cannot
                                        book this ground.
                                    </small>
                                </div>

                            </label>

                        </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="edit-ground-form-actions">

                        <button
                            type="button"
                            className="edit-ground-cancel"
                            onClick={() =>
                                navigate(
                                    "/admin/cricket-box"
                                )
                            }
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="edit-ground-submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving Changes..."
                                : "✓ Save Changes"}
                        </button>

                    </div>

                </form>

                {/* FOOTER */}

                <footer className="edit-ground-footer">

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

export default EditGround
                
