import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ViewComplaint.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const menuItems = [
  { label: "Dashboard", icon: "📊", path: "/student/dashboard" },
  { label: "My Profile", icon: "👤", path: "/student/profile" },
  { label: "My Room", icon: "🛏️", path: "/student/room" },
  { label: "My Leave", icon: "📝", path: "/student/leaves" },
  { label: "Apply Leave", icon: "➕", path: "/student/apply-leave" },
  { label: "Gate Pass", icon: "🎫", path: "/student/gatepass" },
  { label: "Complaints", icon: "📩", path: "/student/complaints" },
  { label: "My Fees", icon: "💰", path: "/student/fees" },
  { label: "Cricket Box", icon: "🏏", path: "/student/cricket-box/bookings" },
  { label: "Notifications", icon: "🔔", path: "/student/notifications" },
];
const statusSteps = [
  "Submitted",
  "Assigned",
  "In Progress",
  "Resolution Pending",
  "OTP Verification",
  "Closed",
];

const getPhotoUrl = (photo) => {
  if (!photo) return "";
  const value = String(photo).trim();
  if (
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  )
    return value;
  const normalized = value.replace(/^\/+/, "");
  if (normalized.startsWith("uploads/")) return `${API_URL}/${normalized}`;
  return `${API_URL}/uploads/students/${normalized}`;
};

