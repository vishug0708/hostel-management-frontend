import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageRooms.css";

const AdminRoomSidebar = ({ navigate, mobileMenuOpen, setMobileMenuOpen }) => {
    const closeMenu = () => setMobileMenuOpen(false);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        closeMenu();
        navigate("/admin/login");
    };

    return (
        <>
            <aside className={`admin-room-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
                <div className="admin-room-sidebar-brand">
                    <div className="admin-room-brand-icon">🏠</div>
                    <div>
                        <strong>Hostel</strong>
                        <span>Admin Panel</span>
                    </div>
                </div>
                <nav className="admin-room-sidebar-nav">
                    <button onClick={() => { closeMenu(); navigate("/admin/dashboard"); }}>📊 Dashboard</button>
                    <button onClick={() => { closeMenu(); navigate("/admin/students"); }}>🎓 Students</button>
                    <button className="active" onClick={closeMenu}>🛏️ Rooms</button>
                    <button onClick={() => { closeMenu(); navigate("/admin/fees"); }}>💳 Fees</button>
                    <button onClick={() => { closeMenu(); navigate("/admin/complaints"); }}>📝 Complaints</button>
                    <button onClick={() => { closeMenu(); navigate("/admin/cricket-box"); }}>🏏 Cricket Box</button>
                    <button onClick={() => { closeMenu(); navigate("/admin/announcements"); }}>📢 Announcements</button>
                    <button onClick={() => { closeMenu(); navigate("/admin/reports"); }}>📊 Reports</button>
                    <button onClick={() => { closeMenu(); navigate("/admin/profile"); }}>👤 Profile</button>
                </nav>
                <button className="admin-room-sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
            </aside>
            {mobileMenuOpen && (
                <div className="admin-room-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
            )}
        </>
    );
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ManageRooms = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedBlock, setSelectedBlock] = useState("All");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("adminToken");

            const response = await fetch(
                `${API_URL}/api/admin/rooms`,
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
                    "Failed to load rooms."
                );
            }

            setRooms(
                Array.isArray(data.rooms)
                    ? data.rooms
                    : []
            );
        } catch (err) {
            console.error(
                "Fetch Rooms Error:",
                err
            );

            setError(
                err.message ||
                "Unable to load rooms."
            );
        } finally {
            setLoading(false);
        }
    };

    const blocks = useMemo(() => {
        const uniqueBlocks = [
            ...new Set(
                rooms
                    .map(
                        (room) =>
                            room.block
                    )
                    .filter(Boolean)
            )
        ];

        return uniqueBlocks.sort();
    }, [rooms]);

    const filteredRooms = useMemo(() => {
        return rooms.filter((room) => {

            const matchesBlock =
                selectedBlock === "All" ||
                String(room.block)
                    .toUpperCase() ===
                    String(selectedBlock)
                        .toUpperCase();

            const searchText =
                search
                    .trim()
                    .toLowerCase();

            const matchesSearch =
                !searchText ||
                String(
                    room.room_no || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    room.block || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    room.room_type || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    room.hostel || ""
                )
                    .toLowerCase()
                    .includes(searchText);

            return (
                matchesBlock &&
                matchesSearch
            );
        });
    }, [
        rooms,
        selectedBlock,
        search
    ]);

    const overallStats = useMemo(() => {

        const totalRooms =
            filteredRooms.length;

        const totalBeds =
            filteredRooms.reduce(
                (sum, room) =>
                    sum +
                    Number(
                        room.total_beds || 0
                    ),
                0
            );

        const allocatedBeds =
            filteredRooms.reduce(
                (sum, room) =>
                    sum +
                    Number(
                        room.allocated_beds ||
                        0
                    ),
                0
            );

        const vacantBeds =
            Math.max(
                totalBeds -
                allocatedBeds,
                0
            );

        const occupiedRooms =
            filteredRooms.filter(
                (room) =>
                    Number(
                        room.allocated_beds ||
                        0
                    ) >=
                    Number(
                        room.total_beds ||
                        0
                    ) &&
                    Number(
                        room.total_beds ||
                        0
                    ) > 0
            ).length;

        return {
            totalRooms,
            totalBeds,
            allocatedBeds,
            vacantBeds,
            occupiedRooms
        };
    }, [filteredRooms]);

    const getRoomStatus = (room) => {

        const allocated =
            Number(
                room.allocated_beds || 0
            );

        const total =
            Number(
                room.total_beds || 0
            );

        if (
            room.status === "Reserved"
        ) {
            return "Reserved";
        }

        if (
            room.status === "Not In Use"
        ) {
            return "Not In Use";
        }

        if (
            total > 0 &&
            allocated >= total
        ) {
            return "Occupied";
        }

        return "Available";
    };

    const handleDelete = async (room) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to delete Room ${room.room_no}?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(room.id);
            setError("");

            const token =
                localStorage.getItem(
                    "adminToken"
                );

            const response = await fetch(
                `${API_URL}/api/admin/rooms/${room.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
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
                    "Failed to delete room."
                );
            }

            setRooms((prev) =>
                prev.filter(
                    (item) =>
                        item.id !==
                        room.id
                )
            );

        } catch (err) {
            console.error(
                "Delete Room Error:",
                err
            );

            setError(
                err.message ||
                "Unable to delete room."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const renderBeds = (room) => {

        const totalBeds =
            Number(
                room.total_beds || 0
            );

        const allocatedBeds =
            Number(
                room.allocated_beds || 0
            );

        return (
            <div className="manage-room-beds">

                {Array.from({
                    length: totalBeds
                }).map(
                    (_, index) => {

                        const isAllocated =
                            index <
                            allocatedBeds;

                        return (
                            <div
                                key={
                                    index
                                }
                                className={`manage-room-bed ${
                                    isAllocated
                                        ? "allocated"
                                        : "vacant"
                                }`}
                                title={
                                    isAllocated
                                        ? `Bed ${index + 1} - Allocated`
                                        : `Bed ${index + 1} - Vacant`
                                }
                            >
                                <span>
                                    {index + 1}
                                </span>
                            </div>
                        );
                    }
                )}

            </div>
        );
    };

    return (
        <div className="admin-room-layout">
            <AdminRoomSidebar navigate={navigate} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
            <main className="admin-room-main">
                <div className="admin-room-mobile-header">
                    <div className="admin-room-mobile-left">
                        <button className="admin-room-mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">☰</button>
                        <div className="admin-room-mobile-brand">
                            <div className="admin-room-mobile-brand-icon">🏠</div>
                            <div>
                                <strong>Hostel</strong>
                                <span>Admin Panel</span>
                            </div>
                        </div>
                    </div>
                    <button className="admin-room-mobile-profile-btn" onClick={() => navigate("/admin/profile")} aria-label="Admin profile">👤</button>
                </div>
                <div className="manage-rooms-page">

            {/* HEADER */}

            <div className="manage-rooms-header">

                <div>

                    <span className="manage-rooms-label">
                        ADMIN PANEL
                    </span>

                    <h1>
                        Manage Rooms
                    </h1>

                    <p>
                        Manage hostel rooms,
                        blocks and bed allocation.
                    </p>

                </div>

                <button
                    className="manage-rooms-add-btn"
                    onClick={() =>
                        navigate(
                            "/admin/rooms/add"
                        )
                    }
                >
                    + Add Room
                </button>

            </div>

            {/* ERROR */}

            {error && (
                <div className="manage-rooms-alert">

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

            {/* STATISTICS */}

            <div className="manage-rooms-stats">

                <div className="manage-room-stat-card">

                    <div className="manage-room-stat-icon">
                        🏢
                    </div>

                    <div>
                        <span>
                            TOTAL ROOMS
                        </span>

                        <strong>
                            {
                                overallStats.totalRooms
                            }
                        </strong>
                    </div>

                </div>

                <div className="manage-room-stat-card">

                    <div className="manage-room-stat-icon">
                        🛏️
                    </div>

                    <div>
                        <span>
                            TOTAL BEDS
                        </span>

                        <strong>
                            {
                                overallStats.totalBeds
                            }
                        </strong>
                    </div>

                </div>

                <div className="manage-room-stat-card">

                    <div className="manage-room-stat-icon allocated">
                        🔴
                    </div>

                    <div>
                        <span>
                            ALLOCATED
                        </span>

                        <strong>
                            {
                                overallStats.allocatedBeds
                            }
                        </strong>
                    </div>

                </div>

                <div className="manage-room-stat-card">

                    <div className="manage-room-stat-icon vacant">
                        🟢
                    </div>

                    <div>
                        <span>
                            VACANT
                        </span>

                        <strong>
                            {
                                overallStats.vacantBeds
                            }
                        </strong>
                    </div>

                </div>

                <div className="manage-room-stat-card">

                    <div className="manage-room-stat-icon occupied">
                        🔒
                    </div>

                    <div>
                        <span>
                            FULL ROOMS
                        </span>

                        <strong>
                            {
                                overallStats.occupiedRooms
                            }
                        </strong>
                    </div>

                </div>

            </div>

            {/* FILTERS */}

            <div className="manage-rooms-filter-card">

                <div className="manage-rooms-search">

                    <span>
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search room, block, type or hostel..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>

                <div className="manage-rooms-block-filter">

                    <span>
                        BLOCK
                    </span>

                    <button
                        className={
                            selectedBlock ===
                            "All"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setSelectedBlock(
                                "All"
                            )
                        }
                    >
                        All
                    </button>

                    {blocks.map(
                        (block) => (
                            <button
                                key={
                                    block
                                }
                                className={
                                    selectedBlock ===
                                    block
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
                        )
                    )}

                </div>

                <button
                    className="manage-rooms-refresh-btn"
                    onClick={fetchRooms}
                >
                    ↻ Refresh
                </button>

            </div>

            {/* ROOM LIST */}

            <div className="manage-rooms-content">

                <div className="manage-rooms-content-header">

                    <div>

                        <span>
                            ROOM DIRECTORY
                        </span>

                        <h2>
                            {selectedBlock ===
                            "All"
                                ? "All Blocks"
                                : `Block ${selectedBlock}`}
                        </h2>

                    </div>

                    <strong>
                        {
                            filteredRooms.length
                        } Rooms
                    </strong>

                </div>

                {loading ? (

                    <div className="manage-rooms-state">

                        <div>
                            ⏳
                        </div>

                        <h3>
                            Loading Rooms...
                        </h3>

                        <p>
                            Please wait while
                            room information
                            is being loaded.
                        </p>

                    </div>

                ) : filteredRooms.length ===
                  0 ? (

                    <div className="manage-rooms-state">

                        <div>
                            🛏️
                        </div>

                        <h3>
                            No Rooms Found
                        </h3>

                        <p>
                            No rooms match your
                            current search or
                            block filter.
                        </p>

                        <button
                            onClick={() => {
                                setSearch("");
                                setSelectedBlock(
                                    "All"
                                );
                            }}
                        >
                            Clear Filters
                        </button>

                    </div>

                ) : (

                    <div className="manage-rooms-grid">

                        {filteredRooms.map(
                            (room) => {

                                const status =
                                    getRoomStatus(
                                        room
                                    );

                                const totalBeds =
                                    Number(
                                        room.total_beds ||
                                        0
                                    );

                                const allocatedBeds =
                                    Number(
                                        room.allocated_beds ||
                                        0
                                    );

                                const vacantBeds =
                                    Math.max(
                                        totalBeds -
                                        allocatedBeds,
                                        0
                                    );

                                return (
                                    <div
                                        className="manage-room-card"
                                        key={
                                            room.id
                                        }
                                    >

                                        {/* CARD HEADER */}

                                        <div className="manage-room-card-header">

                                            <div>

                                                <span className="manage-room-block">
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
                                                    {
                                                        room.room_type ||
                                                        "Room"
                                                    }
                                                </p>

                                            </div>

                                            <span
                                                className={`manage-room-status ${status
                                                    .toLowerCase()
                                                    .replace(
                                                        /\s+/g,
                                                        "-"
                                                    )}`}
                                            >
                                                {status}
                                            </span>

                                        </div>

                                        {/* BED STATUS */}

                                        <div className="manage-room-bed-section">

                                            <div className="manage-room-bed-section-header">

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

                                            {renderBeds(
                                                room
                                            )}

                                            <div className="manage-room-bed-summary">

                                                <span>
                                                    🔴{" "}
                                                    {
                                                        allocatedBeds
                                                    }{" "}
                                                    Allocated
                                                </span>

                                                <span>
                                                    🟢{" "}
                                                    {
                                                        vacantBeds
                                                    }{" "}
                                                    Vacant
                                                </span>

                                            </div>

                                        </div>

                                        {/* ROOM INFO */}

                                        <div className="manage-room-info">

                                            <div>

                                                <span>
                                                    HOSTEL
                                                </span>

                                                <strong>
                                                    {
                                                        room.hostel ||
                                                        "—"
                                                    }
                                                </strong>

                                            </div>

                                            <div>

                                                <span>
                                                    FEES
                                                </span>

                                                <strong>
                                                    ₹{" "}
                                                    {Number(
                                                        room.fees ||
                                                        0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>

                                            </div>

                                        </div>

                                        {/* ACTIONS */}

                                        <div className="manage-room-actions">

                                            <button
                                                className="manage-room-view-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/rooms/view/${room.id}`
                                                    )
                                                }
                                            >
                                                👁 View
                                            </button>

                                            <button
                                                className="manage-room-edit-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/rooms/edit/${room.id}`
                                                    )
                                                }
                                            >
                                                ✏ Edit
                                            </button>

                                            <button
                                                className="manage-room-delete-btn"
                                                onClick={() =>
                                                    handleDelete(
                                                        room
                                                    )
                                                }
                                                disabled={
                                                    deletingId ===
                                                    room.id
                                                }
                                            >
                                                {deletingId ===
                                                room.id
                                                    ? "..."
                                                    : "🗑 Delete"}
                                            </button>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                )}

            </div>

                </div>
            </main>
        </div>
    );
};

export default ManageRooms;