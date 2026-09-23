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
    const [menuOpen, setMenuOpen] = useState(false);

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

    const handleNavigation = (path) => {
        setMenuOpen(false);
        navigate(path);
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
    
    const formatDateForTable = (date) => {
        if (!date) {
            return "—";
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return String(date).slice(0, 10);
        }

        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const formatTimeForTable = (time) => {
        if (!time) {
            return "—";
        }

        return String(time).slice(0, 5);
    };


    return (
        <div className="my-gatepass-page">
            <main className="my-gatepass-main">
                <section className="my-gatepass-panel">
                    <div className="my-gatepass-title">
                        <span className="my-gatepass-title-icon">📋</span>
                        <h1>My Gatepasses</h1>
                    </div>

                    {error && (
                        <div className="my-gatepass-alert">
                            <span>⚠️</span>
                            <span>{error}</span>
                            <button type="button" onClick={() => setError("")}>×</button>
                        </div>
                    )}

                    {loading && (
                        <div className="my-gatepass-loading">
                            <div className="gatepass-spinner"></div>
                            <p>Loading gate passes...</p>
                        </div>
                    )}

                    {!loading && !error && gatePasses.length === 0 && (
                        <div className="my-gatepass-empty">
                            <div className="empty-gatepass-icon">🎫</div>
                            <h2>No Gate Pass Found</h2>
                            <p>You have not applied for any gate pass yet.</p>
                            <button
                                type="button"
                                onClick={() => navigate("/student/gatepass/apply")}
                            >
                                Apply Gate Pass
                            </button>
                        </div>
                    )}

                    {!loading && gatePasses.length > 0 && (
                        <div className="gatepass-table-wrapper">
                            <table className="gatepass-table">
                                <thead>
                                    <tr>
                                        <th>Exit Date</th>
                                        <th>Exit Time</th>
                                        <th>Return Date</th>
                                        <th>Return Time</th>
                                        <th>Parent</th>
                                        <th>Rector</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gatePasses.map((gatePass) => {
                                        const rectorStatus = String(gatePass.rector || "").toLowerCase();
                                        const otpStatus = String(gatePass.otp_verified || "").toLowerCase();

                                        const parentStatus =
                                            String(gatePass.status || "").toLowerCase() === "withdrawn" ||
                                            otpStatus.includes("withdrawn")
                                                ? "Withdrawn"
                                                : otpStatus === "yes"
                                                    ? "Approved"
                                                    : "Pending";

                                        const displayRector =
                                            rectorStatus.includes("withdrawn")
                                                ? "Withdrawn by Student"
                                                : rectorStatus === "approved" || rectorStatus === "approve"
                                                    ? "Approved"
                                                    : rectorStatus.includes("reject")
                                                        ? "Rejected"
                                                        : gatePass.rector || "Pending";

                                        const parentClass =
                                            parentStatus === "Approved"
                                                ? "status-approved"
                                                : parentStatus === "Withdrawn"
                                                    ? "status-withdrawn"
                                                    : "status-pending";

                                        const rectorClass =
                                            displayRector === "Approved"
                                                ? "status-approved"
                                                : displayRector === "Withdrawn by Student" || displayRector === "Rejected"
                                                    ? "status-withdrawn"
                                                    : "status-pending";

                                        const isWithdrawn =
                                            parentStatus === "Withdrawn" ||
                                            displayRector === "Withdrawn by Student" ||
                                            String(gatePass.status || "").toLowerCase() === "withdrawn";

                                        return (
                                            <tr key={gatePass.id}>
                                                <td>{formatDateForTable(gatePass.out_date)}</td>
                                                <td>{formatTimeForTable(gatePass.out_time)}</td>
                                                <td>{formatDateForTable(gatePass.return_date)}</td>
                                                <td>{formatTimeForTable(gatePass.return_time)}</td>
                                                <td>
                                                    <span className={`gatepass-status-badge ${parentClass}`}>
                                                        {parentStatus}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`gatepass-status-badge ${rectorClass}`}>
                                                        {displayRector}
                                                    </span>
                                                </td>
                                                <td>
                                                    {isWithdrawn ? (
                                                        <button
                                                            type="button"
                                                            className="gatepass-action-button withdrawn"
                                                            onClick={() => handleViewGatePass(gatePass)}
                                                        >
                                                            Withdrawn
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="gatepass-action-button"
                                                            onClick={() => handleViewGatePass(gatePass)}
                                                        >
                                                            View
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default MyGatePass;
