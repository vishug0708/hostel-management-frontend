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
  { label: "Notifications", icon: "🔔", path: "/student/notifications" },
  { label: "Cricket Box", icon: "🏏", path: "/student/cricket-box/bookings" },
];

const statusSteps = ["Submitted", "Assigned", "In Progress", "Resolution Pending", "OTP Verification", "Closed"];

const getPhotoUrl = (photo) => {
  if (!photo) return "";
  const value = String(photo).trim();
  if (value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http")) return value;
  const normalized = value.replace(/^\/+/, "");
  if (normalized.startsWith("uploads/")) return `${API_URL}/${normalized}`;
  return `${API_URL}/uploads/students/${normalized}`;
};

const formatDateTime = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
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

  const getToken = () => localStorage.getItem("studentToken") || localStorage.getItem("token");

  useEffect(() => {
    const saved = localStorage.getItem("student");
    if (saved) {
      try { setStudent(JSON.parse(saved)); } catch { setStudent(null); }
    }
  }, []);

  useEffect(() => {
    if (student && currentId) fetchComplaint();
  }, [student, currentId]);

  useEffect(() => {
    const outside = (event) => {
      if (mobileMenuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && menuButtonRef.current && !menuButtonRef.current.contains(event.target)) setMobileMenuOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [mobileMenuOpen]);

  const fetchComplaint = async () => {
    const token = getToken();
    const studentId = student?.id || student?.student_id;
    if (!token || !studentId) {
      setError("Student login session not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/student/complaints/${studentId}/${currentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("token");
        localStorage.removeItem("student");
        navigate("/student/login", { replace: true });
        return;
      }

      if (!response.ok || !data.success) throw new Error(data.message || "Failed to load complaint.");
      setComplaint(data.complaint);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load complaint.");
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const logout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("token");
    localStorage.removeItem("student");
    navigate("/student/login", { replace: true });
  };

  const photo = getPhotoUrl(student?.photo);
  const currentIndex = Math.max(0, statusSteps.indexOf(complaint?.status));

  if (loading) return <div className="view-complaint-loading"><div className="view-complaint-loader" /><p>Loading complaint...</p></div>;

  return (
    <div className="student-view-complaint-page">
      <aside ref={sidebarRef} className={`student-dashboard-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="student-dashboard-brand"><div className="student-dashboard-brand-icon">🏠</div><div><strong>Hostel</strong><span>Student Portal</span></div></div>
        <nav className="student-dashboard-nav">
          {menuItems.map((item) => <button key={item.path} className={item.label === "Complaints" ? "active" : ""} onClick={() => navigateTo(item.path)}><span>{item.icon}</span><span>{item.label}</span></button>)}
        </nav>
        <button className="student-dashboard-logout" onClick={logout}><span>🚪</span><span>Logout</span></button>
      </aside>

      {mobileMenuOpen && <div className="student-dashboard-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}

      <main className="student-view-complaint-main">
        <div className="student-dashboard-mobile-topbar">
          <button ref={menuButtonRef} className="student-dashboard-mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>☰</button>
          <div className="student-dashboard-mobile-brand"><strong>Hostel Student Panel</strong><span>Complaint Details</span></div>
          <div className="student-dashboard-mobile-photo">{photo ? <img src={photo} alt="Student" /> : "👤"}</div>
        </div>

        <header className="view-complaint-header">
          <div><span>HOSTEL SERVICES</span><h1>Complaint Details</h1><p>Track assigned staff, expected resolution and the complete resolution workflow.</p></div>
        </header>

        <section className="view-complaint-content">
          <button className="view-complaint-back" onClick={() => navigateTo("/student/complaints")}>← Back to Complaints</button>

          {error ? (
            <div className="view-complaint-error">⚠️ {error}<button onClick={fetchComplaint}>Retry</button></div>
          ) : complaint && (
            <>
              <div className="view-complaint-summary">
                <div><span>COMPLAINT</span><h2>{complaint.complaint_code}</h2><p>{complaint.subject}</p></div>
                <span className={`view-complaint-status status-${String(complaint.status).toLowerCase().replace(/\s+/g, "-")}`}>{complaint.status}</span>
              </div>

              <div className="view-complaint-progress">
                {statusSteps.map((step, index) => (
                  <div key={step} className={`progress-step ${index <= currentIndex ? "done" : ""}`}>
                    <div className="progress-dot">{index < currentIndex ? "✓" : index + 1}</div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className="view-complaint-grid">
                <section className="view-complaint-card">
                  <div className="view-complaint-card-title"><h3>Complaint Information</h3></div>
                  <div className="view-complaint-details">
                    <div><span>Category</span><strong>{complaint.category}</strong></div>
                    <div><span>Submitted</span><strong>{formatDateTime(complaint.created_at)}</strong></div>
                    <div className="full"><span>Subject</span><strong>{complaint.subject}</strong></div>
                    <div className="full"><span>Description</span><p>{complaint.description}</p></div>
                    {complaint.attachment && <div className="full"><span>Attachment</span><a href={`${API_URL}/${String(complaint.attachment).replace(/^\/+/, "")}`} target="_blank" rel="noreferrer">View Attachment</a></div>}
                  </div>
                </section>

                <section className="view-complaint-card">
                  <div className="view-complaint-card-title"><h3>Assigned Staff</h3></div>
                  <div className="assigned-staff-box">
                    <div className="assigned-staff-photo">
                      {getPhotoUrl(complaint.assigned_staff_photo) ? <img src={getPhotoUrl(complaint.assigned_staff_photo)} alt="Staff" /> : <span>{complaint.assigned_staff_name?.charAt(0)?.toUpperCase() || "S"}</span>}
                    </div>
                    <div><h4>{complaint.assigned_staff_name || "Not assigned"}</h4><span>{complaint.assigned_staff_role || "-"}</span><span>📱 {complaint.assigned_staff_mobile || "-"}</span></div>
                  </div>
                  <div className="expected-box"><span>Expected Resolution</span><strong>{formatDateTime(complaint.expected_resolution_at)}</strong></div>
                </section>

                <section className="view-complaint-card">
                  <div className="view-complaint-card-title"><h3>Backup Student</h3></div>
                  <div className="backup-detail">
                    <div className="backup-detail-photo">
                      {getPhotoUrl(complaint.backup_student_photo) ? <img src={getPhotoUrl(complaint.backup_student_photo)} alt="Backup" /> : <span>{complaint.backup_student_name?.charAt(0)?.toUpperCase() || "B"}</span>}
                    </div>
                    <div><h4>{complaint.backup_student_name || "-"}</h4><span>ID: {complaint.backup_student_id || "-"}</span><span>📱 {complaint.backup_student_mobile || "-"}</span><span>✉️ {complaint.backup_student_email || "-"}</span></div>
                  </div>
                </section>

                <section className="view-complaint-card">
                  <div className="view-complaint-card-title"><h3>Resolution</h3></div>
                  <div className="resolution-box">
                    <div><span>Resolution Note</span><p>{complaint.resolution_note || "Not recorded yet."}</p></div>
                    <div><span>OTP Recipient</span><strong>{complaint.otp_recipient_type ? `${complaint.otp_recipient_type} (${complaint.otp_email || "-"})` : "Not selected yet"}</strong></div>
                    <div><span>OTP Verification</span><strong>{complaint.otp_verified === "Yes" ? `Verified on ${formatDateTime(complaint.otp_verified_at)}` : "Pending"}</strong></div>
                    <div><span>Closed At</span><strong>{complaint.closed_at ? formatDateTime(complaint.closed_at) : "Not closed"}</strong></div>
                    <div><span>Rating</span><strong>{complaint.rating ? `${complaint.rating}/5` : "Waiting for rating email recipient"}</strong></div>
                    {complaint.rating_feedback && <div><span>Rating Feedback</span><p>{complaint.rating_feedback}</p></div>}
                  </div>
                </section>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default ViewComplaint;
