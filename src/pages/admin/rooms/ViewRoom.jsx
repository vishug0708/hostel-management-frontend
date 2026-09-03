import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ViewRoom.css";

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

const ViewRoom = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { id } = useParams();

    const [room, setRoom] = useState(null);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRoomDetails();
    }, [id]);

    const fetchRoomDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("adminToken");

            const response = await fetch(
                `${API_URL}/api/admin/rooms/${id}`,
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
                    "Failed to load room details."
                );
            }

            setRoom(data.room);

            /*
             * If backend later returns allocations
             * with the room response, this will use them.
             */
            setAllocations(
                Array.isArray(data.allocations)
                    ? data.allocations
                    : []
            );

        } catch (err) {
            console.error(
                "View Room Error:",
                err
            );

            setError(
                err.message ||
                "Unable to load room details."
            );
        } finally {
            setLoading(false);
        }
    };

    const getRoomStatus = () => {
        if (!room) {
            return "Available";
        }

        if (room.status === "Reserved") {
            return "Reserved";
        }

        if (room.status === "Not In Use") {
            return "Not In Use";
        }

        const totalBeds =
            Number(room.total_beds || 0);

        const allocatedBeds =
            Number(
                room.allocated_beds || 0
            );

        if (
            totalBeds > 0 &&
            allocatedBeds >= totalBeds
        ) {
            return "Occupied";
        }

        return "Available";
    };

    const getStudentForBed = (bedNo) => {
        return allocations.find(
            (allocation) =>
                Number(
                    allocation.bed_no
                ) === bedNo &&
                allocation.status ===
                    "Allocated"
        );
    };

    if (loading) {
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
                    <div className="view-room-loading">

                <div className="view-room-loading-icon">
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
                    </div>
                </main>
            </div>
        );
    }

    if (error || !room) {
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
                    <div className="view-room-error-page">

                <div className="view-room-error-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Room
                </h2>

                <p>
                    {error ||
                        "Room information was not found."}
                </p>

                <button
                    onClick={() =>
                        navigate(
                            "/admin/rooms"
                        )
                    }
                >
                    ← Back to Rooms
                </button>

            </div>
                    </div>
                </main>
            </div>
        );
    }

    const totalBeds =
        Number(room.total_beds || 0);

    const allocatedBeds =
        Number(
            room.allocated_beds || 0
        );

    const vacantBeds =
        Math.max(
            totalBeds -
            allocatedBeds,
            0
        );

    const status =
        getRoomStatus();

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
                <div className="view-room-page">

            <div className="view-room-container">

                {/* HEADER */}

                <div className="view-room-header">

                    <div>

                        <span className="view-room-label">
                            ADMIN PANEL
                        </span>

                        <h1>
                            Room Details
                        </h1>

                        <p>
                            Complete information
                            about this hostel room.
                        </p>

                    </div>

                    <div className="view-room-header-actions">

                        <button
                            className="view-room-edit-btn"
                            onClick={() =>
                                navigate(
                                    `/admin/rooms/edit/${room.id}`
                                )
                            }
                        >
                            ✏ Edit Room
                        </button>

                        <button
                            className="view-room-back-btn"
                            onClick={() =>
                                navigate(
                                    "/admin/rooms"
                                )
                            }
                        >
                            ← Back
                        </button>

                    </div>

                </div>

                {/* ROOM HERO */}

                <div className="view-room-hero">

                    <div className="view-room-hero-main">

                        <div className="view-room-hero-icon">
                            🏢
                        </div>

                        <div>

                            <span>
                                BLOCK{" "}
                                {room.block}
                            </span>

                            <h2>
                                Room{" "}
                                {room.room_no}
                            </h2>

                            <p>
                                {room.room_type ||
                                    "Room"}
                            </p>

                        </div>

                    </div>

                    <div
                        className={`view-room-status ${status
                            .toLowerCase()
                            .replace(
                                /\s+/g,
                                "-"
                            )}`}
                    >
                        {status}
                    </div>

                </div>

                {/* STATISTICS */}

                <div className="view-room-stats">

                    <div className="view-room-stat-card">

                        <div className="view-room-stat-icon">
                            🛏️
                        </div>

                        <div>

                            <span>
                                TOTAL BEDS
                            </span>

                            <strong>
                                {totalBeds}
                            </strong>

                        </div>

                    </div>

                    <div className="view-room-stat-card">

                        <div className="view-room-stat-icon allocated">
                            🔴
                        </div>

                        <div>

                            <span>
                                ALLOCATED
                            </span>

                            <strong>
                                {allocatedBeds}
                            </strong>

                        </div>

                    </div>

                    <div className="view-room-stat-card">

                        <div className="view-room-stat-icon vacant">
                            🟢
                        </div>

                        <div>

                            <span>
                                VACANT
                            </span>

                            <strong>
                                {vacantBeds}
                            </strong>

                        </div>

                    </div>

                    <div className="view-room-stat-card">

                        <div className="view-room-stat-icon hostel">
                            🏠
                        </div>

                        <div>

                            <span>
                                HOSTEL
                            </span>

                            <strong>
                                {room.hostel ||
                                    "—"}
                            </strong>

                        </div>

                    </div>

                </div>

                {/* ROOM INFORMATION */}

                <div className="view-room-card">

                    <div className="view-room-card-header">

                        <div className="view-room-card-icon">
                            ℹ️
                        </div>

                        <div>

                            <h2>
                                Room Information
                            </h2>

                            <p>
                                Basic information
                                about this room.
                            </p>

                        </div>

                    </div>

                    <div className="view-room-information">

                        <div className="view-room-information-item">

                            <span>
                                BLOCK
                            </span>

                            <strong>
                                Block{" "}
                                {room.block}
                            </strong>

                        </div>

                        <div className="view-room-information-item">

                            <span>
                                ROOM NUMBER
                            </span>

                            <strong>
                                {room.room_no}
                            </strong>

                        </div>

                        <div className="view-room-information-item">

                            <span>
                                ROOM TYPE
                            </span>

                            <strong>
                                {room.room_type ||
                                    "—"}
                            </strong>

                        </div>

                        <div className="view-room-information-item">

                            <span>
                                TOTAL BEDS
                            </span>

                            <strong>
                                {totalBeds}
                            </strong>

                        </div>

                        <div className="view-room-information-item">

                            <span>
                                ROOM FEES
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

                        <div className="view-room-information-item">

                            <span>
                                STATUS
                            </span>

                            <strong>
                                {status}
                            </strong>

                        </div>

                        <div className="view-room-information-item full">

                            <span>
                                HOSTEL
                            </span>

                            <strong>
                                {room.hostel ||
                                    "—"}
                            </strong>

                        </div>

                    </div>

                </div>

                {/* BED STATUS */}

                <div className="view-room-card">

                    <div className="view-room-card-header">

                        <div className="view-room-card-icon bed">
                            🛏️
                        </div>

                        <div>

                            <h2>
                                Bed Status
                            </h2>

                            <p>
                                Bed-wise occupancy
                                of Room{" "}
                                {room.room_no}.
                            </p>

                        </div>

                    </div>

                    <div className="view-room-bed-legend">

                        <div>
                            <span className="legend-dot allocated">
                                ●
                            </span>

                            Allocated
                        </div>

                        <div>
                            <span className="legend-dot vacant">
                                ●
                            </span>

                            Vacant
                        </div>

                    </div>

                    <div className="view-room-beds">

                        {Array.from({
                            length: totalBeds
                        }).map(
                            (_, index) => {

                                const bedNo =
                                    index + 1;

                                const student =
                                    getStudentForBed(
                                        bedNo
                                    );

                                const isAllocated =
                                    index <
                                    allocatedBeds;

                                return (
                                    <div
                                        key={
                                            bedNo
                                        }
                                        className={`view-room-bed ${
                                            isAllocated
                                                ? "allocated"
                                                : "vacant"
                                        }`}
                                    >

                                        <div className="view-room-bed-number">
                                            Bed{" "}
                                            {
                                                bedNo
                                            }
                                        </div>

                                        <div className="view-room-bed-status">

                                            {isAllocated
                                                ? "Allocated"
                                                : "Vacant"}

                                        </div>

                                        {student && (
                                            <div className="view-room-bed-student">

                                                <strong>
                                                    {
                                                        student.student_name ||
                                                        student.name ||
                                                        "Student"
                                                    }
                                                </strong>

                                                {student.student_id && (
                                                    <span>
                                                        ID:{" "}
                                                        {
                                                            student.student_id
                                                        }
                                                    </span>
                                                )}

                                            </div>
                                        )}

                                    </div>
                                );
                            }
                        )}

                    </div>

                </div>

                {/* ALLOCATION TABLE */}

                <div className="view-room-card">

                    <div className="view-room-card-header">

                        <div className="view-room-card-icon">
                            👨‍🎓
                        </div>

                        <div>

                            <h2>
                                Current Allocations
                            </h2>

                            <p>
                                Students currently
                                allocated to this room.
                            </p>

                        </div>

                    </div>

                    {allocations.filter(
                        (allocation) =>
                            allocation.status ===
                            "Allocated"
                    ).length === 0 ? (

                        <div className="view-room-empty">

                            <div>
                                🛏️
                            </div>

                            <h3>
                                No Students Allocated
                            </h3>

                            <p>
                                This room currently
                                has no active
                                allocations.
                            </p>

                        </div>

                    ) : (

                        <div className="view-room-table-wrapper">

                            <table className="view-room-table">

                                <thead>

                                    <tr>

                                        <th>
                                            BED
                                        </th>

                                        <th>
                                            STUDENT
                                        </th>

                                        <th>
                                            STUDENT ID
                                        </th>

                                        <th>
                                            ALLOCATION DATE
                                        </th>

                                        <th>
                                            STATUS
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {allocations
                                        .filter(
                                            (
                                                allocation
                                            ) =>
                                                allocation.status ===
                                                "Allocated"
                                        )
                                        .sort(
                                            (
                                                a,
                                                b
                                            ) =>
                                                Number(
                                                    a.bed_no
                                                ) -
                                                Number(
                                                    b.bed_no
                                                )
                                        )
                                        .map(
                                            (
                                                allocation
                                            ) => (

                                                <tr
                                                    key={
                                                        allocation.id
                                                    }
                                                >

                                                    <td>

                                                        <span className="view-room-table-bed">
                                                            Bed{" "}
                                                            {
                                                                allocation.bed_no
                                                            }
                                                        </span>

                                                    </td>

                                                    <td>

                                                        <strong>
                                                            {
                                                                allocation.student_name ||
                                                                allocation.name ||
                                                                "—"
                                                            }
                                                        </strong>

                                                    </td>

                                                    <td>
                                                        {
                                                            allocation.student_id ||
                                                            "—"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            allocation.allocation_date ||
                                                            "—"
                                                        }
                                                    </td>

                                                    <td>

                                                        <span className="view-room-table-status">
                                                            Allocated
                                                        </span>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

                </div>
            </main>
        </div>
    );
};

export default ViewRoom;