import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ViewStudent.css";

function ViewStudent() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [student, setStudent] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


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
                    `http://localhost:5000/api/admin/students/${id}`,
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


                setStudent(data.student);


            } catch (err) {

                console.error(
                    "View Student Error:",
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


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="view-student-loading">

                <div className="view-student-loader">
                    ⏳
                </div>

                <p>
                    Loading student details...
                </p>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error || !student) {

        return (

            <div className="view-student-error-page">

                <div className="view-error-icon">
                    ⚠️
                </div>

                <h2>
                    Student Not Found
                </h2>

                <p>
                    {error || "Student details are unavailable."}
                </p>

                <button
                    onClick={() =>
                        navigate("/admin/students")
                    }
                >
                    ← Back to Students
                </button>

            </div>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="view-student-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="view-student-sidebar">


                <div className="view-student-brand">

                    <div className="view-brand-icon">
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


                <nav className="view-student-nav">


                    <button
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        📊 Dashboard
                    </button>


                    <button className="active">
                        🎓 Students
                    </button>


                    <button
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        👥 Manage Students
                    </button>


                    <button
                        onClick={() =>
                            navigate("/admin/students/add")
                        }
                    >
                        ➕ Add Student
                    </button>


                    <button
                        onClick={() =>
                            navigate("/admin/rooms")
                        }
                    >
                        🛏️ Rooms
                    </button>


                    <button
                        onClick={() =>
                            navigate("/admin/profile")
                        }
                    >
                        👤 Profile
                    </button>

                </nav>


                <button
                    className="view-student-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="view-student-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="view-student-header">

                    <div>

                        <span>
                            STUDENT MANAGEMENT
                        </span>

                        <h1>
                            Student Details
                        </h1>

                        <p>
                            View complete information about
                            this student.
                        </p>

                    </div>


                    <div className="view-header-actions">

                        <button
                            className="view-back-btn"
                            onClick={() =>
                                navigate(
                                    "/admin/students"
                                )
                            }
                        >
                            ← Manage Students
                        </button>


                        <button
                            className="view-edit-btn"
                            onClick={() =>
                                navigate(
                                    `/admin/students/edit/${student.id}`
                                )
                            }
                        >
                            ✏️ Edit Student
                        </button>

                    </div>

                </header>


                {/* =================================================
                    PROFILE CARD
                ================================================= */}

                <section className="student-profile-card">


                    <div className="student-profile-top">


                        <div className="student-large-avatar">

                            {student.name
                                ?.charAt(0)
                                ?.toUpperCase() || "S"}

                        </div>


                        <div className="student-profile-name">

                            <h2>
                                {student.name}
                            </h2>

                            <p>
                                {student.email}
                            </p>

                            <span>
                                Student ID: #{student.id}
                            </span>

                        </div>


                        <div className="student-status-badge">
                            ● Active
                        </div>

                    </div>


                    {/* =================================================
                        PERSONAL INFORMATION
                    ================================================= */}

                    <div className="student-details-section">

                        <h3>
                            👤 Personal Information
                        </h3>


                        <div className="student-details-grid">


                            <div className="student-detail-item">

                                <span>
                                    Full Name
                                </span>

                                <strong>
                                    {student.name || "—"}
                                </strong>

                            </div>


                            <div className="student-detail-item">

                                <span>
                                    Email
                                </span>

                                <strong>
                                    {student.email || "—"}
                                </strong>

                            </div>


                            <div className="student-detail-item">

                                <span>
                                    Mobile Number
                                </span>

                                <strong>
                                    {student.mobile || "—"}
                                </strong>

                            </div>


                            <div className="student-detail-item">

                                <span>
                                    Parent Email
                                </span>

                                <strong>
                                    {student.parent_email || "—"}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        ACADEMIC INFORMATION
                    ================================================= */}

                    <div className="student-details-section">

                        <h3>
                            🎓 Academic Information
                        </h3>


                        <div className="student-details-grid">


                            <div className="student-detail-item">

                                <span>
                                    College
                                </span>

                                <strong>
                                    {student.college || "—"}
                                </strong>

                            </div>


                            <div className="student-detail-item">

                                <span>
                                    Course
                                </span>

                                <strong>
                                    {student.course || "—"}
                                </strong>

                            </div>


                        </div>

                    </div>


                    {/* =================================================
                        HOSTEL INFORMATION
                    ================================================= */}

                    <div className="student-details-section">

                        <h3>
                            🏠 Hostel Information
                        </h3>


                        <div className="student-details-grid">


                            <div className="student-detail-item">

                                <span>
                                    Hostel
                                </span>

                                <strong>
                                    {student.hostel || "—"}
                                </strong>

                            </div>


                            <div className="student-detail-item">

                                <span>
                                    Hostel Fee
                                </span>

                                <strong className="student-fee">

                                    ₹
                                    {Number(
                                        student.hostel_fee || 0
                                    ).toLocaleString("en-IN")}

                                </strong>

                            </div>


                        </div>

                    </div>


                    {/* =================================================
                        ACCOUNT INFORMATION
                    ================================================= */}

                    <div className="student-details-section">


                        <h3>
                            🔐 Account Information
                        </h3>


                        <div className="student-account-info">

                            <div>

                                <span>
                                    Student Database ID
                                </span>

                                <strong>
                                    #{student.id}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Password
                                </span>

                                <strong>
                                    ••••••••
                                </strong>

                            </div>


                        </div>

                    </div>


                </section>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="view-student-footer">

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

export default ViewStudent;