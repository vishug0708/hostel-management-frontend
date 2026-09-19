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
                context.close().catch(() => {});
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
                selectedCamera.id,
                {
                    fps: 12,
                    qrbox: { width: 270, height: 270 },
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
                () => {}
            );

            setScanning(true);
        } catch (error) {
            console.error("Gate pass scanner error:", error);
            scannerRef.current = null;
            setScanning(false);
            showMessage(error?.message || "Unable to start camera scanner.", "error");
        } finally {
            setStarting(false);
        }
    };

    const verifyGatePass = async (qrValue) => {
        try {
            setLoading(true);
            setMessage("");
            setGatePass(null);

            const response = await fetch(`${API_URL}/api/security/gatepass/scan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(securityToken ? { Authorization: `Bearer ${securityToken}` } : {})
                },
                body: JSON.stringify({
                    verification_code: qrValue
                })
            });

            const data = await response.json();
            const scannedGatePass = data.gatePass || data.data || null;

            if (!response.ok || !scannedGatePass) {
                throw new Error(data.message || "Invalid gate pass.");
            }

            setGatePass(scannedGatePass);

            if (scannedGatePass.rector !== "Approved") {
                showMessage("Gate pass is not approved by the Rector.", "error");
                return;
            }

            if (scannedGatePass.security_exit !== "Yes") {
                navigate(`/security/gatepass/allow-exit/${encodeURIComponent(scannedGatePass.verification_code || qrValue)}`, {
                    state: { gatePass: scannedGatePass }
                });
                return;
            }

            if (scannedGatePass.security_entry !== "Yes") {
                navigate(`/security/gatepass/allow-entry/${encodeURIComponent(scannedGatePass.verification_code || qrValue)}`, {
                    state: { gatePass: scannedGatePass }
                });
                return;
            }

            showMessage("This gate pass is already completed. No further entry or exit is allowed.", "error");
        } catch (error) {
            console.error("Gate pass verification error:", error);
            setGatePass(null);
            showMessage(error.message || "Unable to verify gate pass.", "error");
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
                scanner.stop().catch(() => {});
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
