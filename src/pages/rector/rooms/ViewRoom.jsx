import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ViewRoom.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ViewRoom = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [room, setRoom] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRoomDetails();
    }, [id]);

    const fetchRoomDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/rector/rooms/${id}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load room details.");
            }

            setRoom(data.room || data);
            setStudents(
                data.room?.allocations ||
                data.students ||
                []
            );
        } catch (err) {
            console.error("View Room Error:", err);
            setError(err.message || "Failed to load room details.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("rectorToken");
        localStorage.removeItem("rector");
        navigate("/rector/login");
    };

    const getBedNumber = (student) => {
        return student.bed_no ?? student.bedNo ?? "-";
    };

    const getStudentName = (student) => {
        return (
            student.name ||
            student.student_name ||
            `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
            "Unknown Student"
        );
    };

    const getStudentId = (student) => {
        return student.student_id || student.id || "-";
    };

    const getAllocationDate = (student) => {
        const date =
            student.allocation_date ||
            student.allocationDate;

        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const totalBeds = Number(
        room?.capacity ||
        room?.total_beds ||
        room?.totalBeds ||
        0
    );

    const allocatedBeds = students.length;
    const vacantBeds = Math.max(totalBeds - allocatedBeds, 0);

    const vacantBedNumbers = [];

    for (let i = 1; i <= totalBeds; i++) {
        const occupied = students.some(
            (student) => Number(getBedNumber(student)) === i
        );

        if (!occupied) {
            vacantBedNumbers.push(i);
        }
    }

    return (
        <div className="rector-view-layout">

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
            {/* ================= MAIN CONTENT ================= */}
            <main className="rector-view-main">

                <div className="rector-view-header">

                    <div>
                        <span className="rector-view-eyebrow">
                            ROOM DETAILS
                        </span>

                        <h1>
                            {room
                                ? `Room ${room.room_no || room.roomNo || ""}`
                                : "Room Details"}
                        </h1>

                        <p>
                            View room information and allocated students.
                        </p>
                    </div>

                    <button
                        className="rector-view-back-btn"
                        onClick={() => navigate("/rector/rooms")}
                    >
                        ← Back to Rooms
                    </button>

                </div>

                {loading && (
                    <div className="rector-view-message loading">
                        Loading room details...
                    </div>
                )}

                {!loading && error && (
                    <div className="rector-view-message error">
                        ⚠️ {error}
                    </div>
                )}

                {!loading && !error && room && (
                    <>
                        {/* ================= ROOM SUMMARY ================= */}
                        <section className="rector-view-room-card">

                            <div className="rector-view-room-top">

                                <div>
                                    <span className="rector-view-block">
                                        BLOCK {room.block || "-"}
                                    </span>

                                    <h2>
                                        Room {room.room_no || room.roomNo}
                                    </h2>

                                    <p>Hostel Room</p>
                                </div>

                                <span
                                    className={`rector-view-status ${allocatedBeds >= totalBeds &&
                                        totalBeds > 0
                                        ? "full"
                                        : "available"
                                        }`}
                                >
                                    {allocatedBeds >= totalBeds &&
                                        totalBeds > 0
                                        ? "FULL"
                                        : "AVAILABLE"}
                                </span>

                            </div>

                            <div className="rector-view-stats">

                                <div className="rector-view-stat">
                                    <span>Total Beds</span>
                                    <strong>{totalBeds}</strong>
                                </div>

                                <div className="rector-view-stat allocated">
                                    <span>Allocated</span>
                                    <strong>{allocatedBeds}</strong>
                                </div>

                                <div className="rector-view-stat vacant">
                                    <span>Vacant</span>
                                    <strong>{vacantBeds}</strong>
                                </div>

                                <div className="rector-view-stat">
                                    <span>Hostel</span>
                                    <strong>
                                        {room.hostel || "Virtuous Hostel"}
                                    </strong>
                                </div>

                            </div>

                        </section>

                        {/* ================= ALLOCATED STUDENTS ================= */}
                        <section className="rector-view-students-card">

                            <div className="rector-view-section-header">

                                <div>
                                    <span>
                                        ROOM OCCUPANTS
                                    </span>

                                    <h2>
                                        Allocated Students
                                    </h2>

                                    <p>
                                        Students currently staying in this room.
                                    </p>
                                </div>

                                <div className="rector-view-count">
                                    {allocatedBeds} Students
                                </div>

                            </div>

                            {students.length === 0 ? (

                                <div className="rector-view-empty">
                                    <div className="empty-icon">
                                        🛏️
                                    </div>

                                    <h3>No Students Allocated</h3>

                                    <p>
                                        No student is currently allocated
                                        to this room.
                                    </p>
                                </div>

                            ) : (

                                <div className="rector-view-table-wrapper">

                                    <table className="rector-view-table">

                                        <thead>
                                            <tr>
                                                <th>BED</th>
                                                <th>STUDENT</th>
                                                <th>STUDENT ID</th>
                                                <th>ALLOCATION DATE</th>
                                                <th>STATUS</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {students
                                                .slice()
                                                .sort(
                                                    (a, b) =>
                                                        Number(
                                                            getBedNumber(a)
                                                        ) -
                                                        Number(
                                                            getBedNumber(b)
                                                        )
                                                )
                                                .map((student, index) => (

                                                    <tr
                                                        key={
                                                            student.id ||
                                                            student.student_id ||
                                                            index
                                                        }
                                                    >

                                                        <td>
                                                            <span className="bed-number">
                                                                {getBedNumber(
                                                                    student
                                                                )}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <div className="student-info">

                                                                <div className="student-avatar">
                                                                    👨‍🎓
                                                                </div>

                                                                <strong>
                                                                    {getStudentName(
                                                                        student
                                                                    )}
                                                                </strong>

                                                            </div>
                                                        </td>

                                                        <td>
                                                            {getStudentId(
                                                                student
                                                            )}
                                                        </td>

                                                        <td>
                                                            {getAllocationDate(
                                                                student
                                                            )}
                                                        </td>

                                                        <td>
                                                            <span className="student-status">
                                                                Allocated
                                                            </span>
                                                        </td>

                                                    </tr>

                                                ))}
                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </section>


                    </>
                )}

            </main>
        </div>
    );
};

export default ViewRoom;