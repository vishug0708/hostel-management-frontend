import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
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

        if (!email || !password) {

            setError(
                "Please enter email and password."
            );

            return;
        }


        try {

            setLoading(true);


            // =================================================
            // API REQUEST
            // =================================================

            const response = await fetch(
                "http://localhost:5000/api/auth/admin/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        password: password
                    })
                }
            );


            const data = await response.json();


            console.log("Admin Login Response:", data);


            // =================================================
            // LOGIN FAILED
            // =================================================

            if (!response.ok || !data.success) {

                setError(
                    data.message ||
                    "Invalid email or password."
                );

                return;
            }


            // =================================================
            // SAVE ADMIN JWT
            // =================================================

            localStorage.setItem(
                "adminToken",
                data.token
            );


            // =================================================
            // SAVE ADMIN INFORMATION
            // =================================================

            localStorage.setItem(
                "admin",
                JSON.stringify(data.admin)
            );


            // =================================================
            // SUCCESS MESSAGE
            // =================================================

            setMessage(
                "Admin login successful! Redirecting..."
            );


            // =================================================
            // REDIRECT TO ADMIN DASHBOARD
            // =================================================

            navigate("/admin/dashboard");


        } catch (error) {

            console.error(
                "Admin Login Error:",
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

        <div className="admin-login-page">

            <div className="admin-login-card">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="admin-login-header">

                    <div className="admin-login-icon">
                        👨‍💼
                    </div>

                    <h1>
                        Admin Login
                    </h1>

                    <p>
                        Hostel Management System
                    </p>

                </div>


                {/* =================================================
                    LOGIN FORM
                ================================================= */}

                <form
                    className="admin-login-form"
                    onSubmit={handleLogin}
                >


                    {/* EMAIL */}

                    <div className="admin-form-group">

                        <label htmlFor="admin-email">
                            Email Address
                        </label>

                        <input
                            id="admin-email"
                            type="email"
                            placeholder="Enter admin email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            autoComplete="email"
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="admin-form-group">

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
                        className="admin-login-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing In..."
                            : "Sign In"
                        }

                    </button>


                    {/* SUCCESS MESSAGE */}

                    {message && (

                        <div className="admin-login-message success-message">
                            {message}
                        </div>

                    )}


                    {/* ERROR MESSAGE */}

                    {error && (

                        <div className="admin-login-message error-message">
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

export default AdminLogin;