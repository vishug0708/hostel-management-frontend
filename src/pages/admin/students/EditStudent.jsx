import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditStudent.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function EditStudent() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        parent_email: "",
        college: "",
        course: "",
        hostel: "",
        photo: null
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [photoPreview, setPhotoPreview] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // =====================================================
    // FETCH STUDENT
    // =====================================================

    useEffect(() => {

        const fetchStudent = async () => {

            const token =
                localStorage.getItem("adminToken");

            if (!token) {

                navigate("/admin/login", {
                    replace: true
                });

                return;
            }

            try {

                const response = await fetch(
                   `${API_URL}/api/admin/students/${id}`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {

                    setError(
                        data.message ||
                        "Unable to load student."
                    );

                    return;
                }

                const student = data.student;

                setFormData({
                    name: student.name || "",
                    email: student.email || "",
                    mobile: student.mobile || "",
                    parent_email:
                        student.parent_email || "",
                    college: student.college || "",
                    course: student.course || "",
                    hostel: student.hostel || "",
                    photo: null
                });

                if (student.photo) {
                    setPhotoPreview(getPhotoUrl(student.photo));
                }

            } catch (err) {

                console.error(
                    "Fetch Student Error:",
                    err
                );

                setError(
                    "Cannot connect to backend server."
                );

            } finally {

                setLoading(false);

            }

        };

        fetchStudent();

    }, [id, navigate]);


    // =====================================================
    // PHOTO URL
    // =====================================================

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

        return `${API_URL}/uploads/students/${normalized}`;
    };

    // =====================================================
    // PHOTO CHANGE
    // =====================================================

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];

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
        setSuccess("");

        setFormData((prev) => ({
            ...prev,
            photo: file
        }));

        setPhotoPreview(URL.createObjectURL(file));
    };

    // =====================================================
    // HANDLE CHANGE
    // =====================================================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setError("");
        setSuccess("");

    };


    // =====================================================
    // UPDATE STUDENT
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        const token =
            localStorage.getItem("adminToken");

        if (!token) {

            navigate("/admin/login", {
                replace: true
            });

            return;
        }


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !formData.name ||
            !formData.email ||
            !formData.mobile ||
            !formData.parent_email ||
            !formData.college ||
            !formData.course ||
            !formData.hostel
        ) {

            setError(
                "Please fill all required fields."
            );

            return;
        }


        if (
            !/^[0-9]{10}$/.test(
                formData.mobile
            )
        ) {

            setError(
                "Mobile number must contain exactly 10 digits."
            );

            return;
        }


        try {

            setSaving(true);


            const body = new FormData();

            body.append("name", formData.name.trim());
            body.append("email", formData.email.trim());
            body.append("mobile", formData.mobile.trim());
            body.append("parent_email", formData.parent_email.trim());
            body.append("college", formData.college.trim());
            body.append("course", formData.course.trim());
            body.append("hostel", formData.hostel.trim());

            if (formData.photo) {
                body.append("photo", formData.photo);
            }

            const response = await fetch(
                `${API_URL}/api/admin/students/${id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },
                    body
                }
            );


            const data = await response.json();


            if (!response.ok || !data.success) {

                setError(
                    data.message ||
                    "Unable to update student."
                );

                return;
            }


            setSuccess(
                "Student updated successfully."
            );


        } catch (err) {

            console.error(
                "Update Student Error:",
                err
            );

            setError(
                "Cannot connect to backend server."
            );

        } finally {

            setSaving(false);

        }

    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem(
            "adminToken"
        );

        localStorage.removeItem(
            "admin"
        );

        navigate("/admin/login", {
            replace: true
        });

    };


    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

    return (

            <div className="edit-student-loading">

                <div className="edit-student-loader">
                    ⏳
                </div>

                <p>
                    Loading student...
                </p>

            </div>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="edit-student-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className={`edit-student-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>

                <div className="edit-student-brand">

                    <div className="edit-brand-icon">
                        🏠
                    </div>

                    <div>

                        <strong>
                            Hostel
                        </strong>

                        <span>
                            Admin Panel
                        </span>

                    </div>

                </div>


                <nav className="edit-student-nav">

                    <button
                        onClick={() => {{
                            closeMobileMenu();
                            navigate("/admin/dashboard");
                        }}}
                    >
                        📊 Dashboard
                    </button>

                    <button className="active" onClick={() => closeMobileMenu()}>
                        🎓 Students
                    </button>

                    <button
                        onClick={() => {{
                            closeMobileMenu();
                            navigate("/admin/rooms");
                        }}}
                    >
                        🛏️ Rooms
                    </button>

                    <button
                        onClick={() => {{
                            closeMobileMenu();
                            navigate("/admin/fees");
                        }}}
                    >
                        💳 Fees
                    </button>

                    <button
                        onClick={() => {{
                            closeMobileMenu();
                            navigate("/admin/complaints");
                        }}}
                    >
                        📝 Complaints
                    </button>

                    <button
                        onClick={() => {{
                            closeMobileMenu();
                            navigate("/admin/cricket-box");
                        }}}
                    >
                        🏏 Cricket Box
                    </button>

                    <button
                        onClick={() => {{
                            closeMobileMenu();
                            navigate("/admin/announcements");
                        }}}
                    >
                        📢 Announcements
                    </button>

                    <button
                        onClick={() => {{
                            closeMobileMenu();
                            navigate("/admin/reports");
                        }}}
                    >
                        📊 Reports
                    </button>

                    <button
                        onClick={() => {{
                            closeMobileMenu();
                            navigate("/admin/profile");
                        }}}
                    >
                        👤 Profile
                    </button>

                </nav>


                <button
                    className="edit-student-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>


            {mobileMenuOpen && (
                <div
                    className="admin-mobile-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="edit-student-main">


                <div className="admin-mobile-header">

                    <div className="admin-mobile-left">

                        <button
                            className="admin-mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            ☰
                        </button>

                        <div className="admin-mobile-brand">

                            <div className="admin-mobile-brand-icon">
                                🏠
                            </div>

                            <div>
                                <strong>Hostel</strong>
                                <span>Admin Panel</span>
                            </div>

                        </div>

                    </div>

                    <button
                        className="admin-mobile-profile-btn"
                        onClick={() => navigate("/admin/profile")}
                    >
                        👤
                    </button>

                </div>


                {/* HEADER */}

                <header className="edit-student-header">

                    <div>

                        <span>
                            STUDENT MANAGEMENT
                        </span>

                        <h1>
                            Edit Student
                        </h1>

                        <p>
                            Update student information.
                        </p>

                    </div>


                    <button
                        className="edit-back-btn"
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        ← Manage Students
                    </button>

                </header>


                {/* FORM CARD */}

                <section className="edit-student-card">


                    <div className="edit-student-card-header">

                        <div className="edit-student-icon">
                            ✏️
                        </div>

                        <div>

                            <h2>
                                Student Information
                            </h2>

                            <p>
                                Update the student's details
                                and save your changes.
                            </p>

                        </div>

                    </div>


                    <form
                        className="edit-student-form"
                        onSubmit={handleSubmit}
                    >


                        {/* =================================================
                            PROFILE PHOTO
                        ================================================= */}

                        <div className="edit-student-photo-section">

                            <div className="edit-student-photo-preview">
                                {photoPreview ? (
                                    <img
                                        src={photoPreview}
                                        alt={formData.name || "Student"}
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <span>
                                        {formData.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "S"}
                                    </span>
                                )}
                            </div>

                            <div className="edit-student-photo-content">
                                <span className="edit-student-photo-label">
                                    PROFILE PHOTO
                                </span>

                                <h3>
                                    Change Student Photo
                                </h3>

                                <p>
                                    JPG, JPEG, PNG or WEBP. Maximum size 5 MB.
                                </p>

                                <label
                                    htmlFor="student-photo"
                                    className="edit-student-photo-btn"
                                >
                                    📷 Choose Photo
                                </label>

                                <input
                                    id="student-photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    hidden
                                />

                                {formData.photo && (
                                    <span className="edit-student-photo-name">
                                        ✓ {formData.photo.name}
                                    </span>
                                )}
                            </div>

                        </div>


                        {/* =================================================
                            PERSONAL INFORMATION
                        ================================================= */}

                        <div className="edit-section-title">
                            Personal Information
                        </div>


                        <div className="edit-form-grid">


                            <div className="edit-form-group">

                                <label>
                                    Full Name *
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter student name"
                                />

                            </div>


                            <div className="edit-form-group">

                                <label>
                                    Email *
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="student@example.com"
                                />

                            </div>


                            <div className="edit-form-group">

                                <label>
                                    Mobile Number *
                                </label>

                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    maxLength="10"
                                    placeholder="10-digit mobile number"
                                />

                            </div>


                            <div className="edit-form-group">

                                <label>
                                    Parent Email *
                                </label>

                                <input
                                    type="email"
                                    name="parent_email"
                                    value={formData.parent_email}
                                    onChange={handleChange}
                                    placeholder="parent@example.com"
                                />

                            </div>

                        </div>


                        {/* =================================================
                            ACADEMIC INFORMATION
                        ================================================= */}

                        <div className="edit-section-title">
                            Academic Information
                        </div>


                        <div className="edit-form-grid">


                            <div className="edit-form-group">

                                <label>
                                    College *
                                </label>

                                <input
                                    type="text"
                                    name="college"
                                    value={formData.college}
                                    onChange={handleChange}
                                    placeholder="Enter college"
                                />

                            </div>


                            <div className="edit-form-group">

                                <label>
                                    Course *
                                </label>

                                <input
                                    type="text"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    placeholder="Enter course"
                                />

                            </div>


                            <div className="edit-form-group">

                                <label>
                                    Hostel *
                                </label>

                                <input
                                    type="text"
                                    name="hostel"
                                    value={formData.hostel}
                                    onChange={handleChange}
                                    placeholder="Enter hostel"
                                />

                            </div>

                        </div>


                        {/* =================================================
                            PASSWORD NOTE
                        ================================================= */}

                        <div className="edit-password-note">

                            <span>
                                🔐
                            </span>

                            <div>

                                <strong>
                                    Password
                                </strong>

                                <p>
                                    Student password is not changed
                                    from this page. Use the dedicated
                                    password management option later.
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            MESSAGES
                        ================================================= */}

                        {success && (

                            <div className="edit-student-success">
                                ✓ {success}
                            </div>

                        )}


                        {error && (

                            <div className="edit-student-error">
                                ⚠ {error}
                            </div>

                        )}


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="edit-student-actions">

                            <button
                                type="button"
                                className="edit-cancel-btn"
                                onClick={() =>
                                    navigate(
                                        "/admin/students"
                                    )
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="edit-save-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "💾 Save Changes"
                                }
                            </button>

                        </div>

                    </form>

                </section>


                {/* FOOTER */}

                <footer className="edit-student-footer">

                    <span>
                        © 2026 Hostel Management System
                    </span>

                    <span>
                        Admin Panel
                    </span>

                </footer>

            </main>

        </div>

    );

}

export default EditStudent;