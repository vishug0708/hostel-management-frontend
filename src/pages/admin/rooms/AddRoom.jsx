import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddRoom.css";

function AddRoom() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        room_no: "",
        floor: "",
        capacity: "",
        room_type: "",
        fees: "",
        hostel: "",
        status: "Available"
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [saving, setSaving] = useState(false);


    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        setError("");
        setSuccess("");

    };


    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !formData.room_no ||
            !formData.capacity ||
            !formData.fees ||
            !formData.hostel
        ) {

            setError(
                "Please fill all required fields."
            );

            return;
        }


        if (
            !Number.isInteger(
                Number(formData.capacity)
            ) ||
            Number(formData.capacity) <= 0
        ) {

            setError(
                "Room capacity must be a valid number."
            );

            return;
        }


        if (Number(formData.fees) < 0) {

            setError(
                "Room fees cannot be negative."
            );

            return;
        }


        const token =
            localStorage.getItem("adminToken");


        if (!token) {

            navigate("/admin/login", {
                replace: true
            });

            return;
        }


        // =================================================
        // API
        // =================================================

        try {

            setSaving(true);


            const response = await fetch(
                "http://localhost:5000/api/admin/rooms",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({
                        room_no:
                            formData.room_no,

                        floor:
                            formData.floor,

                        capacity:
                            Number(formData.capacity),

                        room_type:
                            formData.room_type,

                        fees:
                            Number(formData.fees),

                        hostel:
                            formData.hostel,

                        status:
                            formData.status,
                        
                        // floor:
                        //     formData.floor
                        
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok || !data.success) {

                setError(
                    data.message ||
                    "Unable to add room."
                );

                return;
            }


            setSuccess(
                "Room added successfully."
            );


            // Reset form

            setFormData({
                room_no: "",
                floor: "",
                capacity: "",
                room_type: "",
                fees: "",
                hostel: "",
                status: "Available"
            });


        } catch (err) {

            console.error(
                "Add Room Error:",
                err
            );

            setError(
                "Cannot connect to backend server."
            );

        } finally {

            setSaving(false);

        }

    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem(
            "adminToken"
        );

        localStorage.removeItem(
            "admin"
        );

        navigate("/admin/login", {
            replace: true
        });

    };


    return (

        <div className="add-room-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="add-room-sidebar">


                <div className="add-room-brand">

                    <div className="add-room-brand-icon">
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


                <nav className="add-room-nav">


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
                    >
                        🛏️ Rooms
                    </button>


                    <button
                        onClick={() =>
                            navigate("/admin/rooms")
                        }
                    >
                        📋 Manage Rooms
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
                    className="add-room-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="add-room-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="add-room-header">

                    <div>

                        <span>
                            ROOM MANAGEMENT
                        </span>

                        <h1>
                            Add Room
                        </h1>

                        <p>
                            Create a new hostel room and
                            define its capacity and fees.
                        </p>

                    </div>


                    <button
                        className="room-back-btn"
                        onClick={() =>
                            navigate("/admin/rooms")
                        }
                    >
                        ← Manage Rooms
                    </button>

                </header>


                {/* =================================================
                    FORM CARD
                ================================================= */}

                <section className="add-room-card">


                    <div className="add-room-card-header">

                        <div className="room-form-icon">
                            🛏️
                        </div>

                        <div>

                            <h2>
                                Room Information
                            </h2>

                            <p>
                                Enter the room details below.
                            </p>

                        </div>

                    </div>


                    <form
                        className="add-room-form"
                        onSubmit={handleSubmit}
                    >


                        {/* =================================================
                            ROOM DETAILS
                        ================================================= */}

                        <div className="room-section-title">
                            Room Details
                        </div>


                        <div className="room-form-grid">


                            {/* ROOM NUMBER */}

                            <div className="room-form-group">

                                <label>
                                    Room Number *
                                </label>

                                <input
                                    type="text"
                                    name="room_no"
                                    value={
                                        formData.room_no
                                    }
                                    onChange={handleChange}
                                    placeholder="Example: A 101"
                                />

                            </div>


                            {/* FLOOR */}

                            <div className="room-form-group">

                                <label>
                                    Floor
                                </label>

                                <input
                                    type="text"
                                    name="floor"
                                    value={
                                        formData.floor
                                    }
                                    onChange={handleChange}
                                    placeholder="Example: 1nd Floor"
                                />

                            </div>


                            {/* HOSTEL */}

                            <div className="room-form-group">

                                <label>
                                    Hostel *
                                </label>

                                <input
                                    type="text"
                                    name="hostel"
                                    value={
                                        formData.hostel
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter hostel name"
                                />

                            </div>


                            {/* ROOM TYPE */}

                            <div className="room-form-group">

                                <label>
                                    Room Type
                                </label>

                                <select
                                    name="room_type"
                                    value={
                                        formData.room_type
                                    }
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select Room Type
                                    </option>

                                    <option value="Single">
                                        Single
                                    </option>

                                    <option value="Double">
                                        Double
                                    </option>

                                    <option value="Triple">
                                        Triple
                                    </option>

                                    <option value="Four Sharing">
                                        Four Sharing
                                    </option>

                                </select>

                            </div>


                            {/* CAPACITY */}

                            <div className="room-form-group">

                                <label>
                                    Capacity *
                                </label>

                                <input
                                    type="number"
                                    name="capacity"
                                    min="1"
                                    value={
                                        formData.capacity
                                    }
                                    onChange={handleChange}
                                    placeholder="Example: 3"
                                />

                            </div>


                            {/* FEE */}

                            <div className="room-form-group">

                                <label>
                                    Room Fees *
                                </label>

                                <div className="room-fee-input">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        name="fees"
                                        min="0"
                                        step="0.01"
                                        value={
                                            formData.fees
                                        }
                                        onChange={handleChange}
                                        placeholder="Example: 3000"
                                    />

                                </div>

                            </div>


                            {/* STATUS */}

                            <div className="room-form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={
                                        formData.status
                                    }
                                    onChange={handleChange}
                                >

                                    <option value="Available">
                                        Available
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


                        {/* =================================================
                            CAPACITY INFO
                        ================================================= */}

                        <div className="room-capacity-info">

                            <div className="capacity-icon">
                                👥
                            </div>

                            <div>

                                <strong>
                                    Room Capacity
                                </strong>

                                <p>
                                    Maximum students that can be
                                    allocated to this room.
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            MESSAGES
                        ================================================= */}

                        {success && (

                            <div className="add-room-success">
                                ✓ {success}
                            </div>

                        )}


                        {error && (

                            <div className="add-room-error">
                                ⚠ {error}
                            </div>

                        )}


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="add-room-actions">

                            <button
                                type="button"
                                className="room-cancel-btn"
                                onClick={() =>
                                    navigate(
                                        "/admin/rooms"
                                    )
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="room-save-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "➕ Add Room"
                                }
                            </button>

                        </div>

                    </form>

                </section>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="add-room-footer">

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

export default AddRoom;