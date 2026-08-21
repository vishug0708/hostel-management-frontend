import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageRooms.css";

function ManageRooms() {

    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");


    // =====================================================
    // FETCH ROOMS
    // =====================================================

    const fetchRooms = async () => {

        const token =
            localStorage.getItem("adminToken");


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
                "http://localhost:5000/api/admin/rooms",
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const data =
                await response.json();


            if (!response.ok || !data.success) {

                setError(
                    data.message ||
                    "Unable to load rooms."
                );

                return;
            }


            setRooms(
                Array.isArray(data.rooms)
                    ? data.rooms
                    : []
            );


        } catch (err) {

            console.error(
                "Manage Rooms Error:",
                err
            );

            setError(
                "Cannot connect to backend server."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchRooms();

    }, []);


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


    // =====================================================
    // FILTER ROOMS
    // =====================================================

    const filteredRooms = rooms.filter((room) => {

        const searchText =
            search.toLowerCase().trim();


        const matchesSearch =
            String(room.room_no || "")
                .toLowerCase()
                .includes(searchText) ||

            String(room.floor || "")
                .toLowerCase()
                .includes(searchText) ||

            String(room.hostel || "")
                .toLowerCase()
                .includes(searchText) ||

            String(room.room_type || "")
                .toLowerCase()
                .includes(searchText);


        const matchesStatus =
            statusFilter === "All" ||
            String(room.status || "")
                .toLowerCase() ===
            statusFilter.toLowerCase();


        return (
            matchesSearch &&
            matchesStatus
        );

    });


    // =====================================================
    // ROOM COUNTS
    // =====================================================

    const totalRooms =
        rooms.length;

    const availableRooms =
        rooms.filter(
            room =>
                String(room.status)
                    .toLowerCase() ===
                "available"
        ).length;

    const maintenanceRooms =
        rooms.filter(
            room =>
                String(room.status)
                    .toLowerCase() ===
                "maintenance"
        ).length;

    const inactiveRooms =
        rooms.filter(
            room =>
                String(room.status)
                    .toLowerCase() ===
                "inactive"
        ).length;


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="manage-rooms-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="manage-rooms-sidebar">


                <div className="manage-rooms-brand">

                    <div className="manage-room-brand-icon">
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


                <nav className="manage-rooms-nav">


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
                        className="active"
                    >
                        🛏️ Rooms
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/admin/rooms/add"
                            )
                        }
                    >
                        ➕ Add Room
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
                    className="manage-rooms-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="manage-rooms-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="manage-rooms-header">

                    <div>

                        <span>
                            ROOM MANAGEMENT
                        </span>

                        <h1>
                            Manage Rooms
                        </h1>

                        <p>
                            View and manage all hostel
                            rooms from one place.
                        </p>

                    </div>


                    <button
                        className="manage-add-room-btn"
                        onClick={() =>
                            navigate(
                                "/admin/rooms/add"
                            )
                        }
                    >
                        + Add Room
                    </button>

                </header>


                {/* =================================================
                    STAT CARDS
                ================================================= */}

                <section className="room-stat-grid">


                    <div className="room-stat-card">

                        <div className="room-stat-icon total">
                            🛏️
                        </div>

                        <div>

                            <span>
                                Total Rooms
                            </span>

                            <strong>
                                {totalRooms}
                            </strong>

                        </div>

                    </div>


                    <div className="room-stat-card">

                        <div className="room-stat-icon available">
                            ✓
                        </div>

                        <div>

                            <span>
                                Available
                            </span>

                            <strong>
                                {availableRooms}
                            </strong>

                        </div>

                    </div>


                    <div className="room-stat-card">

                        <div className="room-stat-icon maintenance">
                            🔧
                        </div>

                        <div>

                            <span>
                                Maintenance
                            </span>

                            <strong>
                                {maintenanceRooms}
                            </strong>

                        </div>

                    </div>


                    <div className="room-stat-card">

                        <div className="room-stat-icon inactive">
                            ⛔
                        </div>

                        <div>

                            <span>
                                Inactive
                            </span>

                            <strong>
                                {inactiveRooms}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    TABLE CARD
                ================================================= */}

                <section className="manage-rooms-card">


                    {/* TOOLBAR */}

                    <div className="rooms-toolbar">


                        <div>

                            <h2>
                                All Rooms
                            </h2>

                            <p>
                                {filteredRooms.length}
                                {" "}
                                room
                                {filteredRooms.length !== 1
                                    ? "s"
                                    : ""}
                                {" "}found
                            </p>

                        </div>


                        <div className="rooms-filters">


                            <div className="room-search">

                                <span>
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search room..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="All">
                                    All Status
                                </option>

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
                        ERROR
                    ================================================= */}

                    {error && (

                        <div className="manage-rooms-error">

                            ⚠️ {error}

                            <button
                                onClick={fetchRooms}
                            >
                                Retry
                            </button>

                        </div>

                    )}


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading ? (

                        <div className="rooms-loading">

                            <div>
                                ⏳
                            </div>

                            <p>
                                Loading rooms...
                            </p>

                        </div>

                    ) : filteredRooms.length === 0 ? (

                        /* =================================================
                            EMPTY
                        ================================================= */

                        <div className="rooms-empty">

                            <div className="rooms-empty-icon">
                                🛏️
                            </div>

                            <h3>
                                No Rooms Found
                            </h3>

                            <p>
                                {rooms.length === 0
                                    ? "No rooms have been added yet."
                                    : "No rooms match your search or filter."}
                            </p>


                            {rooms.length === 0 && (

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/admin/rooms/add"
                                        )
                                    }
                                >
                                    + Add First Room
                                </button>

                            )}

                        </div>

                    ) : (

                        /* =================================================
                            TABLE
                        ================================================= */

                        <div className="rooms-table-wrapper">

                            <table className="rooms-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Room
                                        </th>

                                        <th>
                                            Floor
                                        </th>

                                        <th>
                                            Hostel
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Capacity
                                        </th>

                                        <th>
                                            Fees
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredRooms.map(
                                        (room) => (

                                            <tr
                                                key={
                                                    room.id
                                                }
                                            >


                                                <td>

                                                    <div className="room-number-cell">

                                                        <div className="room-mini-icon">
                                                            🛏️
                                                        </div>

                                                        <strong>
                                                            {
                                                                room.room_no ||
                                                                "—"
                                                            }
                                                        </strong>

                                                    </div>

                                                </td>


                                                <td>

                                                    {room.floor ||
                                                        "—"}

                                                </td>


                                                <td>

                                                    {room.hostel ||
                                                        "—"}

                                                </td>


                                                <td>

                                                    {room.room_type ||
                                                        "—"}

                                                </td>


                                                <td>

                                                    <span className="capacity-badge">

                                                        👥{" "}
                                                        {
                                                            room.capacity ||
                                                            0
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    <strong className="room-fee">

                                                        ₹
                                                        {Number(
                                                            room.fees ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}

                                                    </strong>

                                                </td>


                                                <td>

                                                    <span
                                                        className={`room-status ${String(
                                                            room.status ||
                                                            ""
                                                        )
                                                            .toLowerCase()
                                                            .replace(
                                                                /\s+/g,
                                                                "-"
                                                            )}`}
                                                    >

                                                        ●{" "}
                                                        {
                                                            room.status ||
                                                            "Unknown"
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="room-actions">


                                                        <button
                                                            title="View Room"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/rooms/view/${room.id}`
                                                                )
                                                            }
                                                        >
                                                            👁️
                                                        </button>


                                                        <button
                                                            title="Edit Room"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/rooms/edit/${room.id}`
                                                                )
                                                            }
                                                        >
                                                            ✏️
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="manage-rooms-footer">

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

export default ManageRooms;