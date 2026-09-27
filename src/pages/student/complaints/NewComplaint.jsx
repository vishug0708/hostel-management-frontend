import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewComplaint.css";

const API_URL = import.meta.env.VITE_API_URL || "";

const categoryStaffMap = {
    Electrical: "Electrical",
    Plumbing: "Plumbing",
    Carpenter: "Carpenter",
    Cleaning: "Cleaning",
    IT: "IT",
    Maintenance: "Maintenance"
};

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

const NewComplaint = () => {
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [student, setStudent] = useState(null);

    const [backupStudents, setBackupStudents] = useState([]);
    const [selectedBackupStudent, setSelectedBackupStudent] = useState(null);

    const [formData, setFormData] = useState({
        backup_student_id: "",
        category: "",
        subject: "",
        description: ""
    });

    const [attachment, setAttachment] = useState(null);

    const [loadingStudent, setLoadingStudent] = useState(true);
    const [loadingBackupStudents, setLoadingBackupStudents] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    useEffect(() => {
        const storedStudent =
            localStorage.getItem("student");

        if (storedStudent) {
            try {
                setStudent(JSON.parse(storedStudent));
            } catch (error) {
                console.error("Student data parse error:", error);
            }
        }

        setLoadingStudent(false);
    }, []);

    const getStudentId = () => {
        if (student?.id) return student.id;

        if (student?.student_id) return student.student_id;

        return null;
    };

    useEffect(() => {
        if (!student) return;

        const studentId = getStudentId();

        if (!studentId) {
            setLoadingBackupStudents(false);
            return;
        }

        fetchBackupStudents(studentId);
    }, [student]);

    const getToken = () => {
        return (
            localStorage.getItem("studentToken") ||
            localStorage.getItem("token")
        );
    };

    const getPhotoUrl = (photo) => {
        if (!photo) return "";

        if (
            photo.startsWith("http://") ||
            photo.startsWith("https://")
        ) {
            return photo;
        }

        return `${API_URL}/${photo.replace(/^\/+/, "")}`;
    };

    const fetchBackupStudents = async (studentId) => {
        try {
            setLoadingBackupStudents(true);
            setMessage("");

            const token = getToken();

            const response = await fetch(
                `${API_URL}/api/student/complaints/backup-students/${studentId}`,
                {
                    headers: token
                        ? {
                              Authorization: `Bearer ${token}`
                          }
                        : {}
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to load backup students."
                );
            }

            setBackupStudents(
                Array.isArray(data.students)
                    ? data.students
                    : Array.isArray(data.backupStudents)
                    ? data.backupStudents
                    : []
            );
        } catch (error) {
            console.error(
                "Backup Students Error:",
                error
            );

            setBackupStudents([]);

            setMessage(
                error.message ||
                    "Unable to load backup students."
            );

            setMessageType("error");
        } finally {
            setLoadingBackupStudents(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        if (name === "backup_student_id") {
            const backupStudent =
                backupStudents.find(
                    (item) =>
                        String(item.id) === String(value)
                );

            setSelectedBackupStudent(
                backupStudent || null
            );
        }

        setMessage("");
        setMessageType("");
    };

    const handleAttachmentChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            setAttachment(null);
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "application/pdf"
        ];

        if (!allowedTypes.includes(file.type)) {
            setAttachment(null);
            event.target.value = "";

            setMessage(
                "Only JPG, JPEG, PNG, WEBP and PDF files are allowed."
            );

            setMessageType("error");

            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setAttachment(null);
            event.target.value = "";

            setMessage(
                "Attachment size must be less than 5 MB."
            );

            setMessageType("error");

            return;
        }

        setAttachment(file);
        setMessage("");
        setMessageType("");
    };

    const validateForm = () => {
        if (!formData.backup_student_id) {
            setMessage(
                "Please select a backup student."
            );
            setMessageType("error");
            return false;
        }

        if (!formData.category) {
            setMessage(
                "Please select a complaint category."
            );
            setMessageType("error");
            return false;
        }

        if (!formData.subject.trim()) {
            setMessage(
                "Please enter complaint subject."
            );
            setMessageType("error");
            return false;
        }

        if (!formData.description.trim()) {
            setMessage(
                "Please enter complaint description."
            );
            setMessageType("error");
            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const studentId = getStudentId();

        if (!studentId) {
            setMessage(
                "Student information not found. Please login again."
            );
            setMessageType("error");
            return;
        }

        try {
            setSubmitting(true);
            setMessage("");
            setMessageType("");

            const token = getToken();

            const body = new FormData();

            body.append(
                "student_id",
                studentId
            );

            body.append(
                "backup_student_id",
                formData.backup_student_id
            );

            body.append(
                "category",
                formData.category
            );

            body.append(
                "subject",
                formData.subject.trim()
            );

            body.append(
                "description",
                formData.description.trim()
            );

            if (attachment) {
                body.append(
                    "attachment",
                    attachment
                );
            }

            const response = await fetch(
                `${API_URL}/api/student/complaints`,
                {
                    method: "POST",
                    headers: token
                        ? {
                              Authorization: `Bearer ${token}`
                          }
                        : {},
                    body
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to submit complaint."
                );
            }

            setMessage(
                data.message ||
                    "Complaint submitted successfully."
            );

            setMessageType("success");

            setTimeout(() => {
                navigate("/student/complaints");
            }, 1200);
        } catch (error) {
            console.error(
                "Submit Complaint Error:",
                error
            );

            setMessage(
                error.message ||
                    "Failed to submit complaint."
            );

            setMessageType("error");
        } finally {
            setSubmitting(false);
        }
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

    if (loadingStudent) {
        return (
            <div className="new-complaint-loading">
                Loading...
            </div>
        );
    }

    return (
        <div className="student-complaint-page">
            <aside
                className={`student-complaint-sidebar ${
                    sidebarOpen ? "open" : ""
                }`}
            >
                <div className="student-complaint-sidebar-header">
                    <div className="student-complaint-logo">
                        HMS
                    </div>

                    <div>
                        <h2>Student Panel</h2>
                        <span>Hostel Management</span>
                    </div>
                </div>

                <nav className="student-complaint-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            type="button"
                            className={`student-complaint-nav-item ${
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
                    className="student-complaint-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </aside>

            {sidebarOpen && (
                <div
                    className="student-complaint-overlay"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            <main className="student-complaint-main">
                <header className="student-complaint-header">
                    <button
                        type="button"
                        className="student-complaint-menu-button"
                        onClick={() =>
                            setSidebarOpen(
                                !sidebarOpen
                            )
                        }
                        aria-label="Toggle menu"
                    >
                        ☰
                    </button>

                    <div className="student-complaint-header-title">
                        <h1>New Complaint</h1>
                        <p>
                            Submit your hostel complaint
                        </p>
                    </div>

                    <div className="student-complaint-profile">
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
                            <div className="student-complaint-profile-placeholder">
                                {student?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                    "S"}
                            </div>
                        )}

                        <div className="student-complaint-profile-info">
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

                <section className="new-complaint-content">
                    <div className="new-complaint-top">
                        <button
                            type="button"
                            className="new-complaint-back"
                            onClick={() =>
                                navigate(
                                    "/student/complaints"
                                )
                            }
                        >
                            ← Back to Complaints
                        </button>
                    </div>

                    <div className="new-complaint-card">
                        <div className="new-complaint-card-header">
                            <div>
                                <h2>
                                    Raise a Complaint
                                </h2>
                                <p>
                                    Please provide accurate
                                    details about your
                                    complaint.
                                </p>
                            </div>
                        </div>

                        {message && (
                            <div
                                className={`new-complaint-message ${messageType}`}
                            >
                                {message}
                            </div>
                        )}

                        <form
                            className="new-complaint-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="new-complaint-section">
                                <h3>
                                    Complaint Details
                                </h3>

                                <div className="new-complaint-grid">
                                    <div className="new-complaint-field">
                                        <label>
                                            Complaint Category
                                            <span>*</span>
                                        </label>

                                        <select
                                            name="category"
                                            value={
                                                formData.category
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >
                                            <option value="">
                                                Select Category
                                            </option>

                                            <option value="Electrical">
                                                Electrical
                                            </option>

                                            <option value="Plumbing">
                                                Plumbing
                                            </option>

                                            <option value="Carpenter">
                                                Carpenter
                                            </option>

                                            <option value="Cleaning">
                                                Cleaning
                                            </option>

                                            <option value="IT">
                                                IT
                                            </option>

                                            <option value="Maintenance">
                                                Maintenance
                                            </option>
                                        </select>

                                        {formData.category && (
                                            <small className="new-complaint-help">
                                                Automatically
                                                assigned to{" "}
                                                {
                                                    categoryStaffMap[
                                                        formData
                                                            .category
                                                    ]
                                                }{" "}
                                                staff.
                                            </small>
                                        )}
                                    </div>

                                    <div className="new-complaint-field">
                                        <label>
                                            Backup Student
                                            <span>*</span>
                                        </label>

                                        <select
                                            name="backup_student_id"
                                            value={
                                                formData.backup_student_id
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            disabled={
                                                loadingBackupStudents
                                            }
                                        >
                                            <option value="">
                                                {loadingBackupStudents
                                                    ? "Loading students..."
                                                    : "Select Backup Student"}
                                            </option>

                                            {backupStudents.map(
                                                (
                                                    backup
                                                ) => (
                                                    <option
                                                        key={
                                                            backup.id
                                                        }
                                                        value={
                                                            backup.id
                                                        }
                                                    >
                                                        {backup.name}{" "}
                                                        -{" "}
                                                        {backup.email ||
                                                            backup.mobile ||
                                                            `ID ${backup.id}`}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        <small className="new-complaint-help">
                                            Backup student
                                            is mandatory.
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {selectedBackupStudent && (
                                <div className="backup-student-card">
                                    <div className="backup-student-title">
                                        <h3>
                                            Backup Student
                                            Details
                                        </h3>
                                        <span>
                                            Automatically
                                            fetched
                                        </span>
                                    </div>

                                    <div className="backup-student-content">
                                        <div className="backup-student-photo">
                                            {selectedBackupStudent.photo ? (
                                                <img
                                                    src={getPhotoUrl(
                                                        selectedBackupStudent.photo
                                                    )}
                                                    alt={
                                                        selectedBackupStudent.name ||
                                                        "Backup Student"
                                                    }
                                                />
                                            ) : (
                                                <div className="backup-student-photo-placeholder">
                                                    {selectedBackupStudent.name
                                                        ?.charAt(
                                                            0
                                                        )
                                                        ?.toUpperCase() ||
                                                        "S"}
                                                </div>
                                            )}
                                        </div>

                                        <div className="backup-student-details">
                                            <div>
                                                <span>
                                                    Name
                                                </span>
                                                <strong>
                                                    {
                                                        selectedBackupStudent.name
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Student ID
                                                </span>
                                                <strong>
                                                    {selectedBackupStudent.student_id ||
                                                        selectedBackupStudent.id}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Mobile
                                                </span>
                                                <strong>
                                                    {selectedBackupStudent.mobile ||
                                                        "Not available"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Email
                                                </span>
                                                <strong>
                                                    {selectedBackupStudent.email ||
                                                        "Not available"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Hostel
                                                </span>
                                                <strong>
                                                    {selectedBackupStudent.hostel ||
                                                        "Not available"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Room
                                                </span>
                                                <strong>
                                                    {selectedBackupStudent.room_no ||
                                                        selectedBackupStudent.room ||
                                                        "Not available"}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="new-complaint-section">
                                <h3>
                                    Complaint Information
                                </h3>

                                <div className="new-complaint-field">
                                    <label>
                                        Subject
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="subject"
                                        value={
                                            formData.subject
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter complaint subject"
                                        maxLength={200}
                                    />

                                    <small className="new-complaint-counter">
                                        {
                                            formData.subject
                                                .length
                                        }
                                        /200
                                    </small>
                                </div>

                                <div className="new-complaint-field">
                                    <label>
                                        Description
                                        <span>*</span>
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Describe your complaint in detail..."
                                        rows={7}
                                    />

                                    <small className="new-complaint-help">
                                        Please include
                                        relevant details such
                                        as location, room
                                        number and issue.
                                    </small>
                                </div>

                                <div className="new-complaint-field">
                                    <label>
                                        Attachment
                                    </label>

                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                                        onChange={
                                            handleAttachmentChange
                                        }
                                    />

                                    <small className="new-complaint-help">
                                        Optional. Maximum
                                        file size: 5 MB.
                                    </small>

                                    {attachment && (
                                        <div className="new-complaint-file">
                                            <span>
                                                {attachment.name}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setAttachment(
                                                        null
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="new-complaint-workflow">
                                <div>
                                    <strong>
                                        Automatic Staff
                                        Assignment
                                    </strong>

                                    <p>
                                        Your complaint will be
                                        automatically assigned
                                        to available staff
                                        according to the
                                        selected category.
                                    </p>
                                </div>

                                <div>
                                    <strong>
                                        Resolution Time
                                    </strong>

                                    <p>
                                        The assigned staff will
                                        provide the expected
                                        resolution date and
                                        time.
                                    </p>
                                </div>
                            </div>

                            <div className="new-complaint-actions">
                                <button
                                    type="button"
                                    className="new-complaint-cancel"
                                    onClick={() =>
                                        navigate(
                                            "/student/complaints"
                                        )
                                    }
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="new-complaint-submit"
                                    disabled={
                                        submitting
                                    }
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit Complaint"}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default NewComplaint;