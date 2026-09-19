import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Html5Qrcode,
    Html5QrcodeSupportedFormats
} from "html5-qrcode";
import "./StaffCricketQRScanner.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const getStaff = () => {
    try {
        return JSON.parse(
            localStorage.getItem("staff") || "{}"
        );
    } catch {
        return {};
    }
};

const getPhotoUrl = (photo) => {
    if (!photo) {
        return "";
    }

    const value = String(photo).trim();

    if (
        value.startsWith("data:") ||
        value.startsWith("blob:") ||
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    const normalized = value.replace(/^\/+/, "");

    if (normalized.startsWith("uploads/")) {
        return `${API_URL}/${normalized}`;
    }

    return `${API_URL}/uploads/staff/${normalized}`;
};

const playQrBeep = async (type = "success") => {
    try {
        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContextClass) {
            return;
        }

        const audioContext = new AudioContextClass();

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = "sine";
        oscillator.frequency.value =
            type === "success" ? 880 : 420;

        gainNode.gain.setValueAtTime(
            0.0001,
            audioContext.currentTime
        );

        gainNode.gain.exponentialRampToValueAtTime(
            0.25,
            audioContext.currentTime + 0.02
        );

        gainNode.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime + 0.22
        );

        oscillator.start();
        oscillator.stop(
            audioContext.currentTime + 0.22
        );

        oscillator.onended = () => {
            audioContext.close().catch(() => { });
        };
    } catch (error) {
        console.warn("QR Beep Error:", error);
    }
};

