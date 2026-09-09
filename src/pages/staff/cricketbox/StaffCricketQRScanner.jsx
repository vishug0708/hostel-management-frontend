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
            setError("");
            setResult(null);
            setDecodedText("");

            const element = document.getElementById(
                "sc-qr-reader"
            );

            if (!element) {
                throw new Error(
                    "QR scanner container not found."
                );
            }

            element.innerHTML = "";

            const scanner = new Html5Qrcode(
                "sc-qr-reader",
                {
                    formatsToSupport: [
                        Html5QrcodeSupportedFormats.QR_CODE
                    ],
                    verbose: false
                }
            );

            scannerRef.current = scanner;

            await scanner.start(
                {
                    facingMode: {
                        ideal: "environment"
                    }
                },
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

                    const qrValue = String(
                        decodedText || ""
                    ).trim();

                    setDecodedText(qrValue);

                    console.log(
                        "QR DETECTED:",
                        qrValue
                    );

                    if (!qrValue) {
                        processingRef.current = false;
                        return;
                    }

                    await verifyQr(qrValue);
                },
                (scanErrorMessage) => {
                    // html5-qrcode continuously calls this
                    // while searching for a QR.
                    // Do not show these normal scan errors
                    // on the UI.
                }
            );

            isScanningRef.current = true;
            setReady(true);
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

    const verifyQr = async (qrToken) => {
        try {
            setError("");
            setResult(null);

            console.log(
                "Sending QR token to backend:",
                qrToken
            );

            const response = await fetch(
                `${API_URL}/api/staff/cricket-box/scan`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        qr_token: qrToken
                    })
                }
            );

            const data = await response.json();

            console.log(
                "QR Backend Response:",
                data
            );

            setResult(data);

            if (!response.ok || !data.success) {
                setError(
                    data.message ||
                    "QR verification failed."
                );
            }

            // Stop camera after successful detection.
            await stopScanner();
            setReady(false);
        } catch (error) {
            console.error(
                "QR Verification Error:",
                error
            );

            setError(
                error?.message ||
                "Unable to verify QR code."
            );
        } finally {
            processingRef.current = false;
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
                className={`sq-side ${
                    sidebarOpen ? "open" : ""
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
                        to verify cricket box entry.
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

                            {decodedText && (
                                <div
                                    style={{
                                        marginTop: "15px",
                                        padding: "12px",
                                        background: "#f1f5f9",
                                        borderRadius: "8px",
                                        wordBreak: "break-all",
                                        fontSize: "12px"
                                    }}
                                >
                                    <strong>
                                        QR Detected:
                                    </strong>

                                    <br />

                                    {decodedText}
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

                            {!result ? (
                                <div className="sq-empty">

                                    📷

                                    <p>
                                        Scan a QR code to
                                        verify the booking.
                                    </p>

                                </div>
                            ) : (
                                <div
                                    className={`sq-result ${
                                        result.success
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
                                            ? "ENTRY ALLOWED"
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
                                                        result
                                                            .booking
                                                            .student_name ||
                                                        "-"
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Ground
                                                </span>

                                                <strong>
                                                    {
                                                        result
                                                            .booking
                                                            .ground_name ||
                                                        "-"
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Date
                                                </span>

                                                <strong>
                                                    {
                                                        result
                                                            .booking
                                                            .booking_date ||
                                                        "-"
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Time
                                                </span>

                                                <strong>
                                                    {result
                                                        .booking
                                                        .start_time
                                                        ? String(
                                                              result
                                                                  .booking
                                                                  .start_time
                                                          ).slice(
                                                              0,
                                                              5
                                                          )
                                                        : "-"}{" "}
                                                    -{" "}
                                                    {result
                                                        .booking
                                                        .end_time
                                                        ? String(
                                                              result
                                                                  .booking
                                                                  .end_time
                                                          ).slice(
                                                              0,
                                                              5
                                                          )
                                                        : "-"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Payment
                                                </span>

                                                <strong>
                                                    {
                                                        result
                                                            .booking
                                                            .payment_status ||
                                                        "-"
                                                    }
                                                </strong>
                                            </div>

                                        </div>
                                    )}

                                    <button
                                        onClick={
                                            scanAnother
                                        }
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