import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ViewComplaint.css";

const API_URL = import.meta.env.VITE_API_URL || "";

const menuItems = [
    { label: "Dashboard", path: "/student/dashboard" },
    { label: "My Profile", path: "/student/profile" },
    { label: "My Room", path: "/student/my-room" },
    { label: "My Leave", path: "/student/my-leave" },
    { label: "Apply Leave", path: "/student/apply-leave" },
    { label: "Gate Pass", path: "/student/gatepass" },
    { label: "Complaints", path: "/student/complaints" },
    { label: "My Fees", path: "/student/fees" },
    { label: "Notifications", path: "/student/notifications" },
    { label: "Cricket Box", path: "/student/cricketbox" }
];

const statusSteps = [
    "Submitted",
    "Assigned",
    "In Progress",
    "Resolution Pending",
    "OTP Verification",
    "Closed"
];

const ViewComplaint = () => {
    const navigate = useNavigate();
    const { id, complaintId } = useParams();

    const currentComplaintId = complaintId || id;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [student, setStudent] = useState(null);
    const [complaint, setComplaint] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedStudent =
            localStorage.getItem("student");

        if (storedStudent) {
            try {
                setStudent(JSON.parse(storedStudent));
            } catch (parseError) {
                console.error(
                    "Student data parse error:",
                    parseError
                );
            }
        }
    }, []);

    useEffect(() => {
        if (!currentComplaintId) {
            setError("Complaint ID is missing.");
            setLoading(false);
            return;
        }

        fetchComplaint();
    }, [currentComplaintId]);

    const getToken = () => {
        return (
            localStorage.getItem("studentToken") ||
            localStorage.getItem("token")
        );
    };

    const getStudentId = () => {
        if (student?.id) {
            return student.id;
        }

        if (student?.student_id) {
            return student.student_id;
        }

        return null;
    };

    const getPhotoUrl = (photo) => {
        if (!photo) {
            return "";
        }

        if (
            photo.startsWith("http://") ||
            photo.startsWith("https://")
        ) {
            return photo;
        }

        return `${API_URL}/${photo.replace(/^\/+/, "")}`;
    };

    const fetchComplaint = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();
            const studentId = getStudentId();

            let endpoint;

            if (studentId) {
                endpoint = `${API_URL}/api/student/complaints/${studentId}/${currentComplaintId}`;
            } else {
                endpoint = `${API_URL}/api/student/complaints/${currentComplaintId}`;
            }

            const response = await fetch(endpoint, {
                headers: token
                    ? {
                          Authorization: `Bearer ${token}`
                      }
                    : {}
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to load complaint."
                );
            }

            const complaintData =
                data.complaint ||
                data.data ||
                data;

            setComplaint(complaintData);
        } catch (fetchError) {
            console.error(
                "View Complaint Error:",
                fetchError
            );

            setError(
                fetchError.message ||
                    "Failed to load complaint."
            );
        } finally {
            setLoading(false);
        }
    };

    const getCurrentStatusIndex = () => {
        if (!complaint?.status) {
            return 0;
        }

        const index = statusSteps.indexOf(
            complaint.status
        );

        return index >= 0 ? index : 0;
    };

    const getStatusClass = () => {
        const status =
            String(
                complaint?.status || ""
            ).toLowerCase();

        if (status === "closed") {
            return "closed";
        }

        if (
            status === "otp verification"
        ) {
            return "otp";
        }

        if (
            status === "resolution pending"
        ) {
            return "pending";
        }

        if (status === "in progress") {
            return "progress";
        }

        if (status === "assigned") {
            return "assigned";
        }

        return "submitted";
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "Not available";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatDate = (value) => {
        if (!value) {
            return "Not available";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const handleLogout = () => {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("token");
        localStorage.removeItem("student");

        navigate("/student/login");
    };

    const handleMenuClick = (path) => {
        setSidebarOpen(false);
        navigate(path);
    };

    const renderValue = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "Not available";
        }

        return value;
    };

    if (loading) {
        return (
            <div className="view-complaint-loading">
                <div className="view-complaint-loader"></div>
                <p>Loading complaint...</p>
            </div>
        );
    }

    return (
        <div className="student-view-complaint-page">
            <aside
                className={`student-view-complaint-sidebar ${
                    sidebarOpen ? "open" : ""
                }`}
            >
                <div className="student-view-complaint-sidebar-header">
                    <div className="student-view-complaint-logo">
                        HMS
                    </div>

                    <div>
                        <h2>Student Panel</h2>
                        <span>
                            Hostel Management
                        </span>
                    </div>
                </div>

                <nav className="student-view-complaint-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            type="button"
                            className={`student-view-complaint-nav-item ${
                                item.path ===
                                "/student/complaints"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                handleMenuClick(
                                    item.path
                                )
                            }
                        >
                            <span>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </nav>

                <button
                    type="button"
                    className="student-view-complaint-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </aside>

            {sidebarOpen && (
                <div
                    className="student-view-complaint-overlay"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            <main className="student-view-complaint-main">
                <header className="student-view-complaint-header">
                    <button
                        type="button"
                        className="student-view-complaint-menu-button"
                        onClick={() =>
                            setSidebarOpen(
                                !sidebarOpen
                            )
                        }
                        aria-label="Toggle menu"
                    >
                        ☰
                    </button>

                    <div className="student-view-complaint-header-title">
                        <h1>
                            Complaint Details
                        </h1>
                        <p>
                            View your complaint status
                            and assigned staff
                        </p>
                    </div>

                    <div className="student-view-complaint-profile">
                        {student?.photo ? (
                            <img
                                src={getPhotoUrl(
                                    student.photo
                                )}
                                alt={
                                    student?.name ||
                                    "Student"
                                }
                            />
                        ) : (
                            <div className="student-view-complaint-profile-placeholder">
                                {student?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                    "S"}
                            </div>
                        )}

                        <div className="student-view-complaint-profile-info">
                            <strong>
                                {student?.name ||
                                    "Student"}
                            </strong>
                            <span>
                                Student
                            </span>
                        </div>
                    </div>
                </header>

                <section className="view-complaint-content">
                    <div className="view-complaint-top">
                        <button
                            type="button"
                            className="view-complaint-back"
                            onClick={() =>
                                navigate(
                                    "/student/complaints"
                                )
                            }
                        >
                            ← Back to Complaints
                        </button>
                    </div>

                    {error ? (
                        <div className="view-complaint-error">
                            <div className="view-complaint-error-icon">
                                !
                            </div>

                            <h2>
                                Unable to Load
                                Complaint
                            </h2>

                            <p>{error}</p>

                            <div className="view-complaint-error-actions">
                                <button
                                    type="button"
                                    onClick={
                                        fetchComplaint
                                    }
                                >
                                    Try Again
                                </button>

                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={() =>
                                        navigate(
                                            "/student/complaints"
                                        )
                                    }
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    ) : !complaint ? (
                        <div className="view-complaint-error">
                            <div className="view-complaint-error-icon">
                                !
                            </div>

                            <h2>
                                Complaint Not Found
                            </h2>

                            <p>
                                The requested complaint
                                could not be found.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/student/complaints"
                                    )
                                }
                            >
                                Back to Complaints
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="view-complaint-title-card">
                                <div>
                                    <span className="view-complaint-label">
                                        Complaint ID
                                    </span>

                                    <h2>
                                        {complaint.complaint_code ||
                                            `#${complaint.id}`}
                                    </h2>

                                    <p>
                                        Submitted on{" "}
                                        {formatDateTime(
                                            complaint.created_at
                                        )}
                                    </p>
                                </div>

                                <span
                                    className={`view-complaint-status ${getStatusClass()}`}
                                >
                                    {renderValue(
                                        complaint.status
                                    )}
                                </span>
                            </div>

                            <div className="view-complaint-progress-card">
                                <div className="view-complaint-card-heading">
                                    <div>
                                        <h3>
                                            Complaint
                                            Progress
                                        </h3>
                                        <p>
                                            Track your
                                            complaint
                                            resolution
                                        </p>
                                    </div>
                                </div>

                                <div className="view-complaint-progress">
                                    {statusSteps.map(
                                        (
                                            step,
                                            index
                                        ) => {
                                            const currentIndex =
                                                getCurrentStatusIndex();

                                            const completed =
                                                index <=
                                                currentIndex;

                                            return (
                                                <div
                                                    className={`view-complaint-progress-step ${
                                                        completed
                                                            ? "completed"
                                                            : ""
                                                    } ${
                                                        index ===
                                                        currentIndex
                                                            ? "current"
                                                            : ""
                                                    }`}
                                                    key={
                                                        step
                                                    }
                                                >
                                                    <div className="view-complaint-progress-dot">
                                                        {completed
                                                            ? "✓"
                                                            : index +
                                                              1}
                                                    </div>

                                                    <span>
                                                        {
                                                            step
                                                        }
                                                    </span>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>

                            <div className="view-complaint-layout">
                                <div className="view-complaint-left">
                                    <div className="view-complaint-card">
                                        <div className="view-complaint-card-heading">
                                            <div>
                                                <h3>
                                                    Complaint
                                                    Information
                                                </h3>
                                                <p>
                                                    Details
                                                    submitted
                                                    by you
                                                </p>
                                            </div>
                                        </div>

                                        <div className="view-complaint-info-grid">
                                            <div className="view-complaint-info-item">
                                                <span>
                                                    Category
                                                </span>
                                                <strong>
                                                    {renderValue(
                                                        complaint.category
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="view-complaint-info-item">
                                                <span>
                                                    Subject
                                                </span>
                                                <strong>
                                                    {renderValue(
                                                        complaint.subject
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="view-complaint-info-item full">
                                                <span>
                                                    Description
                                                </span>
                                                <p>
                                                    {renderValue(
                                                        complaint.description
                                                    )}
                                                </p>
                                            </div>

                                            <div className="view-complaint-info-item">
                                                <span>
                                                    Complaint
                                                    Created
                                                </span>
                                                <strong>
                                                    {formatDateTime(
                                                        complaint.created_at
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="view-complaint-info-item">
                                                <span>
                                                    Assigned
                                                    Date
                                                </span>
                                                <strong>
                                                    {formatDateTime(
                                                        complaint.assigned_at
                                                    )}
                                                </strong>
                                            </div>
                                        </div>

                                        {complaint.attachment && (
                                            <div className="view-complaint-attachment">
                                                <span>
                                                    Attachment
                                                </span>

                                                <a
                                                    href={
                                                        complaint.attachment.startsWith(
                                                            "http"
                                                        )
                                                            ? complaint.attachment
                                                            : `${API_URL}/${complaint.attachment.replace(
                                                                  /^\/+/,
                                                                  ""
                                                              )}`
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    View
                                                    Attachment
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="view-complaint-card">
                                        <div className="view-complaint-card-heading">
                                            <div>
                                                <h3>
                                                    Backup
                                                    Student
                                                </h3>
                                                <p>
                                                    Mandatory
                                                    backup
                                                    contact
                                                </p>
                                            </div>
                                        </div>

                                        <div className="view-backup-student">
                                            <div className="view-backup-student-photo">
                                                {complaint.backup_student_photo ? (
                                                    <img
                                                        src={getPhotoUrl(
                                                            complaint.backup_student_photo
                                                        )}
                                                        alt={
                                                            complaint.backup_student_name ||
                                                            "Backup Student"
                                                        }
                                                    />
                                                ) : (
                                                    <div className="view-backup-student-placeholder">
                                                        {complaint.backup_student_name
                                                            ?.charAt(
                                                                0
                                                            )
                                                            ?.toUpperCase() ||
                                                            "S"}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="view-backup-student-details">
                                                <div>
                                                    <span>
                                                        Name
                                                    </span>
                                                    <strong>
                                                        {renderValue(
                                                            complaint.backup_student_name
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Student
                                                        ID
                                                    </span>
                                                    <strong>
                                                        {renderValue(
                                                            complaint.backup_student_id
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Mobile
                                                    </span>
                                                    <strong>
                                                        {renderValue(
                                                            complaint.backup_student_mobile
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Email
                                                    </span>
                                                    <strong>
                                                        {renderValue(
                                                            complaint.backup_student_email
                                                        )}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {complaint.resolution_note && (
                                        <div className="view-complaint-card">
                                            <div className="view-complaint-card-heading">
                                                <div>
                                                    <h3>
                                                        Resolution
                                                        Details
                                                    </h3>
                                                    <p>
                                                        Information
                                                        provided
                                                        by assigned
                                                        staff
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="view-resolution-box">
                                                <span>
                                                    Resolution
                                                    Note
                                                </span>

                                                <p>
                                                    {
                                                        complaint.resolution_note
                                                    }
                                                </p>
                                            </div>

                                            <div className="view-resolution-meta">
                                                <div>
                                                    <span>
                                                        Resolution
                                                        Marked
                                                    </span>
                                                    <strong>
                                                        {formatDateTime(
                                                            complaint.resolution_marked_at
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        OTP
                                                        Status
                                                    </span>
                                                    <strong>
                                                        {complaint.otp_verified ===
                                                        "Yes"
                                                            ? "Verified"
                                                            : "Pending"}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {complaint.status ===
                                        "Closed" && (
                                        <div className="view-complaint-card">
                                            <div className="view-complaint-card-heading">
                                                <div>
                                                    <h3>
                                                        Complaint
                                                        Rating
                                                    </h3>
                                                    <p>
                                                        Feedback
                                                        after
                                                        resolution
                                                    </p>
                                                </div>
                                            </div>

                                            {complaint.rating ? (
                                                <div className="view-rating-section">
                                                    <div className="view-rating-stars">
                                                        {[
                                                            1,
                                                            2,
                                                            3,
                                                            4,
                                                            5
                                                        ].map(
                                                            (
                                                                star
                                                            ) => (
                                                                <span
                                                                    key={
                                                                        star
                                                                    }
                                                                    className={
                                                                        star <=
                                                                        Number(
                                                                            complaint.rating
                                                                        )
                                                                            ? "filled"
                                                                            : ""
                                                                    }
                                                                >
                                                                    ★
                                                                </span>
                                                            )
                                                        )}
                                                    </div>

                                                    {complaint.rating_feedback && (
                                                        <p className="view-rating-feedback">
                                                            "
                                                            {
                                                                complaint.rating_feedback
                                                            }
                                                            "
                                                        </p>
                                                    )}

                                                    <small>
                                                        Rated
                                                        on{" "}
                                                        {formatDate(
                                                            complaint.rated_at
                                                        )}
                                                    </small>
                                                </div>
                                            ) : (
                                                <div className="view-rating-pending">
                                                    <strong>
                                                        Rating
                                                        pending
                                                    </strong>
                                                    <p>
                                                        A rating
                                                        request
                                                        will be
                                                        available
                                                        after the
                                                        complaint
                                                        is closed.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <aside className="view-complaint-right">
                                    <div className="view-complaint-card assigned-staff-card">
                                        <div className="view-complaint-card-heading">
                                            <div>
                                                <h3>
                                                    Assigned
                                                    Staff
                                                </h3>
                                                <p>
                                                    Automatically
                                                    assigned
                                                </p>
                                            </div>
                                        </div>

                                        {complaint.assigned_staff_id ||
                                        complaint.assigned_staff_name ? (
                                            <>
                                                <div className="assigned-staff-profile">
                                                    <div className="assigned-staff-photo">
                                                        {complaint.assigned_staff_photo ? (
                                                            <img
                                                                src={getPhotoUrl(
                                                                    complaint.assigned_staff_photo
                                                                )}
                                                                alt={
                                                                    complaint.assigned_staff_name ||
                                                                    "Staff"
                                                                }
                                                            />
                                                        ) : (
                                                            <div className="assigned-staff-placeholder">
                                                                {complaint.assigned_staff_name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    ?.toUpperCase() ||
                                                                    "S"}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <h4>
                                                            {renderValue(
                                                                complaint.assigned_staff_name
                                                            )}
                                                        </h4>

                                                        <span>
                                                            {renderValue(
                                                                complaint.assigned_staff_role
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="assigned-staff-info">
                                                    <div>
                                                        <span>
                                                            Staff
                                                            ID
                                                        </span>
                                                        <strong>
                                                            {renderValue(
                                                                complaint.assigned_staff_id
                                                            )}
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            Mobile
                                                        </span>
                                                        <strong>
                                                            {renderValue(
                                                                complaint.assigned_staff_mobile
                                                            )}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="assigned-staff-empty">
                                                <strong>
                                                    Not assigned
                                                </strong>
                                                <p>
                                                    Staff will
                                                    be assigned
                                                    automatically.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="view-complaint-card">
                                        <div className="view-complaint-card-heading">
                                            <div>
                                                <h3>
                                                    Expected
                                                    Resolution
                                                </h3>
                                                <p>
                                                    Assigned
                                                    staff timeline
                                                </p>
                                            </div>
                                        </div>

                                        <div className="expected-resolution">
                                            <div className="expected-resolution-icon">
                                                ⏱
                                            </div>

                                            <div>
                                                <span>
                                                    Expected
                                                    Date & Time
                                                </span>

                                                <strong>
                                                    {formatDateTime(
                                                        complaint.expected_resolution_at
                                                    )}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="view-complaint-card">
                                        <div className="view-complaint-card-heading">
                                            <div>
                                                <h3>
                                                    Current
                                                    Status
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="current-status-box">
                                            <span
                                                className={`view-complaint-status ${getStatusClass()}`}
                                            >
                                                {renderValue(
                                                    complaint.status
                                                )}
                                            </span>

                                            <p>
                                                {complaint.status ===
                                                    "Closed" &&
                                                    "This complaint has been successfully closed."}

                                                {complaint.status ===
                                                    "OTP Verification" &&
                                                    "Resolution has been marked. OTP verification is required before closure."}

                                                {complaint.status ===
                                                    "Resolution Pending" &&
                                                    "Staff has submitted the complaint for resolution verification."}

                                                {complaint.status ===
                                                    "In Progress" &&
                                                    "Assigned staff is currently working on your complaint."}

                                                {complaint.status ===
                                                    "Assigned" &&
                                                    "Your complaint has been assigned to staff."}

                                                {complaint.status ===
                                                    "Submitted" &&
                                                    "Your complaint has been submitted and is waiting for staff assignment."}
                                            </p>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
};

export default ViewComplaint;