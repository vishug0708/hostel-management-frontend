import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";


// =====================================================
// ADMIN
// =====================================================

import Index from "./pages/index";
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
import ManageRooms from "./pages/admin/rooms/ManageRooms";
import FeesDashboard from "./pages/admin/fees/FeesDashboard";
import FeeRecords from "./pages/admin/fees/FeeRecords";
import PendingFees from "./pages/admin/fees/PendingFees";
import StudentFeeDetails from "./pages/admin/fees/StudentFeeDetails";
import ViewComplaints from "./pages/admin/complaints/ViewComplaints";
import ManageGround from "./pages/admin/cricketbox/ManageGround";
import AddGround from "./pages/admin/cricketbox/AddGround";
import EditGround from "./pages/admin/cricketbox/EditGround";
import BookingHistory from "./pages/admin/cricketbox/BookingHistory";
import Reports from "./pages/admin/cricketbox/Reports";
import ManageStaff from "./pages/admin/staff/ManageStaff";
import AddStaff from "./pages/admin/staff/AddStaff";
import EditStaff from "./pages/admin/staff/EditStaff";


// =====================================================
// RECTOR
// =====================================================

import RectorLogin from "./pages/rector/RectorLogin";
import RectorDashboard from "./pages/rector/RectorDashboard";
import RectorManageRooms from "./pages/rector/rooms/ManageRooms";
import RectorViewRoom from "./pages/rector/rooms/ViewRoom";
import RoomAllocation from "./pages/rector/rooms/RoomAllocation";
import RoomDeallocation from "./pages/rector/rooms/RoomDeallocation";
import GatePass from "./pages/rector/gatepass/GatePass";


// =====================================================
// STUDENTS
// =====================================================

import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/StudentDashboard";
import MyProfile from "./pages/student/profile/MyProfile";
import EditProfile from "./pages/student/profile/EditProfile";
import MyRoom from "./pages/student/room/MyRoom";
import MyGatePass from "./pages/student/gatepass/MyGatePass";
import ApplyGatePass from "./pages/student/gatepass/ApplyGatePass";
import ViewGatePass from "./pages/student/gatepass/ViewGatePass";
import VerifyOtp from "./pages/student/gatepass/VerifyOtp";


// =====================================================
// STAFF
// =====================================================

import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";


// =====================================================
// SECURITY
// =====================================================

import SecurityLogin from "./pages/security/SecurityLogin";
import SecurityDashboard from "./pages/security/SecurityDashboard";
import ScanGatePass from "./pages/security/gatepass/ScanGatePass";
import AllowExit from "./pages/security/gatepass/AllowExit";
import AllowEntry from "./pages/security/gatepass/AllowEntry";


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
                    path="/admin/rooms/edit/:id"
                    element={<EditRoom />}
                />

                <Route
                    path="/admin/fees"
                    element={<FeesDashboard />}
                />

                <Route
                    path="/admin/fees/records"
                    element={<FeeRecords />}
                />

                <Route
                    path="/admin/fees/pending"
                    element={<PendingFees />}
                />

                <Route
                    path="/admin/fees/student/:id"
                    element={<StudentFeeDetails />}
                />

                <Route
                    path="/admin/complaints"
                    element={<ViewComplaints />}
                />

                <Route
                    path="/admin/cricket-box"
                    element={<ManageGround />}
                />

                <Route
                    path="/admin/cricket-box/add"
                    element={<AddGround />}
                />

                <Route
                    path="/admin/cricket-box/edit/:id"
                    element={<EditGround />}
                />

                <Route
                    path="/admin/cricket-box/booking-history"
                    element={<BookingHistory />}
                />

                <Route
                    path="/admin/cricket-box/reports"
                    element={<Reports />}
                />

                <Route
                    path="/admin/staff"
                    element={<ManageStaff />}
                />

                <Route
                    path="/admin/staff/add"
                    element={<AddStaff />}
                />

                <Route
                    path="/admin/staff/edit/:id"
                    element={<EditStaff />}
                />



                <Route
                    path="/rector/login"
                    element={<RectorLogin />}
                />

                <Route
                    path="/rector/dashboard"
                    element={<RectorDashboard />}
                />

                <Route
                    path="/rector/rooms"
                    element={<RectorManageRooms />}
                />

                <Route
                    path="/rector/rooms/view/:id"
                    element={<RectorViewRoom />}
                />

                <Route
                    path="/rector/rooms/allocation"
                    element={<RoomAllocation />}
                />

                <Route
                    path="/rector/rooms/deallocation"
                    element={<RoomDeallocation />}
                />

                <Route
                    path="/rector/gatepass"
                    element={<GatePass />}
                />



                <Route
                    path="/student/login"
                    element={<StudentLogin />}
                />

                <Route
                    path="/student/dashboard"
                    element={<StudentDashboard />}
                />

                <Route
                    path="/student/profile"
                    element={<MyProfile />}
                />

                <Route
                    path="/student/profile/edit"
                    element={<EditProfile />}
                />

                <Route path="/student/room" element={<MyRoom />} />

                <Route
                    path="/student/gatepass"
                    element={<MyGatePass />}
                />

                <Route
                    path="/student/gatepass/apply"
                    element={<ApplyGatePass />}
                />

                <Route
                    path="/student/gatepass/view/:gatePassId"
                    element={<ViewGatePass />}
                />

                <Route
                    path="/student/gatepass/verify-otp/:gatePassId"
                    element={<VerifyOtp />}
                />



                <Route path="/staff/login" element={<StaffLogin />} />
                <Route path="/staff/dashboard" element={<StaffDashboard />} />






                <Route
                    path="/security/login"
                    element={<SecurityLogin />}
                />

                <Route
                    path="/security/dashboard"
                    element={<SecurityDashboard />}
                />

                <Route
                    path="/security/gatepass/scan"
                    element={<ScanGatePass />}
                />

                <Route path="/security/gatepass/exit" element={<AllowExit />} />
                <Route path="/security/gatepass/entry" element={<AllowEntry />} />




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