const formatDateTime = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ViewComplaint = () => {
  const navigate = useNavigate();
  const { id, complaintId } = useParams();
  const currentId = complaintId || id;
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [student, setStudent] = useState(null);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getToken = () =>
    localStorage.getItem("studentToken") || localStorage.getItem("token");
  const getStudentId = () => student?.id || student?.student_id || null;

  useEffect(() => {
    document.title = "View Complaint | Hostel Management System";
    const saved = localStorage.getItem("student");
    if (saved) {
      try {
        setStudent(JSON.parse(saved));
      } catch {
        setStudent(null);
      }
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      "student-view-complaint-menu-open",
      mobileMenuOpen,
    );
    return () =>
      document.body.classList.remove("student-view-complaint-menu-open");
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const outside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      )
        setMobileMenuOpen(false);
    };
    document.addEventListener("pointerdown", outside, true);
    return () => document.removeEventListener("pointerdown", outside, true);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (currentId && student) fetchComplaint();
    if (!currentId) {
      setError("Complaint ID is missing.");
      setLoading(false);
    }
  }, [currentId, student]);

  const fetchComplaint = async () => {
    const token = getToken();
    const studentId = getStudentId();
    if (!token || !studentId) {
      setError("Student login session not found.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `${API_URL}/api/student/complaints/${studentId}/${currentId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("token");
        localStorage.removeItem("student");
        navigate("/student/login", { replace: true });
        return;
      }
      if (!response.ok || !data.success)
        throw new Error(data.message || "Failed to load complaint.");
      setComplaint(data.complaint || data.data);
    } catch (err) {
      console.error("View Complaint Error:", err);
      setError(err.message || "Unable to load complaint.");
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };
  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("token");
    localStorage.removeItem("student");
    navigate("/student/login", { replace: true });
  };
  const photo = getPhotoUrl(student?.photo);
  const initials = String(student?.name || "Student")
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();
  const currentIndex = Math.max(0, statusSteps.indexOf(complaint?.status));

  if (loading)
    return (
      <div className="view-complaint-loading">
        <div className="view-complaint-loader" />
        <p>Loading complaint...</p>
      </div>
    );

  return (
    <div className="student-view-complaint-page">
      <aside
        ref={sidebarRef}
        className={`student-dashboard-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}
      >
        <div className="student-dashboard-brand">
          <div className="student-dashboard-brand-icon">🏠</div>
          <div>
            <strong>Hostel</strong>
            <span>Student Portal</span>
          </div>
        </div>
        <nav className="student-dashboard-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={item.label === "Complaints" ? "active" : ""}
              onClick={() => navigateTo(item.path)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="student-dashboard-logout" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </aside>
      {mobileMenuOpen && (
        <div
          className="student-dashboard-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <main className="student-view-complaint-main">
        <div className="student-dashboard-mobile-topbar">
          <button
            ref={menuButtonRef}
            type="button"
            className="student-dashboard-mobile-menu-btn"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            ☰
          </button>
          <div className="student-dashboard-mobile-brand">
            <div className="student-dashboard-mobile-brand-icon">🏠</div>
            <div>
              <strong>Hostel</strong>
              <span>Student Portal</span>
            </div>
          </div>
          <div className="student-dashboard-mobile-photo">
            {photo ? (
              <img src={photo} alt="Student" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
        </div>
        <header className="view-complaint-header">
          <div>
            <span>HOSTEL SERVICES</span>
            <h1>Complaint Details</h1>
            <p>
              Track complaint progress, assigned staff and resolution
              information.
            </p>
          </div>
        </header>
        <section className="view-complaint-content">
          <button
            className="view-complaint-back"
            onClick={() => navigateTo("/student/complaints")}
          >
            ← Back to Complaints
          </button>
          {error ? (
            <div className="view-complaint-error">
              ⚠️ {error}
              <button onClick={fetchComplaint}>Retry</button>
            </div>
          ) : (
            complaint && (
              <>
                <div className="view-complaint-summary">
                  <div>
                    <span>COMPLAINT</span>
                    <h2>{complaint.complaint_code || `#${complaint.id}`}</h2>
                    <p>{complaint.subject}</p>
                  </div>
                  <span
                    className={`view-complaint-status status-${String(
                      complaint.status || "submitted",
                    )
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {complaint.status || "Submitted"}
                  </span>
                </div>
                <div className="view-complaint-progress">
                  {statusSteps.map((step, index) => (
                    <div
                      key={step}
                      className={`progress-step ${index <= currentIndex ? "done" : ""}`}
                    >
                      <div className="progress-dot">
                        {index < currentIndex ? "✓" : index + 1}
                      </div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
                <div className="view-complaint-grid">
                  <section className="view-complaint-card">
                    <div className="view-complaint-card-title">
                      <h3>Complaint Information</h3>
                    </div>
                    <div className="view-complaint-details">
                      <div>
                        <span>Category</span>
                        <strong>{complaint.category || "-"}</strong>
                      </div>
                      <div>
                        <span>Submitted</span>
                        <strong>{formatDateTime(complaint.created_at)}</strong>
                      </div>
                      <div className="full">
                        <span>Subject</span>
                        <strong>{complaint.subject || "-"}</strong>
                      </div>
                      <div className="full">
                        <span>Description</span>
                        <p>{complaint.description || "-"}</p>
                      </div>
                      {complaint.attachment && (
                        <div className="full">
                          <span>Attachment</span>
                          <a
                            href={getPhotoUrl(complaint.attachment)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Attachment
                          </a>
                        </div>
                      )}
                    </div>
                  </section>
                  <section className="view-complaint-card">
                    <div className="view-complaint-card-title">
                      <h3>Assigned Staff</h3>
                    </div>
                    <div className="assigned-staff-box">
                      <div className="assigned-staff-photo">
                        {getPhotoUrl(complaint.assigned_staff_photo) ? (
                          <img
                            src={getPhotoUrl(complaint.assigned_staff_photo)}
                            alt={complaint.assigned_staff_name || "Staff"}
                          />
                        ) : (
                          <span>
                            {complaint.assigned_staff_name
                              ?.charAt(0)
                              ?.toUpperCase() || "S"}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4>
                          {complaint.assigned_staff_name || "Not assigned"}
                        </h4>
                        <span>{complaint.assigned_staff_role || "-"}</span>
                        <span>
                          📱{" "}
                          {complaint.assigned_staff_mobile ||
                            "Mobile not available"}
                        </span>
                      </div>
                    </div>
                    <div className="expected-box">
                      <span>Expected Resolution</span>
                      <strong>
                        {complaint.expected_resolution_at
                          ? formatDateTime(complaint.expected_resolution_at)
                          : "Not set by staff yet"}
                      </strong>
                    </div>
                  </section>
                  <section className="view-complaint-card">
                    <div className="view-complaint-card-title">
                      <h3>Backup Student</h3>
                    </div>
                    <div className="backup-detail">
                      <div className="backup-detail-photo">
                        {getPhotoUrl(complaint.backup_student_photo) ? (
                          <img
                            src={getPhotoUrl(complaint.backup_student_photo)}
                            alt={complaint.backup_student_name || "Backup"}
                          />
                        ) : (
                          <span>
                            {complaint.backup_student_name
                              ?.charAt(0)
                              ?.toUpperCase() || "S"}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4>{complaint.backup_student_name || "-"}</h4>
                        <span>ID: {complaint.backup_student_id || "-"}</span>
                        <span>📱 {complaint.backup_student_mobile || "-"}</span>
                        <span>✉️ {complaint.backup_student_email || "-"}</span>
                      </div>
                    </div>
                  </section>
                  <section className="view-complaint-card">
                    <div className="view-complaint-card-title">
                      <h3>Resolution</h3>
                    </div>
                    <div className="resolution-box">
                      <div>
                        <span>Resolution Note</span>
                        <p>
                          {complaint.resolution_note ||
                            "Resolution has not been recorded yet."}
                        </p>
                      </div>
                      <div>
                        <span>OTP Verification</span>
                        <strong>
                          {complaint.otp_verified === "Yes"
                            ? "Verified"
                            : "Pending"}
                        </strong>
                      </div>
                      <div>
                        <span>Closed At</span>
                        <strong>
                          {complaint.closed_at
                            ? formatDateTime(complaint.closed_at)
                            : "Not closed"}
                        </strong>
                      </div>
                      {complaint.rating ? (
                        <div>
                          <span>Rating</span>
                          <strong>{complaint.rating}/5</strong>
                        </div>
                      ) : null}
                    </div>
                  </section>
                </div>
              </>
            )
          )}
        </section>
      </main>
    </div>
  );
};

export default ViewComplaint;
