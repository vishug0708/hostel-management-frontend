import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "./ViewGatePass.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ViewGatePass = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { gatePassId } = useParams();

    const [gatePass, setGatePass] = useState(
        location.state?.gatePass || null
    );
    const [student, setStudent] = useState(
        location.state?.student || null
    );
    const [loading, setLoading] = useState(!gatePass);
    const [error, setError] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (gatePass) {
            return;
        }

        const loadGatePass = async () => {
            try {
                const savedStudent = localStorage.getItem("student");

                if (!savedStudent) {
                    navigate("/student/login", { replace: true });
                    return;
                }

                const studentData = JSON.parse(savedStudent);
                setStudent(studentData);

                const token = localStorage.getItem("studentToken");
                const response = await fetch(
                    `${API_URL}/api/student/gatepass/${studentData.id}/${gatePassId}`,
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
                        data.message ||
                            "Failed to load gate pass."
                    );
                }

                setGatePass(data.data || data.gatePass);
            } catch (err) {
                console.error("View Gate Pass Error:", err);
                setError(
                    err.message ||
                        "Failed to load gate pass."
                );
            } finally {
                setLoading(false);
            }
        };

        loadGatePass();
    }, [gatePass, gatePassId, navigate]);

    const handleNavigation = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("student");
        navigate("/student/login", { replace: true });
    };

    if (loading) {
        return (
            <div className="view-gatepass-page">
                <div className="view-gatepass-error">
                    <div className="view-gatepass-error-icon">⏳</div>
                    <h2>Loading Gate Pass...</h2>
                    <p>Please wait while your gate pass is loaded.</p>
                </div>
            </div>
        );
    }

    if (!gatePass) {
        return (
            <div className="view-gatepass-page">
                <div className="view-gatepass-error">
                    <div className="view-gatepass-error-icon">⚠️</div>
                    <h2>Gate Pass Data Not Found</h2>
                    <p>{error || "Please open the gate pass again."}</p>
                    <button onClick={() => navigate("/student/gatepass")}>
                        ← Back to My Gate Passes
                    </button>
                </div>
            </div>
        );
    }

    const photo = student?.photo || gatePass.photo;

    const photoUrl = photo
        ? photo.startsWith("http")
            ? photo
            : `${API_URL}/${photo.replace(/^\/+/, "")}`
        : null;

    const formatDate = (date) => {
        if (!date) return "—";
        const value = new Date(date);
        if (Number.isNaN(value.getTime())) return date;
        return value.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const formatTime = (time) => {
        if (!time) return "—";
        const parts = String(time).split(":");
        if (parts.length < 2) return time;

        let hour = Number(parts[0]);
        const minute = parts[1];
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;

        return `${String(hour).padStart(2, "0")}:${minute} ${ampm}`;
    };

    const formatDateTime = (value) => {
        if (!value) return "Pending";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    const gatePassNo =
        gatePass.gate_pass_no ||
        `GP-${String(gatePass.id || gatePassId).padStart(5, "0")}`;

    const approved =
        String(gatePass.rector || "").toLowerCase() === "approved";

    const parentApproved =
        String(gatePass.otp_verified || "").toLowerCase() === "yes";

    const qrValue =
        approved && gatePass.qr_code
            ? gatePass.qr_code
            : "";

    const expiry = gatePass.return_date
        ? new Date(
              `${gatePass.return_date}T${
                  gatePass.return_time || "23:59:59"
              }`
          )
        : null;

    const expired =
        approved &&
        expiry &&
        new Date() > expiry &&
        gatePass.security_entry !== "Yes";

    return (
        <div className="view-gatepass-page">
            <button
                type="button"
                className="student-mobile-menu-button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open student menu"
            >
                ☰
            </button>

            <div
                className={`student-mobile-overlay ${menuOpen ? "show" : ""}`}
                onClick={() => setMenuOpen(false)}
            />

            <aside className={`student-sidebar ${menuOpen ? "mobile-open" : ""}`}>
                <div className="student-sidebar-brand">
                    <div className="student-brand-icon">🏠</div>
                    <div>
                        <h2>Hostel</h2>
                        <span>Student Portal</span>
                    </div>
                    <button
                        type="button"
                        className="student-mobile-close"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close student menu"
                    >
                        ×
                    </button>
                </div>

                <nav className="student-sidebar-nav">
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() => handleNavigation("/student/dashboard")}
                    >
                        📊
                        <span>Dashboard</span>
                    </button>
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() => handleNavigation("/student/profile")}
                    >
                        👤
                        <span>My Profile</span>
                    </button>
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() => handleNavigation("/student/room")}
                    >
                        🛏️
                        <span>My Room</span>
                    </button>
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() => handleNavigation("/student/leave")}
                    >
                        📄
                        <span>My Leave</span>
                    </button>
                    <button
                        type="button"
                        className="student-nav-item active"
                        onClick={() => handleNavigation("/student/gatepass")}
                    >
                        🎫
                        <span>Gate Pass</span>
                    </button>
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() => handleNavigation("/student/complaints")}
                    >
                        🛠️
                        <span>Complaints</span>
                    </button>
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() => handleNavigation("/student/fees")}
                    >
                        💰
                        <span>My Fees</span>
                    </button>
                    <button
                        type="button"
                        className="student-nav-item"
                        onClick={() => handleNavigation("/student/notifications")}
                    >
                        🔔
                        <span>Notifications</span>
                    </button>
                </nav>

                <button
                    type="button"
                    className="student-logout-button"
                    onClick={handleLogout}
                >
                    🚪
                    <span>Logout</span>
                </button>
            </aside>

            <main className="view-gatepass-main">
                <div className="view-mobile-topbar">
                    <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open student menu">☰</button>
                    <div><strong>Hostel</strong><span>Student Portal</span></div>
                    <span>🎫</span>
                </div>

                <div className="view-gatepass-wrapper">
                <button
                    className="view-gatepass-back"
                    onClick={() => navigate("/student/gatepass")}
                >
                    ← Back to My Gate Passes
                </button>

                <div className="view-gatepass-card">
                    <div className="view-gatepass-header">
                        <div className="view-gatepass-logo">🏠</div>

                        <div>
                            <h1>GATEPASS</h1>
                            <p>Virtuous Hostel</p>
                            <span>Hostel Management System</span>
                        </div>

                        <div className="view-gatepass-ticket">🎫</div>
                    </div>

                    <div className="view-gatepass-photo-wrap">
                        {photoUrl ? (
                            <img
                                className="view-gatepass-photo"
                                src={photoUrl}
                                alt="Student"
                            />
                        ) : (
                            <div className="view-gatepass-photo-placeholder">
                                👨‍🎓
                            </div>
                        )}
                    </div>

                    <div className="view-gatepass-number">
                        🎫 <strong>Gatepass No:</strong> <b>{gatePassNo}</b>
                    </div>

                    <section className="view-gatepass-section">
                        <h2>STUDENT INFORMATION</h2>

                        <div className="view-gatepass-info-grid">
                            <div>
                                <span>Full Name</span>
                                <strong>
                                    {student?.name ||
                                        gatePass.student_name ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Student ID</span>
                                <strong>
                                    {student?.student_id ||
                                        student?.enrollment_no ||
                                        gatePass.enrollment_no ||
                                        gatePass.student_id ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Mobile</span>
                                <strong>
                                    {student?.mobile ||
                                        gatePass.student_mobile ||
                                        gatePass.mobile ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Parent Email</span>
                                <strong>
                                    {student?.parent_email ||
                                        gatePass.parent_email ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>College</span>
                                <strong>
                                    {student?.college ||
                                        gatePass.college ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Course</span>
                                <strong>
                                    {student?.course ||
                                        gatePass.course ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Hostel</span>
                                <strong>
                                    {student?.hostel ||
                                        gatePass.hostel ||
                                        "Virtuous Hostel"}
                                </strong>
                            </div>

                            <div>
                                <span>Room No</span>
                                <strong>
                                    {student?.room_no ||
                                        gatePass.room_no ||
                                        gatePass.room_number ||
                                        "—"}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <section className="view-gatepass-section">
                        <h2>GATE PASS DETAILS</h2>

                        <div className="view-gatepass-details">
                            <div>
                                <span>Exit Date</span>
                                <strong>{formatDate(gatePass.out_date)}</strong>
                            </div>

                            <div>
                                <span>Exit Time</span>
                                <strong>{formatTime(gatePass.out_time)}</strong>
                            </div>

                            <div>
                                <span>Return Date</span>
                                <strong>
                                    {formatDate(gatePass.return_date)}
                                </strong>
                            </div>

                            <div>
                                <span>Return Time</span>
                                <strong>
                                    {formatTime(gatePass.return_time)}
                                </strong>
                            </div>

                            <div>
                                <span>Destination</span>
                                <strong>{gatePass.destination || "—"}</strong>
                            </div>

                            <div className="full">
                                <span>Purpose</span>
                                <strong>{gatePass.purpose || "—"}</strong>
                            </div>

                            <div>
                                <span>Hostel Exit</span>
                                <strong>
                                    {formatDateTime(gatePass.exit_datetime)}
                                </strong>
                            </div>

                            <div>
                                <span>Hostel Entry</span>
                                <strong>
                                    {formatDateTime(gatePass.entry_datetime)}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <section className="view-gatepass-qr">
                        <h2>QR CODE</h2>

                        {approved && qrValue ? (
                            <>
                                <div className="view-gatepass-qr-box">
                                    <QRCodeSVG
                                        value={String(qrValue)}
                                        size={220}
                                        level="H"
                                        includeMargin
                                    />
                                </div>

                                <p>Scan this QR code at the hostel security gate.</p>
                            </>
                        ) : (
                            <div className="view-gatepass-qr-placeholder">
                                <span>▦</span>
                                <strong>QR Code Not Generated</strong>
                                <small>QR will be generated after rector approval.</small>
                            </div>
                        )}
                    </section>

                    <section className="view-gatepass-approval-panel">
                        <div className="approval-row">
                            <span>Parent Verification</span>
                            <strong className={parentApproved ? "view-approved" : "view-pending"}>
                                {parentApproved ? "✓ Approved" : "⏳ Pending"}
                            </strong>
                        </div>

                        <div className="approval-row">
                            <span>Rector Approval</span>
                            <strong className={approved ? "view-approved" : "view-pending"}>
                                {approved ? "✓ Approved" : "⏳ Pending"}
                            </strong>
                        </div>
                    </section>

                    <section className="view-gatepass-approved-by">
                        <div>
                            <span>Approved By</span>
                            <strong>
                                {gatePass.rector_name ||
                                    gatePass.rectorName ||
                                    gatePass.approved_by_name ||
                                    "Hostel Rector"}
                            </strong>
                        </div>

                        <div>
                            <span>Mobile</span>
                            <strong>
                                {gatePass.rector_mobile ||
                                    gatePass.rectorMobile ||
                                    gatePass.approved_by_mobile ||
                                    "—"}
                            </strong>
                        </div>

                        <div>
                            <span>Hostel</span>
                            <strong>
                                {student?.hostel ||
                                    gatePass.hostel ||
                                    "Virtuous Hostel"}
                            </strong>
                        </div>
                    </section>

                    <section className="view-gatepass-security">
                        <div>
                            <span>Security Exit</span>
                            <strong>
                                {gatePass.security_exit === "Yes"
                                    ? "✓ Exited"
                                    : "Pending"}
                            </strong>
                        </div>

                        <div>
                            <span>Security Entry</span>
                            <strong>
                                {gatePass.security_entry === "Yes"
                                    ? "✓ Entered"
                                    : "Pending"}
                            </strong>
                        </div>
                    </section>

                    <div
                        className={`view-gatepass-validity ${
                            !approved
                                ? "inactive"
                                : expired
                                ? "expired"
                                : "valid"
                        }`}
                    >
                        <strong>
                            {!approved ? "!" : expired ? "✕" : "✓"}{" "}
                            {!approved
                                ? "NOT ACTIVE"
                                : expired
                                ? "EXPIRED GATE PASS"
                                : "VALID GATE PASS"}
                        </strong>

                        <span>
                            {!approved
                                ? "Waiting for rector approval"
                                : expired
                                ? `Expired On: ${formatDate(
                                      gatePass.return_date
                                  )}`
                                : `Valid Until: ${formatDate(
                                      gatePass.return_date
                                  )} ${
                                      gatePass.return_time
                                          ? formatTime(gatePass.return_time)
                                          : "11:59 PM"
                                  }`}
                        </span>
                    </div>
                </div>
                </div>
            </main>
        </div>
    );
};

export default ViewGatePass;