function StaffCricketQRScanner() {
    const navigate = useNavigate();
    const scannerRef = useRef(null);
    const isScanningRef = useRef(false);
    const processingRef = useRef(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [ready, setReady] = useState(false);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const [decodedText, setDecodedText] = useState("");
    const [verificationLoading, setVerificationLoading] = useState(false);

    const token = localStorage.getItem("staffToken");
    const staff = getStaff();

    const staffPhoto = getPhotoUrl(
        staff.photo ||
        staff.profile_photo ||
        staff.staff_photo ||
        localStorage.getItem("staffPhoto")
    );

    useEffect(() => {
        if (!token) {
            navigate("/staff/login", {
                replace: true
            });
            return;
        }

        startScanner();

        return () => {
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        if (starting || isScanningRef.current) {
            return;
        }

        try {
            setStarting(true);
            setReady(false);
            setError("");
            setResult(null);
            setDecodedText("");

            if (!window.isSecureContext) {
                throw new Error(
                    "Camera requires HTTPS. Please open the website using HTTPS."
                );
            }

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                throw new Error(
                    "Camera is not supported by this browser."
                );
            }

            const readerElement = document.getElementById(
                "sc-qr-reader"
            );

            if (!readerElement) {
                throw new Error(
                    "QR scanner container was not found."
                );
            }

            readerElement.innerHTML = "";

            // --------------------------------------------------
            // STEP 1: Ask browser for camera permission
            // --------------------------------------------------

            let cameraStream;

            try {
                cameraStream =
                    await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: {
                                ideal: "environment"
                            }
                        },
                        audio: false
                    });
            } catch (cameraError) {
                console.error(
                    "Camera Permission Error:",
                    cameraError
                );

                if (
                    cameraError.name ===
                    "NotAllowedError"
                ) {
                    throw new Error(
                        "Camera permission was denied. Please allow Camera permission for this website from browser settings."
                    );
                }

                if (
                    cameraError.name ===
                    "NotFoundError"
                ) {
                    throw new Error(
                        "No camera was found on this device."
                    );
                }

                if (
                    cameraError.name ===
                    "NotReadableError"
                ) {
                    throw new Error(
                        "Camera is already being used by another application. Close other camera/scanner apps and try again."
                    );
                }

                if (
                    cameraError.name ===
                    "SecurityError"
                ) {
                    throw new Error(
                        "Browser security blocked camera access. Please use HTTPS and allow camera permission."
                    );
                }

                throw new Error(
                    cameraError.message ||
                    "Unable to access device camera."
                );
            }

            // We only used getUserMedia to request permission.
            // Html5Qrcode will open the camera again.
            cameraStream
                .getTracks()
                .forEach((track) => track.stop());

            // --------------------------------------------------
            // STEP 2: Get available cameras
            // --------------------------------------------------

            const cameras =
                await Html5Qrcode.getCameras();

            console.log(
                "Available cameras:",
                cameras
            );

            if (!cameras || cameras.length === 0) {
                throw new Error(
                    "No camera device is available."
                );
            }

            // --------------------------------------------------
            // STEP 3: Select rear camera if available
            // --------------------------------------------------

            let selectedCamera = cameras[0];

            const rearCamera =
                cameras.find((camera) => {
                    const label =
                        String(
                            camera.label || ""
                        ).toLowerCase();

                    return (
                        label.includes("back") ||
                        label.includes("rear") ||
                        label.includes("environment")
                    );
                });

            if (rearCamera) {
                selectedCamera = rearCamera;
            }

            console.log(
                "Selected camera:",
                selectedCamera
            );

            // --------------------------------------------------
            // STEP 4: Create QR scanner
            // --------------------------------------------------

            const scanner =
                new Html5Qrcode(
                    "sc-qr-reader"
                );

            scannerRef.current = scanner;

            // --------------------------------------------------
            // STEP 5: Start selected camera
            // --------------------------------------------------

            await scanner.start(
                selectedCamera.id,
                {
                    fps: 10,
                    qrbox: {
                        width: 280,
                        height: 280
                    },
                    aspectRatio: 1
                },
                async (decodedText) => {
                    if (processingRef.current) {
                        return;
                    }

                    processingRef.current = true;

                    const qrValue = String(decodedText || "").trim();

                    if (!qrValue) {
                        processingRef.current = false;
                        return;
                    }

                    console.log("QR SCANNED:", qrValue);

                    // QR scan ke turant baad camera band
                    await stopScanner();
                    setReady(false);

                    // QR token screen par show nahi karna
                    setDecodedText("");

                    // Verification Result load karo
                    await checkQr(qrValue);

                    processingRef.current = false;
                },

                (scanErrorMessage) => {
                    // Ignore normal QR search errors.
                    // html5-qrcode calls this repeatedly
                    // while searching for a QR.
                }
            );

            isScanningRef.current = true;

            setReady(true);

            console.log(
                "Cricket QR Scanner started successfully."
            );
        } catch (error) {
            console.error(
                "QR Scanner Start Error:",
                error
            );

            setReady(false);

            setError(
                error?.message ||
                "Unable to start QR scanner."
            );
        } finally {
            setStarting(false);
        }
    };

    const stopScanner = async () => {
        try {
            if (
                scannerRef.current &&
                isScanningRef.current
            ) {
                await scannerRef.current.stop();
            }
        } catch (error) {
            console.warn(
                "QR Scanner Stop Error:",
                error
            );
        }

        try {
            if (scannerRef.current) {
                await scannerRef.current.clear();
            }
        } catch (error) {
            console.warn(
                "QR Scanner Clear Error:",
                error
            );
        }

        scannerRef.current = null;
        isScanningRef.current = false;
    };

    const checkQr = async (qrValue) => {
        try {
            setError("");
            setResult(null);
            setVerificationLoading(true);

            const response = await fetch(
                `${API_URL}/api/staff/cricket-box/scan`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        qr_token: qrValue,
                        action: "CHECK"
                    })
                }
            );

            const data = await response.json();

            console.log("QR CHECK RESPONSE:", data);

            setResult(data);

            if (!response.ok || !data.success) {
                setError(
                    data.message ||
                    "Unable to verify QR code."
                );
            }
        } catch (error) {
            console.error(
                "QR Check Error:",
                error
            );

            setError(
                error?.message ||
                "Unable to verify QR code."
            );
        } finally {
            setVerificationLoading(false);
        }
    };

    const verifyQr = async (action) => {
        try {
            setError("");
            setVerificationLoading(true);

            const qrToken = String(
                result?.qr_token || ""
            ).trim();

            if (!qrToken) {
                setError("QR information is missing.");
                return;
            }

            if (
                action !== "ENTRY" &&
                action !== "EXIT"
            ) {
                setError("Invalid action.");
                return;
            }

            const response = await fetch(
                `${API_URL}/api/staff/cricket-box/scan`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        qr_token: qrToken,
                        action: action
                    })
                }
            );

            const data = await response.json();

            console.log(
                "QR ACTION RESPONSE:",
                data
            );

            if (!response.ok || !data.success) {
                setResult(data);

                setError(
                    data.message ||
                    "QR verification failed."
                );

                await playQrBeep("error");

                return;
            }

            // Successful ENTRY / EXIT
            setResult({
                ...data,
                qr_token: qrToken
            });

            // 🔊 SUCCESS BEEP
            await playQrBeep("success");

            // Automatically open scanner again
            setTimeout(async () => {
                setError("");
                setResult(null);
                setDecodedText("");

                processingRef.current = false;

                await startScanner();
            }, 1200);

        } catch (error) {
            console.error(
                "QR Verification Error:",
                error
            );

            setError(
                error?.message ||
                "Unable to verify QR code."
            );

            await playQrBeep("error");

        } finally {
            setVerificationLoading(false);
        }
    };
    
    const scanAnother = async () => {
        setError("");
        setResult(null);
        setDecodedText("");

        processingRef.current = false;

        await startScanner();
    };

    const handleLogout = () => {
        localStorage.removeItem("staffToken");
        localStorage.removeItem("staff");
        localStorage.removeItem("staffPhoto");

        navigate("/staff/login", {
            replace: true
        });
    };

    const goTo = (path) => {
        setSidebarOpen(false);
        navigate(path);
    };

    return (
        <div className="sq-page">

            {sidebarOpen && (
                <div
                    className="sq-overlay"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            <aside
                className={`sq-side ${sidebarOpen ? "open" : ""
                    }`}
            >
                <div className="sq-brand">
                    🏠

                    <span>
                        <strong>Hostel</strong>
                        <small>Staff Panel</small>
                    </span>
                </div>

                <nav>
                    <button
                        onClick={() =>
                            goTo("/staff/cricket-box")
                        }
                    >
                        📊 Dashboard
                    </button>

                    <button
                        className="active"
                        onClick={() =>
                            goTo(
                                "/staff/cricket-box/scan"
                            )
                        }
                    >
                        📷 Scan QR
                    </button>

                    <button
                        onClick={() =>
                            goTo(
                                "/staff/cricket-box/history"
                            )
                        }
                    >
                        📋 Scan History
                    </button>

                    <button
                        onClick={() =>
                            goTo("/staff/profile")
                        }
                    >
                        👤 My Profile
                    </button>
                </nav>

                <button
                    className="sq-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>
            </aside>

            <main className="sq-main">

                <header className="sq-top">

                    <button
                        className="sq-menu"
                        onClick={() =>
                            setSidebarOpen(true)
                        }
                    >
                        ☰
                    </button>

                    <div>
                        <h1>
                            Hostel Staff Panel
                        </h1>

                        <span>
                            Cricket Box QR Handler
                        </span>
                    </div>

                    <div className="sq-photo">
                        {staffPhoto ? (
                            <img
                                src={staffPhoto}
                                alt="Staff"
                                onError={(event) => {
                                    event.currentTarget.style.display =
                                        "none";
                                }}
                            />
                        ) : (
                            "👤"
                        )}
                    </div>

                </header>

                <section className="sq-content">

                    <span>CRICKET BOX</span>

                    <h2>
                        Scan Booking QR
                    </h2>

                    <p>
                        Scan the student's QR code
                        to allow entry or exit from the cricket box.

                    </p>

                    <div className="sq-grid">

                        <div className="sq-card">

                            <h3>
                                QR Scanner
                            </h3>

                            <div
                                id="sc-qr-reader"
                                style={{
                                    width: "100%",
                                    maxWidth: "500px",
                                    margin: "0 auto"
                                }}
                            />

                            {starting && (
                                <p className="sq-loading">
                                    Starting camera...
                                </p>
                            )}

                            {!ready &&
                                !starting &&
                                !error && (
                                    <p className="sq-loading">
                                        Camera is not running.
                                    </p>
                                )}

                            {error && (
                                <div className="sq-error">
                                    {error}
                                </div>
                            )}

                            <small>
                                Keep the QR code inside
                                the scanner frame.
                            </small>

                        </div>

                        <div className="sq-card">

                            <h3>
                                Verification Result
                            </h3>

                            {verificationLoading ? (
                                <div className="sq-empty">
                                    <div>⏳</div>
                                    <p>
                                        Verifying booking...
                                    </p>
                                </div>
                            ) : !result ? (
                                <div className="sq-empty">
                                    <div>📷</div>
                                    <p>
                                        Scan a booking QR code.
                                    </p>
                                </div>
                            ) : (
                                <div
                                    className={`sq-result ${result.success
                                        ? "valid"
                                        : "invalid"
                                        }`}
                                >
                                    <b>
                                        {result.success
                                            ? "✓"
                                            : "✕"}
                                    </b>

                                    <h4>
                                        {result.success
                                            ? "BOOKING VERIFIED"
                                            : "ENTRY DENIED"}
                                    </h4>

                                    <p>
                                        {result.message}
                                    </p>

                                    {result.booking && (
                                        <div className="sq-summary">

                                            <div>
                                                <span>
                                                    Student
                                                </span>

                                                <strong>
                                                    {
                                                        result.booking
                                                            .student_name || "-"
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Ground
                                                </span>

                                                <strong>
                                                    {
                                                        result.booking
                                                            .ground_name || "-"
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Date
                                                </span>

                                                <strong>
                                                    {
                                                        result.booking
                                                            .booking_date || "-"
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Time
                                                </span>

                                                <strong>
                                                    {result.booking.start_time
                                                        ? String(
                                                            result.booking.start_time
                                                        ).slice(0, 5)
                                                        : "-"}

                                                    {" - "}

                                                    {result.booking.end_time
                                                        ? String(
                                                            result.booking.end_time
                                                        ).slice(0, 5)
                                                        : "-"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Payment
                                                </span>

                                                <strong>
                                                    {
                                                        result.booking
                                                            .payment_status || "-"
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Action
                                                </span>

                                                <strong>
                                                    {result.success
                                                        ? result.action === "ENTRY"
                                                            ? "🟢 Allow Entry"
                                                            : result.action === "EXIT"
                                                                ? "🔵 Allow Exit"
                                                                : "🔴 Denied"
                                                        : "🔴 Denied"}
                                                </strong>
                                            </div>

                                        </div>
                                    )}

                                    {result.success && (
                                        <div className="sq-action-buttons">

                                            {result.action === "ENTRY" && (
                                                <button
                                                    type="button"
                                                    className="sq-entry-btn"
                                                    disabled={verificationLoading}
                                                    onClick={() =>
                                                        verifyQr("ENTRY")
                                                    }
                                                >
                                                    🟢 Allow Entry
                                                </button>
                                            )}

                                            {result.action === "EXIT" && (
                                                <button
                                                    type="button"
                                                    className="sq-exit-btn"
                                                    disabled={verificationLoading}
                                                    onClick={() =>
                                                        verifyQr("EXIT")
                                                    }
                                                >
                                                    🔵 Allow Exit
                                                </button>
                                            )}

                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={scanAnother}
                                    >
                                        Scan Another QR
                                    </button>
                                </div>
                            )}

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default StaffCricketQRScanner;