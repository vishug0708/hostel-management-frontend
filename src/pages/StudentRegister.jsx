import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./StudentRegister.css";

function StudentRegister() {

    const navigate = useNavigate();

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

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);


    // =====================================================
    // HANDLE INPUT CHANGE
    // =====================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

    };


    // =====================================================
    // HANDLE REGISTER
    // =====================================================

    const handleRegister = async (e) => {

        e.preventDefault();

        setMessage("");


        // Password check
        if (formData.password !== formData.confirm_password) {

            setMessage("Passwords do not match.");

            return;
        }


        try {

            setLoading(true);

            const response = await api.post(
                "/auth/student/register",
                formData
            );


            console.log(
                "Registration Response:",
                response.data
            );


            if (response.data.success) {

                setMessage(
                    "Registration successful ✅"
                );


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


                setTimeout(() => {

                    navigate("/student/login");

                }, 1500);


            } else {

                setMessage(
                    response.data.message ||
                    "Registration failed."
                );

            }


        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );


            if (error.response) {

                setMessage(
                    error.response.data.message ||
                    "Registration failed."
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

        <div className="register-page">

            <div className="register-card">


                {/* =================================================
                    HEADER
                   ================================================= */}

                <div className="register-header">

                    <h1>
                        Student Registration
                    </h1>

                    <p>
                        Create your Hostel Management System account
                    </p>

                </div>


                {/* =================================================
                    FORM
                   ================================================= */}

                <form
                    className="register-form"
                    onSubmit={handleRegister}
                >

                    <div className="form-grid">


                        {/* NAME */}

                        <div className="form-group">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />

                        </div>


                        {/* MOBILE */}

                        <div className="form-group">

                            <label>
                                Mobile Number
                            </label>

                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="Enter 10 digit mobile number"
                                maxLength="10"
                                required
                            />

                        </div>


                        {/* PARENT EMAIL */}

                        <div className="form-group">

                            <label>
                                Parent Email
                            </label>

                            <input
                                type="email"
                                name="parent_email"
                                value={formData.parent_email}
                                onChange={handleChange}
                                placeholder="Enter parent email"
                                required
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                required
                            />

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="form-group">

                            <label>
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                            />

                        </div>


                        {/* COLLEGE */}

                        <div className="form-group">

                            <label>
                                College
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

                        <div className="form-group">

                            <label>
                                Course
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

                        <div className="form-group full-width">

                            <label>
                                Hostel
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


                    {/* REGISTER BUTTON */}

                    <button
                        type="submit"
                        className="register-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating Account..."
                            : "Create Student Account"
                        }

                    </button>


                    {/* MESSAGE */}

                    {message && (

                        <div className="register-message">

                            {message}

                        </div>

                    )}


                    {/* LOGIN */}

                    <div className="login-section">

                        Already have an account?

                        <button
                            type="button"
                            className="login-button"
                            onClick={() =>
                                navigate("/student/login")
                            }
                        >
                            Login here
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default StudentRegister;