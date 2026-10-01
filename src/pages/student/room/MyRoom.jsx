import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyRoom.css";
import StudentSidebar from "../../components/student/StudentSidebar";

const MyRoom = () => {
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [menuOpen, setMenuOpen] = useState(false);

    const getStudentId = () => {
        const studentData = localStorage.getItem("student");

        if (!studentData) {
            return null;
        }

        try {
            const student = JSON.parse(studentData);
            return student?.id || null;
        } catch (error) {
            console.error("Invalid student data:", error);
            return null;
        }
    };

    useEffect(() => {
        const savedStudent = localStorage.getItem("student");

        if (savedStudent) {
            try {
                setStudent(JSON.parse(savedStudent));
            } catch (error) {
                console.error("Invalid saved student data:", error);
            }
        }

        fetchRoom();
    }, []);

    const fetchRoom = async () => {
        try {
            setLoading(true);
            setError("");

            const studentId = getStudentId();

            if (!studentId) {
                setError("Student session not found. Please login again.");
                setLoading(false);
                return;
            }

            const API_URL =
                import.meta.env.VITE_API_URL ||
                "http://localhost:5000";

            const response = await fetch(
                `${API_URL}/api/student/room/${studentId}`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch room details."
                );
            }

            setRoom(data.room || null);
        } catch (err) {
            console.error("My Room Error:", err);
            setError(
                err.message || "Failed to fetch room details."
            );
        } finally {
            setLoading(false);
        }
    };

    const getProfilePhoto = () => {
        if (!student?.photo) {
            return "";
        }

        const photo = String(student.photo).trim();

        if (
            photo.startsWith("data:") ||
            photo.startsWith("blob:") ||
            photo.startsWith("http://") ||
            photo.startsWith("https://")
        ) {
            return photo;
        }

        const API_URL =
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000";

        const normalizedPhoto = photo.replace(/^\/+/, "");

        if (normalizedPhoto.startsWith("uploads/")) {
            return `${API_URL}/${normalizedPhoto}`;
        }

        return `${API_URL}/uploads/students/${normalizedPhoto}`;
    };

    const profilePhoto = getProfilePhoto();

    const roommates = room?.roommates || [];

    return (
        <div className="myroom-layout">

            <header className="myroom-mobile-header">
                <div className="myroom-mobile-left">
                    <button
                        type="button"
                        className="myroom-mobile-menu"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label={
                            menuOpen
                                ? "Close student menu"
                                : "Open student menu"
                        }
                    >
                        ☰
                    </button>

                    <div className="myroom-mobile-brand">
                        <div className="myroom-mobile-brand-icon">🏠</div>
                        <div>
                            <strong>Hostel</strong>
                            <span>Student Portal</span>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="myroom-mobile-photo"
                    onClick={() => navigate("/student/profile")}
                    aria-label="Open student profile"
                >
                    {profilePhoto ? (
                        <img
                            src={profilePhoto}
                            alt="Student profile"
                            onError={(event) => {
                                event.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        "👤"
                    )}
                </button>
            </header>

            <StudentSidebar
                mobileOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
            />

            <main className="myroom-main">
                <div className="myroom-desktop-photo">
                    <button
                        type="button"
                        onClick={() => navigate("/student/profile")}
                        aria-label="Open student profile"
                    >
                        {profilePhoto ? (
                            <img
                                src={profilePhoto}
                                alt="Student profile"
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            "👤"
                        )}
                    </button>
                </div>

                <div className="myroom-header">
                    <div>
                        <p className="section-label">ROOM INFORMATION</p>
                        <h1>My Room</h1>
                        <p className="page-description">
                            View your room and roommate details.
                        </p>
                    </div>

                    <button
                        className="refresh-btn"
                        onClick={fetchRoom}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>
                </div>

                {error && (
                    <div className="room-alert">
                        ⚠️ <span>{error}</span>
                        <button onClick={() => setError("")}>×</button>
                    </div>
                )}

                {loading ? (
                    <div className="room-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading room details...</p>
                    </div>
                ) : !room ? (
                    <div className="no-room-card">
                        <div className="no-room-icon">🛏️</div>
                        <h2>No Room Allocated</h2>
                        <p>
                            You have not been allocated a room yet.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* ROOM SUMMARY */}
                        <section className="room-summary-card">
                            <div className="room-card-header">
                                <div className="room-icon">🛏️</div>
                                <div>
                                    <p className="small-label">MY ROOM</p>
                                    <h2>Room {room.room_no}</h2>
                                    <p>Hostel Room</p>
                                </div>

                                <div className="allocated-badge">
                                    ● Allocated
                                </div>
                            </div>

                            <div className="room-info-grid">

                                <div className="room-info-item">
                                    <span>ROOM NUMBER</span>
                                    <strong>{room.room_no || "—"}</strong>
                                </div>

                                <div className="room-info-item">
                                    <span>BLOCK</span>
                                    <strong>{room.block || "—"}</strong>
                                </div>

                                <div className="room-info-item">
                                    <span>MY BED</span>
                                    <strong>
                                        {room.bed_no
                                            ? `Bed ${room.bed_no}`
                                            : "—"}
                                    </strong>
                                </div>

                                <div className="room-info-item">
                                    <span>TOTAL BEDS</span>
                                    <strong>{room.total_beds || "—"}</strong>
                                </div>

                            </div>
                        </section>

                        {/* ROOMMATES */}
                        <section className="roommates-card">
                            <div className="roommates-header">
                                <div>
                                    <p className="section-label">
                                        ROOM OCCUPANTS
                                    </p>
                                    <h2>My Roommates</h2>
                                    <p>
                                        Students currently staying in your room.
                                    </p>
                                </div>

                                <div className="roommate-count">
                                    {roommates.length} Students
                                </div>
                            </div>

                            {roommates.length === 0 ? (
                                <div className="no-roommates">
                                    <div className="no-roommates-icon">
                                        👥
                                    </div>
                                    <h3>No Roommates</h3>
                                    <p>
                                        No other student is currently allocated
                                        to this room.
                                    </p>
                                </div>
                            ) : (
                                <div className="roommates-list">
                                    {roommates.map((student) => (
                                        <div
                                            className="roommate-card"
                                            key={student.id}
                                        >
                                            <div className="roommate-photo">
                                                {student.photo ? (
                                                    <img
                                                        src={
                                                            student.photo.startsWith("http")
                                                                ? student.photo
                                                                : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${String(student.photo).replace(/^\/+/, "")}`
                                                        }
                                                        alt={student.name}
                                                    />
                                                ) : (
                                                    <span>
                                                        {student.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ||
                                                            "S"}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="roommate-details">
                                                <h3>{student.name || "—"}</h3>

                                                <div className="myroom-detail-row">
                                                    <span>ID</span>
                                                    <strong>
                                                        {student.id || "—"}
                                                    </strong>
                                                </div>

                                                <div className="myroom-detail-row">
                                                    <span>Email</span>
                                                    <strong>
                                                        {student.email || "—"}
                                                    </strong>
                                                </div>

                                                <div className="myroom-detail-row">
                                                    <span>Mobile</span>
                                                    <strong>
                                                        {student.mobile || "—"}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default MyRoom;