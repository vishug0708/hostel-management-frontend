import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Index from "./pages/Index";
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import StudentProfile from "./pages/StudentProfile";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminChangePassword from "./pages/admin/AdminChangePassword";
import AddStudent from "./pages/admin/students/AddStudent";
import ManageStudents from "./pages/admin/students/ManageStudents";
import EditStudent from "./pages/admin/students/EditStudent";
import ViewStudent from "./pages/admin/students/ViewStudent";
import AddRoom from "./pages/admin/rooms/AddRoom";
import ViewRoom from "./pages/admin/rooms/ViewRoom";
import EditRoom from "./pages/admin/rooms/EditRoom";
import RoomStatus from "./pages/admin/rooms/RoomStatus";
import ManageRooms from "./pages/admin/rooms/ManageRooms";


// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children }) {

    const token = localStorage.getItem("token");

    if (!token) {
        return (
            <Navigate
                to="/student/login"
                replace
            />
        );
    }

    return children;
}


// =====================================================
// MAIN APP
// =====================================================

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* =========================================
                    DEFAULT INDEX / HOME PAGE
                   ========================================= */}

                <Route
                    path="/"
                    element={<Index />}
                />


                {/* =========================================
                    STUDENT LOGIN
                   ========================================= */}

                <Route
                    path="/student/login"
                    element={<StudentLogin />}
                />


                {/* =========================================
                    STUDENT REGISTER
                   ========================================= */}

                <Route
                    path="/student/register"
                    element={<StudentRegister />}
                />


                {/* =========================================
                    STUDENT PROFILE
                   ========================================= */}

                <Route
                    path="/student/profile"
                    element={
                        <ProtectedRoute>
                            <StudentProfile />
                        </ProtectedRoute>
                    }
                />

                {/* =========================================
                    ADMIN LOGIN
                    ========================================= */}

                <Route
                    path="/admin/login"
                    element={<AdminLogin />}
                />

                {/* =========================================
                    ADMIN DASHBOARD
                    ========================================= */}

                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />


                <Route
                    path="/admin/profile"
                    element={<AdminProfile />}
                />

                <Route
                    path="/admin/change-password"
                    element={<AdminChangePassword />}
                />

                <Route
                    path="/admin/students/add"
                    element={<AddStudent />}
                />

                <Route
                    path="/admin/students"
                    element={<ManageStudents />}
                />

                <Route
                    path="/admin/students/edit/:id"
                    element={<EditStudent />}
                />

                <Route
                    path="/admin/students/view/:id"
                    element={<ViewStudent />}
                />

                <Route
                    path="/admin/rooms/add"
                    element={<AddRoom />}
                />

                <Route
                    path="/admin/rooms"
                    element={<ManageRooms />}
                />

                <Route
                    path="/admin/rooms/view/:id"
                    element={<ViewRoom />}
                />

                <Route
                    path="/admin/rooms/status/:id"
                    element={<RoomStatus />}
                />

                <Route
                    path="/admin/rooms/edit/:id"
                    element={<EditRoom />}
                />


                {/* =========================================
                    UNKNOWN URL
                   ========================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;