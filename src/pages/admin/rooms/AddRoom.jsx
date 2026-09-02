import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddRoom.css";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

const BLOCKS = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H"
];

const AddRoom = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        block: "",
        room_no: "",
        total_beds: "8",
        status: "Available",
        hostel: "Virtuous Hostel"
    });

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    const generateRoomNumber = async () => {
        if (!formData.block) {
            setError(
                "Please select a block first."
            );
            return;
        }

        try {
            const token =
                localStorage.getItem(
                    "adminToken"
                );

            const response = await fetch(
                `${API_URL}/api/admin/rooms`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to fetch rooms."
                );
            }

            const rooms =
                data.rooms || [];

            const blockRooms =
                rooms.filter(
                    (room) =>
                        String(
                            room.block
                        ).toUpperCase() ===
                        formData.block
                );

            let highestNumber = 0;

            blockRooms.forEach(
                (room) => {
                    const match =
                        String(
                            room.room_no
                        ).match(
                            new RegExp(
                                `^${formData.block}(\\d+)$`,
                                "i"
                            )
                        );

                    if (match) {
                        const number =
                            parseInt(
                                match[1],
                                10
                            );

                        if (
                            number >
                            highestNumber
                        ) {
                            highestNumber =
                                number;
                        }
                    }
                }
            );

            let nextNumber;

            if (highestNumber === 0) {
                nextNumber = 101;
            } else {
                nextNumber =
                    highestNumber + 1;
            }

            setFormData((prev) => ({
                ...prev,
                room_no:
                    `${formData.block}${nextNumber}`
            }));
        } catch (err) {
            console.error(
                "Generate Room Error:",
                err
            );

            setError(
                err.message ||
                "Unable to generate room number."
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.block) {
            setError(
                "Please select a block."
            );
            return;
        }

        if (!formData.room_no.trim()) {
            setError(
                "Please enter room number."
            );
            return;
        }

        if (!formData.total_beds) {
            setError(
                "Please enter total beds."
            );
            return;
        }

        const totalBeds =
            Number(formData.total_beds);

        if (
            !Number.isInteger(totalBeds) ||
            totalBeds <= 0
        ) {
            setError(
                "Total beds must be a positive number."
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
                `${API_URL}/api/admin/rooms`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        block:
                            formData.block,
                        room_no:
                            formData.room_no
                                .trim()
                                .toUpperCase(),
                        total_beds:
                            totalBeds,
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

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to add room."
                );
            }

            setSuccess(
                "Room added successfully."
            );

            setFormData({
                block: "",
                room_no: "",
                total_beds: "8",
                status: "Available",
                hostel:
                    "Virtuous Hostel"
            });

        } catch (err) {
            console.error(
                "Add Room Error:",
                err
            );

            setError(
                err.message ||
                "Unable to add room."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="add-room-page">

            <div className="add-room-container">

                <div className="add-room-header">

                    <div>
                        <span className="add-room-label">
                            ADMIN PANEL
                        </span>

                        <h1>
                            Add New Room
                        </h1>

                        <p>
                            Create a new hostel
                            room with available
                            beds.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="add-room-back-btn"
                        onClick={() =>
                            navigate(
                                "/admin/rooms"
                            )
                        }
                    >
                        ← Back to Rooms
                    </button>

                </div>

                {error && (
                    <div className="add-room-alert add-room-error">

                        <span>⚠️</span>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {success && (
                    <div className="add-room-alert add-room-success">

                        <span>✓</span>

                        <p>
                            {success}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccess("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                <form
                    className="add-room-card"
                    onSubmit={handleSubmit}
                >

                    <div className="add-room-card-header">

                        <div className="add-room-icon">
                            🛏️
                        </div>

                        <div>
                            <h2>
                                Room Information
                            </h2>

                            <p>
                                Configure room
                                block, number
                                and beds.
                            </p>
                        </div>

                    </div>

                    <div className="add-room-form">

                        {/* BLOCK */}

                        <div className="add-room-field">

                            <label>
                                BLOCK
                            </label>

                            <select
                                name="block"
                                value={
                                    formData.block
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    submitting
                                }
                                required
                            >
                                <option value="">
                                    Select Block
                                </option>

                                {BLOCKS.map(
                                    (block) => (
                                        <option
                                            key={
                                                block
                                            }
                                            value={
                                                block
                                            }
                                        >
                                            Block{" "}
                                            {block}
                                        </option>
                                    )
                                )}
                            </select>

                            <small>
                                Select hostel
                                block.
                            </small>

                        </div>

                        {/* ROOM NUMBER */}

                        <div className="add-room-field">

                            <label>
                                ROOM NUMBER
                            </label>

                            <div className="room-number-row">

                                <input
                                    type="text"
                                    name="room_no"
                                    value={
                                        formData.room_no
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Example: A101"
                                    disabled={
                                        submitting
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    className="generate-btn"
                                    onClick={
                                        generateRoomNumber
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    Generate
                                </button>

                            </div>

                            <small>
                                Example: A101,
                                B101, C201.
                            </small>

                        </div>

                        {/* TOTAL BEDS */}

                        <div className="add-room-field">

                            <label>
                                TOTAL BEDS
                            </label>

                            <input
                                type="number"
                                name="total_beds"
                                min="1"
                                value={
                                    formData.total_beds
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter total beds"
                                disabled={
                                    submitting
                                }
                                required
                            />

                            <small>
                                Total beds available
                                in this room.
                            </small>

                        </div>

                        {/* STATUS */}

                        <div className="add-room-field">

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

                                <option value="Maintenance">
                                    Maintenance
                                </option>
                            </select>

                            <small>
                                Current room
                                status.
                            </small>

                        </div>

                        {/* HOSTEL */}

                        <div className="add-room-field add-room-full">

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
                                placeholder="Enter hostel name"
                                disabled={
                                    submitting
                                }
                                required
                            />

                        </div>

                    </div>

                    {/* PREVIEW */}

                    <div className="add-room-preview">

                        <div className="preview-title">
                            ROOM PREVIEW
                        </div>

                        <div className="preview-grid">

                            <div className="preview-room">

                                <span>
                                    ROOM
                                </span>

                                <strong>
                                    {formData.room_no ||
                                        "A101"}
                                </strong>

                            </div>

                            <div className="preview-item">

                                <span>
                                    BLOCK
                                </span>

                                <strong>
                                    {formData.block ||
                                        "-"}
                                </strong>

                            </div>

                            <div className="preview-item">

                                <span>
                                    TOTAL BEDS
                                </span>

                                <strong>
                                    {
                                        formData.total_beds ||
                                        "0"
                                    }
                                </strong>

                            </div>

                            <div className="preview-item">

                                <span>
                                    STATUS
                                </span>

                                <strong>
                                    {
                                        formData.status
                                    }
                                </strong>

                            </div>

                        </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="add-room-actions">

                        <button
                            type="button"
                            className="cancel-btn"
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
                            className="add-room-submit-btn"
                            disabled={
                                submitting
                            }
                        >
                            {submitting
                                ? "Adding Room..."
                                : "✓ Add Room"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default AddRoom;