import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import "./ScanGatePass.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ScanGatePass = () => {
    const navigate = useNavigate();
    const scannerRef = useRef(null);
    const scanLockedRef = useRef(false);

    const [scanning, setScanning] = useState(false);
    const [starting, setStarting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [gatePass, setGatePass] = useState(null);

    const security = JSON.parse(localStorage.getItem("security") || "{}");
    const securityToken = localStorage.getItem("securityToken");

    const showMessage = (text, type = "success") => {
        setMessage(text);
        setMessageType(type);
    };

    const playBeep = async () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;

            if (!AudioContext) {
                return;
            }

            const context = new AudioContext();

            if (context.state === "suspended") {
                await context.resume();
            }

            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(1000, context.currentTime);
            gainNode.gain.setValueAtTime(0.25, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            oscillator.start();
            oscillator.stop(context.currentTime + 0.2);

            window.setTimeout(() => {
                context.close().catch(() => { });
            }, 300);
        } catch (error) {
            console.warn("Gate pass beep failed:", error);
        }
    };

    const stopScanner = async () => {
        const scanner = scannerRef.current;

        try {
            if (scanner?.isScanning) {
                await scanner.stop();
            }

            if (scanner) {
                await scanner.clear();
            }
        } catch (error) {
            console.warn("Scanner stop error:", error);
        } finally {
            scannerRef.current = null;
            setScanning(false);
        }
    };

    const startScanner = async () => {
        if (starting || scannerRef.current) {
            return;
        }

        try {
            setStarting(true);
            setLoading(false);
            setGatePass(null);
            setMessage("");
            setMessageType("");
            scanLockedRef.current = false;

            if (!window.isSecureContext) {
                throw new Error("Camera requires HTTPS. Please open the website using HTTPS.");
            }

            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error("Camera is not supported by this browser.");
            }

            const reader = document.getElementById("security-qr-reader");

            if (!reader) {
                throw new Error("QR scanner container was not found.");
            }

            reader.innerHTML = "";

            const permissionStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" } },
                audio: false
            });

            permissionStream.getTracks().forEach((track) => track.stop());

            const cameras = await Html5Qrcode.getCameras();

            if (!cameras?.length) {
                throw new Error("No camera device is available.");
            }

            const rearCamera = cameras.find((camera) => {
                const label = String(camera.label || "").toLowerCase();
                return label.includes("back") || label.includes("rear") || label.includes("environment");
            });

            const selectedCamera = rearCamera || cameras[0];
            const scanner = new Html5Qrcode("security-qr-reader");
            scannerRef.current = scanner;

            await scanner.start(
                { deviceId: { exact: selectedCamera.id } },
                {
                    fps: 15,
                    qrbox: { width: 280, height: 280 },
                    aspectRatio: 1
                },
                async (decodedText) => {
                    if (scanLockedRef.current || !decodedText) {
                        return;
                    }

                    scanLockedRef.current = true;
                    await playBeep();
                    await stopScanner();
                    await verifyGatePass(String(decodedText).trim());
                },
                () => { }
            );

            setScanning(true);
        } catch (error) {
            console.error("Gate pass scanner error:", error);
            try {
                if (scannerRef.current?.isScanning) {
                    await scannerRef.current.stop();
                }
                await scannerRef.current?.clear();
            } catch (cleanupError) {
                console.warn("Scanner cleanup after start failure:", cleanupError);
            }
            scannerRef.current = null;
            setScanning(false);
            showMessage(error?.message || "Unable to start camera scanner.", "error");
        } finally {
            setStarting(false);
        }
    };

    const verifyGatePass = async (qrValue) => {
        const cleanQrValue = String(qrValue || "").trim();

        if (!cleanQrValue) {
            showMessage("No QR value was detected.", "error");
            return;
        }

        const verifyOnce = async () => {
            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), 25000);

            try {
                const response = await fetch(`${API_URL}/api/security/gatepass/scan`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(securityToken ? { Authorization: `Bearer ${securityToken}` } : {})
                    },
                    body: JSON.stringify({
                        verification_code: cleanQrValue,
                        qr_code: cleanQrValue
                    }),
                    signal: controller.signal
                });

                let data = {};
                try {
                    data = await response.json();
                } catch {
                    data = {};
                }

                if (!response.ok) {
                    if (data.gatePass) {
                        setGatePass(data.gatePass);
                    }

                    const error = new Error(
                        data.message || `Gate pass verification failed (${response.status}).`
                    );

                    error.status = response.status;
                    error.gatePass = data.gatePass || null;
                    error.action = data.action || data.gatePass?.action || null;

                    throw error;
                }

                const scannedGatePass = data.gatePass || data.data || null;

                if (!scannedGatePass) {
                    throw new Error("Gate pass verification returned no gate pass data.");
                }

                return scannedGatePass;
            } finally {
                window.clearTimeout(timeoutId);
            }
        };

        try {
            setLoading(true);
            setMessage("");
            setGatePass(null);

            let scannedGatePass;

            try {
                scannedGatePass = await verifyOnce();
            } catch (firstError) {
                // Retry only network/time-out/server errors. Do not duplicate
                // valid 400/403/404 business responses.
                const retryable =
                    firstError?.name === "AbortError" ||
                    !firstError?.status ||
                    firstError.status >= 500;

                if (!retryable) {
                    throw firstError;
                }

                await new Promise((resolve) => window.setTimeout(resolve, 1200));
                scannedGatePass = await verifyOnce();
            }

            setGatePass(scannedGatePass);

            if (scannedGatePass.rector !== "Approved") {
                showMessage(
                    "Gate pass is not approved by the Rector.",
                    "error"
                );
                return;
            }

            if (scannedGatePass.action === "EXIT") {
                navigate("/security/gatepass/exit", {
                    state: {
                        gatePass: scannedGatePass
                    }
                });
                return;
            }

            if (scannedGatePass.action === "ENTRY") {
                navigate("/security/gatepass/entry", {
                    state: {
                        gatePass: scannedGatePass
                    }
                });
                return;
            }

            if (scannedGatePass.security_exit !== "Yes") {
                navigate("/security/gatepass/exit", {
                    state: {
                        gatePass: scannedGatePass
                    }
                });
                return;
            }

            if (
                scannedGatePass.security_exit === "Yes" &&
                scannedGatePass.security_entry !== "Yes"
            ) {
                navigate("/security/gatepass/entry", {
                    state: {
                        gatePass: scannedGatePass
                    }
                });
                return;
            }

            showMessage(
                "This gate pass is already completed. No further entry or exit is allowed.",
                "error"
            );

            showMessage("This gate pass is already completed. No further entry or exit is allowed.", "error");
        } catch (error) {
            console.error("Gate pass verification error:", error);

            if (error?.gatePass) {
                setGatePass(error.gatePass);
            } else {
                setGatePass(null);
            }

            if (error?.name === "AbortError") {
                showMessage(
                    "Gate pass verification timed out. Please try scanning again.",
                    "error"
                );
            } else {
                showMessage(
                    error?.message || "Unable to verify gate pass.",
                    "error"
                );
            }
        } finally {
            setLoading(false);
            scanLockedRef.current = false;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("security");
        localStorage.removeItem("securityToken");
        navigate("/security/login", { replace: true });
    };

    useEffect(() => {
        return () => {
            const scanner = scannerRef.current;

            if (scanner?.isScanning) {
                scanner.stop().catch(() => { });
            }
        };
    }, []);

    return (
        <div className="security-gatepass-page">
            <aside className="security-gatepass-sidebar">
                <div className="security-gatepass-brand">
                    <div className="security-gatepass-brand-icon">🛡️</div>
                    <div>
                        <h2>Virtuous</h2>
                        <span>Security Panel</span>
                    </div>
                </div>

                <nav className="security-gatepass-nav">
                    <button onClick={() => navigate("/security/dashboard")}>
                        📊 Dashboard
                    </button>
                    <button className="active">
                        📷 Scan Gate Pass
                    </button>
                    <button onClick={() => navigate("/security/gatepass/exit-records")}>
                        🚪 Exit Records
                    </button>
                    <button onClick={() => navigate("/security/gatepass/entry-records")}>
                        🏠 Entry Records
                    </button>
                    <button onClick={() => navigate("/security/profile")}>
                        👤 Profile
                    </button>
                </nav>

                <div className="security-gatepass-sidebar-bottom">
                    <div className="security-gatepass-user">
                        <div className="security-gatepass-avatar">
                            {security?.name?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div>
                            <strong>{security?.name || "Security Guard"}</strong>
                            <span>{security?.hostel_name || security?.hostel || "Hostel"}</span>
                        </div>
                    </div>

                    <button className="security-gatepass-logout" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </aside>

            <main className="security-gatepass-main">
                <header className="security-gatepass-header">
                    <div>
                        <span>GATE PASS MANAGEMENT</span>
                        <h1>Scan Gate Pass</h1>
                        <p>Scan the approved student QR and continue with exit or entry verification.</p>
                    </div>
                    <div className="security-gatepass-online">
                        <i></i>
                        Security Online
                    </div>
                </header>

                {message && (
                    <div className={`security-gatepass-message ${messageType}`}>
                        <strong>{messageType === "error" ? "⚠️" : "✓"}</strong>
                        <span>{message}</span>
                        <button onClick={() => setMessage("")}>×</button>
                    </div>
                )}

                <section className="security-gatepass-grid">
                    <div className="security-gatepass-scanner-card">
                        <div className="security-gatepass-card-header">
                            <div>
                                <span>STEP 1</span>
                                <h2>Scan Student QR</h2>
                            </div>
                            <div className="security-gatepass-card-icon">📷</div>
                        </div>

                        <div id="security-qr-reader" className="security-qr-reader"></div>

                        {!scanning && !loading && (
                            <div className="security-gatepass-scanner-placeholder">
                                <div>▣</div>
                                <h3>Ready to Scan</h3>
                                <p>Place the student's approved QR code inside the scanner frame.</p>
                                <button onClick={startScanner} disabled={starting}>
                                    {starting ? "Starting Camera..." : "Start Scanner"}
                                </button>
                            </div>
                        )}

                        {loading && (
                            <div className="security-gatepass-loading">
                                <div className="security-gatepass-spinner"></div>
                                <strong>Verifying Gate Pass...</strong>
                                <span>Please wait.</span>
                            </div>
                        )}

                        {scanning && (
                            <div className="security-gatepass-scanning-status">
                                <span></span>
                                Camera active — scan QR now
                            </div>
                        )}
                    </div>

                    <div className="security-gatepass-info-card">
                        <div className="security-gatepass-card-header">
                            <div>
                                <span>FLOW</span>
                                <h2>Gate Pass Process</h2>
                            </div>
                            <div className="security-gatepass-card-icon">🎫</div>
                        </div>

                        <div className="security-gatepass-flow">
                            <div><b>1</b><span>Student shows approved QR</span></div>
                            <div><b>2</b><span>Security scans QR</span></div>
                            <div><b>3</b><span>Allow Exit if student is inside</span></div>
                            <div><b>4</b><span>Allow Entry when student returns</span></div>
                            <div><b>5</b><span>Gate pass becomes completed</span></div>
                        </div>

                        {gatePass && (
                            <div className="security-gatepass-preview">
                                <span>LAST VERIFIED</span>
                                <strong>{gatePass.name || "Student"}</strong>
                                <p>{gatePass.destination || "-"} • {gatePass.purpose || "-"}</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ScanGatePass;
