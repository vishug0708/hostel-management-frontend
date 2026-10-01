import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./StudentSidebar.css";

const menuItems = [
  { label: "Dashboard", icon: "📊", path: "/student/dashboard" },
  { label: "My Profile", icon: "👤", path: "/student/profile" },
  { label: "My Room", icon: "🛏️", path: "/student/room" },
  { label: "My Leave", icon: "📝", path: "/student/leaves" },
  { label: "Apply Leave", icon: "➕", path: "/student/apply-leave" },
  { label: "Gate Pass", icon: "🎫", path: "/student/gatepass" },
  { label: "Complaints", icon: "📩", path: "/student/complaints" },
  { label: "My Fees", icon: "💰", path: "/student/fees" },
  { label: "Notifications", icon: "🔔", path: "/student/notifications" },
  { label: "Cricket Box", icon: "🏏", path: "/student/cricket-box/bookings" }
];

const StudentSidebar = ({
  mobileOpen = false,
  onClose = () => {},
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    onClose();

    if (onLogout) {
      onLogout();
      return;
    }

    localStorage.removeItem("studentToken");
    localStorage.removeItem("token");
    localStorage.removeItem("student");
    localStorage.removeItem("studentPhoto");

    navigate("/student/login", { replace: true });
  };

  const isActive = (path) => {
    if (path === "/student/dashboard") {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="student-sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`student-sidebar ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="student-sidebar-brand">
          <div className="student-sidebar-brand-icon">🏠</div>
          <div>
            <strong>Hostel</strong>
            <span>Student Portal</span>
          </div>
        </div>

        <nav className="student-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`student-sidebar-nav-item ${
                isActive(item.path) ? "active" : ""
              }`}
              onClick={() => navigateTo(item.path)}
            >
              <span className="student-sidebar-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="student-sidebar-logout"
          onClick={handleLogout}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
};

export default StudentSidebar;