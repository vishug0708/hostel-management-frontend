import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ViewRoom.css";

function ViewRoom() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [room, setRoom] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =====================================================
    // FETCH ROOM
    // =====================================================

    useEffect(() => {

        const fetchRoom = async () => {

            const token =
                localStorage.getItem("adminToken");


            if (!token) {

                navigate("/admin/login", {
                    replace: true
                });

                return;

            }


            if (!id) {

                setError(
                    "Room ID is missing."
                );

                setLoading(false);

                return;

            }


            try {

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
                        "Unable to load room."
                    );

                    return;

                }


                setRoom(data.room);


            } catch (err) {

                console.error(
                    "View Room Error:",
                    err
                );

                setError(
                    "Cannot connect to backend server."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchRoom();

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

        return String(status || "unknown")
            .toLowerCase()
            .replace(/\s+/g, "-");

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="view-room-loading">

                <div className="view-room-spinner">
                    ⏳
                </div>

                <p>
                    Loading room details...
                </p>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error || !room) {

        return (

            <div className="view-room-error-page">

                <div className="view-room-error-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Room
                </h2>

                <p>
                    {error || "Room not found."}
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
    // PAGE
    // =====================================================

    return (

        <div className="view-room-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="view-room-sidebar">


                <div className="view-room-brand">

                    <div className="view-room-brand-icon">
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


                <nav className="view-room-nav">


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


                <button
                    className="view-room-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="view-room-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="view-room-header">

                    <div>

                        <span>
                            ROOM MANAGEMENT
                        </span>

                        <h1>
                            Room Details
                        </h1>

                        <p>
                            View complete information
                            about this hostel room.
                        </p>

                    </div>


                    <div className="view-room-header-actions">

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


                        <button
                            className="view-room-edit-btn"
                            onClick={() =>
                                navigate(
                                    `/admin/rooms/edit/${room.id}`
                                )
                            }
                        >
                            ✏️ Edit Room
                        </button>

                    </div>

                </header>


                {/* =================================================
                    ROOM HERO
                ================================================= */}

                <section className="room-detail-hero">


                    <div className="room-detail-icon">
                        🛏️
                    </div>


                    <div className="room-detail-title">

                        <span>
                            ROOM NUMBER
                        </span>

                        <h2>
                            {room.room_no}
                        </h2>

                        <p>
                            {room.hostel || "Hostel"}
                            {room.floor
                                ? ` • Floor ${room.floor}`
                                : ""}
                        </p>

                    </div>


                    <div
                        className={
                            `room-detail-status ${
                                getStatusClass(
                                    room.status
                                )
                            }`
                        }
                    >

                        <span>
                            ●
                        </span>

                        {room.status ||
                            "Unknown"}

                    </div>

                </section>


                {/* =================================================
                    BASIC INFORMATION
                ================================================= */}

                <section className="room-info-card">


                    <div className="room-info-card-header">

                        <div className="room-info-card-icon">
                            ℹ️
                        </div>

                        <div>

                            <h2>
                                Room Information
                            </h2>

                            <p>
                                Basic details of the room.
                            </p>

                        </div>

                    </div>


                    <div className="room-info-grid">


                        <div className="room-info-item">

                            <span>
                                Room Number
                            </span>

                            <strong>
                                {room.room_no ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="room-info-item">

                            <span>
                                Floor
                            </span>

                            <strong>
                                {room.floor ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="room-info-item">

                            <span>
                                Hostel
                            </span>

                            <strong>
                                {room.hostel ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="room-info-item">

                            <span>
                                Room Type
                            </span>

                            <strong>
                                {room.room_type ||
                                    "—"}
                            </strong>

                        </div>


                        <div className="room-info-item">

                            <span>
                                Capacity
                            </span>

                            <strong>
                                {room.capacity
                                    ? `${room.capacity} Students`
                                    : "—"}
                            </strong>

                        </div>


                        <div className="room-info-item">

                            <span>
                                Hostel Fee
                            </span>

                            <strong className="room-fee-value">

                                ₹
                                {Number(
                                    room.fees || 0
                                ).toLocaleString(
                                    "en-IN"
                                )}

                            </strong>

                        </div>


                        <div className="room-info-item">

                            <span>
                                Room Status
                            </span>

                            <strong>

                                <span
                                    className={
                                        `room-status-badge ${
                                            getStatusClass(
                                                room.status
                                            )
                                        }`
                                    }
                                >

                                    ●{" "}
                                    {room.status ||
                                        "Unknown"}

                                </span>

                            </strong>

                        </div>


                        <div className="room-info-item">

                            <span>
                                Room ID
                            </span>

                            <strong>
                                #{room.id}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    CAPACITY INFORMATION
                ================================================= */}

                <section className="room-capacity-card">


                    <div className="room-capacity-top">

                        <div>

                            <span>
                                ROOM CAPACITY
                            </span>

                            <h2>
                                {room.capacity || 0}
                            </h2>

                            <p>
                                Maximum students
                                allowed
                            </p>

                        </div>


                        <div className="room-capacity-icon">
                            👥
                        </div>

                    </div>


                    <div className="room-capacity-bar">

                        <div
                            className="room-capacity-progress"
                            style={{
                                width: "0%"
                            }}
                        />

                    </div>


                    <div className="room-capacity-note">

                        <span>
                            ℹ️
                        </span>

                        <p>
                            Student allocation is managed
                            by the Rector.
                        </p>

                    </div>

                </section>


                {/* =================================================
                    ADMIN ACTIONS
                ================================================= */}

                <section className="room-admin-actions">


                    <div>

                        <h2>
                            Room Management
                        </h2>

                        <p>
                            You can edit room information
                            or check its current status.
                        </p>

                    </div>


                    <div className="room-admin-action-buttons">

                        <button
                            className="room-action-edit"
                            onClick={() =>
                                navigate(
                                    `/admin/rooms/edit/${room.id}`
                                )
                            }
                        >
                            ✏️ Edit Room
                        </button>


                        <button
                            className="room-action-status"
                            onClick={() =>
                                navigate(
                                    `/admin/rooms/status/${room.id}`
                                )
                            }
                        >
                            📊 Room Status
                        </button>

                    </div>

                </section>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="view-room-footer">

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

export default ViewRoom;