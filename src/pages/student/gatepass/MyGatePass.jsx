import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyGatePass.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const MyGatePass = () => {
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [gatePasses, setGatePasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        loadStudent();
    }, []);

    const loadStudent = async () => {
        try {
            const savedStudent = localStorage.getItem("student");

            if (!savedStudent) {
                navigate("/student/login", { replace: true });
                return;
            }

            const studentData = JSON.parse(savedStudent);
            setStudent(studentData);

            await fetchGatePasses(studentData.id);
        } catch (err) {
            console.error("Student Session Error:", err);
            setError("Unable to load student information.");
            setLoading(false);
        }
    };

    const fetchGatePasses = async (studentId) => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("studentToken");

            const response = await fetch(
                `${API_URL}/api/student/gatepass/my/${studentId}`,
                {
                    headers: {
                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`
                            }
                            : {})
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch gate passes."
                );
            }

            setGatePasses(data.gatePasses || []);
        } catch (err) {
            console.error("Gate Pass Fetch Error:", err);
            setError(err.message || "Failed to load gate passes.");
        } finally {
            setLoading(false);
        }
    };

    const handleNavigation = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("student");
        navigate("/student/login", { replace: true });
    };

    const getStudentPhoto = () => {
        if (!student?.photo) {
            return null;
        }

        if (String(student.photo).startsWith("http")) {
            return student.photo;
        }

        return `${API_URL}/${String(student.photo).replace(/^\/+/, "")}`;
    };

    const formatDateForTable = (date) => {
        if (!date) {
            return "—";
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return String(date).slice(0, 10);
        }

        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const formatTimeForTable = (time) => {
        if (!time) {
            return "—";
        }

        return String(time).slice(0, 5);
    };

    const getGatePassStatus = (gatePass) => {
        const status = String(gatePass.status || "").toLowerCase();
        const otpStatus = String(gatePass.otp_verified || "").toLowerCase();
        const rectorStatus = String(gatePass.rector || "").toLowerCase();

        if (
            status.includes("withdrawn") ||
            otpStatus.includes("withdrawn") ||
            rectorStatus.includes("withdrawn")
        ) {
            return {
                parent: "Withdrawn",
                parentClass: "status-withdrawn",
                rector: "Withdrawn by Student",
                rectorClass: "status-withdrawn",
                withdrawn: true
            };
        }

        const parentApproved = otpStatus === "yes";
        const rectorApproved =
            rectorStatus === "approved" ||
            rectorStatus === "approve";

        return {
            parent: parentApproved ? "Approved" : "Pending",
            parentClass: parentApproved
                ? "status-approved"
                : "status-pending",
            rector: rectorApproved
                ? "Approved"
                : rectorStatus.includes("reject")
                    ? "Rejected"
                    : gatePass.rector || "Pending",
            rectorClass:
                rectorApproved
                    ? "status-approved"
                    : rectorStatus.includes("reject")
                        ? "status-withdrawn"
                        : "status-pending",
            withdrawn: false
        };
    };

    const handleViewGatePass = (gatePass) => {
        navigate(`/student/gatepass/view/${gatePass.id}`, {
            state: {
                gatePass,
                student
            }
        });
    };

    return (
        <div className="my-gatepass-page">
            <button
                type="button"
                className="student-mobile-menu-button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open student menu"
            >
                ☰
            </button>

            <aside
                className={`student-sidebar ${
                    menuOpen ? "mobile-open" : ""
                }`}
            >
                <div className="student-sidebar-brand">
                    <div className="student-brand-icon">
                        🏠
                    </div>

                    <div>
                        <h2>Hostel</h2>
                        <span>Student Portal</span>
                    </div>
                </div>

                <nav className="student-sidebar-nav">
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() =>
                            handleNavigation("/student/dashboard")
                        }
                    >
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </button>

                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() =>
                            handleNavigation("/student/profile")
                        }
                    >
                        <span className="nav-icon">👤</span>
                        <span>My Profile</span>
                    </button>

                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() =>
                            handleNavigation("/student/room")
                        }
                    >
                        <span className="nav-icon">🛏️</span>
                        <span>My Room</span>
                    </button>

                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() =>
                            handleNavigation("/student/leave")
                        }
                    >
                        <span className="nav-icon">📄</span>
                        <span>My Leave</span>
                    </button>

                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() =>
                            handleNavigation("/student/leave/apply")
                        }
                    >
                        <span className="nav-icon">➕</span>
                        <span>Apply Leave</span>
                    </button>

                    <button
                        type="button"
                        className="student-nav-item active"
                        onClick={() =>
                            handleNavigation("/student/gatepass")
                        }
                    >
                        <span className="nav-icon">🎫</span>
                        <span>Gate Pass</span>
                    </button>

                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() =>
                            handleNavigation("/student/complaints")
                        }
                    >
                        <span className="nav-icon">🛠️</span>
                        <span>Complaints</span>
                    </button>

                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() =>
                            handleNavigation("/student/fees")
                        }
                    >
                        <span className="nav-icon">💰</span>
                        <span>My Fees</span>
                    </button>

                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() =>
                            handleNavigation("/student/cricketbox")
                        }
                    >
                        <span className="nav-icon">🏏</span>
                        <span>Cricket Box</span>
                    </button>

                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() =>
                            handleNavigation("/student/notifications")
                        }
                    >
                        <span className="nav-icon">🔔</span>
                        <span>Notifications</span>
                    </button>
                </nav>

                <button
                    type="button"
                    className="student-logout-button"
                    onClick={handleLogout}
                >
                    <span className="nav-icon">🚪</span>
                    <span>Logout</span>
                </button>
            </aside>

    <main className="my-gatepass-main">
        <div className="my-gatepass-topbar">
            <div className="my-gatepass-heading">
                <span className="my-gatepass-eyebrow">
                    STUDENT PORTAL
                </span>
                <h1>My Gatepasses</h1>
                <p>
                    View and manage your hostel gate pass requests.
                </p>
            </div>

            <div className="student-profile-mini">
                <div className="student-profile-mini-info">
                    <strong>{student?.name || "Student"}</strong>
                    <span>Student</span>
                </div>

                {getStudentPhoto() ? (
                    <img
                        src={getStudentPhoto()}
                        alt={student?.name || "Student"}
                    />
                ) : (
                    <div className="student-profile-mini-placeholder">
                        {student?.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                )}
            </div>
        </div>

        {error && (
            <div className="my-gatepass-alert">
                <span>⚠️</span>
                <span>{error}</span>
                <button
                    type="button"
                    onClick={() => setError("")}
                >
                    ×
                </button>
            </div>
        )}

        <section className="my-gatepass-panel">
            <div className="my-gatepass-panel-title">
                <span>📋</span>
                <h2>My Gatepasses</h2>
            </div>

            {loading && (
                <div className="my-gatepass-loading">
                    <div className="gatepass-spinner"></div>
                    <p>Loading gate passes...</p>
                </div>
            )}

            {!loading && !error && gatePasses.length === 0 && (
                <div className="my-gatepass-empty">
                    <div className="empty-gatepass-icon">🎫</div>
                    <h2>No Gate Pass Found</h2>
                    <p>
                        You have not applied for any gate pass yet.
                    </p>
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/student/gatepass/apply")
                        }
                    >
                        Apply Gate Pass
                    </button>
                </div>
            )}

            {!loading && gatePasses.length > 0 && (
                <div className="gatepass-table-wrapper">
                    <table className="gatepass-table">
                        <thead>
                            <tr>
                                <th>Exit Date</th>
                                <th>Exit Time</th>
                                <th>Return Date</th>
                                <th>Return Time</th>
                                <th>Parent</th>
                                <th>Rector</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {gatePasses.map((gatePass) => {
                                const status =
                                    getGatePassStatus(gatePass);

                                return (
                                    <tr key={gatePass.id}>
                                        <td>
                                            {formatDateForTable(
                                                gatePass.out_date
                                            )}
                                        </td>
                                        <td>
                                            {formatTimeForTable(
                                                gatePass.out_time
                                            )}
                                        </td>
                                        <td>
                                            {formatDateForTable(
                                                gatePass.return_date
                                            )}
                                        </td>
                                        <td>
                                            {formatTimeForTable(
                                                gatePass.return_time
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`gatepass-status-badge ${status.parentClass}`}
                                            >
                                                {status.parent}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`gatepass-status-badge ${status.rectorClass}`}
                                            >
                                                {status.rector}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className={`gatepass-action-button ${status.withdrawn
                                                        ? "withdrawn"
                                                        : ""
                                                    }`}
                                                onClick={() =>
                                                    handleViewGatePass(
                                                        gatePass
                                                    )
                                                }
                                            >
                                                {status.withdrawn
                                                    ? "Withdrawn"
                                                    : "View"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
        </main>
        </div>
    );
};

export default MyGatePass;
