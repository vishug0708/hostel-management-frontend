import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddStudent.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AddStudent() {

    const navigate = useNavigate();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirm_password: "",
        parent_email: "",
        college: "",
        course: "",
        hostel: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        setError("");
        setSuccess("");
    };


    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        // =============================================
        // REQUIRED FIELDS
        // =============================================

        if (
            !formData.name ||
            !formData.email ||
            !formData.mobile ||
            !formData.password ||
            !formData.confirm_password ||
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


        // =============================================
        // PASSWORD
        // =============================================

        if (
            formData.password !==
            formData.confirm_password
        ) {

            setError(
                "Password and confirm password do not match."
            );

            return;
        }


        if (formData.password.length < 6) {

            setError(
                "Password must be at least 6 characters."
            );

            return;
        }


        // =============================================
        // MOBILE
        // =============================================

        if (!/^[0-9]{10}$/.test(formData.mobile)) {

            setError(
                "Please enter a valid 10-digit mobile number."
            );

            return;
        }


        try {

            const token =
                localStorage.getItem("adminToken");


            if (!token) {

                navigate("/admin/login", {
                    replace: true
                });

                return;
            }


            // =============================================
            // API
            // =============================================

            const response = await fetch(
                `${API_URL}/api/admin/students`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify(formData)
                }
            );


            const data = await response.json();


            if (!response.ok || !data.success) {

                setError(
                    data.message ||
                    "Unable to add student."
                );

                return;
            }


            setSuccess(
                "Student added successfully."
            );


            // Reset form

            setFormData({
                name: "",
                email: "",
                mobile: "",
                password: "",
                confirm_password: "",
                parent_email: "",
                college: "",
                course: "",
                hostel: ""
            });


        } catch (error) {

            console.error(
                "Add Student Error:",
                error
            );

            setError(
                "Cannot connect to backend server."
            );

        }

    };


    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };


    return (

        <div className="add-student-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className={`add-student-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>

                <div className="add-student-brand">

                    <div className="add-student-brand-icon">
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


                <nav className="add-student-nav">

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
                    className="add-student-logout"
                    onClick={() => {

                        localStorage.removeItem(
                            "adminToken"
                        );

                        localStorage.removeItem(
                            "admin"
                        );

                        navigate("/admin/login", {
                            replace: true
                        });

                    }}
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

            <main className="add-student-main">


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

                <header className="add-student-header">

                    <div>

                        <span>
                            STUDENT MANAGEMENT
                        </span>

                        <h1>
                            Add Student
                        </h1>

                        <p>
                            Register a new student in the
                            hostel management system.
                        </p>

                    </div>

                    <button
                        className="back-students-btn"
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        ← Students
                    </button>

                </header>


                {/* FORM CARD */}

                <section className="add-student-card">


                    <div className="add-student-card-header">

                        <div className="student-form-icon">
                            🎓
                        </div>

                        <div>

                            <h2>
                                Student Information
                            </h2>

                            <p>
                                Enter the student's basic
                                and hostel details.
                            </p>

                        </div>

                    </div>


                    <form
                        className="add-student-form"
                        onSubmit={handleSubmit}
                    >


                        {/* =====================================
                            PERSONAL INFORMATION
                        ===================================== */}

                        <div className="form-section-title">
                            Personal Information
                        </div>


                        <div className="student-form-grid">


                            {/* NAME */}

                            <div className="student-form-group">

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


                            {/* EMAIL */}

                            <div className="student-form-group">

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


                            {/* MOBILE */}

                            <div className="student-form-group">

                                <label>
                                    Mobile Number *
                                </label>

                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    placeholder="10-digit mobile number"
                                    maxLength="10"
                                />

                            </div>


                            {/* PARENT EMAIL */}

                            <div className="student-form-group">

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


                        {/* =====================================
                            ACADEMIC INFORMATION
                        ===================================== */}

                        <div className="form-section-title">
                            Academic Information
                        </div>


                        <div className="student-form-grid">


                            {/* COLLEGE */}

                            <div className="student-form-group">

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


                            {/* COURSE */}

                            <div className="student-form-group">

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


                            {/* HOSTEL */}

                            <div className="student-form-group">

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


                        {/* =====================================
                            ACCOUNT PASSWORD
                        ===================================== */}

                        <div className="form-section-title">
                            Account Security
                        </div>


                        <div className="student-form-grid">


                            {/* PASSWORD */}

                            <div className="student-form-group">

                                <label>
                                    Password *
                                </label>

                                <div className="student-password-wrapper">

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                    >
                                        {showPassword
                                            ? "🙈"
                                            : "👁️"
                                        }
                                    </button>

                                </div>

                            </div>


                            {/* CONFIRM PASSWORD */}

                            <div className="student-form-group">

                                <label>
                                    Confirm Password *
                                </label>

                                <div className="student-password-wrapper">

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirm_password"
                                        value={
                                            formData.confirm_password
                                        }
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                    >
                                        {showConfirmPassword
                                            ? "🙈"
                                            : "👁️"
                                        }
                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* =====================================
                            MESSAGE
                        ===================================== */}

                        {success && (

                            <div className="add-student-success">
                                ✓ {success}
                            </div>

                        )}


                        {error && (

                            <div className="add-student-error">
                                ⚠ {error}
                            </div>

                        )}


                        {/* =====================================
                            ACTIONS
                        ===================================== */}

                        <div className="add-student-actions">

                            <button
                                type="button"
                                className="student-cancel-btn"
                                onClick={() =>
                                    navigate("/admin/students")
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="student-save-btn"
                            >
                                ➕ Add Student
                            </button>

                        </div>

                    </form>

                </section>


                {/* FOOTER */}

                <footer className="add-student-footer">

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

export default AddStudent;