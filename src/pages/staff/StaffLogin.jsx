import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StaffLogin.css";

function StaffLogin() {

    const navigate = useNavigate();

    const [staffId, setStaffId] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    // =====================================================
    // ADMIN LOGIN
    // =====================================================

    const handleLogin = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        // =================================================
        // VALIDATION
        // =================================================

        if (!staffId || !password) {

            setError(
                "Please enter Staff ID and password."
            );

            return;
        }


        try {

            setLoading(true);


            // =================================================
            // API REQUEST
            // =================================================

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/staff/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        staff_id: staffId.trim(),
                        password: password
                    })
                }
            );


            const data = await response.json();


            console.log("Staff Login Response:", data);


            // =================================================
            // LOGIN FAILED
            // =================================================

            if (!response.ok || !data.success) {

                setError(
                    data.message ||
                    "Invalid Staff ID or password."
                );

                return;
            }


            // =================================================
            // SAVE ADMIN JWT
            // =================================================

            localStorage.setItem(
                "staffToken",
                data.token
            );


            // =================================================
            // SAVE ADMIN INFORMATION
            // =================================================

            localStorage.setItem(
                "admin",
                JSON.stringify(data.staff)
            );


            // =================================================
            // SUCCESS MESSAGE
            // =================================================

            setMessage(
                "Staff login successful! Redirecting..."
            );


            // =================================================
            // REDIRECT TO ADMIN DASHBOARD
            // =================================================

            navigate("/staff/dashboard");


        } catch (error) {

            console.error(
                "Staff Login Error:",
                error
            );


            setError(
                "Cannot connect to backend server."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="staff-login-page">

            <div className="staff-login-card">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="staff-login-header">

                    <div className="staff-login-icon">
                        👨‍💼
                    </div>

                    <h1>
                        Staff Login
                    </h1>

                    <p>
                        Hostel Management System
                    </p>

                </div>


                {/* =================================================
                    LOGIN FORM
                ================================================= */}

                <form
                    className="staff-login-form"
                    onSubmit={handleLogin}
                >


                    {/* EMAIL */}

                    <div className="staff-form-group">

                        <label htmlFor="staff-id">
                            Staff ID
                        </label>

                        <input
                            id="staff-id"
                            type="text"
                            placeholder="Enter Staff ID"
                            value={staffId}
                            onChange={(e) =>
                                setStaffId(e.target.value)
                            }
                            autoComplete="username"
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="staff-form-group">

                        <label htmlFor="admin-password">
                            Password
                        </label>

                        <input
                            id="admin-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            autoComplete="current-password"
                        />

                    </div>


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        className="staff-login-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing In..."
                            : "Sign In"
                        }

                    </button>


                    {/* SUCCESS MESSAGE */}

                    {message && (

                        <div className="staff-login-message success-message">
                            {message}
                        </div>

                    )}


                    {/* ERROR MESSAGE */}

                    {error && (

                        <div className="staff-login-message error-message">
                            {error}
                        </div>

                    )}


                    {/* BACK TO HOME */}

                    <div className="admin-back-home">

                        <Link to="/">
                            ← Back to Home
                        </Link>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default StaffLogin;
