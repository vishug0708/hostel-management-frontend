import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function StudentProfile() {

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const getProfile = async () => {

            try {

                const response = await api.get(
                    "/student/profile"
                );

                console.log(
                    "Profile Response:",
                    response.data
                );

                if (response.data.success) {

                    setStudent(response.data.student);

                } else {

                    setError(
                        response.data.message ||
                        "Unable to load profile."
                    );
                }

            } catch (error) {

                console.error(
                    "Profile Error:",
                    error
                );

                if (error.response) {

                    setError(
                        error.response.data.message ||
                        "Failed to load profile."
                    );

                } else {

                    setError(
                        "Cannot connect to backend server."
                    );
                }

            } finally {

                setLoading(false);

            }
        };


        getProfile();

    }, []);


    if (loading) {

        return <h2>Loading profile...</h2>;

    }


    if (error) {

        return <h2>{error}</h2>;

    }


    return (

        <div>

            <h1>Student Profile</h1>

            {student && (

                <div>

                    <p>
                        <strong>ID:</strong>{" "}
                        {student.id}
                    </p>

                    <p>
                        <strong>Name:</strong>{" "}
                        {student.name}
                    </p>

                    <p>
                        <strong>Email:</strong>{" "}
                        {student.email}
                    </p>

                    <p>
                        <strong>Mobile:</strong>{" "}
                        {student.mobile}
                    </p>

                    <p>
                        <strong>Parent Email:</strong>{" "}
                        {student.parent_email}
                    </p>

                    <p>
                        <strong>College:</strong>{" "}
                        {student.college}
                    </p>

                    <p>
                        <strong>Course:</strong>{" "}
                        {student.course}
                    </p>

                    <p>
                        <strong>Hostel:</strong>{" "}
                        {student.hostel}
                    </p>

                </div>

            )}

            <button onClick={() => {

                    localStorage.removeItem("token");
                    localStorage.removeItem("student");

                    navigate("/student/login");

                }}>
                    
                Logout
            </button>

        </div>

    );

}

export default StudentProfile;