import React, { useEffect, useRef, useState } from "react";
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

    const sidebarRef = useRef(null);
    const mobileMenuButtonRef = useRef(null);

    useEffect(() => {
        loadStudent();
    }, []);

    useEffect(() => {
        document.body.classList.toggle(
            "mygatepass-menu-open",
            menuOpen
        );

        return () => {
            document.body.classList.remove(
                "mygatepass-menu-open"
            );
        };
    }, [menuOpen]);

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        const handleOutsidePointer = (event) => {
            const sidebar = sidebarRef.current;
            const menuButton = mobileMenuButtonRef.current;

            if (
                sidebar &&
                !sidebar.contains(event.target) &&
                menuButton &&
                !menuButton.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener(
            "pointerdown",
            handleOutsidePointer,
            true
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsidePointer,
                true
            );
        };
    }, [menuOpen]);

    const loadStudent = async () => {
        try {
            const savedStudent = localStorage.getItem("student");

            if (!savedStudent) {
                navigate("/student/login", {
                    replace: true
                });
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
                    method: "GET",
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

            setError(
                err.message || "Failed to load gate passes."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleNavigation = (path) => {
        setMenuOpen(false);

        navigate(path);
    };

    const handleLogout = () => {
        setMenuOpen(false);

        localStorage.removeItem("studentToken");
        localStorage.removeItem("student");

        navigate("/student/login", {
            replace: true
        });
    };

    const getStudentPhoto = () => {
        if (!student?.photo) {
            return null;
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

        const normalizedPhoto = photo.replace(/^\/+/, "");

        if (normalizedPhoto.startsWith("uploads/")) {
            return `${API_URL}/${normalizedPhoto}`;
        }

        return `${API_URL}/uploads/students/${normalizedPhoto}`;
    };

    const profilePhoto = getStudentPhoto();

    const formatDateForTable = (date) => {
        if (!date) {
            return "—";
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return String(date).slice(0, 10);
        }

        const year = value.getFullYear();
        const month = String(
            value.getMonth() + 1
        ).padStart(2, "0");
        const day = String(
            value.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const formatTimeForTable = (time) => {
        if (!time) {
            return "—";
        }

        return String(time).slice(0, 5);
    };

    const getGatePassStatus = (gatePass) => {
        const status = String(
            gatePass.status || ""
        ).toLowerCase();

        const parentDecision = String(
            gatePass.parent_decision || "pending"
        ).toLowerCase();

        const rectorStatus = String(
            gatePass.rector || ""
        ).toLowerCase();

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

        const parentApproved =
            parentDecision === "approved";

        const parentRejected =
            parentDecision === "rejected";

        const rectorApproved =
            rectorStatus === "approved" ||
            rectorStatus === "approve";

        return {
            parent: parentApproved
                ? "Approved"
                : parentRejected
                    ? "Rejected"
                    : "Pending",

            parentClass: parentApproved
                ? "status-approved"
                : parentRejected
                    ? "status-withdrawn"
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
        navigate(
            `/student/gatepass/view/${gatePass.id}`,
            {
                state: {
                    gatePass,
                    student
                }
            }
        );
    };

    return (
        <div className="mygatepass-page">

            {/* =========================
                MOBILE HEADER
            ========================= */}

            <header className="mygatepass-mobile-header">

                <div className="mygatepass-mobile-left">

                    <button
                        ref={mobileMenuButtonRef}
                        type="button"
                        className="mygatepass-mobile-menu"
                        onClick={() =>
                            setMenuOpen((open) => !open)
                        }
                        aria-label={
                            menuOpen
                                ? "Close student menu"
                                : "Open student menu"
                        }
                    >
                        ☰
                    </button>

                    <div className="mygatepass-mobile-brand">

                        <div className="mygatepass-mobile-brand-icon">
                            🏠
                        </div>

                        <div>
                            <strong>
                                Hostel
                            </strong>

                            <span>
                                Student Portal
                            </span>
                        </div>

                    </div>

                </div>

                <button
                    type="button"
                    className="mygatepass-mobile-photo"
                    onClick={() =>
                        navigate("/student/profile")
                    }
                    aria-label="Open student profile"
                >
                    {getStudentPhoto() ? (
                        <img
                            src={getStudentPhoto()}
                            alt="Student profile"
                            onError={(event) => {
                                event.currentTarget.style.display =
                                    "none";
                            }}
                        />
                    ) : (
                        "👤"
                    )}
                </button>

            </header>

            {/* =========================
                SIDEBAR
            ========================= */}

            <aside
                ref={sidebarRef}
                className={`mygatepass-sidebar ${
                    menuOpen
                        ? "mobile-open"
                        : ""
                }`}
            >

                <div className="mygatepass-sidebar-brand">

                    <div className="mygatepass-brand-icon">
                        🏠
                    </div>

                    <div>
                        <strong>
                            Hostel
                        </strong>

                        <span>
                            Student Portal
                        </span>
                    </div>

                </div>

                <nav className="mygatepass-sidebar-nav">

                    <button
                        type="button"
                        className="mygatepass-nav-item"
                        onClick={() =>
                            handleNavigation(
                                "/student/dashboard"
                            )
                        }
                    >
                        <span>📊</span>
                        Dashboard
                    </button>

                    <button
                        type="button"
                        className="mygatepass-nav-item"
                        onClick={() =>
                            handleNavigation(
                                "/student/profile"
                            )
                        }
                    >
                        <span>👤</span>
                        My Profile
                    </button>

                    <button
                        type="button"
                        className="mygatepass-nav-item"
                        onClick={() =>
                            handleNavigation(
                                "/student/room"
                            )
                        }
                    >
                        <span>🛏️</span>
                        My Room
                    </button>

                    <button
                        type="button"
                        className="mygatepass-nav-item"
                        onClick={() =>
                            handleNavigation(
                                "/student/leave"
                            )
                        }
                    >
                        <span>📄</span>
                        My Leave
                    </button>

                    <button
                        type="button"
                        className="mygatepass-nav-item"
                        onClick={() =>
                            handleNavigation(
                                "/student/leave/apply"
                            )
                        }
                    >
                        <span>➕</span>
                        Apply Leave
                    </button>

                    <button
                        type="button"
                        className="mygatepass-nav-item active"
                        onClick={() =>
                            handleNavigation(
                                "/student/gatepass"
                            )
                        }
                    >
                        <span>🎫</span>
                        Gate Pass
                    </button>

                    <button
                        type="button"
                        className="mygatepass-nav-item"
                        onClick={() =>
                            handleNavigation(
                                "/student/complaints"
                            )
                        }
                    >
                        <span>🛠️</span>
                        Complaints
                    </button>

                    <button
                        type="button"
                        className="mygatepass-nav-item"
                        onClick={() =>
                            handleNavigation(
                                "/student/fees"
                            )
                        }
                    >
                        <span>💰</span>
                        My Fees
                    </button>

                    <button
                        type="button"
                        className="mygatepass-nav-item"
                        onClick={() =>
                            handleNavigation(
                                "/student/cricketbox"
                            )
                        }
                    >
                        <span>🏏</span>
                        Cricket Box
                    </button>

                    <button
                        type="button"
                        className="mygatepass-nav-item"
                        onClick={() =>
                            handleNavigation(
                                "/student/notifications"
                            )
                        }
                    >
                        <span>🔔</span>
                        Notifications
                    </button>

                </nav>

                <button
                    type="button"
                    className="mygatepass-logout"
                    onClick={handleLogout}
                >
                    <span>🚪</span>
                    Logout
                </button>

            </aside>

            {/* =========================
                MOBILE OVERLAY
            ========================= */}

            {menuOpen && (
                <div
                    className="mygatepass-mobile-overlay"
                    onPointerDown={() =>
                        setMenuOpen(false)
                    }
                    onClick={() =>
                        setMenuOpen(false)
                    }
                />
            )}

            {/* =========================
                MAIN
            ========================= */}

            <main className="mygatepass-main">

                {/* =========================
                    DESKTOP TOPBAR
                ========================= */}

                <header className="mygatepass-topbar">

                    <div className="mygatepass-heading">

                        <span className="mygatepass-eyebrow">
                            STUDENT PORTAL
                        </span>

                        <h1>
                            My Gatepasses
                        </h1>

                        <p>
                            View and manage your hostel
                            gate pass requests.
                        </p>

                    </div>

                    <div className="mygatepass-desktop-photo">
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

                </header>

                {error && (
                    <div className="mygatepass-alert">

                        <span>
                            ⚠️
                        </span>

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {/* =========================
                    GATEPASS PANEL
                ========================= */}

                <section className="mygatepass-panel">

                    <div className="mygatepass-panel-title">

                        <div className="panel-title-left">
                            <span>📋</span>

                            <h2>
                                My Gatepasses
                            </h2>
                        </div>

                        <button
                            type="button"
                            className="panel-apply-btn"
                            onClick={() =>
                                navigate(
                                    "/student/gatepass/apply"
                                )
                            }
                        >
                            + Apply Gate Pass
                        </button>

                    </div>

                    {loading && (
                        <div className="mygatepass-loading">

                            <div className="gatepass-spinner"></div>

                            <p>
                                Loading gate passes...
                            </p>

                        </div>
                    )}

                    {!loading &&
                        !error &&
                        gatePasses.length === 0 && (
                            <div className="mygatepass-empty">

                                <div className="empty-gatepass-icon">
                                    🎫
                                </div>

                                <h2>
                                    No Gate Pass Found
                                </h2>

                                <p>
                                    You have not applied
                                    for any gate pass yet.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/student/gatepass/apply"
                                        )
                                    }
                                >
                                    Apply Gate Pass
                                </button>

                            </div>
                        )}

                    {!loading &&
                        gatePasses.length > 0 && (
                            <div className="gatepass-table-wrapper">

                                <table className="gatepass-table">

                                    <thead>
                                        <tr>
                                            <th>
                                                Exit Date
                                            </th>

                                            <th>
                                                Exit Time
                                            </th>

                                            <th>
                                                Return Date
                                            </th>

                                            <th>
                                                Return Time
                                            </th>

                                            <th>
                                                Parent
                                            </th>

                                            <th>
                                                Rector
                                            </th>

                                            <th>
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {gatePasses.map(
                                            (gatePass) => {

                                                const status =
                                                    getGatePassStatus(
                                                        gatePass
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            gatePass.id
                                                        }
                                                    >

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
                                                                {
                                                                    status.parent
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`gatepass-status-badge ${status.rectorClass}`}
                                                            >
                                                                {
                                                                    status.rector
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <button
                                                                type="button"
                                                                className={`gatepass-action-button ${
                                                                    status.withdrawn
                                                                        ? "withdrawn"
                                                                        : ""
                                                                }`}
                                                                onClick={() =>
                                                                    handleViewGatePass(
                                                                        gatePass
                                                                    )
                                                                }
                                                            >
                                                                {
                                                                    status.withdrawn
                                                                        ? "Withdrawn"
                                                                        : "View"
                                                                }
                                                            </button>
                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

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