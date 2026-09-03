import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddGround.css";

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


function AddGround() {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("admin") || "{}");
        } catch {
            return {};
        }
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
            setError("Ground name is required.");
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
            formData.opening_time &&
            formData.closing_time &&
            formData.opening_time >=
            formData.closing_time
        ) {
            setError(
                "Closing time must be after opening time."
            );
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/admin/cricket-grounds`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: formData.name.trim(),
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
                            formData.opening_time ||
                            null,
                        closing_time:
                            formData.closing_time ||
                            null,
                        slot_duration:
                            Number(formData.slot_duration),
                        status:
                            formData.status
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to add cricket ground."
                );
            }

            alert(
                "Cricket ground added successfully."
            );

            navigate("/admin/cricket-box");
        } catch (err) {
            console.error(
                "Add Ground Error:",
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

    return (
        <div className="add-ground-page">

            {/* SIDEBAR */}

            <aside className="add-ground-sidebar">

                <div className="add-ground-brand">

                    <div className="add-ground-brand-icon">
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

                <nav className="add-ground-nav">

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
                                "/admin/profile"
                            )
                        }
                    >
                        👤 Profile
                    </button>

                </nav>

                <button
                    className="add-ground-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>

            {/* MAIN */}

            <main className="add-ground-main">

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

                <header className="add-ground-header">

                    <div>

                        <span>
                            CRICKET BOX MANAGEMENT
                        </span>

                        <h1>
                            Add Cricket Ground
                        </h1>

                        <p>
                            Add a new cricket box
                            for student bookings.
                        </p>

                    </div>

                    <button
                        className="add-ground-back"
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

                    <div className="add-ground-error">

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
                    className="add-ground-form"
                    onSubmit={handleSubmit}
                >

                    <div className="add-ground-form-header">

                        <div className="add-ground-form-icon">
                            🏏
                        </div>

                        <div>

                            <h2>
                                Ground Information
                            </h2>

                            <p>
                                Enter the details of
                                the cricket box.
                            </p>

                        </div>

                    </div>

                    {/* BASIC INFORMATION */}

                    <div className="add-ground-section">

                        <h3>
                            Basic Information
                        </h3>

                        <div className="add-ground-fields">

                            <div className="add-ground-field">

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

                            <div className="add-ground-field">

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

                            <div className="add-ground-field full">

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

                    <div className="add-ground-section">

                        <h3>
                            Capacity & Pricing
                        </h3>

                        <div className="add-ground-fields">

                            <div className="add-ground-field">

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

                            <div className="add-ground-field">

                                <label>
                                    Price Per Hour
                                    <span>*</span>
                                </label>

                                <div className="add-ground-price-input">

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

                    <div className="add-ground-section">

                        <h3>
                            Booking Timings
                        </h3>

                        <div className="add-ground-fields">

                            <div className="add-ground-field">

                                <label>
                                    Opening Time
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
                                />

                            </div>

                            <div className="add-ground-field">

                                <label>
                                    Closing Time
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
                                />

                            </div>

                            <div className="add-ground-field">

                                <label>
                                    Slot Duration
                                    <span>*</span>
                                </label>

                                <select
                                    name="slot_duration"
                                    value={formData.slot_duration}
                                    onChange={handleChange}
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
                                    Slots will be generated automatically.
                                </small>

                            </div>

                        </div>

                    </div>

                    {/* STATUS */}

                    <div className="add-ground-section">

                        <h3>
                            Ground Status
                        </h3>

                        <div className="add-ground-status-options">

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

                    <div className="add-ground-form-actions">

                        <button
                            type="button"
                            className="add-ground-cancel"
                            onClick={() =>
                                navigate(
                                    "/admin/cricket-box"
                                )
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="add-ground-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Adding Ground..."
                                : "✓ Add Ground"}
                        </button>

                    </div>

                </form>

                {/* FOOTER */}

                <footer className="add-ground-footer">

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

export default AddGround
                <aside className="add-ground-sidebar {mobileMenuOpen ? "mobile-open" : ""}">
                    <div className="add-ground-brand">
                        <div className="add-ground-brand-icon">🏠</div>
                        <div><strong>Hostel</strong><span>Admin Panel</span></div>
                    </div>
                    <nav className="add-ground-nav">
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/dashboard"); }}>📊 Dashboard</button>
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/students"); }}>🎓 Students</button>
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/rooms"); }}>🛏️ Rooms</button>
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/fees"); }}>💳 Fees</button>
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/complaints"); }}>📝 Complaints</button>
                        <button className="active" onClick={() => { closeMobileMenu(); navigate("/admin/cricket-box"); }}>🏏 Cricket Box</button>
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/announcements"); }}>📢 Announcements</button>
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/reports"); }}>📊 Reports</button>
                        <button onClick={() => { closeMobileMenu(); navigate("/admin/profile"); }}>👤 Profile</button>
                    </nav>
                    <button className="add-ground-logout" onClick={handleLogout}>🚪 Logout</button>
                </aside>
                {mobileMenuOpen && (
                    <div className="admin-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
                )}
            {/* MAIN */}

            <main className="add-ground-main">

                {/* HEADER */}

                <header className="add-ground-header">

                    <div>

                        <span>
                            CRICKET BOX MANAGEMENT
                        </span>

                        <h1>
                            Add Cricket Ground
                        </h1>

                        <p>
                            Add a new cricket box
                            for student bookings.
                        </p>

                    </div>

                    <button
                        className="add-ground-back"
                        onClick={() =>
                            navigate(
                                "/admin/cricket-box"
                            )
                        }
                    >
                        ← Back to Grounds
                    </button>

                </header>

                {/* ERROR */}

                {error && (

                    <div className="add-ground-error">

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
                    className="add-ground-form"
                    onSubmit={handleSubmit}
                >

                    <div className="add-ground-form-header">

                        <div className="add-ground-form-icon">
                            🏏
                        </div>

                        <div>

                            <h2>
                                Ground Information
                            </h2>

                            <p>
                                Enter the details of
                                the cricket box.
                            </p>

                        </div>

                    </div>

                    {/* BASIC INFORMATION */}

                    <div className="add-ground-section">

                        <h3>
                            Basic Information
                        </h3>

                        <div className="add-ground-fields">

                            <div className="add-ground-field">

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

                            <div className="add-ground-field">

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

                            <div className="add-ground-field full">

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

                    <div className="add-ground-section">

                        <h3>
                            Capacity & Pricing
                        </h3>

                        <div className="add-ground-fields">

                            <div className="add-ground-field">

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

                            <div className="add-ground-field">

                                <label>
                                    Price Per Hour
                                    <span>*</span>
                                </label>

                                <div className="add-ground-price-input">

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

                    <div className="add-ground-section">

                        <h3>
                            Booking Timings
                        </h3>

                        <div className="add-ground-fields">

                            <div className="add-ground-field">

                                <label>
                                    Opening Time
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
                                />

                            </div>

                            <div className="add-ground-field">

                                <label>
                                    Closing Time
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
                                />

                            </div>

                            <div className="add-ground-field">

                                <label>
                                    Slot Duration
                                    <span>*</span>
                                </label>

                                <select
                                    name="slot_duration"
                                    value={formData.slot_duration}
                                    onChange={handleChange}
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
                                    Slots will be generated automatically.
                                </small>

                            </div>

                        </div>

                    </div>

                    {/* STATUS */}

                    <div className="add-ground-section">

                        <h3>
                            Ground Status
                        </h3>

                        <div className="add-ground-status-options">

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

                    <div className="add-ground-form-actions">

                        <button
                            type="button"
                            className="add-ground-cancel"
                            onClick={() =>
                                navigate(
                                    "/admin/cricket-box"
                                )
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="add-ground-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Adding Ground..."
                                : "✓ Add Ground"}
                        </button>

                    </div>

                </form>

                {/* FOOTER */}

                <footer className="add-ground-footer">

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

export default AddGround;