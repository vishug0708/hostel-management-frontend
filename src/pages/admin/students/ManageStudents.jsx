import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageStudents.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ManageStudents() {

    const navigate = useNavigate();

    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");


    // =====================================================
    // FETCH STUDENTS
    // =====================================================

    useEffect(() => {

        const fetchStudents = async () => {

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
                    `${API_URL}/api/admin/students`,
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
                        "Unable to load students."
                    );

                    return;
                }


                setStudents(
                    data.students || []
                );


            } catch (err) {

                console.error(
                    "Fetch Students Error:",
                    err
                );

                setError(
                    "Cannot connect to backend server."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchStudents();

    }, [navigate]);


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredStudents =
        students.filter((student) => {

            const searchText =
                search.toLowerCase().trim();

            return (

                student.name
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                student.email
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                student.mobile
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                student.college
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                student.course
                    ?.toLowerCase()
                    .includes(searchText)

            );

        });


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

            <div className="manage-students-loading">

                <div className="students-loader">
                    ⏳
                </div>

                <p>
                    Loading students...
                </p>

            </div>

        );

    }


    return (

        <div className="manage-students-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="manage-students-sidebar">


                <div className="manage-students-brand">

                    <div className="manage-brand-icon">
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


                <nav className="manage-students-nav">

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
                            navigate("/admin/fees")
                        }
                    >
                        💳 Fees
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
                    className="manage-students-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="manage-students-main">


                {/* HEADER */}

                <header className="manage-students-header">

                    <div>

                        <span>
                            STUDENT MANAGEMENT
                        </span>

                        <h1>
                            Manage Students
                        </h1>

                        <p>
                            View and manage all registered
                            hostel students.
                        </p>

                    </div>


                    <button
                        className="add-new-student-btn"
                        onClick={() =>
                            navigate(
                                "/admin/students/add"
                            )
                        }
                    >
                        ➕ Add Student
                    </button>

                </header>


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="student-stats">

                    <div className="student-stat-card">

                        <div className="student-stat-icon">
                            🎓
                        </div>

                        <div>

                            <span>
                                Total Students
                            </span>

                            <strong>
                                {students.length}
                            </strong>

                        </div>

                    </div>


                    <div className="student-stat-card">

                        <div className="student-stat-icon">
                            🏠
                        </div>

                        <div>

                            <span>
                                Hostel Students
                            </span>

                            <strong>
                                {students.filter(
                                    student =>
                                        student.hostel
                                ).length}
                            </strong>

                        </div>

                    </div>


                    <div className="student-stat-card">

                        <div className="student-stat-icon">
                            🏫
                        </div>

                        <div>

                            <span>
                                Colleges
                            </span>

                            <strong>
                                {
                                    new Set(
                                        students
                                            .map(
                                                student =>
                                                    student.college
                                            )
                                            .filter(Boolean)
                                    ).size
                                }
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    STUDENTS TABLE
                ================================================= */}

                <section className="students-table-card">


                    <div className="students-table-header">

                        <div>

                            <h2>
                                Student List
                            </h2>

                            <p>
                                {filteredStudents.length}
                                {" "}student(s) found
                            </p>

                        </div>


                        <div className="student-search">

                            <span>
                                🔍
                            </span>

                            <input
                                type="text"
                                placeholder="Search students..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>


                    {error && (

                        <div className="students-error">
                            ⚠ {error}
                        </div>

                    )}


                    {filteredStudents.length === 0 ? (

                        <div className="no-students">

                            <div>
                                🎓
                            </div>

                            <h3>
                                No Students Found
                            </h3>

                            <p>
                                {search
                                    ? "Try a different search."
                                    : "No students have been registered yet."
                                }
                            </p>

                            {!search && (

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/admin/students/add"
                                        )
                                    }
                                >
                                    ➕ Add First Student
                                </button>

                            )}

                        </div>

                    ) : (

                        <div className="students-table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Mobile
                                        </th>

                                        <th>
                                            College
                                        </th>

                                        <th>
                                            Course
                                        </th>

                                        <th>
                                            Hostel
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredStudents.map(
                                        (student) => (

                                            <tr
                                                key={
                                                    student.id
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        #
                                                        {student.id}
                                                    </strong>
                                                </td>


                                                <td>

                                                    <div className="student-name-cell">

                                                        <div className="student-avatar">
                                                            {student.name
                                                                ?.charAt(0)
                                                                ?.toUpperCase()
                                                                || "S"}
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    student.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    student.email
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>
                                                    {
                                                        student.mobile
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        student.college
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        student.course
                                                    }
                                                </td>


                                                <td>

                                                    <span className="hostel-badge">

                                                        {
                                                            student.hostel
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="student-actions">

                                                        <button
                                                            title="View"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/students/view/${student.id}`
                                                                )
                                                            }
                                                        >
                                                            👁️
                                                        </button>

                                                        <button
                                                            title="Edit"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/students/edit/${student.id}`
                                                                )
                                                            }
                                                        >
                                                            ✏️
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* FOOTER */}

                <footer className="manage-students-footer">

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

export default ManageStudents;