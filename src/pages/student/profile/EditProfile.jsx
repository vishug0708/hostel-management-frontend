import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./EditProfile.css";

const EditProfile = () => {
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [photoPreview, setPhotoPreview] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        photo: null
    });

    const getStudentId = () => {
        const studentData = localStorage.getItem("student");

        if (studentData) {
            try {
                const student = JSON.parse(studentData);
                return student?.id || null;
            } catch (error) {
                console.error("Invalid student data:", error);
            }
        }

        return (
            localStorage.getItem("studentId") ||
            localStorage.getItem("student_id")
        );
    };

    const studentId = getStudentId();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            if (!studentId) {
                setError("Student session not found. Please login again.");
                setLoading(false);
                return;
            }

            const API_URL =
                import.meta.env.VITE_API_URL ||
                "http://localhost:5000";

            const response = await fetch(
                `${API_URL}/api/student/profile/${studentId}`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch profile."
                );
            }

            const profile = data.student;

            setStudent(profile);

            setFormData({
                name: profile.name || "",
                email: profile.email || "",
                mobile: profile.mobile || "",
                photo: null
            });

            if (profile.photo) {
                setPhotoPreview(
                    profile.photo.startsWith("http")
                        ? profile.photo
                        : `${API_URL}/${profile.photo}`
                );
            }
        } catch (err) {
            console.error("Edit Profile Error:", err);
            setError(
                err.message || "Failed to fetch profile."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Photo size must be less than 5 MB.");
            return;
        }

        setError("");

        setFormData((prev) => ({
            ...prev,
            photo: file
        }));

        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (!studentId) {
                setError("Student session not found. Please login again.");
                return;
            }

            if (!formData.name.trim()) {
                setError("Name is required.");
                return;
            }

            if (!formData.email.trim()) {
                setError("Email is required.");
                return;
            }

            if (!formData.mobile.trim()) {
                setError("Mobile number is required.");
                return;
            }

            const API_URL =
                import.meta.env.VITE_API_URL ||
                "http://localhost:5000";

            const body = new FormData();

            body.append("name", formData.name.trim());
            body.append("email", formData.email.trim());
            body.append("mobile", formData.mobile.trim());

            if (formData.photo) {
                body.append("photo", formData.photo);
            }

            const response = await fetch(
                `${API_URL}/api/student/profile/${studentId}`,
                {
                    method: "PUT",
                    body
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to update profile."
                );
            }

            setStudent(data.student);

            if (data.student?.photo) {
                setPhotoPreview(
                    data.student.photo.startsWith("http")
                        ? data.student.photo
                        : `${API_URL}/${data.student.photo}`
                );
            }

            const oldStudentData = localStorage.getItem("student");

            if (oldStudentData) {
                try {
                    const oldStudent = JSON.parse(oldStudentData);

                    localStorage.setItem(
                        "student",
                        JSON.stringify({
                            ...oldStudent,
                            ...data.student
                        })
                    );
                } catch (error) {
                    console.error(
                        "Failed to update local student data:",
                        error
                    );
                }
            }

            setFormData((prev) => ({
                ...prev,
                photo: null
            }));

            setSuccess("Profile updated successfully.");

            setTimeout(() => {
                navigate("/student/profile");
            }, 1200);
        } catch (err) {
            console.error("Update Profile Error:", err);
            setError(
                err.message || "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("studentId");
        localStorage.removeItem("student_id");
        localStorage.removeItem("student");
        localStorage.removeItem("studentToken");

        navigate("/student/login");
    };

    const getInitials = () => {
        if (!formData.name) {
            return "S";
        }

        return formData.name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    if (loading) {
        return (
            <div className="student-layout">
                <aside className="student-sidebar">
                    <div className="student-brand">
                        <div className="student-brand-icon">🏠</div>
                        <div>
                            <h2>Hostel</h2>
                            <p>Student Portal</p>
                        </div>
                    </div>
                </aside>

                <main className="student-main">
                    <div className="edit-profile-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading profile...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="student-layout">

            {/* SIDEBAR */}
            <aside className="student-sidebar">

                <div className="student-brand">
                    <div className="student-brand-icon">🏠</div>

                    <div>
                        <h2>Hostel</h2>
                        <p>Student Portal</p>
                    </div>
                </div>

                <nav className="student-nav">

                    <NavLink
                        to="/student/dashboard"
                        className={({ isActive }) =>
                            `student-nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        📊 <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/student/profile"
                        className={({ isActive }) =>
                            `student-nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        👤 <span>My Profile</span>
                    </NavLink>

                    <NavLink
                        to="/student/room"
                        className={({ isActive }) =>
                            `student-nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        🛏️ <span>My Room</span>
                    </NavLink>

                    <NavLink
                        to="/student/leave"
                        className={({ isActive }) =>
                            `student-nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        📄 <span>My Leave</span>
                    </NavLink>

                    <NavLink
                        to="/student/leave/apply"
                        className={({ isActive }) =>
                            `student-nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        ➕ <span>Apply Leave</span>
                    </NavLink>

                    <NavLink
                        to="/student/gate-pass"
                        className={({ isActive }) =>
                            `student-nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        🎫 <span>Gate Pass</span>
                    </NavLink>

                    <NavLink
                        to="/student/complaints"
                        className={({ isActive }) =>
                            `student-nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        🛠️ <span>Complaints</span>
                    </NavLink>

                    <NavLink
                        to="/student/fees"
                        className={({ isActive }) =>
                            `student-nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        💰 <span>My Fees</span>
                    </NavLink>

                    <NavLink
                        to="/student/notifications"
                        className={({ isActive }) =>
                            `student-nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        🔔 <span>Notifications</span>
                    </NavLink>

                </nav>

                <button
                    className="student-logout"
                    onClick={handleLogout}
                >
                    🚪 <span>Logout</span>
                </button>

            </aside>

            {/* MAIN CONTENT */}
            <main className="student-main">

                <div className="edit-profile-header">
                    <div>
                        <p className="section-label">
                            STUDENT PROFILE
                        </p>

                        <h1>Edit Profile</h1>

                        <p className="page-description">
                            Update your personal information and profile photo.
                        </p>
                    </div>

                    <button
                        className="back-profile-btn"
                        onClick={() => navigate("/student/profile")}
                    >
                        ← Back to Profile
                    </button>
                </div>

                {error && (
                    <div className="profile-alert error">
                        ⚠️
                        <span>{error}</span>

                        <button onClick={() => setError("")}>
                            ×
                        </button>
                    </div>
                )}

                {success && (
                    <div className="profile-alert success">
                        ✅
                        <span>{success}</span>
                    </div>
                )}

                <form
                    className="edit-profile-card"
                    onSubmit={handleSubmit}
                >

                    {/* PROFILE PHOTO */}
                    <div className="photo-section">

                        <div className="photo-heading">
                            <p className="section-label">
                                PROFILE PHOTO
                            </p>

                            <h2>Update your photo</h2>

                            <p>
                                Choose a clear photo. Maximum size is 5 MB.
                            </p>
                        </div>

                        <div className="photo-content">

                            <div className="profile-photo-preview">

                                {photoPreview ? (
                                    <img
                                        src={photoPreview}
                                        alt="Student Profile"
                                    />
                                ) : (
                                    <span>
                                        {getInitials()}
                                    </span>
                                )}

                            </div>

                            <div className="photo-actions">

                                <label
                                    htmlFor="photo"
                                    className="choose-photo-btn"
                                >
                                    📷 Choose Photo
                                </label>

                                <input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    hidden
                                />

                                <p>
                                    JPG, JPEG, PNG or WEBP
                                </p>

                                {formData.photo && (
                                    <span className="selected-photo">
                                        ✓ {formData.photo.name}
                                    </span>
                                )}

                            </div>

                        </div>

                    </div>

                    {/* PERSONAL INFORMATION */}
                    <div className="form-section">

                        <div className="form-section-heading">
                            <p className="section-label">
                                PERSONAL INFORMATION
                            </p>

                            <h2>Basic Details</h2>
                        </div>

                        <div className="form-grid">

                            <div className="form-group full-width">
                                <label htmlFor="name">
                                    Full Name
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">

                                <label htmlFor="email">
                                    Email Address
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="mobile">
                                    Mobile Number
                                </label>

                                <input
                                    id="mobile"
                                    name="mobile"
                                    type="tel"
                                    maxLength="10"
                                    placeholder="Enter your mobile number"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>

                    </div>

                    {/* ACTIONS */}
                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate("/student/profile")}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-profile-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "✓ Save Changes"}
                        </button>

                    </div>

                </form>

            </main>
        </div>
    );
};

export default EditProfile;