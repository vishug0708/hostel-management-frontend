import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProfile.css";

function AdminProfile() {

    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");


    // =====================================================
    // GET ADMIN PROFILE
    // =====================================================

    useEffect(() => {

        const fetchAdminProfile = async () => {

            const token = localStorage.getItem("adminToken");

            if (!token) {

                navigate("/admin/login", {
                    replace: true
                });

                return;
            }


            try {

                const response = await fetch(
                    "http://localhost:5000/api/admin/profile",
                    {
                        method: "GET",

                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );


                const data = await response.json();


                if (!response.ok || !data.success) {

                    setError(
                        data.message ||
                        "Unable to load admin profile."
                    );

                    return;
                }


                setAdmin(data.admin);


            } catch (err) {

                console.error(
                    "Admin Profile Error:",
                    err
                );

                setError(
                    "Cannot connect to backend server."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchAdminProfile();

    }, [navigate]);


    // =====================================================
    // INPUT CHANGE
    // =====================================================

    const handleChange = (e) => {

        setAdmin({
            ...admin,
            [e.target.name]: e.target.value
        });

        setMessage("");

        setError("");

    };


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");

        setError("");


        const token =
            localStorage.getItem("adminToken");


        if (!token) {

            navigate("/admin/login");

            return;
        }


        try {

            setSaving(true);


            const response = await fetch(
                "http://localhost:5000/api/admin/profile",
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        name: admin.name,

                        email: admin.email,

                        phone: admin.phone

                    })
                }
            );


            const data = await response.json();


            if (!response.ok || !data.success) {

                setError(
                    data.message ||
                    "Profile update failed."
                );

                return;
            }


            // =============================================
            // UPDATE LOCAL STORAGE
            // =============================================

            const oldAdmin =
                JSON.parse(
                    localStorage.getItem("admin") || "{}"
                );


            const updatedAdmin = {

                ...oldAdmin,

                name: admin.name,

                email: admin.email,

                phone: admin.phone

            };


            localStorage.setItem(
                "admin",
                JSON.stringify(updatedAdmin)
            );


            setMessage(
                "Profile updated successfully."
            );


        } catch (err) {

            console.error(
                "Update Admin Profile Error:",
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

        localStorage.removeItem("adminToken");

        localStorage.removeItem("admin");

        navigate("/admin/login", {
            replace: true
        });

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="admin-profile-loading">

                <div className="profile-loader">
                    ⏳
                </div>

                <p>
                    Loading admin profile...
                </p>

            </div>

        );

    }


    // =====================================================
    // ERROR WITHOUT ADMIN DATA
    // =====================================================

    if (!admin) {

        return (

            <div className="admin-profile-error">

                <div className="profile-error-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Profile
                </h2>

                <p>
                    {error || "Admin profile not found."}
                </p>

                <button
                    onClick={() =>
                        navigate("/admin/dashboard")
                    }
                >
                    Back to Dashboard
                </button>

            </div>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="admin-profile-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="admin-profile-sidebar">

                <div className="admin-profile-brand">

                    <div className="profile-brand-icon">
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


                <nav className="admin-profile-nav">

                    <button
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        📊 Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        🎓 Students
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
                        className="active"
                    >
                        👤 Profile
                    </button>

                </nav>


                <button
                    className="profile-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="admin-profile-main">


                {/* HEADER */}

                <header className="admin-profile-header">

                    <div>

                        <span>
                            ADMINISTRATION
                        </span>

                        <h1>
                            Admin Profile
                        </h1>

                        <p>
                            View and manage your administrator
                            account information.
                        </p>

                    </div>

                    <button
                        className="back-dashboard-btn"
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                </header>


                {/* PROFILE CONTENT */}

                <section className="admin-profile-container">


                    {/* PROFILE CARD */}

                    <div className="admin-profile-card">


                        {/* PROFILE TOP */}

                        <div className="admin-profile-top">

                            <div className="admin-profile-avatar">
                                👨‍💼
                            </div>

                            <div>

                                <h2>
                                    {admin.name}
                                </h2>

                                <p>
                                    Administrator
                                </p>

                            </div>

                        </div>


                        {/* FORM */}

                        <form
                            className="admin-profile-form"
                            onSubmit={handleSubmit}
                        >


                            {/* NAME */}

                            <div className="profile-form-group">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={admin.name || ""}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="profile-form-group">

                                <label>
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={admin.email || ""}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                />

                            </div>


                            {/* PHONE */}

                            <div className="profile-form-group">

                                <label>
                                    Phone Number
                                </label>

                                <input
                                    type="text"
                                    name="phone"
                                    value={admin.phone || ""}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                />

                            </div>


                            {/* PASSWORD */}

                            <div className="profile-password-info">

                                <span>
                                    🔒
                                </span>

                                <div>

                                    <strong>
                                        Password
                                    </strong>

                                    <p>
                                        Your password is protected
                                        and cannot be viewed here.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/admin/change-password"
                                        )
                                    }
                                >
                                    Change Password
                                </button>

                            </div>


                            {/* MESSAGES */}

                            {message && (

                                <div className="profile-success">
                                    ✓ {message}
                                </div>

                            )}


                            {error && (

                                <div className="profile-error">
                                    ⚠ {error}
                                </div>

                            )}


                            {/* BUTTON */}

                            <div className="profile-form-actions">

                                <button
                                    type="button"
                                    className="cancel-profile-btn"
                                    onClick={() =>
                                        navigate(
                                            "/admin/dashboard"
                                        )
                                    }
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
                                        : "Save Changes"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>


                    {/* ACCOUNT INFORMATION */}

                    <div className="admin-account-card">

                        <div className="account-card-icon">
                            🛡️
                        </div>

                        <h3>
                            Account Information
                        </h3>

                        <div className="account-info-row">

                            <span>
                                Admin ID
                            </span>

                            <strong>
                                #{admin.id}
                            </strong>

                        </div>

                        <div className="account-info-row">

                            <span>
                                Role
                            </span>

                            <strong>
                                Administrator
                            </strong>

                        </div>

                        <div className="account-info-row">

                            <span>
                                Account Status
                            </span>

                            <strong className="active-status">
                                Active
                            </strong>

                        </div>

                    </div>

                </section>


                {/* FOOTER */}

                <footer className="admin-profile-footer">

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

export default AdminProfile;