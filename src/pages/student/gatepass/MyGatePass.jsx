import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "./MyGatePass.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const MyGatePass = () => {
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [gatePasses, setGatePasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
            setError(
                err.message || "Failed to load gate passes."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
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

        if (student.photo.startsWith("http")) {
            return student.photo;
        }

        return `${API_URL}/${student.photo.replace(/^\/+/, "")}`;
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return date;
        }

        return value.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "Pending";

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return date;
        }

        return value.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    const getGatePassNumber = (gatePass) => {
        return (
            gatePass.gate_pass_no ||
            `GP-${String(gatePass.id).padStart(5, "0")}`
        );
    };

    const getStatus = (gatePass) => {
        const rectorStatus =
            String(gatePass.rector || "").toLowerCase();

        if (
            rectorStatus.includes("reject") ||
            rectorStatus.includes("rejected")
        ) {
            return {
                label: "Rejected",
                className: "rejected"
            };
        }

        if (
            gatePass.security_entry === "Yes" ||
            gatePass.security_entry === 1
        ) {
            return {
                label: "Completed",
                className: "completed"
            };
        }

        if (
            gatePass.security_exit === "Yes" ||
            gatePass.security_exit === 1
        ) {
            return {
                label: "Outside Hostel",
                className: "outside"
            };
        }

        if (
            rectorStatus === "approved" ||
            rectorStatus === "approve"
        ) {
            return {
                label: "Approved",
                className: "approved"
            };
        }

        return {
            label: "Pending",
            className: "pending"
        };
    };

    const isApproved = (gatePass) => {
        const rectorStatus =
            String(gatePass.rector || "").toLowerCase();

        return (
            rectorStatus === "approved" ||
            rectorStatus === "approve"
        );
    };

    const getExpiryDateTime = (gatePass) => {
        if (!gatePass.return_date) {
            return null;
        }

        /*
         * Return date + out_time is used as the gate-pass
         * expiry reference when a separate expiry column
         * is not present in gate_pass.
         */

        if (gatePass.out_time) {
            return `${gatePass.return_date}T${gatePass.out_time}`;
        }

        return `${gatePass.return_date}T23:59:59`;
    };

    const isExpired = (gatePass) => {
        if (!isApproved(gatePass)) {
            return false;
        }

        if (
            gatePass.security_entry === "Yes" ||
            gatePass.security_entry === 1
        ) {
            return false;
        }

        const expiry = getExpiryDateTime(gatePass);

        if (!expiry) {
            return false;
        }

        return new Date() > new Date(expiry);
    };

    const getValidity = (gatePass) => {
        if (isExpired(gatePass)) {
            return {
                label: "Expired Gate Pass",
                className: "expired"
            };
        }

        if (isApproved(gatePass)) {
            return {
                label: "Valid Gate Pass",
                className: "valid"
            };
        }

        return {
            label: "Not Active",
            className: "not-active"
        };
    };

    const getQRValue = (gatePass) => {
        if (!gatePass.verification_code) {
            return "";
        }

        return gatePass.verification_code;
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

            {/* ================= SIDEBAR ================= */}

            <aside className="student-sidebar">

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
                        className="student-nav-item"
                        onClick={() =>
                            navigate("/student/dashboard")
                        }
                    >
                        📊
                        <span>Dashboard</span>
                    </button>

                    <button
                        className="student-nav-item"
                        onClick={() =>
                            navigate("/student/profile")
                        }
                    >
                        👤
                        <span>My Profile</span>
                    </button>

                    <button
                        className="student-nav-item"
                        onClick={() =>
                            navigate("/student/room")
                        }
                    >
                        🛏️
                        <span>My Room</span>
                    </button>

                    <button
                        className="student-nav-item"
                        onClick={() =>
                            navigate("/student/leave")
                        }
                    >
                        📄
                        <span>My Leave</span>
                    </button>

                    <button
                        className="student-nav-item active"
                        onClick={() =>
                            navigate("/student/gatepass")
                        }
                    >
                        🎫
                        <span>Gate Pass</span>
                    </button>

                    <button
                        className="student-nav-item"
                        onClick={() =>
                            navigate("/student/complaints")
                        }
                    >
                        🛠️
                        <span>Complaints</span>
                    </button>

                    <button
                        className="student-nav-item"
                        onClick={() =>
                            navigate("/student/fees")
                        }
                    >
                        💰
                        <span>My Fees</span>
                    </button>

                    <button
                        className="student-nav-item"
                        onClick={() =>
                            navigate("/student/notifications")
                        }
                    >
                        🔔
                        <span>Notifications</span>
                    </button>

                </nav>

                <button
                    className="student-logout-button"
                    onClick={handleLogout}
                >
                    🚪
                    <span>Logout</span>
                </button>

            </aside>


            {/* ================= MAIN ================= */}

            <main className="my-gatepass-main">

                <div className="my-gatepass-header">

                    <div>
                        <span className="my-gatepass-eyebrow">
                            STUDENT PORTAL
                        </span>

                        <h1>My Gate Pass</h1>

                        <p>
                            View and manage your hostel gate pass
                            requests.
                        </p>
                    </div>

                    <button
                        className="apply-new-gatepass-button"
                        onClick={() =>
                            navigate("/student/gatepass/apply")
                        }
                    >
                        + Apply Gate Pass
                    </button>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="my-gatepass-alert">

                        <span>⚠️</span>

                        <span>{error}</span>

                        <button
                            onClick={() => setError("")}
                        >
                            ×
                        </button>

                    </div>
                )}


                {/* LOADING */}

                {loading && (
                    <div className="my-gatepass-loading">
                        <div className="gatepass-spinner"></div>
                        <p>Loading gate passes...</p>
                    </div>
                )}


                {/* EMPTY */}

                {!loading && !error && gatePasses.length === 0 && (
                    <div className="my-gatepass-empty">

                        <div className="empty-gatepass-icon">
                            🎫
                        </div>

                        <h2>No Gate Pass Found</h2>

                        <p>
                            You have not applied for any gate pass yet.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/student/gatepass/apply")
                            }
                        >
                            Apply Gate Pass
                        </button>

                    </div>
                )}


                {/* GATE PASSES */}

                {!loading && gatePasses.length > 0 && (
                    <div className="gatepass-list">

                        {gatePasses.map((gatePass) => {

                            const status = getStatus(gatePass);
                            const validity = getValidity(gatePass);
                            const approved = isApproved(gatePass);
                            const qrValue = getQRValue(gatePass);

                            return (
                                <section
                                    className="gatepass-card"
                                    key={gatePass.id}
                                >

                                    {/* CARD HEADER */}

                                    <div className="gatepass-card-top">

                                        <div>

                                            <span className="gatepass-small-title">
                                                GATE PASS
                                            </span>

                                            <h2>
                                                {getGatePassNumber(
                                                    gatePass
                                                )}
                                            </h2>

                                        </div>

                                        <div
                                            className={`gatepass-status ${status.className}`}
                                        >
                                            {status.label}
                                        </div>

                                    </div>


                                    {/* STUDENT + DETAILS */}

                                    <div className="gatepass-content">

                                        <div className="gatepass-student-column">

                                            <div className="gatepass-photo">

                                                {getStudentPhoto() ? (
                                                    <img
                                                        src={getStudentPhoto()}
                                                        alt="Student"
                                                    />
                                                ) : (
                                                    <span>
                                                        👨‍🎓
                                                    </span>
                                                )}

                                            </div>

                                            <h3>
                                                {student?.name ||
                                                    "Student"}
                                            </h3>

                                            <p>
                                                {student?.email ||
                                                    ""}
                                            </p>

                                        </div>


                                        <div className="gatepass-details">

                                            <div className="gatepass-detail-item">

                                                <span>
                                                    📱 Mobile
                                                </span>

                                                <strong>
                                                    {student?.mobile ||
                                                        "—"}
                                                </strong>

                                            </div>

                                            <div className="gatepass-detail-item">

                                                <span>
                                                    📍 Destination
                                                </span>

                                                <strong>
                                                    {gatePass.destination ||
                                                        "—"}
                                                </strong>

                                            </div>

                                            <div className="gatepass-detail-item full">

                                                <span>
                                                    📝 Purpose
                                                </span>

                                                <strong>
                                                    {gatePass.purpose ||
                                                        "—"}
                                                </strong>

                                            </div>

                                            <div className="gatepass-detail-item">

                                                <span>
                                                    📅 Exit Date
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        gatePass.out_date
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="gatepass-detail-item">

                                                <span>
                                                    🕐 Exit Time
                                                </span>

                                                <strong>
                                                    {gatePass.out_time ||
                                                        "—"}
                                                </strong>

                                            </div>

                                            <div className="gatepass-detail-item">

                                                <span>
                                                    ↩️ Entry Time
                                                </span>

                                                <strong>
                                                    {formatDateTime(
                                                        gatePass.entry_datetime
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="gatepass-detail-item">

                                                <span>
                                                    📆 Return Date
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        gatePass.return_date
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="gatepass-detail-item">

                                                <span>
                                                    👨‍🏫 Rector
                                                </span>

                                                <strong>
                                                    {gatePass.rector ||
                                                        "Pending"}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>


                                    {/* QR SECTION */}

                                    {approved && (
                                        <div className="gatepass-qr-section">

                                            <div className="gatepass-qr-heading">

                                                <span>
                                                    QR CODE
                                                </span>

                                                <p>
                                                    Scan this QR code at
                                                    the hostel gate.
                                                </p>

                                            </div>

                                            {qrValue ? (
                                                <div className="gatepass-qr-box">

                                                    <QRCodeSVG
                                                        value={qrValue}
                                                        size={190}
                                                        level="H"
                                                    />

                                                </div>
                                            ) : (
                                                <div className="gatepass-no-qr">
                                                    QR code not generated yet.
                                                </div>
                                            )}

                                        </div>
                                    )}


                                    {/* VALIDITY */}

                                    <div
                                        className={`gatepass-validity ${validity.className}`}
                                    >

                                        <div>

                                            <span>
                                                {validity.className ===
                                                "valid"
                                                    ? "✓"
                                                    : "!"}
                                            </span>

                                            <div>

                                                <strong>
                                                    {validity.label}
                                                </strong>

                                                <p>
                                                    {isExpired(gatePass)
                                                        ? `Expired on ${formatDate(
                                                              gatePass.return_date
                                                          )}`
                                                        : `Valid until ${formatDate(
                                                              gatePass.return_date
                                                          )}`}
                                                </p>

                                            </div>

                                        </div>

                                        <div className="gatepass-security-status">

                                            <span>
                                                Exit:{" "}
                                                {gatePass.security_exit ===
                                                    "Yes"
                                                    ? "✓"
                                                    : "—"}
                                            </span>

                                            <span>
                                                Entry:{" "}
                                                {gatePass.security_entry ===
                                                    "Yes"
                                                    ? "✓"
                                                    : "—"}
                                            </span>

                                        </div>

                                    </div>


                                    {/* TIMESTAMPS */}

                                    <div className="gatepass-times">

                                        <div>
                                            <span>
                                                Hostel Exit
                                            </span>

                                            <strong>
                                                {formatDateTime(
                                                    gatePass.exit_datetime
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Hostel Entry
                                            </span>

                                            <strong>
                                                {formatDateTime(
                                                    gatePass.entry_datetime
                                                )}
                                            </strong>
                                        </div>

                                    </div>

                                    <div className="gatepass-view-action">
                                        <button
                                            type="button"
                                            onClick={() => handleViewGatePass(gatePass)}
                                        >
                                            👁 View Gate Pass
                                        </button>
                                    </div>

                                </section>
                            );
                        })}

                    </div>
                )}

            </main>

        </div>
    );
};

export default MyGatePass;