import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ApplyGatePass.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ApplyGatePass = () => {
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);

    const [formData, setFormData] = useState({
        destination: "",
        purpose: "",
        out_date: "",
        return_date: "",
        out_time: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const savedStudent = localStorage.getItem("student");

        if (!savedStudent) {
            setError("Student session not found. Please login again.");
            return;
        }

        try {
            setStudent(JSON.parse(savedStudent));
        } catch (err) {
            console.error("Student session error:", err);
            setError("Invalid student session. Please login again.");
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.destination.trim()) {
            setError("Please enter your destination.");
            return;
        }

        if (!formData.purpose.trim()) {
            setError("Please enter the purpose of your gate pass.");
            return;
        }

        if (!formData.out_date) {
            setError("Please select exit date.");
            return;
        }

        if (!formData.return_date) {
            setError("Please select return date.");
            return;
        }

        if (!formData.out_time) {
            setError("Please select exit time.");
            return;
        }

        if (formData.return_date < formData.out_date) {
            setError("Return date cannot be before exit date.");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("studentToken");

            if (!student?.id) {
                throw new Error("Student session not found. Please login again.");
            }

            const response = await fetch(
                `${API_URL}/api/student/gatepass/apply`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token
                            ? {
                                  Authorization: `Bearer ${token}`
                              }
                            : {})
                    },
                    body: JSON.stringify({
                        student_id: student.id,
                        destination: formData.destination.trim(),
                        purpose: formData.purpose.trim(),
                        out_date: formData.out_date,
                        return_date: formData.return_date,
                        out_time: formData.out_time
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to submit gate pass request."
                );
            }

            setSuccess(
                data.message ||
                    "Gate pass request submitted successfully. OTP has been sent to your parent."
            );

            setFormData({
                destination: "",
                purpose: "",
                out_date: "",
                return_date: "",
                out_time: ""
            });

            // OTP verification page
            if (data.gate_pass_id || data.id) {
                const gatePassId = data.gate_pass_id || data.id;

                setTimeout(() => {
                    navigate(`/student/gatepass/verify-otp/${gatePassId}`);
                }, 1000);
            }

        } catch (err) {
            console.error("Apply Gate Pass Error:", err);

            setError(
                err.message || "Failed to submit gate pass request."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("student");

        navigate("/student/login", {
            replace: true
        });
    };

    return (
        <div className="apply-gatepass-page">

            {/* ================= SIDEBAR ================= */}

            <aside className="student-sidebar">

                <div className="student-sidebar-brand">

                    <div className="student-brand-icon">
                        🏠
                    </div>

                    <div>
                        <h2>Hostel</h2>
                        <span>Student Portal</span>
                    </div>

                </div>

                <nav className="student-sidebar-nav">

                    <button
                        className="student-nav-item"
                        onClick={() =>
                            navigate("/student/dashboard")
                        }
                    >
                        📊
                        <span>Dashboard</span>
                    </button>

                    <button
                        className="student-nav-item"
                        onClick={() =>
                            navigate("/student/profile")
                        }
                    >
                        👤
                        <span>My Profile</span>
                    </button>

                    <button
                        className="student-nav-item"
                        onClick={() =>
                            navigate("/student/room")
                        }
                    >
                        🛏️
                        <span>My Room</span>
                    </button>

                    <button
                        className="student-nav-item"
                        onClick={() =>
                            navigate("/student/leave")
                        }
                    >
                        📄
                        <span>My Leave</span>
                    </button>

                    <button
                        className="student-nav-item active"
                        onClick={() =>
                            navigate("/student/gatepass")
                        }
                    >
                        🎫
                        <span>Gate Pass</span>
                    </button>

                    <button
                        className="student-nav-item"
                        onClick={() =>
                            navigate("/student/complaints")
                        }
                    >
                        🛠️
                        <span>Complaints</span>
                    </button>

                    <button
                        className="student-nav-item"
                        onClick={() =>
                            navigate("/student/fees")
                        }
                    >
                        💰
                        <span>My Fees</span>
                    </button>

                    <button
                        className="student-nav-item"
                        onClick={() =>
                            navigate("/student/notifications")
                        }
                    >
                        🔔
                        <span>Notifications</span>
                    </button>

                </nav>

                <button
                    className="student-logout-button"
                    onClick={handleLogout}
                >
                    🚪
                    <span>Logout</span>
                </button>

            </aside>


            {/* ================= MAIN CONTENT ================= */}

            <main className="apply-gatepass-main">

                {/* HEADER */}

                <div className="apply-gatepass-header">

                    <div>
                        <span className="apply-gatepass-eyebrow">
                            GATE PASS
                        </span>

                        <h1>Apply Gate Pass</h1>

                        <p>
                            Submit a gate pass request for going outside
                            the hostel.
                        </p>
                    </div>

                    <button
                        className="apply-gatepass-back"
                        onClick={() =>
                            navigate("/student/gatepass")
                        }
                    >
                        ← My Gate Pass
                    </button>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="apply-gatepass-alert error">

                        <span>⚠️</span>

                        <span>{error}</span>

                        <button
                            onClick={() => setError("")}
                        >
                            ×
                        </button>

                    </div>
                )}


                {/* SUCCESS */}

                {success && (
                    <div className="apply-gatepass-alert success">

                        <span>✓</span>

                        <span>{success}</span>

                        <button
                            onClick={() => setSuccess("")}
                        >
                            ×
                        </button>

                    </div>
                )}


                {/* FORM CARD */}

                <section className="apply-gatepass-card">

                    <div className="apply-gatepass-card-header">

                        <div className="apply-gatepass-card-icon">
                            🎫
                        </div>

                        <div>
                            <h2>Gate Pass Request</h2>

                            <p>
                                Fill in the details for your outing.
                            </p>
                        </div>

                    </div>


                    <form
                        className="apply-gatepass-form"
                        onSubmit={handleSubmit}
                    >

                        {/* STUDENT INFORMATION */}

                        <div className="apply-gatepass-section">

                            <div className="apply-gatepass-section-title">
                                👤 Student Information
                            </div>

                            <div className="apply-gatepass-student-box">

                                <div className="apply-gatepass-student-avatar">
                                    {student?.photo ? (
                                        <img
                                            src={
                                                student.photo.startsWith(
                                                    "http"
                                                )
                                                    ? student.photo
                                                    : `${API_URL}/${student.photo.replace(
                                                          /^\/+/,
                                                          ""
                                                      )}`
                                            }
                                            alt="Student"
                                        />
                                    ) : (
                                        "👨‍🎓"
                                    )}
                                </div>

                                <div className="apply-gatepass-student-info">

                                    <strong>
                                        {student?.name || "Student"}
                                    </strong>

                                    <span>
                                        {student?.email ||
                                            "Student email"}
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* DESTINATION */}

                        <div className="apply-gatepass-section">

                            <div className="apply-gatepass-section-title">
                                📍 Gate Pass Details
                            </div>

                            <div className="apply-gatepass-field">

                                <label>
                                    Destination
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="destination"
                                    value={formData.destination}
                                    onChange={handleChange}
                                    placeholder="Enter destination"
                                    maxLength={255}
                                />

                            </div>


                            <div className="apply-gatepass-field">

                                <label>
                                    Purpose
                                    <span>*</span>
                                </label>

                                <textarea
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    placeholder="Enter reason for going outside"
                                    rows="4"
                                    maxLength={500}
                                />

                            </div>


                            <div className="apply-gatepass-row">

                                <div className="apply-gatepass-field">

                                    <label>
                                        Exit Date
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="date"
                                        name="out_date"
                                        value={formData.out_date}
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="apply-gatepass-field">

                                    <label>
                                        Return Date
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="date"
                                        name="return_date"
                                        value={formData.return_date}
                                        min={
                                            formData.out_date ||
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>


                            <div className="apply-gatepass-field">

                                <label>
                                    Exit Time
                                    <span>*</span>
                                </label>

                                <input
                                    type="time"
                                    name="out_time"
                                    value={formData.out_time}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>


                        {/* PARENT VERIFICATION */}

                        <div className="apply-gatepass-parent-box">

                            <div className="apply-gatepass-parent-icon">
                                ✉️
                            </div>

                            <div>

                                <strong>
                                    Parent Verification Required
                                </strong>

                                <p>
                                    An OTP will be sent to your registered
                                    parent's email after submitting this
                                    request.
                                </p>

                            </div>

                        </div>


                        {/* SUBMIT */}

                        <div className="apply-gatepass-form-footer">

                            <button
                                type="button"
                                className="apply-gatepass-cancel"
                                onClick={() =>
                                    navigate("/student/gatepass")
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="apply-gatepass-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Submitting..."
                                    : "Submit Gate Pass"}
                            </button>

                        </div>

                    </form>

                </section>

            </main>

        </div>
    );
};

export default ApplyGatePass;