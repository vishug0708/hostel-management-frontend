import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageRooms.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ManageRooms = () => {
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedBlock, setSelectedBlock] = useState("All");

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/rector/rooms`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load rooms."
                );
            }

            setRooms(
                Array.isArray(data)
                    ? data
                    : data.rooms || []
            );
        } catch (err) {
            console.error("Rector Manage Rooms Error:", err);
            setError(
                err.message || "Failed to load rooms."
            );
        } finally {
            setLoading(false);
        }
    };

    const blocks = useMemo(() => {
        const uniqueBlocks = [
            ...new Set(
                rooms
                    .map((room) => room.block)
                    .filter(Boolean)
            )
        ];

        return uniqueBlocks.sort();
    }, [rooms]);

    const filteredRooms = useMemo(() => {
        return rooms.filter((room) => {
            const roomNo =
                room.room_no ||
                room.roomNo ||
                "";

            const block =
                room.block ||
                "";

            const searchText =
                `${roomNo} ${block}`.toLowerCase();

            const matchesSearch =
                searchText.includes(
                    search.toLowerCase()
                );

            const matchesBlock =
                selectedBlock === "All" ||
                block === selectedBlock;

            return matchesSearch && matchesBlock;
        });
    }, [rooms, search, selectedBlock]);

    const groupedRooms = useMemo(() => {
        return filteredRooms.reduce((groups, room) => {
            const block = room.block || "Other";

            if (!groups[block]) {
                groups[block] = [];
            }

            groups[block].push(room);

            return groups;
        }, {});
    }, [filteredRooms]);

    const getRoomId = (room) => {
        return room.id;
    };

    const getRoomNumber = (room) => {
        return room.room_no || room.roomNo || "-";
    };

    const getTotalBeds = (room) => {
        return Number(
            room.capacity ||
            room.total_beds ||
            room.totalBeds ||
            0
        );
    };

    const getAllocatedBeds = (room) => {
        return Number(
            room.allocated_beds ||
            room.allocatedBeds ||
            room.occupied_beds ||
            room.occupiedBeds ||
            0
        );
    };

    const getVacantBeds = (room) => {
        const total = getTotalBeds(room);
        const allocated = getAllocatedBeds(room);

        return Math.max(total - allocated, 0);
    };

    const getRoomStatus = (room) => {
        const total = getTotalBeds(room);
        const allocated = getAllocatedBeds(room);

        if (total > 0 && allocated >= total) {
            return "Full";
        }

        if (allocated > 0) {
            return "Partially Allocated";
        }

        return "Available";
    };

    const getBedStatus = (room, bedNumber) => {
        const allocations =
            room.allocations ||
            room.students ||
            room.allocated_students ||
            [];

        const occupied = allocations.some(
            (student) =>
                Number(
                    student.bed_no ||
                    student.bedNo
                ) === bedNumber
        );

        return occupied ? "allocated" : "vacant";
    };

    const handleLogout = () => {
        localStorage.removeItem("rectorToken");
        localStorage.removeItem("rector");
        navigate("/rector/login");
    };

    return (
        <div className="rector-manage-layout">

            {/* SIDEBAR */}

            <aside className="rector-dashboard-sidebar">

                <div className="rector-dashboard-brand">

                    <div className="rector-dashboard-brand-icon">
                        🏠
                    </div>

                    <div>
                        <strong>
                            Hostel
                        </strong>

                        <span>
                            Rector Portal
                        </span>
                    </div>

                </div>

                <nav className="rector-dashboard-nav">

                    <button className="active">
                        📊 Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/rooms"
                            )
                        }
                    >
                        🛏️ Manage Rooms
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/rector/leaves"
                            )
                        }
                    >
                        📝 Leave Requests
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/complaints"
                            )
                        }
                    >
                        🛠️ Complaints
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/cricket-box"
                            )
                        }
                    >
                        🏏 Cricket Box
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/attendance"
                            )
                        }
                    >
                        📅 Attendance
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/profile"
                            )
                        }
                    >
                        👤 Profile
                    </button>

                </nav>

                <button
                    className="rector-dashboard-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>
            {/* ================= MAIN ================= */}

            <main className="rector-manage-main">

                <div className="rector-manage-header">

                    <div>
                        <span className="rector-manage-eyebrow">
                            ROOM MANAGEMENT
                        </span>

                        <h1>Manage Rooms</h1>

                        <p>
                            View hostel rooms, blocks and bed
                            allocation status.
                        </p>
                    </div>

                    <div className="rector-manage-header-actions">

                        <button
                            className="rector-manage-allocation-btn"
                            onClick={() =>
                                navigate(
                                    "/rector/rooms/allocation"
                                )
                            }
                        >
                            + Room Allocation
                        </button>

                        <button
                            className="rector-manage-deallocation-btn"
                            onClick={() =>
                                navigate(
                                    "/rector/rooms/deallocation"
                                )
                            }
                        >
                            ↩ Room Deallocation
                        </button>

                    </div>

                </div>

                {/* ================= STATS ================= */}

                <div className="rector-manage-stats">

                    <div className="rector-manage-stat-card">
                        <div className="stat-icon">🏢</div>

                        <div>
                            <span>Total Rooms</span>
                            <strong>{rooms.length}</strong>
                        </div>
                    </div>

                    <div className="rector-manage-stat-card">
                        <div className="stat-icon">🛏️</div>

                        <div>
                            <span>Total Beds</span>
                            <strong>
                                {rooms.reduce(
                                    (sum, room) =>
                                        sum +
                                        getTotalBeds(room),
                                    0
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="rector-manage-stat-card">
                        <div className="stat-icon allocated-icon">
                            🔴
                        </div>

                        <div>
                            <span>Allocated</span>
                            <strong>
                                {rooms.reduce(
                                    (sum, room) =>
                                        sum +
                                        getAllocatedBeds(room),
                                    0
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="rector-manage-stat-card">
                        <div className="stat-icon vacant-icon">
                            🟢
                        </div>

                        <div>
                            <span>Vacant</span>
                            <strong>
                                {rooms.reduce(
                                    (sum, room) =>
                                        sum +
                                        getVacantBeds(room),
                                    0
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="rector-manage-stat-card">
                        <div className="stat-icon full-icon">
                            🔒
                        </div>

                        <div>
                            <span>Full Rooms</span>
                            <strong>
                                {
                                    rooms.filter(
                                        (room) =>
                                            getRoomStatus(
                                                room
                                            ) === "Full"
                                    ).length
                                }
                            </strong>
                        </div>
                    </div>

                </div>

                {/* ================= FILTER ================= */}

                <section className="rector-manage-filter-card">

                    <div className="rector-manage-search">

                        <span>🔍</span>

                        <input
                            type="text"
                            placeholder="Search room or block..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    <div className="rector-manage-block-filter">

                        <span>BLOCK</span>

                        <button
                            className={
                                selectedBlock === "All"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setSelectedBlock("All")
                            }
                        >
                            All
                        </button>

                        {blocks.map((block) => (
                            <button
                                key={block}
                                className={
                                    selectedBlock === block
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setSelectedBlock(
                                        block
                                    )
                                }
                            >
                                {block}
                            </button>
                        ))}

                    </div>

                    <button
                        className="rector-manage-refresh"
                        onClick={fetchRooms}
                    >
                        ↻ Refresh
                    </button>

                </section>

                {/* ================= CONTENT ================= */}

                {loading && (
                    <div className="rector-manage-message">
                        Loading rooms...
                    </div>
                )}

                {!loading && error && (
                    <div className="rector-manage-message error">
                        ⚠️ {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    filteredRooms.length === 0 && (
                        <div className="rector-manage-empty">
                            <div>🏢</div>
                            <h3>No Rooms Found</h3>
                            <p>
                                No rooms match your current
                                search or block filter.
                            </p>
                        </div>
                    )}

                {!loading &&
                    !error &&
                    Object.entries(groupedRooms).map(
                        ([block, blockRooms]) => (

                            <section
                                className="rector-room-directory"
                                key={block}
                            >

                                <div className="rector-room-directory-header">

                                    <div>
                                        <span>
                                            ROOM DIRECTORY
                                        </span>

                                        <h2>
                                            BLOCK {block}
                                        </h2>
                                    </div>

                                    <div className="rector-room-count">
                                        {blockRooms.length} Rooms
                                    </div>

                                </div>

                                <div className="rector-room-grid">

                                    {blockRooms.map((room) => {

                                        const totalBeds =
                                            getTotalBeds(room);

                                        const allocatedBeds =
                                            getAllocatedBeds(room);

                                        const vacantBeds =
                                            getVacantBeds(room);

                                        const status =
                                            getRoomStatus(room);

                                        return (
                                            <article
                                                className="rector-room-card"
                                                key={getRoomId(room)}
                                            >

                                                {/* ROOM HEADER */}

                                                <div className="rector-room-card-header">

                                                    <div>
                                                        <span className="room-block">
                                                            BLOCK{" "}
                                                            {room.block}
                                                        </span>

                                                        <h3>
                                                            Room{" "}
                                                            {getRoomNumber(
                                                                room
                                                            )}
                                                        </h3>

                                                        <p>
                                                            Hostel Room
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`room-status ${status
                                                            .toLowerCase()
                                                            .replace(
                                                                " ",
                                                                "-"
                                                            )}`}
                                                    >
                                                        {status}
                                                    </span>

                                                </div>

                                                {/* BED STATUS */}

                                                <div className="rector-bed-section">

                                                    <div className="rector-bed-title">

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

                                                    <div className="rector-bed-grid">

                                                        {Array.from(
                                                            {
                                                                length:
                                                                    totalBeds
                                                            },
                                                            (
                                                                _,
                                                                index
                                                            ) => {

                                                                const bedNo =
                                                                    index +
                                                                    1;

                                                                const bedStatus =
                                                                    getBedStatus(
                                                                        room,
                                                                        bedNo
                                                                    );

                                                                return (
                                                                    <div
                                                                        key={
                                                                            bedNo
                                                                        }
                                                                        className={`rector-bed ${bedStatus}`}
                                                                        title={`Bed ${bedNo} - ${
                                                                            bedStatus ===
                                                                            "allocated"
                                                                                ? "Allocated"
                                                                                : "Vacant"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            bedNo
                                                                        }
                                                                    </div>
                                                                );
                                                            }
                                                        )}

                                                    </div>

                                                    <div className="rector-bed-summary">

                                                        <span>
                                                            <i className="red-dot"></i>
                                                            {
                                                                allocatedBeds
                                                            }{" "}
                                                            Allocated
                                                        </span>

                                                        <span>
                                                            <i className="green-dot"></i>
                                                            {
                                                                vacantBeds
                                                            }{" "}
                                                            Vacant
                                                        </span>

                                                    </div>

                                                </div>

                                                {/* ROOM INFO */}

                                                <div className="rector-room-info">

                                                    <div>
                                                        <span>
                                                            BLOCK
                                                        </span>

                                                        <strong>
                                                            {
                                                                room.block
                                                            }
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            TOTAL BEDS
                                                        </span>

                                                        <strong>
                                                            {
                                                                totalBeds
                                                            }
                                                        </strong>
                                                    </div>

                                                </div>

                                                {/* ACTION */}

                                                <div className="rector-room-actions">

                                                    <button
                                                        className="view-btn"
                                                        onClick={() =>
                                                            navigate(
                                                                `/rector/rooms/view/${getRoomId(
                                                                    room
                                                                )}`
                                                            )
                                                        }
                                                    >
                                                        👁 View
                                                    </button>

                                                </div>

                                            </article>
                                        );
                                    })}

                                </div>

                            </section>
                        )
                    )}

            </main>

        </div>
    );
};

export default ManageRooms;