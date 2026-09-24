import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./AllowEntry.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AllowEntry = () => {
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

    const handleAllowEntry = async () => {
        if (!gatePass?.id || processing) {
            return;
        }

        try {
            setProcessing(true);
            setError("");

            const response = await fetch(`${API_URL}/api/security/gatepass/${gatePass.id}/entry`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({
                    security_id: security.id || security.security_id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to allow entry.");
            }

            navigate("/security/gatepass/scan", {
                replace: true,
                state: { message: "Student entry recorded successfully." }
            });
        } catch (err) {
            setError(err.message || "Unable to allow entry.");
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

    const getPhotoUrl = (photo) => {
        if (!photo) return "";
        const value = String(photo).trim();
        if (!value) return "";
        if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) return value;
        if (value.startsWith("/uploads/")) return `${API_URL}${value}`;
        if (value.startsWith("uploads/")) return `${API_URL}/${value}`;
        return `${API_URL}/uploads/students/${value}`;
    };

    return (
        <div className="security-entry-page">
            <aside className="security-entry-sidebar">
                <div className="security-entry-brand">
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
                <div className="security-entry-bottom">
                    <div className="security-entry-user">
                        <div>{security?.name?.charAt(0)?.toUpperCase() || "S"}</div>
                        <span>{security?.name || "Security Guard"}</span>
                    </div>
                    <button onClick={handleLogout}>🚪 Logout</button>
                </div>
            </aside>

            <main className="security-entry-main">
                <header className="security-entry-header">
                    <div>
                        <span>GATE PASS • RETURN</span>
                        <h1>Allow Student Entry</h1>
                        <p>Verify the student's return and record entry into the hostel.</p>
                    </div>
                    <button onClick={() => navigate("/security/gatepass/scan")}>← Scanner</button>
                </header>

                {loading && (
                    <div className="security-entry-state">Verifying gate pass...</div>
                )}

                {!loading && error && (
                    <div className="security-entry-error">
                        <strong>⚠️ Gate Pass Verification Failed</strong>
                        <span>{error}</span>
                        <button onClick={() => navigate("/security/gatepass/scan")}>Back to Scanner</button>
                    </div>
                )}

                {!loading && !error && gatePass && (
                    <div className="security-entry-container">
                        {gatePass.security_entry === "Yes" ? (
                            <div className="security-entry-complete">
                                <div>✓</div>
                                <h2>Gate Pass Completed</h2>
                                <p>Exit and entry have already been recorded. This gate pass cannot be used again.</p>
                                <button onClick={() => navigate("/security/gatepass/scan")}>Scan Another QR</button>
                            </div>
                        ) : (
                            <>
                                <div className="security-entry-status">
                                    <span>✓</span>
                                    <div>
                                        <strong>Return Verification Ready</strong>
                                        <p>The student has a recorded hostel exit and can now be allowed back inside.</p>
                                    </div>
                                </div>

                                <section className="security-entry-card">
                                    <div className="security-entry-card-title">
                                        <span>Student Details</span>
                                        <b>RECTOR APPROVED</b>
                                    </div>
                                    <div className="security-entry-student">
                                        {gatePass.photo ? (
                                            <img src={getPhotoUrl(gatePass.photo)} alt={gatePass.name || "Student"} />
                                        ) : (
                                            <div className="security-entry-photo-placeholder">{gatePass.name?.charAt(0)?.toUpperCase() || "S"}</div>
                                        )}
                                        <div>
                                            <h2>{gatePass.name || "Student"}</h2>
                                            <div className="security-entry-details">
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

                                <section className="security-entry-card">
                                    <div className="security-entry-card-title">
                                        <span>Gate Pass Details</span>
                                        <b>EXIT RECORDED</b>
                                    </div>
                                    <div className="security-entry-details gatepass">
                                        <div><span>Destination</span><strong>{gatePass.destination || "—"}</strong></div>
                                        <div><span>Purpose</span><strong>{gatePass.purpose || "—"}</strong></div>
                                        <div><span>Exit Date</span><strong>{formatDate(gatePass.out_date)}</strong></div>
                                        <div><span>Return Date</span><strong>{formatDate(gatePass.return_date)}</strong></div>
                                        <div><span>Exit Time</span><strong>{formatTime(gatePass.out_time)}</strong></div>
                                        <div><span>Exit Recorded</span><strong className="verified">✓ {formatDateTime(gatePass.exit_datetime)}</strong></div>
                                    </div>
                                </section>

                                <section className="security-entry-action">
                                    <div className="security-entry-action-icon">🏠</div>
                                    <div>
                                        <h2>Allow Hostel Entry?</h2>
                                        <p>Confirm that <strong>{gatePass.name || "the student"}</strong> has returned to the hostel.</p>
                                        <small>After entry is recorded, this gate pass becomes completed and cannot be reused.</small>
                                        <button onClick={handleAllowEntry} disabled={processing}>
                                            {processing ? "Recording Entry..." : "✓ Allow Entry"}
                                        </button>
                                    </div>
                                </section>

                                {gatePass.entry_datetime && (
                                    <div className="security-entry-recorded">✓ Entry recorded at {formatDateTime(gatePass.entry_datetime)}</div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AllowEntry;
