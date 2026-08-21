import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./RoomStatus.css";

function RoomStatus() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [room, setRoom] = useState(null);
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =====================================================
    // FETCH ROOM + ALLOCATED STUDENTS
    // =====================================================

    useEffect(() => {

        const fetchRoomStatus = async () => {

            const token =
                localStorage.getItem("adminToken");


            // ---------------------------------------------
            // CHECK LOGIN
            // ---------------------------------------------

            if (!token) {

                navigate("/admin/login", {
                    replace: true
                });

                return;

            }


            // ---------------------------------------------
            // CHECK ROOM ID
            // ---------------------------------------------

            if (!id) {

                setError(
                    "Room ID is missing."
                );

                setLoading(false);

                return;

            }


            try {

                setLoading(true);
                setError("");


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


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    setError(
                        data.message ||
                        "Unable to load room status."
                    );

                    return;

                }


                // -----------------------------------------
                // ROOM DATA
                // -----------------------------------------

                setRoom(
                    data.room || null
                );


                // -----------------------------------------
                // ALLOCATED STUDENTS
                // -----------------------------------------

                setStudents(
                    Array.isArray(data.students)
                        ? data.students
                        : []
                );


            } catch (err) {

                console.error(
                    "Room Status Error:",
                    err
                );

                setError(
                    "Cannot connect to backend server."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchRoomStatus();

    }, [id, navigate]);


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
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {

        return String(
            status || "unknown"
        )
            .toLowerCase()
            .replace(/\s+/g, "-");

    };


    // =====================================================
    // STATUS DESCRIPTION
    // =====================================================

    const getStatusDescription = (status) => {

        switch (
            String(status || "")
                .toLowerCase()
        ) {

            case "available":

                return (
                    "This room is currently available " +
                    "for student allocation."
                );


            case "occupied":

                return (
                    "This room is currently occupied " +
                    "by students."
                );


            case "maintenance":

                return (
                    "This room is currently under maintenance."
                );


            case "inactive":

                return (
                    "This room is currently inactive."
                );


            default:

                return (
                    "Current room status is not available."
                );

        }

    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return date;

        }


        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // =====================================================
    // STUDENT PHOTO
    // =====================================================

    const getStudentPhoto = (photo) => {

        if (!photo) {
            return null;
        }


        // If backend already sends complete URL

        if (
            photo.startsWith("http://") ||
            photo.startsWith("https://")
        ) {

            return photo;

        }


        // Backend uploads folder

        return `http://localhost:5000/uploads/${photo}`;

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="room-status-loading">

                <div className="room-status-spinner">
                    ⏳
                </div>

                <p>
                    Loading room status...
                </p>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error || !room) {

        return (

            <div className="room-status-error-page">

                <div className="room-status-error-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Room
                </h2>

                <p>
                    {error ||
                        "Room not found."}
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

        );

    }


    // =====================================================
    // CALCULATIONS
    // =====================================================

    const allocatedCount =
        students.length;


    const roomCapacity =
        Number(room.capacity || 0);


    const availableSlots =
        Math.max(
            roomCapacity -
            allocatedCount,
            0
        );


    const capacityPercentage =
        roomCapacity > 0
            ? Math.min(
                (allocatedCount /
                    roomCapacity) *
                    100,
                100
            )
            : 0;


    const statusClass =
        getStatusClass(
            room.status
        );


    return (

        <div className="room-status-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="room-status-sidebar">


                {/* BRAND */}

                <div className="room-status-brand">

                    <div className="room-status-brand-icon">
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


                {/* NAVIGATION */}

                <nav className="room-status-nav">


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
                        onClick={() =>
                            navigate(
                                "/admin/rooms"
                            )
                        }
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


                {/* LOGOUT */}

                <button
                    className="room-status-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="room-status-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="room-status-header">

                    <div>

                        <span>
                            ROOM MANAGEMENT
                        </span>

                        <h1>
                            Room Status
                        </h1>

                        <p>
                            View room occupancy and
                            allocated student details.
                        </p>

                    </div>


                    <div className="room-status-header-actions">

                        <button
                            className="room-status-back-btn"
                            onClick={() =>
                                navigate(
                                    "/admin/rooms"
                                )
                            }
                        >
                            ← Back to Rooms
                        </button>


                        <button
                            className="room-status-view-btn"
                            onClick={() =>
                                navigate(
                                    `/admin/rooms/view/${room.id}`
                                )
                            }
                        >
                            👁️ View Room
                        </button>

                    </div>

                </header>


                {/* =================================================
                    STATUS HERO
                ================================================= */}

                <section
                    className={
                        `room-status-hero ${statusClass}`
                    }
                >


                    <div className="room-status-main-icon">

                        {statusClass === "available"
                            ? "✓"
                            : statusClass === "occupied"
                            ? "👥"
                            : statusClass === "maintenance"
                            ? "🔧"
                            : statusClass === "inactive"
                            ? "⛔"
                            : "?"}

                    </div>


                    <div className="room-status-hero-content">

                        <span>
                            CURRENT ROOM STATUS
                        </span>

                        <h2>
                            {room.status ||
                                "Unknown"}
                        </h2>

                        <p>
                            {getStatusDescription(
                                room.status
                            )}
                        </p>

                    </div>


                    <div className="room-status-hero-capacity">

                        <strong>
                            {allocatedCount}
                            {" / "}
                            {roomCapacity}
                        </strong>

                        <span>
                            Students
                        </span>

                    </div>

                </section>


                {/* =================================================
                    ROOM SUMMARY
                ================================================= */}

                <section className="room-status-summary">


                    <div className="room-status-summary-header">

                        <div>

                            <h2>
                                Room Information
                            </h2>

                            <p>
                                Complete information
                                about this room.
                            </p>

                        </div>

                    </div>


                    <div className="room-status-grid">


                        <div className="room-status-item">

                            <span>
                                Room Number
                            </span>

                            <strong>
                                {room.room_number ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="room-status-item">

                            <span>
                                Floor
                            </span>

                            <strong>
                                {room.floor ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="room-status-item">

                            <span>
                                Hostel
                            </span>

                            <strong>
                                {room.hostel ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="room-status-item">

                            <span>
                                Room Type
                            </span>

                            <strong>
                                {room.room_type ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="room-status-item">

                            <span>
                                Capacity
                            </span>

                            <strong>
                                {roomCapacity}
                                {" Students"}
                            </strong>

                        </div>


                        <div className="room-status-item">

                            <span>
                                Room Fee
                            </span>

                            <strong className="room-status-fee">

                                ₹
                                {Number(
                                    room.fee || 0
                                ).toLocaleString(
                                    "en-IN"
                                )}

                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    OCCUPANCY
                ================================================= */}

                <section className="room-occupancy-card">


                    <div className="room-occupancy-header">

                        <div>

                            <span>
                                ROOM OCCUPANCY
                            </span>

                            <h2>
                                {allocatedCount}
                                {" / "}
                                {roomCapacity}
                                {" Students"}
                            </h2>

                        </div>


                        <div className="room-occupancy-number">

                            {availableSlots}

                            <span>
                                {availableSlots === 1
                                    ? "Slot Available"
                                    : "Slots Available"}
                            </span>

                        </div>

                    </div>


                    <div className="room-occupancy-bar">

                        <div
                            className="room-occupancy-progress"
                            style={{
                                width:
                                    `${capacityPercentage}%`
                            }}
                        />

                    </div>


                    <div className="room-occupancy-footer">

                        <span>
                            {allocatedCount}
                            {" "}
                            allocated
                        </span>

                        <span>
                            {availableSlots}
                            {" "}
                            available
                        </span>

                    </div>

                </section>


                {/* =================================================
                    ALLOCATED STUDENTS
                ================================================= */}

                <section className="allocated-students-section">


                    <div className="allocated-students-header">

                        <div>

                            <span>
                                ROOM ALLOCATION
                            </span>

                            <h2>
                                Allocated Students
                            </h2>

                            <p>
                                Students currently
                                assigned to this room.
                            </p>

                        </div>


                        <div className="allocated-students-count">

                            {allocatedCount}
                            {" / "}
                            {roomCapacity}

                        </div>

                    </div>


                    {students.length === 0 ? (

                        /* =========================================
                           EMPTY ROOM
                        ========================================= */

                        <div className="no-students-card">

                            <div className="no-students-icon">
                                🛏️
                            </div>

                            <h3>
                                No Students Allocated
                            </h3>

                            <p>
                                No student is currently
                                allocated to this room.
                            </p>

                            <small>
                                Student allocation is
                                managed by the Rector.
                            </small>

                        </div>

                    ) : (

                        /* =========================================
                           STUDENT LIST
                        ========================================= */

                        <div className="allocated-students-list">

                            {students.map(
                                (student) => {

                                    const photo =
                                        getStudentPhoto(
                                            student.photo
                                        );


                                    return (

                                        <article
                                            className="allocated-student-card"
                                            key={
                                                student.id
                                            }
                                        >


                                            {/* PHOTO */}

                                            <div className="allocated-student-photo">

                                                {photo ? (

                                                    <img
                                                        src={
                                                            photo
                                                        }
                                                        alt={
                                                            student.name ||
                                                            "Student"
                                                        }

                                                        onError={(
                                                            e
                                                        ) => {

                                                            e.currentTarget.style.display =
                                                                "none";

                                                            e.currentTarget
                                                                .nextElementSibling
                                                                .style.display =
                                                                "flex";

                                                        }}
                                                    />

                                                ) : null}


                                                <div
                                                    className="student-photo-fallback"

                                                    style={{
                                                        display:
                                                            photo
                                                                ? "none"
                                                                : "flex"
                                                    }}
                                                >

                                                    {student.name
                                                        ?.charAt(
                                                            0
                                                        )
                                                        ?.toUpperCase()
                                                        || "S"}

                                                </div>

                                            </div>


                                            {/* STUDENT BASIC */}

                                            <div className="allocated-student-main">

                                                <div className="allocated-student-name">

                                                    <h3>
                                                        {
                                                            student.name ||
                                                            "Unknown Student"
                                                        }
                                                    </h3>

                                                    <span>
                                                        Student ID #
                                                        {
                                                            student.id
                                                        }
                                                    </span>

                                                </div>


                                                <div className="allocated-student-details">


                                                    {/* MOBILE */}

                                                    <div className="student-detail">

                                                        <span>
                                                            📱
                                                        </span>

                                                        <div>

                                                            <small>
                                                                Mobile
                                                            </small>

                                                            <strong>
                                                                {
                                                                    student.mobile ||
                                                                    "—"
                                                                }
                                                            </strong>

                                                        </div>

                                                    </div>


                                                    {/* EMAIL */}

                                                    <div className="student-detail">

                                                        <span>
                                                            ✉️
                                                        </span>

                                                        <div>

                                                            <small>
                                                                Email
                                                            </small>

                                                            <strong>
                                                                {
                                                                    student.email ||
                                                                    "—"
                                                                }
                                                            </strong>

                                                        </div>

                                                    </div>


                                                    {/* ADDRESS */}

                                                    <div className="student-detail student-address">

                                                        <span>
                                                            📍
                                                        </span>

                                                        <div>

                                                            <small>
                                                                Address
                                                            </small>

                                                            <strong>
                                                                {
                                                                    student.address ||
                                                                    "—"
                                                                }
                                                            </strong>

                                                        </div>

                                                    </div>


                                                    {/* ALLOCATION DATE */}

                                                    <div className="student-detail">

                                                        <span>
                                                            📅
                                                        </span>

                                                        <div>

                                                            <small>
                                                                Allocation Date
                                                            </small>

                                                            <strong>
                                                                {
                                                                    formatDate(
                                                                        student.allocation_date
                                                                    )
                                                                }
                                                            </strong>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        </article>

                                    );

                                }
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                    RECTOR NOTE
                ================================================= */}

                <div className="room-status-note">

                    <span>
                        ℹ️
                    </span>

                    <div>

                        <strong>
                            Room Allocation
                        </strong>

                        <p>
                            Student allocation and
                            deallocation are managed
                            by the Rector.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="room-status-footer">

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

export default RoomStatus;