import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GatePass.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const GatePass = () => {
    const navigate = useNavigate();

    const [gatePasses, setGatePasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    const rector = JSON.parse(
        localStorage.getItem("rector") || "{}"
    );

    const rectorId =
        rector.id ||
        rector.rector_id ||
        localStorage.getItem("rectorId");

    useEffect(() => {
        fetchGatePasses();
    }, []);

    const fetchGatePasses = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/rector/gatepass`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to load gate pass requests."
                );
            }

            setGatePasses(
                data.gatePasses ||
                data.data ||
                []
            );
        } catch (err) {
            console.error(err);
            setError(
                err.message ||
                "Failed to load gate pass requests."
            );
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (
        gatePassId,
        status
    ) => {
        try {
            setProcessingId(gatePassId);
            setError("");

            const endpoint =
                status === "Approved"
                    ? `${API_URL}/api/rector/gatepass/${gatePassId}/approve`
                    : `${API_URL}/api/rector/gatepass/${gatePassId}/reject`;

            const response = await fetch(
                endpoint,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update gate pass."
                );
            }

            setGatePasses((previous) =>
                previous.map((pass) =>
                    pass.id === gatePassId
                        ? {
                              ...pass,
                              rector: status
                          }
                        : pass
                )
            );
        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                "Something went wrong."
            );
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return date;
        }

        return value.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const formatTime = (time) => {
        if (!time) return "—";

        const parts =
            String(time).split(":");

        if (parts.length < 2) {
            return time;
        }

        let hour =
            Number(parts[0]);

        const minute = parts[1];

        const period =
            hour >= 12 ? "PM" : "AM";

        hour =
            hour % 12 || 12;

        return `${String(hour).padStart(
            2,
            "0"
        )}:${minute} ${period}`;
    };

    const parentVerified =
        (pass) =>
            pass.otp_verified ===
                "Yes" ||
            pass.otp_verified ===
                1 ||
            pass.otp_verified ===
                true;

    const getStatusClass = (
        status
    ) => {
        if (status === "Approved") {
            return "status-approved";
        }

        if (status === "Rejected") {
            return "status-rejected";
        }

        return "status-pending";
    };

    const handleLogout = () => {
        localStorage.removeItem(
            "rector"
        );
        localStorage.removeItem(
            "rectorToken"
        );
        localStorage.removeItem(
            "rectorId"
        );

        navigate("/rector/login");
    };

    const pendingCount =
        gatePasses.filter(
            (pass) =>
                (pass.rector ||
                    "Pending") ===
                "Pending"
        ).length;

    const approvedCount =
        gatePasses.filter(
            (pass) =>
                pass.rector ===
                "Approved"
        ).length;

    const rejectedCount =
        gatePasses.filter(
            (pass) =>
                pass.rector ===
                "Rejected"
        ).length;

    return (
        <div className="rector-gatepass-layout">

            {/* ================= SIDEBAR ================= */}

            <aside
                className={`rector-gatepass-sidebar ${
                    sidebarOpen
                        ? "sidebar-open"
                        : ""
                }`}
            >

                <div className="rector-sidebar-brand">

                    <div className="rector-brand-logo">
                        🏠
                    </div>

                    <div>
                        <h2>
                            Virtuous
                        </h2>

                        <span>
                            Rector Panel
                        </span>
                    </div>

                </div>

                <div className="rector-profile-box">

                    <div className="rector-profile-avatar">
                        {rector.photo ? (
                            <img
                                src={
                                    rector.photo.startsWith(
                                        "http"
                                    )
                                        ? rector.photo
                                        : `${API_URL}/${rector.photo.replace(
                                              /^\/+/,
                                              ""
                                          )}`
                                }
                                alt="Rector"
                            />
                        ) : (
                            "👤"
                        )}
                    </div>

                    <div>
                        <strong>
                            {rector.name ||
                                "Rector"}
                        </strong>

                        <span>
                            Rector
                        </span>
                    </div>

                </div>

                <nav className="rector-gatepass-nav">

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/dashboard"
                            )
                        }
                    >
                        <span>▦</span>
                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/students"
                            )
                        }
                    >
                        <span>👨‍🎓</span>
                        Students
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/attendance"
                            )
                        }
                    >
                        <span>✓</span>
                        Attendance
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/leave"
                            )
                        }
                    >
                        <span>📋</span>
                        Leave Requests
                    </button>

                    <button
                        className="active"
                        onClick={() =>
                            navigate(
                                "/rector/gatepass"
                            )
                        }
                    >
                        <span>🎫</span>
                        Gate Pass
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/rooms"
                            )
                        }
                    >
                        <span>🛏</span>
                        Rooms
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/complaints"
                            )
                        }
                    >
                        <span>⚠</span>
                        Complaints
                    </button>

                </nav>

                <div className="rector-sidebar-bottom">

                    <button
                        onClick={() =>
                            navigate(
                                "/rector/profile"
                            )
                        }
                    >
                        <span>⚙</span>
                        Profile
                    </button>

                    <button
                        className="logout-button"
                        onClick={
                            handleLogout
                        }
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>

            {/* MOBILE OVERLAY */}

            {sidebarOpen && (
                <div
                    className="rector-sidebar-overlay"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            {/* ================= MAIN ================= */}

            <main className="rector-gatepass-main">

                <header className="rector-gatepass-topbar">

                    <button
                        className="rector-mobile-menu"
                        onClick={() =>
                            setSidebarOpen(
                                !sidebarOpen
                            )
                        }
                    >
                        ☰
                    </button>

                    <div>
                        <h1>
                            Gate Pass
                        </h1>

                        <p>
                            Manage and approve
                            student gate pass
                            requests
                        </p>
                    </div>

                    <button
                        className="refresh-gatepass"
                        onClick={
                            fetchGatePasses
                        }
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>

                </header>

                {/* ERROR */}

                {error && (
                    <div className="gatepass-error">
                        <span>
                            ⚠ {error}
                        </span>

                        <button
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* ================= STATS ================= */}

                <div className="gatepass-stats">

                    <div className="gatepass-stat-card">
                        <div className="stat-icon pending">
                            ⏳
                        </div>

                        <div>
                            <span>
                                Pending
                            </span>

                            <strong>
                                {pendingCount}
                            </strong>
                        </div>
                    </div>

                    <div className="gatepass-stat-card">
                        <div className="stat-icon approved">
                            ✓
                        </div>

                        <div>
                            <span>
                                Approved
                            </span>

                            <strong>
                                {approvedCount}
                            </strong>
                        </div>
                    </div>

                    <div className="gatepass-stat-card">
                        <div className="stat-icon rejected">
                            ✕
                        </div>

                        <div>
                            <span>
                                Rejected
                            </span>

                            <strong>
                                {rejectedCount}
                            </strong>
                        </div>
                    </div>

                    <div className="gatepass-stat-card">
                        <div className="stat-icon total">
                            🎫
                        </div>

                        <div>
                            <span>
                                Total
                            </span>

                            <strong>
                                {
                                    gatePasses.length
                                }
                            </strong>
                        </div>
                    </div>

                </div>

                {/* ================= REQUESTS ================= */}

                <section className="gatepass-content-card">

                    <div className="gatepass-content-header">

                        <div>
                            <span>
                                GATE PASS MANAGEMENT
                            </span>

                            <h2>
                                Student Requests
                            </h2>
                        </div>

                        <div className="request-count">
                            {
                                gatePasses.length
                            } Requests
                        </div>

                    </div>

                    {loading ? (
                        <div className="gatepass-loading">

                            <div className="gatepass-spinner" />

                            <p>
                                Loading gate
                                pass requests...
                            </p>

                        </div>
                    ) : gatePasses.length ===
                      0 ? (
                        <div className="gatepass-empty">

                            <div className="empty-icon">
                                🎫
                            </div>

                            <h3>
                                No Gate Pass
                                Requests
                            </h3>

                            <p>
                                There are no
                                gate pass
                                requests
                                available.
                            </p>

                        </div>
                    ) : (
                        <div className="gatepass-table-wrapper">

                            <table className="gatepass-table">

                                <thead>
                                    <tr>
                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Destination
                                        </th>

                                        <th>
                                            Purpose
                                        </th>

                                        <th>
                                            Exit
                                        </th>

                                        <th>
                                            Return
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
                                        (pass) => {

                                            const status =
                                                pass.rector ||
                                                "Pending";

                                            const verified =
                                                parentVerified(
                                                    pass
                                                );

                                            const processing =
                                                processingId ===
                                                pass.id;

                                            return (
                                                <tr
                                                    key={
                                                        pass.id
                                                    }
                                                >

                                                    {/* STUDENT */}

                                                    <td>

                                                        <div className="student-cell">

                                                            {pass.photo ? (
                                                                <img
                                                                    src={
                                                                        pass.photo.startsWith(
                                                                            "http"
                                                                        )
                                                                            ? pass.photo
                                                                            : `${API_URL}/${pass.photo.replace(
                                                                                  /^\/+/,
                                                                                  ""
                                                                              )}`
                                                                    }
                                                                    alt={
                                                                        pass.student_name
                                                                    }
                                                                />
                                                            ) : (
                                                                <div className="student-photo-placeholder">
                                                                    👤
                                                                </div>
                                                            )}

                                                            <div>
                                                                <strong>
                                                                    {
                                                                        pass.student_name
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    ID:{" "}
                                                                    {
                                                                        pass.student_id
                                                                    }
                                                                </small>

                                                                <small>
                                                                    {
                                                                        pass.student_mobile
                                                                    }
                                                                </small>
                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* DESTINATION */}

                                                    <td>
                                                        <strong>
                                                            {
                                                                pass.destination ||
                                                                "—"
                                                            }
                                                        </strong>
                                                    </td>

                                                    {/* PURPOSE */}

                                                    <td>
                                                        <span className="purpose-text">
                                                            {
                                                                pass.purpose ||
                                                                "—"
                                                            }
                                                        </span>
                                                    </td>

                                                    {/* EXIT */}

                                                    <td>

                                                        <div className="date-cell">

                                                            <strong>
                                                                {formatDate(
                                                                    pass.out_date
                                                                )}
                                                            </strong>

                                                            <small>
                                                                {formatTime(
                                                                    pass.out_time
                                                                )}
                                                            </small>

                                                        </div>

                                                    </td>

                                                    {/* RETURN */}

                                                    <td>

                                                        <div className="date-cell">

                                                            <strong>
                                                                {formatDate(
                                                                    pass.return_date
                                                                )}
                                                            </strong>

                                                        </div>

                                                    </td>

                                                    {/* PARENT */}

                                                    <td>

                                                        <span
                                                            className={`gatepass-status ${verified
                                                                ? "status-approved"
                                                                : "status-pending"
                                                            }`}
                                                        >
                                                            {verified
                                                                ? "✓ Verified"
                                                                : "Pending"}
                                                        </span>

                                                    </td>

                                                    {/* RECTOR */}

                                                    <td>

                                                        <span
                                                            className={`gatepass-status ${getStatusClass(
                                                                status
                                                            )}`}
                                                        >
                                                            {
                                                                status
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* ACTION */}

                                                    <td>

                                                        {status ===
                                                        "Pending" ? (
                                                            <div className="gatepass-actions">

                                                                <button
                                                                    className="approve-btn"
                                                                    disabled={
                                                                        processing ||
                                                                        !verified
                                                                    }
                                                                    title={
                                                                        !verified
                                                                            ? "Parent OTP must be verified first"
                                                                            : "Approve Gate Pass"
                                                                    }
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            pass.id,
                                                                            "Approved"
                                                                        )
                                                                    }
                                                                >
                                                                    {processing
                                                                        ? "..."
                                                                        : "✓ Approve"}
                                                                </button>

                                                                <button
                                                                    className="reject-btn"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            pass.id,
                                                                            "Rejected"
                                                                        )
                                                                    }
                                                                >
                                                                    {processing
                                                                        ? "..."
                                                                        : "✕ Reject"}
                                                                </button>

                                                            </div>
                                                        ) : (
                                                            <span className="completed-action">
                                                                {status ===
                                                                "Approved"
                                                                    ? "✓ Approved"
                                                                    : "✕ Rejected"}
                                                            </span>
                                                        )}

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

export default GatePass;