import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./StudentLogin.css";

function StudentLogin() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");


    // =====================================================
    // HANDLE LOGIN
    // =====================================================

    const handleLogin = async (e) => {

        e.preventDefault();

        setMessage("");


        // Basic validation
        if (!email || !password) {

            setMessage(
                "Please enter email and password."
            );

            return;
        }


        try {

            setLoading(true);


            const response = await api.post(
                "/auth/student/login",
                {
                    email: email,
                    password: password
                }
            );


            console.log(
                "Login Response:",
                response.data
            );


            if (response.data.success) {

                // Save JWT
                localStorage.setItem(
                    "token",
                    response.data.token
                );


                // Save student data
                localStorage.setItem(
                    "student",
                    JSON.stringify(
                        response.data.student
                    )
                );


                setMessage(
                    "Login successful ✅"
                );


                // Redirect to profile
                setTimeout(() => {

                    navigate("/student/profile");

                }, 500);


            } else {

                setMessage(
                    response.data.message ||
                    "Login failed."
                );

            }


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );


            if (error.response) {

                setMessage(
                    error.response.data.message ||
                    "Invalid email or password."
                );

            } else {

                setMessage(
                    "Cannot connect to backend server."
                );

            }


        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="login-page">

            <div className="login-card">


                {/* =================================================
                    HEADER
                   ================================================= */}

                <div className="login-header">

                    <div className="login-logo">
                        🏠
                    </div>

                    <h1>
                        Student Login
                    </h1>

                    <p>
                        Welcome back to Hostel Management System
                    </p>

                </div>


                {/* =================================================
                    LOGIN FORM
                   ================================================= */}

                <form
                    className="login-form"
                    onSubmit={handleLogin}
                >


                    {/* EMAIL */}

                    <div className="login-form-group">

                        <label>
                            Email Address
                        </label>

                        <div className="login-input-wrapper">

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="Enter your email"
                                required
                            />

                        </div>

                    </div>


                    {/* PASSWORD */}

                    <div className="login-form-group">

                        <label>
                            Password
                        </label>

                        <div className="login-input-wrapper">

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter your password"
                                required
                            />

                        </div>

                    </div>


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        className="login-submit-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing In..."
                            : "Sign In"
                        }

                    </button>


                    {/* MESSAGE */}

                    {message && (

                        <div className="login-message">

                            {message}

                        </div>

                    )}


                    {/* REGISTER */}

                    <div className="register-section">

                        Don't have an account?

                        <button
                            type="button"
                            className="register-button"
                            onClick={() =>
                                navigate("/student/register")
                            }
                        >
                            Create Account
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default StudentLogin;