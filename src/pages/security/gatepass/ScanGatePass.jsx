import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import "./ScanGatePass.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const ScanGatePass = () => {
    const navigate = useNavigate();

    const scannerRef = useRef(null);
    const scanLockedRef = useRef(false);
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [gatePass, setGatePass] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const security =
        JSON.parse(
            localStorage.getItem("security") || "{}"
        );

    const showMessage = (
        text,
        type = "success"
    ) => {
        setMessage(text);
        setMessageType(type);
    };

    const playBeep = () => {
        try {
            const AudioContext =
                window.AudioContext || window.webkitAudioContext;

            const audioContext = new AudioContext();

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(
                1000,
                audioContext.currentTime
            );

            gainNode.gain.setValueAtTime(
                0.3,
                audioContext.currentTime
            );

            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime + 0.2
            );

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(
                audioContext.currentTime + 0.2
            );
        } catch (error) {
            console.error("Beep sound error:", error);
        }
    };

    const startScanner = async () => {
        if (scannerRef.current) {
            return;
        }

        try {
            setMessage("");
            setGatePass(null);
            scanLockedRef.current = false;

            const qrScanner = new Html5Qrcode("security-qr-reader");
            scannerRef.current = qrScanner;

            await qrScanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 280, height: 280 },
                    aspectRatio: 1
                },
                async (decodedText) => {
                    if (scanLockedRef.current || !decodedText) {
                        return;
                    }

                    scanLockedRef.current = true;

                    console.log("========== QR SCANNED ==========");
                    console.log("QR VALUE:", decodedText);
                    console.log("QR VALUE TYPE:", typeof decodedText);

                    playBeep();
                    await stopScanner();
                    await verifyGatePass(String(decodedText).trim());
                },
                (errorMessage) => {
                    console.debug("QR search:", errorMessage);
                }
            );

            setScanning(true);
            console.log("QR scanner started successfully");
        } catch (error) {
            console.error("QR Scanner Error:", error);
            scannerRef.current = null;
            setScanning(false);
            showMessage(
                error?.message || "Camera permission denied or camera is unavailable.",
                "error"
            );
        }
    };

    const stopScanner = async () => {
        const qrScanner = scannerRef.current;

        try {
            if (qrScanner) {
                if (qrScanner.isScanning) {
                    await qrScanner.stop();
                }
                await qrScanner.clear();
            }
        } catch (error) {
            console.error("Stop Scanner Error:", error);
        } finally {
            scannerRef.current = null;
            setScanning(false);
        }
    };

    useEffect(() => {
        return () => {
            const qrScanner = scannerRef.current;
            if (qrScanner?.isScanning) {
                qrScanner.stop().catch(() => { });
            }
        };
    }, []);

    const verifyGatePass = async (
        qrValue
    ) => {
        try {

            console.log("Sending QR to backend:", qrValue);    //for website purpose

            setLoading(true);
            setMessage("");

            const response = await fetch(
                `${API_URL}/api/security/gatepass/scan`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        verification_code: qrValue
                    })
                }
            );

            const data = await response.json();

            console.log("========== GATE PASS API RESPONSE ==========");
            console.log("Status:", response.status);
            console.log("Response:", data);
            console.log("Gate Pass:", data.gatePass);
            console.log("============================================");

            if (!response.ok) {
                setGatePass(data.gatePass || data.data || null);

                throw new Error(
                    data.message || "Invalid gate pass."
                );
            }

            const scannedGatePass = data.gatePass || data.data;

            console.log("SCANNED GATE PASS:", scannedGatePass);

            if (!scannedGatePass) {
                throw new Error("Backend returned no gate pass data.");
            }

            setGatePass(scannedGatePass);

            showMessage(
                "Gate pass verified successfully.",
                "success"
            );

            setGatePass(
                data.gatePass ||
                data.data
            );

            showMessage(
                "Gate pass verified successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "Verify Gate Pass Error:",
                error
            );

            setGatePass(null);

            showMessage(
                error.message ||
                "Unable to verify gate pass.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleExit = async () => {
        if (!gatePass) {
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/security/gatepass/${gatePass.id}/exit`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        security_id:
                            security.id ||
                            security.security_id
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to allow exit."
                );
            }

            setGatePass((previous) => ({
                ...previous,
                security_exit: "Yes",
                exit_datetime:
                    new Date().toISOString()
            }));

            showMessage(
                "Student exit recorded successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "Exit Error:",
                error
            );

            showMessage(
                error.message ||
                "Unable to record exit.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEntry = async () => {
        if (!gatePass) {
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/security/gatepass/${gatePass.id}/entry`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        security_id:
                            security.id ||
                            security.security_id
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to allow entry."
                );
            }

            setGatePass((previous) => ({
                ...previous,
                security_entry: "Yes",
                entry_datetime:
                    new Date().toISOString()
            }));

            showMessage(
                "Student entry recorded successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "Entry Error:",
                error
            );

            showMessage(
                error.message ||
                "Unable to record entry.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const value =
            new Date(date);

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {
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

    const formatDateTime = (
        date
    ) => {
        if (!date) {
            return "Pending";
        }

        const value =
            new Date(date);

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {
            return date;
        }

        return value.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        );
    };

    const getPhotoUrl = () => {
        if (!gatePass?.photo) {
            return null;
        }

        if (
            gatePass.photo.startsWith(
                "http"
            )
        ) {
            return gatePass.photo;
        }

        return `${API_URL}/${gatePass.photo.replace(
            /^\/+/,
            ""
        )}`;
    };

    const handleNewScan = () => {
        setGatePass(null);
        setMessage("");
        setMessageType("");
        startScanner();
    };

    const handleLogout = () => {
        localStorage.removeItem(
            "security"
        );

        localStorage.removeItem(
            "securityToken"
        );

        navigate("/security/login");
    };

    return (
        <div className="security-scan-layout">

            {/* ================= SIDEBAR ================= */}

            <aside className="security-scan-sidebar">

                <div className="security-brand">

                    <div className="security-brand-logo">
                        🛡️
                    </div>

                    <div>
                        <h2>
                            Virtuous
                        </h2>

                        <span>
                            Security Panel
                        </span>
                    </div>

                </div>

                <div className="security-profile">

                    <div className="security-avatar">
                        👮
                    </div>

                    <div>
                        <strong>
                            {security.name ||
                                "Security Guard"}
                        </strong>

                        <span>
                            Security
                        </span>
                    </div>

                </div>

                <nav className="security-nav">

                    <button
                        onClick={() =>
                            navigate(
                                "/security/dashboard"
                            )
                        }
                    >
                        <span>▦</span>
                        Dashboard
                    </button>

                    <button
                        className="active"
                        onClick={() =>
                            navigate(
                                "/security/gatepass"
                            )
                        }
                    >
                        <span>🎫</span>
                        Scan Gate Pass
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/security/exit"
                            )
                        }
                    >
                        <span>↗</span>
                        Exit Records
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/security/entry"
                            )
                        }
                    >
                        <span>↙</span>
                        Entry Records
                    </button>

                </nav>

                <div className="security-sidebar-bottom">

                    <button
                        onClick={() =>
                            navigate(
                                "/security/profile"
                            )
                        }
                    >
                        ⚙ Profile
                    </button>

                    <button
                        className="security-logout"
                        onClick={
                            handleLogout
                        }
                    >
                        ↪ Logout
                    </button>

                </div>

            </aside>

            {/* ================= MAIN ================= */}

            <main className="security-scan-main">

                <header className="security-scan-header">

                    <div>
                        <span>
                            SECURITY GATE
                        </span>

                        <h1>
                            Scan Gate Pass
                        </h1>

                        <p>
                            Scan the student's
                            approved gate pass QR
                            code.
                        </p>
                    </div>

                    <div className="security-header-status">
                        <span className="online-dot" />
                        Security Online
                    </div>

                </header>

                {message && (
                    <div
                        className={`scan-message ${messageType}`}
                    >
                        <span>
                            {messageType ===
                                "success"
                                ? "✓"
                                : "⚠"}
                        </span>

                        <p>
                            {message}
                        </p>

                        <button
                            onClick={() =>
                                setMessage("")
                            }
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="security-scan-grid">

                    {/* ================= SCANNER ================= */}

                    <section className="scanner-card">

                        <div className="scanner-card-header">

                            <div>
                                <span>
                                    QR VERIFICATION
                                </span>

                                <h2>
                                    Scan QR Code
                                </h2>
                            </div>

                            <div className="scanner-icon">
                                ⌁
                            </div>

                        </div>

                        <div
                            id="security-qr-reader"
                            className="security-qr-reader"
                        />

                        {!scanning && (
                            <div className="scanner-placeholder">

                                <div className="scanner-placeholder-icon">
                                    ▣
                                </div>

                                <h3>
                                    Ready to Scan
                                </h3>

                                <p>
                                    Click the button
                                    below and point
                                    the camera at the
                                    student's QR code.
                                </p>

                            </div>
                        )}

                        <div className="scanner-controls">

                            {!scanning ? (
                                <button
                                    className="start-scan-btn"
                                    onClick={
                                        startScanner
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    📷 Start Scanner
                                </button>
                            ) : (
                                <button
                                    className="stop-scan-btn"
                                    onClick={
                                        stopScanner
                                    }
                                >
                                    ■ Stop Scanner
                                </button>
                            )}

                        </div>

                        <div className="scanner-help">

                            <div>
                                <span>
                                    1
                                </span>

                                <p>
                                    Start scanner
                                </p>
                            </div>

                            <div>
                                <span>
                                    2
                                </span>

                                <p>
                                    Scan QR code
                                </p>
                            </div>

                            <div>
                                <span>
                                    3
                                </span>

                                <p>
                                    Verify details
                                </p>
                            </div>

                        </div>

                    </section>

                    {/* ================= DETAILS ================= */}

                    <section className="scan-details-card">

                        <div className="details-header">

                            <div>
                                <span>
                                    GATE PASS
                                    DETAILS
                                </span>

                                <h2>
                                    Student
                                    Verification
                                </h2>
                            </div>

                            {gatePass && (
                                <span className="verified-label">
                                    ✓ Verified
                                </span>
                            )}

                        </div>

                        {loading ? (
                            <div className="details-loading">
                                <div className="details-spinner" />
                                <p>
                                    Verifying gate
                                    pass...
                                </p>
                            </div>
                        ) : !gatePass ? (
                            <div className="details-empty">

                                <div>
                                    🎫
                                </div>

                                <h3>
                                    No Gate Pass
                                </h3>

                                <p>
                                    Scan an approved
                                    student gate
                                    pass to view its
                                    details.
                                </p>

                            </div>
                        ) : (
                            <div className="gatepass-details">

                                {/* PHOTO */}

                                <div className="security-student-top">

                                    {getPhotoUrl() ? (
                                        <img
                                            src={getPhotoUrl()}
                                            alt="Student"
                                        />
                                    ) : (
                                        <div className="security-photo-placeholder">
                                            👤
                                        </div>
                                    )}

                                    <div>
                                        <h3>
                                            {gatePass.student_name ||
                                                gatePass.name ||
                                                "Student"}
                                        </h3>

                                        <p>
                                            ID:{" "}
                                            {gatePass.student_id ||
                                                "—"}
                                        </p>

                                        <span>
                                            {gatePass.gate_pass_no ||
                                                `GP-${String(
                                                    gatePass.id
                                                ).padStart(
                                                    5,
                                                    "0"
                                                )}`}
                                        </span>
                                    </div>

                                </div>

                                {/* DETAILS */}

                                <div className="security-info-list">

                                    <div>
                                        <span>
                                            Mobile
                                        </span>

                                        <strong>
                                            {gatePass.student_mobile ||
                                                gatePass.mobile ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Parent Email
                                        </span>

                                        <strong>
                                            {gatePass.parent_email ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            College
                                        </span>

                                        <strong>
                                            {gatePass.college ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Course
                                        </span>

                                        <strong>
                                            {gatePass.course ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Hostel
                                        </span>

                                        <strong>
                                            {gatePass.hostel ||
                                                "Virtuous Hostel"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Room No
                                        </span>

                                        <strong>
                                            {gatePass.room_no ||
                                                gatePass.room_number ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Destination
                                        </span>

                                        <strong>
                                            {gatePass.destination ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Purpose
                                        </span>

                                        <strong>
                                            {gatePass.purpose ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Exit Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                gatePass.out_date
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Return Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                gatePass.return_date
                                            )}
                                        </strong>
                                    </div>

                                </div>

                                {/* APPROVAL */}

                                <div className="verification-status">

                                    <div>
                                        <span>
                                            Parent OTP
                                        </span>

                                        <strong className="verified">
                                            ✓ Verified
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Rector
                                        </span>

                                        <strong className="verified">
                                            ✓ Approved
                                        </strong>
                                    </div>

                                </div>

                                {/* EXIT / ENTRY */}

                                <div className="security-movement">

                                    <div>

                                        <span>
                                            Hostel Exit
                                        </span>

                                        <strong>
                                            {gatePass.exit_datetime
                                                ? formatDateTime(
                                                    gatePass.exit_datetime
                                                )
                                                : "Not Exited"}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Hostel Entry
                                        </span>

                                        <strong>
                                            {gatePass.entry_datetime
                                                ? formatDateTime(
                                                    gatePass.entry_datetime
                                                )
                                                : "Not Entered"}
                                        </strong>

                                    </div>

                                </div>

                                {/* ACTIONS */}

                                <div className="security-gate-actions">

                                    {!gatePass.security_exit ||
                                        gatePass.security_exit !==
                                        "Yes" ? (
                                        <button
                                            className="allow-exit-btn"
                                            onClick={
                                                handleExit
                                            }
                                            disabled={
                                                loading
                                            }
                                        >
                                            ↗ Allow Exit
                                        </button>
                                    ) : (
                                        <button
                                            className="exit-done-btn"
                                            disabled
                                        >
                                            ✓ Exit Recorded
                                        </button>
                                    )}

                                    {gatePass.security_exit ===
                                        "Yes" &&
                                        (!gatePass.security_entry ||
                                            gatePass.security_entry !==
                                            "Yes") ? (
                                        <button
                                            className="allow-entry-btn"
                                            onClick={
                                                handleEntry
                                            }
                                            disabled={
                                                loading
                                            }
                                        >
                                            ↙ Allow Entry
                                        </button>
                                    ) : gatePass.security_entry ===
                                        "Yes" ? (
                                        <button
                                            className="entry-done-btn"
                                            disabled
                                        >
                                            ✓ Entry Recorded
                                        </button>
                                    ) : null}

                                </div>

                                <button
                                    className="new-scan-btn"
                                    onClick={
                                        handleNewScan
                                    }
                                >
                                    ⟳ Scan Another Gate Pass
                                </button>

                            </div>
                        )}

                    </section>

                </div>

            </main>

        </div>
    );
};
export default ScanGatePass;