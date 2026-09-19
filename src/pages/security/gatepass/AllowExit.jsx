import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./AllowExit.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AllowExit = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const [gatePass, setGatePass] = useState(location.state?.gatePass || null);
    const [loading, setLoading] = useState(!location.state?.gatePass);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    const security = JSON.parse(localStorage.getItem("security") || "{}");
    const securityToken = localStorage.getItem("securityToken");

    const getHeaders = () => ({
        "Content-Type": "application/json",
        ...(securityToken ? { Authorization: `Bearer ${securityToken}` } : {})
    });

    const fetchGatePass = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/api/security/gatepass/scan`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    verification_code: decodeURIComponent(id || "")
                })
            });

            const data = await response.json();

            if (!response.ok || !(data.gatePass || data.data)) {
                throw new Error(data.message || "Unable to verify gate pass.");
            }

            setGatePass(data.gatePass || data.data);
        } catch (err) {
            setError(err.message || "Unable to verify gate pass.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!gatePass) {
            fetchGatePass();
        }
    }, [id]);

    const handleAllowExit = async () => {
        if (!gatePass?.id || processing) {
            return;
        }

        try {
            setProcessing(true);
            setError("");

            const response = await fetch(`${API_URL}/api/security/gatepass/${gatePass.id}/exit`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({
                    security_id: security.id || security.security_id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to allow exit.");
            }

            navigate("/security/gatepass/scan", {
                replace: true,
                state: { message: "Student exit allowed successfully." }
            });
        } catch (err) {
            setError(err.message || "Unable to allow exit.");
        } finally {
            setProcessing(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("security");
        localStorage.removeItem("securityToken");
        navigate("/security/login", { replace: true });
    };

    const formatDate = (date) => {
        if (!date) return "—";
        const value = new Date(date);
        if (Number.isNaN(value.getTime())) return date;
        return value.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatTime = (time) => {
        if (!time) return "—";
        const parts = String(time).split(":");
        if (parts.length < 2) return time;
        let hour = Number(parts[0]);
        const minute = parts[1];
        const period = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
    };

    const formatDateTime = (date) => {
        if (!date) return "—";
        const value = new Date(date);
        if (Number.isNaN(value.getTime())) return date;
        return value.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    return (
        <div className="security-exit-page">
            <aside className="security-exit-sidebar">
                <div className="security-exit-brand">
                    <div>🛡️</div>
                    <span><strong>Virtuous</strong>Security Panel</span>
                </div>
                <nav>
                    <button onClick={() => navigate("/security/dashboard")}>📊 Dashboard</button>
                    <button className="active" onClick={() => navigate("/security/gatepass/scan")}>📷 Scan Gate Pass</button>
                    <button onClick={() => navigate("/security/gatepass/exit-records")}>🚪 Exit Records</button>
                    <button onClick={() => navigate("/security/gatepass/entry-records")}>🏠 Entry Records</button>
                    <button onClick={() => navigate("/security/profile")}>👤 Profile</button>
                </nav>
                <div className="security-exit-bottom">
                    <div className="security-exit-user">
                        <div>{security?.name?.charAt(0)?.toUpperCase() || "S"}</div>
                        <span>{security?.name || "Security Guard"}</span>
                    </div>
                    <button onClick={handleLogout}>🚪 Logout</button>
                </div>
            </aside>

            <main className="security-exit-main">
                <header className="security-exit-header">
                    <div>
                        <span>GATE PASS • EXIT</span>
                        <h1>Allow Student Exit</h1>
                        <p>Confirm the approved gate pass before the student leaves the hostel.</p>
                    </div>
                    <button onClick={() => navigate("/security/gatepass/scan")}>← Scanner</button>
                </header>

                {loading && (
                    <div className="security-exit-state">Verifying gate pass...</div>
                )}

                {!loading && error && (
                    <div className="security-exit-error">
                        <strong>⚠️ Gate Pass Verification Failed</strong>
                        <span>{error}</span>
                        <button onClick={() => navigate("/security/gatepass/scan")}>Back to Scanner</button>
                    </div>
                )}

                {!loading && !error && gatePass && (
                    <div className="security-exit-container">
                        {gatePass.security_exit === "Yes" ? (
                            <div className="security-exit-complete">
                                <div>✓</div>
                                <h2>Exit Already Recorded</h2>
                                <p>This student has already been allowed to leave. The next scan will be handled as hostel entry.</p>
                                <button onClick={() => navigate(`/security/gatepass/allow-entry/${encodeURIComponent(gatePass.verification_code || id)}`, { state: { gatePass } })}>
                                    Continue to Entry
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="security-exit-status">
                                    <span>✓</span>
                                    <div>
                                        <strong>Rector Approved</strong>
                                        <p>Gate pass is approved and ready for security exit verification.</p>
                                    </div>
                                </div>

                                <section className="security-exit-card">
                                    <div className="security-exit-card-title">
                                        <span>Student Details</span>
                                        <b>APPROVED</b>
                                    </div>
                                    <div className="security-exit-student">
                                        {gatePass.photo ? (
                                            <img src={`${API_URL}/uploads/students/${gatePass.photo}`} alt={gatePass.name || "Student"} />
                                        ) : (
                                            <div className="security-exit-photo-placeholder">{gatePass.name?.charAt(0)?.toUpperCase() || "S"}</div>
                                        )}
                                        <div>
                                            <h2>{gatePass.name || "Student"}</h2>
                                            <div className="security-exit-details">
                                                <div><span>Student ID</span><strong>{gatePass.student_id || "—"}</strong></div>
                                                <div><span>Mobile</span><strong>{gatePass.mobile || "—"}</strong></div>
                                                <div><span>College</span><strong>{gatePass.college || "—"}</strong></div>
                                                <div><span>Course</span><strong>{gatePass.course || "—"}</strong></div>
                                                <div><span>Hostel</span><strong>{gatePass.hostel || "—"}</strong></div>
                                                <div><span>Room</span><strong>{gatePass.room_no ? `${gatePass.block || ""} ${gatePass.room_no}` : "—"}</strong></div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="security-exit-card">
                                    <div className="security-exit-card-title">
                                        <span>Gate Pass Details</span>
                                        <b>QR VERIFIED</b>
                                    </div>
                                    <div className="security-exit-details gatepass">
                                        <div><span>Destination</span><strong>{gatePass.destination || "—"}</strong></div>
                                        <div><span>Purpose</span><strong>{gatePass.purpose || "—"}</strong></div>
                                        <div><span>Exit Date</span><strong>{formatDate(gatePass.out_date)}</strong></div>
                                        <div><span>Return Date</span><strong>{formatDate(gatePass.return_date)}</strong></div>
                                        <div><span>Exit Time</span><strong>{formatTime(gatePass.out_time)}</strong></div>
                                        <div><span>Parent OTP</span><strong className="verified">✓ Verified</strong></div>
                                    </div>
                                </section>

                                <section className="security-exit-action">
                                    <div className="security-exit-action-icon">🚪</div>
                                    <div>
                                        <h2>Allow Hostel Exit?</h2>
                                        <p>Confirm that <strong>{gatePass.name || "the student"}</strong> is leaving using this approved gate pass.</p>
                                        <small>After exit is recorded, the same QR will be used for the student's return entry.</small>
                                        <button onClick={handleAllowExit} disabled={processing}>
                                            {processing ? "Recording Exit..." : "✓ Allow Exit"}
                                        </button>
                                    </div>
                                </section>

                                {gatePass.exit_datetime && (
                                    <div className="security-exit-recorded">✓ Exit recorded at {formatDateTime(gatePass.exit_datetime)}</div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AllowExit;
