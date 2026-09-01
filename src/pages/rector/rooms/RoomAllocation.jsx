import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RoomAllocation.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const RoomAllocation = () => {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");

    const [loading, setLoading] = useState(true);
    const [allocating, setAllocating] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getToken = () => {
        return (
            localStorage.getItem("rectorToken") ||
            localStorage.getItem("token")
        );
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const [studentsRes, roomsRes] = await Promise.all([
                fetch(
                    `${API_URL}/api/rector/room-allocation/students`,
                    {
                        headers,
                    }
                ),
                fetch(
                    `${API_URL}/api/rector/room-allocation/rooms`,
                    {
                        headers,
                    }
                ),
            ]);

            const studentsData = await studentsRes.json();
            const roomsData = await roomsRes.json();

            if (!studentsRes.ok) {
                throw new Error(
                    studentsData.message ||
                    "Failed to load students."
                );
            }

            if (!roomsRes.ok) {
                throw new Error(
                    roomsData.message ||
                    "Failed to load rooms."
                );
            }

            setStudents(studentsData.students || []);
            setRooms(roomsData.rooms || []);
        } catch (err) {
            console.error(
                "Room Allocation Fetch Error:",
                err
            );

            setError(
                err.message ||
                "Unable to load room allocation data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getTotalBeds = (room) => {
        return Number(
            room.total_beds ||
            room.capacity ||
            0
        );
    };

    const getAllocatedBeds = (room) => {
        return Number(
            room.allocated_beds ||
            room.allocatedBeds ||
            0
        );
    };

    const getAvailableBeds = (room) => {
        return Math.max(
            getTotalBeds(room) -
            getAllocatedBeds(room),
            0
        );
    };

    const getRoomStatus = (room) => {
        const availableBeds =
            getAvailableBeds(room);

        if (
            room.status === "Maintenance"
        ) {
            return "Maintenance";
        }

        if (availableBeds === 0) {
            return "Occupied";
        }

        return "Available";
    };

    const handleSelectRoom = (room) => {
        if (
            getRoomStatus(room) !== "Available" ||
            getAvailableBeds(room) <= 0
        ) {
            return;
        }

        setSelectedRoom(
            String(room.id)
        );

        setError("");
        setSuccess("");
    };

    const handleAllocate = async () => {
        setError("");
        setSuccess("");

        if (!selectedStudent) {
            setError(
                "Please select a student first."
            );
            return;
        }

        if (!selectedRoom) {
            setError(
                "Please select a room first."
            );
            return;
        }

        try {
            setAllocating(true);

            const token = getToken();

            const response = await fetch(
                `${API_URL}/api/rector/room-allocation/allocate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        student_id:
                            selectedStudent,
                        room_id:
                            selectedRoom,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Room allocation failed."
                );
            }

            setSuccess(
                data.message ||
                "Room allocated successfully."
            );

            setSelectedStudent("");
            setSelectedRoom("");

            await fetchData();
        } catch (err) {
            console.error(
                "Allocation Error:",
                err
            );

            setError(
                err.message ||
                "Unable to allocate room."
            );
        } finally {
            setAllocating(false);
        }
    };

    const sortedRooms = [...rooms].sort(
        (a, b) => {
            const blockCompare =
                String(a.block || "").localeCompare(
                    String(b.block || "")
                );

            if (blockCompare !== 0) {
                return blockCompare;
            }

            return String(
                a.room_no || ""
            ).localeCompare(
                String(b.room_no || ""),
                undefined,
                {
                    numeric: true,
                }
            );
        }
    );

    const groupedRooms = sortedRooms.reduce(
        (groups, room) => {
            const block =
                room.block || "Other";

            if (!groups[block]) {
                groups[block] = [];
            }

            groups[block].push(room);

            return groups;
        },
        {}
    );

    if (loading) {
        return (
            <div className="room-allocation-page">
                <div className="room-allocation-loading">
                    <div className="room-allocation-spinner"></div>
                    <p>
                        Loading rooms...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="room-allocation-page">

            {/* PAGE HEADER */}

            <div className="room-allocation-header">

                <div>
                    <span className="room-allocation-label">
                        ROOM ALLOCATION
                    </span>

                    <h1>
                        Allocate Room
                    </h1>

                    <p>
                        Select a student and
                        allocate an available bed.
                    </p>
                </div>

                <button
                    className="room-allocation-back"
                    onClick={() =>
                        navigate(
                            "/rector/dashboard"
                        )
                    }
                >
                    ← Back to Dashboard
                </button>

            </div>

            {/* ALERTS */}

            {error && (
                <div className="room-allocation-alert error">
                    <span>⚠️</span>

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={() =>
                            setError("")
                        }
                    >
                        ×
                    </button>
                </div>
            )}

            {success && (
                <div className="room-allocation-alert success">
                    <span>✓</span>

                    <span>
                        {success}
                    </span>

                    <button
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        ×
                    </button>
                </div>
            )}

            {/* STUDENT SELECTION */}

            <div className="student-selection-card">

                <div className="student-selection-title">
                    <div className="student-selection-icon">
                        👨‍🎓
                    </div>

                    <div>
                        <h2>
                            Select Student
                        </h2>

                        <p>
                            Choose a student for
                            room allocation.
                        </p>
                    </div>
                </div>

                <div className="student-selection-content">

                    <label>
                        SELECT STUDENT
                    </label>

                    <select
                        value={
                            selectedStudent
                        }
                        onChange={(e) => {
                            setSelectedStudent(
                                e.target.value
                            );

                            setSelectedRoom("");
                            setError("");
                            setSuccess("");
                        }}
                    >
                        <option value="">
                            Select Student
                        </option>

                        {students.map(
                            (student) => (
                                <option
                                    key={
                                        student.id
                                    }
                                    value={
                                        student.id
                                    }
                                >
                                    {student.name}

                                    {student.student_id
                                        ? ` (${student.student_id})`
                                        : ""}
                                </option>
                            )
                        )}
                    </select>

                    {students.length === 0 && (
                        <div className="student-empty">
                            ✓ All students already
                            have room allocation.
                        </div>
                    )}

                </div>

            </div>

            {/* ROOM DIRECTORY */}

            <div className="room-directory">

                <div className="room-directory-header">

                    <div>
                        <span>
                            ROOM DIRECTORY
                        </span>

                        <h2>
                            All Blocks
                        </h2>
                    </div>

                    <div className="room-count">
                        {rooms.length} Rooms
                    </div>

                </div>

                {/* BLOCKS */}

                {Object.entries(
                    groupedRooms
                ).map(
                    ([
                        block,
                        blockRooms,
                    ]) => (

                        <div
                            className="allocation-block"
                            key={block}
                        >

                            <div className="allocation-block-title">
                                BLOCK{" "}
                                {block}
                            </div>

                            <div className="allocation-room-grid">

                                {blockRooms.map(
                                    (room) => {
                                        const totalBeds =
                                            getTotalBeds(
                                                room
                                            );

                                        const allocatedBeds =
                                            getAllocatedBeds(
                                                room
                                            );

                                        const availableBeds =
                                            getAvailableBeds(
                                                room
                                            );

                                        const status =
                                            getRoomStatus(
                                                room
                                            );

                                        const selected =
                                            String(
                                                selectedRoom
                                            ) ===
                                            String(
                                                room.id
                                            );

                                        return (
                                            <div
                                                key={
                                                    room.id
                                                }
                                                className={`allocation-room-card ${
                                                    selected
                                                        ? "room-selected"
                                                        : ""
                                                }`}
                                            >

                                                {/* ROOM HEADER */}

                                                <div className="allocation-room-card-header">

                                                    <div>
                                                        <span className="allocation-block-name">
                                                            BLOCK{" "}
                                                            {
                                                                room.block
                                                            }
                                                        </span>

                                                        <h3>
                                                            Room{" "}
                                                            {
                                                                room.room_no
                                                            }
                                                        </h3>

                                                        <p>
                                                            Room
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`allocation-status ${status
                                                            .toLowerCase()
                                                            .replace(
                                                                " ",
                                                                "-"
                                                            )}`}
                                                    >
                                                        {status.toUpperCase()}
                                                    </span>

                                                </div>

                                                {/* BED STATUS */}

                                                <div className="allocation-bed-section">

                                                    <div className="allocation-bed-heading">

                                                        <span>
                                                            BED STATUS
                                                        </span>

                                                        <strong>
                                                            {
                                                                allocatedBeds
                                                            }
                                                            /
                                                            {
                                                                totalBeds
                                                            }
                                                        </strong>

                                                    </div>

                                                    <div className="allocation-beds">

                                                        {Array.from(
                                                            {
                                                                length:
                                                                    totalBeds,
                                                            },
                                                            (
                                                                _,
                                                                index
                                                            ) => {

                                                                const bedNumber =
                                                                    index +
                                                                    1;

                                                                const isAllocated =
                                                                    bedNumber <=
                                                                    allocatedBeds;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            bedNumber
                                                                        }
                                                                        className={`allocation-bed ${
                                                                            isAllocated
                                                                                ? "allocated"
                                                                                : "vacant"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            bedNumber
                                                                        }
                                                                    </div>
                                                                );
                                                            }
                                                        )}

                                                    </div>

                                                    <div className="allocation-bed-legend">

                                                        <span>
                                                            <i className="legend-red"></i>

                                                            {
                                                                allocatedBeds
                                                            }{" "}
                                                            Allocated
                                                        </span>

                                                        <span>
                                                            <i className="legend-green"></i>

                                                            {
                                                                availableBeds
                                                            }{" "}
                                                            Vacant
                                                        </span>

                                                    </div>

                                                </div>

                                                {/* ROOM INFO */}

                                                <div className="allocation-room-info">

                                                    <div>
                                                        <span>
                                                            HOSTEL
                                                        </span>

                                                        <strong>
                                                            {room.hostel ||
                                                                "Virtuous Hostel"}
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            AVAILABLE BEDS
                                                        </span>

                                                        <strong>
                                                            {
                                                                availableBeds
                                                            }
                                                        </strong>
                                                    </div>

                                                </div>

                                                {/* ACTION */}

                                                <div className="allocation-room-action">

                                                    <button
                                                        type="button"
                                                        className={
                                                            selected
                                                                ? "selected-room-btn"
                                                                : ""
                                                        }
                                                        disabled={
                                                            !selectedStudent ||
                                                            status !==
                                                                "Available" ||
                                                            availableBeds ===
                                                                0 ||
                                                            allocating
                                                        }
                                                        onClick={() =>
                                                            handleSelectRoom(
                                                                room
                                                            )
                                                        }
                                                    >
                                                        {selected
                                                            ? "✓ Room Selected"
                                                            : status ===
                                                                  "Occupied"
                                                              ? "Room Full"
                                                              : !selectedStudent
                                                                ? "Select Student First"
                                                                : "Select Room"}
                                                    </button>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>
                    )
                )}

                {rooms.length === 0 && (
                    <div className="room-directory-empty">
                        <div>
                            🏠
                        </div>

                        <h3>
                            No Rooms Available
                        </h3>

                        <p>
                            Please add rooms from
                            Admin Room Management.
                        </p>
                    </div>
                )}

            </div>

            {/* ALLOCATION FOOTER */}

            {selectedRoom && (
                <div className="allocation-submit-bar">

                    <div>
                        <span>
                            SELECTED ROOM
                        </span>

                        <strong>
                            {(() => {
                                const room =
                                    rooms.find(
                                        (item) =>
                                            String(
                                                item.id
                                            ) ===
                                            String(
                                                selectedRoom
                                            )
                                    );

                                return room
                                    ? `Room ${room.room_no} — Block ${room.block}`
                                    : "";
                            })()}
                        </strong>
                    </div>

                    <button
                        onClick={
                            handleAllocate
                        }
                        disabled={
                            allocating ||
                            !selectedStudent ||
                            !selectedRoom
                        }
                    >
                        {allocating
                            ? "Allocating..."
                            : "✓ Allocate Student"}
                    </button>

                </div>
            )}

        </div>
    );
};

export default RoomAllocation;