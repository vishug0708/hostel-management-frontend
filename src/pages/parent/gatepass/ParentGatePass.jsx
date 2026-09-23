import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./ParentGatePass.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ParentGatePass = () => {
    const navigate = useNavigate();
    const { gatePassId } = useParams();
    const [searchParams] = useSearchParams();
    const token = useMemo(
        () => searchParams.get("token") || "",
        [searchParams]
    );

    const [gatePass, setGatePass] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadGatePass = async () => {
            if (!token) {
                setError("This gate pass review link is invalid or expired.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `${API_URL}/api/parent/gatepass/${gatePassId}?token=${encodeURIComponent(token)}`
                );
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Unable to load gate pass."
                    );
                }

                setGatePass(data.gatePass);
            } catch (err) {
                console.error("Parent Gate Pass Error:", err);
                setError(
                    err.message || "Unable to load gate pass."
                );
            } finally {
                setLoading(false);
            }
        };

        loadGatePass();
    }, [gatePassId, token]);

    const getStudentPhoto = () => {
        if (!gatePass?.photo) {
            return "";
        }

        const photo = String(gatePass.photo).trim();

        if (
            photo.startsWith("data:") ||
            photo.startsWith("blob:") ||
            photo.startsWith("http://") ||
            photo.startsWith("https://")
        ) {
            return photo;
        }

        const normalizedPhoto = photo.replace(/^\/+/, "");

        if (normalizedPhoto.startsWith("uploads/")) {
            return `${API_URL}/${normalizedPhoto}`;
        }

        return `${API_URL}/uploads/students/${normalizedPhoto}`;
    };

    const formatDate = (value) => {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    };

    const formatTime = (value) => {
        if (!value) {
            return "—";
        }

        const parts = String(value).split(":");
        const hours = Number(parts[0]);
        const minutes = Number(parts[1]);

        if (Number.isNaN(hours) || Number.isNaN(minutes)) {
            return value;
        }

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    const handleDecision = async (decision) => {
        setError("");
        setMessage("");

        const confirmed = window.confirm(
            decision === "approve"
                ? "Are you sure you want to approve this gate pass?"
                : "Are you sure you want to reject this gate pass?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);

            const response = await fetch(
                `${API_URL}/api/parent/gatepass/${gatePassId}/${decision}?token=${encodeURIComponent(token)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to update gate pass."
                );
            }

            setGatePass((previous) => ({
                ...previous,
                parent_decision:
                    decision === "approve"
                        ? "Approved"
                        : "Rejected"
            }));

            setMessage(data.message || "Gate pass status updated successfully.");
        } catch (err) {
            console.error("Parent Gate Pass Decision Error:", err);
            setError(
                err.message || "Unable to update gate pass."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const photo = getStudentPhoto();
    const parentDecision = String(
        gatePass?.parent_decision || "Pending"
    );
    const isApproved = parentDecision === "Approved";
    const isRejected = parentDecision === "Rejected";

    if (loading) {
        return (
            <main className="parentgatepass-page">
                <section className="parentgatepass-state-card">
                    <div className="parentgatepass-state-icon">⏳</div>
                    <h1>Loading Gate Pass</h1>
                    <p>Please wait while the gate pass details are loaded.</p>
                </section>
            </main>
        );
    }

    if (!gatePass) {
        return (
            <main className="parentgatepass-page">
                <section className="parentgatepass-state-card">
                    <div className="parentgatepass-state-icon">⚠️</div>
                    <h1>Gate Pass Unavailable</h1>
                    <p>{error || "This gate pass could not be loaded."}</p>
                </section>
            </main>
        );
    }

    return (
        <main className="parentgatepass-page">
            <section className="parentgatepass-card">
                <header className="parentgatepass-header">
                    <div className="parentgatepass-brand-icon">🏠</div>
                    <div>
                        <strong>Virtuous Hostel</strong>
                        <span>Parent Gate Pass Portal</span>
                    </div>
                </header>

                <div className="parentgatepass-body">
                    <div className="parentgatepass-title">
                        <p>PARENT REVIEW</p>
                        <h1>Gate Pass Request</h1>
                        <span>
                            Review the request carefully before making your decision.
                        </span>
                    </div>

                    <div className="parentgatepass-student">
                        <div className="parentgatepass-photo-wrap">
                            {photo ? (
                                <img
                                    src={photo}
                                    alt={gatePass.student_name || "Student"}
                                    className="parentgatepass-photo"
                                    onError={(event) => {
                                        event.currentTarget.style.display = "none";
                                        event.currentTarget.nextElementSibling.style.display = "flex";
                                    }}
                                />
                            ) : null}
                            <div
                                className="parentgatepass-photo-placeholder"
                                style={{ display: photo ? "none" : "flex" }}
                            >
                                👤
                            </div>
                        </div>

                        <div className="parentgatepass-student-info">
                            <span>STUDENT</span>
                            <h2>{gatePass.student_name || "—"}</h2>
                            <p>
                                {gatePass.college || "—"}
                                {gatePass.course
                                    ? ` • ${gatePass.course}`
                                    : ""}
                            </p>
                            <small>
                                Gate Pass ID: GP-{gatePass.id}
                            </small>
                        </div>
                    </div>

                    {error && (
                        <div className="parentgatepass-alert parentgatepass-alert-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {message && (
                        <div className="parentgatepass-alert parentgatepass-alert-success">
                            ✓ {message}
                        </div>
                    )}

                    <section className="parentgatepass-details">
                        <h3>Gate Pass Details</h3>

                        <div className="parentgatepass-grid">
                            <div>
                                <span>Destination</span>
                                <strong>{gatePass.destination || "—"}</strong>
                            </div>
                            <div>
                                <span>Purpose</span>
                                <strong>{gatePass.purpose || "—"}</strong>
                            </div>
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
                                <strong>{formatDate(gatePass.return_date)}</strong>
                            </div>
                            <div>
                                <span>Return Time</span>
                                <strong>{formatTime(gatePass.return_time)}</strong>
                            </div>
                        </div>
                    </section>

                    <div className={`parentgatepass-status ${
                        isApproved
                            ? "approved"
                            : isRejected
                                ? "rejected"
                                : "pending"
                    }`}>
                        <span>Parent Decision</span>
                        <strong>
                            {isApproved
                                ? "✓ Approved"
                                : isRejected
                                    ? "✕ Rejected"
                                    : "Pending Decision"}
                        </strong>
                    </div>

                    {!isApproved && !isRejected && (
                        <div className="parentgatepass-actions">
                            <button
                                type="button"
                                className="parentgatepass-reject"
                                onClick={() => handleDecision("reject")}
                                disabled={actionLoading}
                            >
                                {actionLoading ? "Please wait..." : "Reject"}
                            </button>
                            <button
                                type="button"
                                className="parentgatepass-approve"
                                onClick={() => handleDecision("approve")}
                                disabled={actionLoading}
                            >
                                {actionLoading ? "Please wait..." : "Approve Gate Pass"}
                            </button>
                        </div>
                    )}

                    {isApproved && (
                        <div className="parentgatepass-next-step">
                            Parent approval is complete. The gate pass is now waiting for rector approval.
                        </div>
                    )}

                    {isRejected && (
                        <div className="parentgatepass-next-step rejected-note">
                            This gate pass request has been rejected by the parent.
                        </div>
                    )}

                    <p className="parentgatepass-footer-note">
                        QR code generation happens only after parent approval and rector approval.
                    </p>
                </div>
            </section>
        </main>
    );
};

export default ParentGatePass;
