import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditRoom.css";

function EditRoom() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        room_no: "",
        floor: "",
        capacity: "",
        room_type: "",
        fees: "",
        hostel: "",
        status: "Available"
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRoom();
    }, [id]);

    const fetchRoom = async () => {
        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login", { replace: true });
            return;
        }

        if (!id) {
            setError("Room ID is missing.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/admin/rooms/${id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(
                    data.message ||
                    "Unable to load room details."
                );
                return;
            }

            const room = data.room;

            setFormData({
                room_no: room.room_no || "",
                floor: room.floor || "",
                capacity: room.capacity || "",
                room_type: room.room_type || "",
                fees: room.fees || "",
                hostel: room.hostel || "",
                status: room.status || "Available"
            });
        } catch (err) {
            console.error("Fetch Room Error:", err);
            setError("Cannot connect to backend server.");
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

        setMessage("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login", { replace: true });
            return;
        }

        if (!formData.room_no.trim()) {
            setError("Room number is required.");
            return;
        }

        if (!formData.floor) {
            setError("Floor is required.");
            return;
        }

        if (!formData.capacity) {
            setError("Capacity is required.");
            return;
        }

        if (!formData.room_type) {
            setError("Room type is required.");
            return;
        }

        if (!formData.fees) {
            setError("Room fees is required.");
            return;
        }

        try {
            setSaving(true);
            setMessage("");
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/admin/rooms/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(
                    data.message ||
                    "Failed to update room."
                );
                return;
            }

            setMessage(
                "Room updated successfully."
            );

            setTimeout(() => {
                navigate(
                    `/admin/rooms/view/${id}`
                );
            }, 1000);
        } catch (err) {
            console.error("Update Room Error:", err);
            setError("Cannot connect to backend server.");
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

    if (loading) {
        return (
            <div className="edit-room-loading">
                <div className="edit-room-spinner">⏳</div>
                <p>Loading room details...</p>
            </div>
        );
    }

    if (error && !formData.room_nor) {
        return (
            <div className="edit-room-error-page">
                <div className="edit-room-error-icon">
                    ⚠️
                </div>

                <h2>Unable to Load Room</h2>

                <p>{error}</p>

                <button
                    onClick={() =>
                        navigate("/admin/rooms")
                    }
                >
                    ← Back to Rooms
                </button>
            </div>
        );
    }

    return (
        <div className="edit-room-page">
            <aside className="edit-room-sidebar">
                <div className="edit-room-brand">
                    <div className="edit-room-brand-icon">
                        🏠
                    </div>

                    <div>
                        <strong>Hostel</strong>
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav className="edit-room-nav">
                    <button
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        📊 Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        🎓 Students
                    </button>

                    <button
                        className="active"
                        onClick={() =>
                            navigate("/admin/rooms")
                        }
                    >
                        🛏️ Rooms
                    </button>

                    <button
                        onClick={() =>
                            navigate("/admin/rooms/add")
                        }
                    >
                        ➕ Add Room
                    </button>

                    <button
                        onClick={() =>
                            navigate("/admin/profile")
                        }
                    >
                        👤 Profile
                    </button>
                </nav>

                <button
                    className="edit-room-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>
            </aside>

            <main className="edit-room-main">
                <header className="edit-room-header">
                    <div>
                        <span>ROOM MANAGEMENT</span>

                        <h1>Edit Room</h1>

                        <p>
                            Update the information of room{" "}
                            <strong>
                                {formData.room_no}
                            </strong>
                        </p>
                    </div>

                    <button
                        className="edit-room-back-btn"
                        onClick={() =>
                            navigate(
                                `/admin/rooms/view/${id}`
                            )
                        }
                    >
                        ← Back to Room
                    </button>
                </header>

                <section className="edit-room-card">
                    <div className="edit-room-card-header">
                        <div className="edit-room-card-icon">
                            🛏️
                        </div>

                        <div>
                            <h2>Room Information</h2>
                            <p>
                                Modify room details below.
                            </p>
                        </div>
                    </div>

                    <form
                        className="edit-room-form"
                        onSubmit={handleSubmit}
                    >
                        {message && (
                            <div className="edit-room-success">
                                ✓ {message}
                            </div>
                        )}

                        {error && (
                            <div className="edit-room-error">
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="edit-room-form-grid">
                            <div className="edit-room-field">
                                <label>
                                    Room Number
                                </label>

                                <input
                                    type="text"
                                    name="room_no"
                                    value={
                                        formData.room_no
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter room number"
                                    required
                                />
                            </div>

                            <div className="edit-room-field">
                                <label>
                                    Floor
                                </label>

                                <input
                                    type="text"
                                    name="floor"
                                    value={formData.floor}
                                    onChange={handleChange}
                                    placeholder="Enter floor"
                                    required
                                />
                            </div>

                            <div className="edit-room-field">
                                <label>
                                    Capacity
                                </label>

                                <input
                                    type="number"
                                    name="capacity"
                                    value={
                                        formData.capacity
                                    }
                                    onChange={handleChange}
                                    placeholder="Number of students"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="edit-room-field">
                                <label>
                                    Room Type
                                </label>

                                <select
                                    name="room_type"
                                    value={
                                        formData.room_type
                                    }
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select room type
                                    </option>

                                    <option value="Single">
                                        Single
                                    </option>

                                    <option value="2 Sharing">
                                        2 Sharing
                                    </option>

                                    <option value="3 Sharing">
                                        3 Sharing
                                    </option>

                                    <option value="4 Sharing">
                                        4 Sharing
                                    </option>
                                </select>
                            </div>

                            <div className="edit-room-field">
                                <label>
                                    Hostel
                                </label>

                                <input
                                    type="text"
                                    name="hostel"
                                    value={formData.hostel}
                                    onChange={handleChange}
                                    placeholder="Enter hostel name"
                                    required
                                />
                            </div>

                            <div className="edit-room-field">
                                <label>
                                    Room Fee
                                </label>

                                <div className="edit-room-fee-input">
                                    <span>₹</span>

                                    <input
                                        type="number"
                                        name="fees"
                                        value={formData.fees}
                                        onChange={handleChange}
                                        placeholder="Enter room fees"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="edit-room-field">
                                <label>
                                    Room Status
                                </label>

                                <select
                                    name="status"
                                    value={
                                        formData.status
                                    }
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Available">
                                        Available
                                    </option>

                                    <option value="Occupied">
                                        Occupied
                                    </option>

                                    <option value="Maintenance">
                                        Maintenance
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="edit-room-notice">
                            <span>ℹ️</span>

                            <p>
                                Student room allocation and
                                deallocation are managed by
                                the Rector.
                            </p>
                        </div>

                        <div className="edit-room-actions">
                            <button
                                type="button"
                                className="edit-room-cancel-btn"
                                onClick={() =>
                                    navigate(
                                        `/admin/rooms/view/${id}`
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="edit-room-save-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? "Updating..."
                                    : "✓ Update Room"}
                            </button>
                        </div>
                    </form>
                </section>

                <footer className="edit-room-footer">
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

export default EditRoom;