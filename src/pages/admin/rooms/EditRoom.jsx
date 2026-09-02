import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditRoom.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EditRoom = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        block: "",
        room_no: "",
        room_type: "",
        total_beds: "",
        fees: "",
        status: "Available",
        hostel: ""
    });

    const [allocatedBeds, setAllocatedBeds] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchRoom();
    }, [id]);

    const fetchRoom = async () => {
        try {
            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("adminToken");

            const response = await fetch(
                `http://localhost:5000/api/admin/rooms/${id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Failed to load room."
                );
            }

            const room = data.room;

            setFormData({
                block: room.block || "",
                room_no: room.room_no || "",
                room_type:
                    room.room_type || "",
                total_beds:
                    room.total_beds || "",
                fees:
                    room.fees ?? "",
                status:
                    room.status || "Available",
                hostel:
                    room.hostel || ""
            });

            setAllocatedBeds(
                Number(
                    room.allocated_beds || 0
                )
            );

        } catch (err) {
            console.error(
                "Fetch Room Error:",
                err
            );

            setError(
                err.message ||
                "Unable to load room."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const {
            name,
            value
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.block.trim()) {
            setError(
                "Please enter block."
            );
            return;
        }

        if (!formData.room_no.trim()) {
            setError(
                "Please enter room number."
            );
            return;
        }

        if (!formData.room_type.trim()) {
            setError(
                "Please select room type."
            );
            return;
        }

        if (
            !formData.total_beds ||
            Number(formData.total_beds) <= 0
        ) {
            setError(
                "Total beds must be greater than 0."
            );
            return;
        }

        if (
            Number(formData.total_beds) <
            allocatedBeds
        ) {
            setError(
                `Total beds cannot be less than ${allocatedBeds} because ${allocatedBeds} beds are currently allocated.`
            );
            return;
        }

        if (
            formData.fees === "" ||
            Number(formData.fees) < 0
        ) {
            setError(
                "Please enter valid room fees."
            );
            return;
        }

        if (!formData.hostel.trim()) {
            setError(
                "Please enter hostel name."
            );
            return;
        }

        try {
            setSubmitting(true);

            const token =
                localStorage.getItem(
                    "adminToken"
                );

            const response = await fetch(
                `http://localhost:5000/api/admin/rooms/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        block:
                            formData.block
                                .trim()
                                .toUpperCase(),

                        room_no:
                            formData.room_no
                                .trim()
                                .toUpperCase(),

                        room_type:
                            formData.room_type
                                .trim(),

                        total_beds:
                            Number(
                                formData.total_beds
                            ),

                        fees:
                            Number(
                                formData.fees
                            ),

                        status:
                            formData.status,

                        hostel:
                            formData.hostel
                                .trim()
                    })
                }
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    "Failed to update room."
                );
            }

            setSuccess(
                `Room ${formData.room_no.toUpperCase()} updated successfully.`
            );

            setTimeout(() => {
                navigate(
                    "/admin/rooms"
                );
            }, 1000);

        } catch (err) {
            console.error(
                "Update Room Error:",
                err
            );

            setError(
                err.message ||
                "Unable to update room."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const availableBeds =
        Math.max(
            Number(
                formData.total_beds || 0
            ) - allocatedBeds,
            0
        );

    if (loading) {
        return (
            <div className="edit-room-loading">
                <div className="edit-room-loading-icon">
                    ⏳
                </div>

                <h2>
                    Loading Room...
                </h2>

                <p>
                    Please wait while room
                    information is being loaded.
                </p>
            </div>
        );
    }

    return (
        <div className="edit-room-page">

            <div className="edit-room-container">

                {/* HEADER */}

                <div className="edit-room-header">

                    <div>
                        <span className="edit-room-label">
                            ADMIN PANEL
                        </span>

                        <h1>
                            Edit Room
                        </h1>

                        <p>
                            Update room and bed
                            information.
                        </p>
                    </div>

                    <button
                        className="edit-room-back-btn"
                        onClick={() =>
                            navigate(
                                "/admin/rooms"
                            )
                        }
                    >
                        ← Back to Rooms
                    </button>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="edit-room-alert error">

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

                {/* SUCCESS */}

                {success && (
                    <div className="edit-room-alert success">

                        <span>
                            ✓
                        </span>

                        <p>
                            {success}
                        </p>

                    </div>
                )}

                {/* CURRENT BED STATUS */}

                <div className="edit-room-status-card">

                    <div className="edit-room-status-heading">

                        <div className="edit-room-status-icon">
                            🛏️
                        </div>

                        <div>
                            <span>
                                CURRENT ROOM STATUS
                            </span>

                            <h2>
                                Room{" "}
                                {formData.room_no ||
                                    "—"}
                            </h2>
                        </div>

                    </div>

                    <div className="edit-room-stat-grid">

                        <div className="edit-room-stat">

                            <span>
                                TOTAL BEDS
                            </span>

                            <strong>
                                {
                                    formData.total_beds ||
                                    0
                                }
                            </strong>

                        </div>

                        <div className="edit-room-stat">

                            <span>
                                ALLOCATED
                            </span>

                            <strong>
                                {allocatedBeds}
                            </strong>

                        </div>

                        <div className="edit-room-stat">

                            <span>
                                VACANT
                            </span>

                            <strong>
                                {availableBeds}
                            </strong>

                        </div>

                    </div>

                </div>

                {/* FORM */}

                <form
                    className="edit-room-card"
                    onSubmit={handleSubmit}
                >

                    <div className="edit-room-card-header">

                        <div className="edit-room-icon">
                            ✏️
                        </div>

                        <div>
                            <h2>
                                Room Information
                            </h2>

                            <p>
                                Make changes to
                                the selected room.
                            </p>
                        </div>

                    </div>

                    <div className="edit-room-form">

                        {/* BLOCK */}

                        <div className="edit-room-field">

                            <label>
                                BLOCK
                            </label>

                            <input
                                type="text"
                                name="block"
                                value={
                                    formData.block
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="A"
                                disabled={
                                    submitting
                                }
                            />

                            <small>
                                Example: A, B, C,
                                D, E, F, G, H
                            </small>

                        </div>

                        {/* ROOM NUMBER */}

                        <div className="edit-room-field">

                            <label>
                                ROOM NUMBER
                            </label>

                            <input
                                type="text"
                                name="room_no"
                                value={
                                    formData.room_no
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="A101"
                                disabled={
                                    submitting
                                }
                            />

                            <small>
                                Example: A101
                            </small>

                        </div>

                        {/* ROOM TYPE */}

                        <div className="edit-room-field">

                            <label>
                                ROOM TYPE
                            </label>

                            <select
                                name="room_type"
                                value={
                                    formData.room_type
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    submitting
                                }
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

                                <option value="Six Sharing">
                                    Six Sharing
                                </option>

                                <option value="Eight Sharing">
                                    Eight Sharing
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>

                        {/* TOTAL BEDS */}

                        <div className="edit-room-field">

                            <label>
                                TOTAL BEDS
                            </label>

                            <input
                                type="number"
                                name="total_beds"
                                value={
                                    formData.total_beds
                                }
                                onChange={
                                    handleChange
                                }
                                min={
                                    allocatedBeds > 0
                                        ? allocatedBeds
                                        : 1
                                }
                                disabled={
                                    submitting
                                }
                            />

                            <small>
                                Minimum{" "}
                                {allocatedBeds}{" "}
                                beds required because
                                they are already allocated.
                            </small>

                        </div>

                        {/* FEES */}

                        <div className="edit-room-field">

                            <label>
                                ROOM FEES
                            </label>

                            <input
                                type="number"
                                name="fees"
                                value={
                                    formData.fees
                                }
                                onChange={
                                    handleChange
                                }
                                min="0"
                                step="0.01"
                                placeholder="50000"
                                disabled={
                                    submitting
                                }
                            />

                        </div>

                        {/* STATUS */}

                        <div className="edit-room-field">

                            <label>
                                ROOM STATUS
                            </label>

                            <select
                                name="status"
                                value={
                                    formData.status
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    submitting
                                }
                            >

                                <option value="Available">
                                    Available
                                </option>

                                <option value="Occupied">
                                    Occupied
                                </option>

                                <option value="Reserved">
                                    Reserved
                                </option>

                                <option value="Not In Use">
                                    Not In Use
                                </option>

                            </select>

                        </div>

                        {/* HOSTEL */}

                        <div className="edit-room-field full-width">

                            <label>
                                HOSTEL NAME
                            </label>

                            <input
                                type="text"
                                name="hostel"
                                value={
                                    formData.hostel
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Virtuous Hostel"
                                disabled={
                                    submitting
                                }
                            />

                        </div>

                    </div>

                    {/* BED VISUALIZATION */}

                    <div className="edit-room-bed-section">

                        <div className="edit-room-bed-header">

                            <div>
                                <span>
                                    BED STATUS
                                </span>

                                <h3>
                                    Current Bed
                                    Occupancy
                                </h3>
                            </div>

                            <div className="edit-room-bed-summary">

                                <span className="edit-room-bed-dot allocated">
                                    ●
                                </span>

                                Allocated

                                <span className="edit-room-bed-dot vacant">
                                    ●
                                </span>

                                Vacant

                            </div>

                        </div>

                        <div className="edit-room-beds">

                            {Array.from({
                                length: Number(
                                    formData.total_beds ||
                                    0
                                )
                            }).map(
                                (_, index) => {

                                    const allocated =
                                        index <
                                        allocatedBeds;

                                    return (
                                        <div
                                            key={
                                                index
                                            }
                                            className={`edit-room-bed ${
                                                allocated
                                                    ? "allocated"
                                                    : "vacant"
                                            }`}
                                        >

                                            <span>
                                                Bed{" "}
                                                {index +
                                                    1}
                                            </span>

                                            <strong>
                                                {allocated
                                                    ? "Allocated"
                                                    : "Vacant"}
                                            </strong>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="edit-room-actions">

                        <button
                            type="button"
                            className="edit-room-cancel-btn"
                            onClick={() =>
                                navigate(
                                    "/admin/rooms"
                                )
                            }
                            disabled={
                                submitting
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="edit-room-submit-btn"
                            disabled={
                                submitting
                            }
                        >
                            {submitting
                                ? "Updating Room..."
                                : "Update Room"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default EditRoom;