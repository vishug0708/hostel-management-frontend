import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RoomDeallocation.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function RoomDeallocation() {
    const navigate = useNavigate();

    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [deallocatingId, setDeallocatingId] = useState(null);

    useEffect(() => {
        fetchAllocations();
    }, []);

    const fetchAllocations = async () => {
        const token = localStorage.getItem("rectorToken");

        if (!token) {
            navigate("/rector/login", {
                replace: true
            });
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
               `${API_URL}/api/rector/room_allocation`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch room allocations."
                );
            }

            setAllocations(
                data.allocations ||
                data.data ||
                []
            );
        } catch (err) {
            console.error("Rector Room Deallocation Error:", err);
            setError(
                err.message ||
                "Cannot connect to backend server."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeallocate = async (allocation) => {
        const token = localStorage.getItem("rectorToken");

        if (!token) {
            navigate("/rector/login", {
                replace: true
            });
            return;
        }

        const studentName =
            allocation.student_name ||
            allocation.studentName ||
            "this student";

        const confirmed = window.confirm(
            `Are you sure you want to deallocate ${studentName} from Room ${allocation.room_number || allocation.roomNumber}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeallocatingId(allocation.id);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}/api/rector/room_allocation/deallocate`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        allocation_id: allocation.id
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Failed to deallocate student."
                );
            }

            setSuccess(
                `${studentName} has been deallocated successfully.`
            );

            setAllocations((previous) =>
                previous.filter(
                    (item) => item.id !== allocation.id
                )
            );
        } catch (err) {
            console.error(
                "Room Deallocation Error:",
                err
            );

            setError(
                err.message ||
                "Failed to deallocate student."
            );
        } finally {
            setDeallocatingId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("rectorToken");
        localStorage.removeItem("rector");

        navigate("/rector/login", {
            replace: true
        });
    };

    const filteredAllocations = allocations.filter((allocation) => {
        const searchText = search.toLowerCase();

        const studentName = String(
            allocation.student_name ||
            allocation.studentName ||
            ""
        ).toLowerCase();

        const roomNumber = String(
            allocation.room_number ||
            allocation.roomNumber ||
            ""
        ).toLowerCase();

        const block = String(
            allocation.block ||
            allocation.block_name ||
            ""
        ).toLowerCase();

        const bedNumber = String(
            allocation.bed_no ||
            allocation.bedNo ||
            ""
        ).toLowerCase();

        return (
            studentName.includes(searchText) ||
            roomNumber.includes(searchText) ||
            block.includes(searchText) ||
            bedNumber.includes(searchText)
        );
    });

    return (
        <div className="rector-dashboard-page">

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

                    <button
                        onClick={() =>
                            navigate("/rector/dashboard")
                        }
                    >
                        📊 Dashboard
                    </button>

                    <button
                        className="active"
                        onClick={() =>
                            navigate("/rector/rooms")
                        }
                    >
                        🛏️ Manage Rooms
                    </button>

                    <button
                        onClick={() =>
                            navigate("/rector/leaves")
                        }
                    >
                        📝 Leave Requests
                    </button>

                    <button
                        onClick={() =>
                            navigate("/rector/complaints")
                        }
                    >
                        🛠️ Complaints
                    </button>

                    <button
                        onClick={() =>
                            navigate("/rector/cricket-box")
                        }
                    >
                        🏏 Cricket Box
                    </button>

                    <button
                        onClick={() =>
                            navigate("/rector/attendance")
                        }
                    >
                        📅 Attendance
                    </button>

                    <button
                        onClick={() =>
                            navigate("/rector/profile")
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

            {/* MAIN CONTENT */}
            <main className="rector-dashboard-main">

                {/* HEADER */}
                <header className="rector-dashboard-header">

                    <div>

                        <span>
                            ROOM MANAGEMENT
                        </span>

                        <h1>
                            Room Deallocation
                        </h1>

                        <p>
                            Remove students from their currently allocated rooms.
                        </p>

                    </div>

                    <button
                        className="rector-dashboard-refresh"
                        onClick={fetchAllocations}
                    >
                        ↻ Refresh
                    </button>

                </header>

                {/* ERROR */}
                {error && (
                    <div className="rector-dashboard-error">

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
                    <div className="room-deallocation-success">

                        <span>
                            ✓
                        </span>

                        <p>
                            {success}
                        </p>

                        <button
                            onClick={() =>
                                setSuccess("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {/* TOP STATS */}
                <section className="room-deallocation-stats">

                    <div className="room-deallocation-stat-card">

                        <div className="room-deallocation-stat-icon">
                            🏢
                        </div>

                        <div>
                            <span>
                                ALLOCATED STUDENTS
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : allocations.length}
                            </strong>
                        </div>

                    </div>

                    <div className="room-deallocation-stat-card">

                        <div className="room-deallocation-stat-icon rooms">
                            🛏️
                        </div>

                        <div>
                            <span>
                                ALLOCATED BEDS
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : allocations.length}
                            </strong>
                        </div>

                    </div>

                    <div className="room-deallocation-stat-card">

                        <div className="room-deallocation-stat-icon active">
                            🟢
                        </div>

                        <div>
                            <span>
                                ACTIVE ALLOCATIONS
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : allocations.length}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* SEARCH */}
                <section className="room-deallocation-search-card">

                    <div className="room-deallocation-search">

                        <span>
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search student, room, block or bed..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                        {search && (
                            <button
                                onClick={() =>
                                    setSearch("")
                                }
                            >
                                ×
                            </button>
                        )}

                    </div>

                </section>

                {/* ALLOCATIONS */}
                <section className="room-deallocation-section">

                    <div className="room-deallocation-section-header">

                        <div>
                            <span>
                                CURRENT ALLOCATIONS
                            </span>

                            <h2>
                                Allocated Students
                            </h2>

                            <p>
                                Students currently assigned to hostel beds.
                            </p>
                        </div>

                        <div className="room-deallocation-count">
                            {filteredAllocations.length} Students
                        </div>

                    </div>

                    {loading ? (
                        <div className="room-deallocation-empty">

                            <div className="room-deallocation-loading-icon">
                                ⏳
                            </div>

                            <h3>
                                Loading allocations...
                            </h3>

                            <p>
                                Please wait while room allocation data is loaded.
                            </p>

                        </div>
                    ) : filteredAllocations.length === 0 ? (
                        <div className="room-deallocation-empty">

                            <div className="room-deallocation-empty-icon">
                                🛏️
                            </div>

                            <h3>
                                No Allocated Students
                            </h3>

                            <p>
                                There are currently no students matching your search.
                            </p>

                        </div>
                    ) : (
                        <div className="room-deallocation-list">

                            {filteredAllocations.map(
                                (allocation) => {

                                    const studentName =
                                        allocation.student_name ||
                                        allocation.studentName ||
                                        "Unknown Student";

                                    const roomNumber =
                                        allocation.room_number ||
                                        allocation.roomNumber ||
                                        "—";

                                    const block =
                                        allocation.block ||
                                        allocation.block_name ||
                                        "—";

                                    const bedNumber =
                                        allocation.bed_no ||
                                        allocation.bedNo ||
                                        "—";

                                    const allocationDate =
                                        allocation.allocation_date ||
                                        allocation.allocationDate ||
                                        "—";

                                    return (
                                        <div
                                            className="room-deallocation-card"
                                            key={allocation.id}
                                        >

                                            <div className="room-deallocation-student">

                                                <div className="room-deallocation-avatar">
                                                    🎓
                                                </div>

                                                <div>
                                                    <h3>
                                                        {studentName}
                                                    </h3>

                                                    <p>
                                                        Student ID:{" "}
                                                        {allocation.student_id ||
                                                            allocation.studentId ||
                                                            "—"}
                                                    </p>
                                                </div>

                                            </div>

                                            <div className="room-deallocation-details">

                                                <div>
                                                    <span>
                                                        BLOCK
                                                    </span>

                                                    <strong>
                                                        {block}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        ROOM
                                                    </span>

                                                    <strong>
                                                        {roomNumber}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        BED
                                                    </span>

                                                    <strong>
                                                        Bed {bedNumber}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        ALLOCATED ON
                                                    </span>

                                                    <strong>
                                                        {allocationDate}
                                                    </strong>
                                                </div>

                                            </div>

                                            <div className="room-deallocation-action">

                                                <span className="room-deallocation-status">
                                                    ● Allocated
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        handleDeallocate(
                                                            allocation
                                                        )
                                                    }
                                                    disabled={
                                                        deallocatingId ===
                                                        allocation.id
                                                    }
                                                >
                                                    {deallocatingId ===
                                                    allocation.id
                                                        ? "Deallocating..."
                                                        : "↩ Deallocate"}
                                                </button>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

                </section>

                {/* FOOTER */}
                <footer className="rector-dashboard-footer">

                    <span>
                        © 2026 Hostel Management System
                    </span>

                    <span>
                        Rector Portal
                    </span>

                </footer>

            </main>

        </div>
    );
}

export default RoomDeallocation;