import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Complaints.css";

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

const getPhotoUrl = (photo) => {
  if (!photo) return "";
  const value = String(photo).trim();
  if (value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http")) return value;
  const normalized = value.replace(/^\/+/, "");
  if (normalized.startsWith("uploads/")) return `${API_URL}/${normalized}`;
  return `${API_URL}/uploads/students/${normalized}`;
};

const formatDateTime = (value) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const statusClass = (status) => String(status || "Submitted").toLowerCase().replace(/\s+/g, "-");

const Complaints = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [student, setStudent] = useState(null);
  const [complaints, setComplaints] = useState([]);
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
    if (student) fetchComplaints();
  }, [student]);

  useEffect(() => {
    const outside = (event) => {
      if (
        mobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) setMobileMenuOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [mobileMenuOpen]);

  const fetchComplaints = async () => {
    const token = getToken();
    const studentId = student?.id || student?.student_id;

    if (!token || !studentId) {
      setError("Student login session not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/student/complaints/${studentId}`, {
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

      if (!response.ok || !data.success) throw new Error(data.message || "Failed to load complaints.");
      setComplaints(Array.isArray(data.complaints) ? data.complaints : []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load complaints.");
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
  const initials = String(student?.name || "Student").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="student-complaints-page">
      <aside ref={sidebarRef} className={`student-dashboard-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="student-dashboard-brand">
          <div className="student-dashboard-brand-icon">🏠</div>
          <div><strong>Hostel</strong><span>Student Portal</span></div>
        </div>
        <nav className="student-dashboard-nav">
          {menuItems.map((item) => (
            <button key={item.path} className={item.label === "Complaints" ? "active" : ""} onClick={() => navigateTo(item.path)}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="student-dashboard-logout" onClick={logout}><span>🚪</span><span>Logout</span></button>
      </aside>

      {mobileMenuOpen && <div className="student-dashboard-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}

      <main className="student-complaints-main">
        <header className="student-dashboard-mobile-topbar">
          <button ref={menuButtonRef} className="student-dashboard-mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>☰</button>
          <div className="student-dashboard-mobile-brand"><strong>Hostel Student Panel</strong><span>My Complaints</span></div>
          <div className="student-dashboard-mobile-photo">{photo ? <img src={photo} alt="Student" /> : initials}</div>
        </header>

        <header className="student-complaints-header">
          <div>
            <span>HOSTEL SERVICES</span>
            <h1>My Complaints</h1>
            <p>Raise a complaint, track the assigned staff and follow the resolution.</p>
          </div>
          <button type="button" className="student-complaints-profile" onClick={() => navigateTo("/student/profile")} aria-label="Open student profile">
            {photo ? <img src={photo} alt="Student" /> : initials}
          </button>
        </header>

        <section className="student-complaints-content">
          <div className="student-complaints-heading">
            <div><span>COMPLAINT MANAGEMENT</span><h2>Complaint History</h2><p>Backup student is mandatory for every new complaint.</p></div>
            <button className="student-complaints-new-btn" onClick={() => navigateTo("/student/complaints/new")}><span>+</span> New Complaint</button>
          </div>

          {error && <div className="student-complaints-error">⚠️ {error}<button onClick={fetchComplaints}>Retry</button></div>}

          <div className="student-complaints-info-grid">
            <div className="student-complaints-info-card"><div className="student-complaints-info-icon">📩</div><div><span>Total Complaints</span><strong>{complaints.length}</strong></div></div>
            <div className="student-complaints-info-card"><div className="student-complaints-info-icon">🔄</div><div><span>Open</span><strong>{complaints.filter((c) => c.status !== "Closed").length}</strong></div></div>
            <div className="student-complaints-info-card"><div className="student-complaints-info-icon">✅</div><div><span>Closed</span><strong>{complaints.filter((c) => c.status === "Closed").length}</strong></div></div>
          </div>

          <section className="student-complaints-section">
            {loading ? (
              <div className="student-complaints-empty"><div className="student-complaints-loader" /><h3>Loading complaints...</h3></div>
            ) : complaints.length === 0 ? (
              <div className="student-complaints-empty"><div className="student-complaints-empty-icon">📋</div><h3>No Complaints Yet</h3><p>Raise your first hostel complaint.</p><button className="student-complaints-new-btn" onClick={() => navigateTo("/student/complaints/new")}>Create Complaint</button></div>
            ) : (
              <>
                <div className="student-complaints-desktop-table-wrapper">
                  <table className="student-complaints-table">
                    <thead><tr><th>Complaint</th><th>Category</th><th>Assigned Staff</th><th>Backup Student</th><th>Expected Resolution</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {complaints.map((c) => (
                        <tr key={c.id}>
                          <td><strong>{c.complaint_code}</strong><span>{c.subject}</span></td>
                          <td>{c.category}</td>
                          <td><strong>{c.assigned_staff_name || "Not assigned"}</strong><span>{c.assigned_staff_mobile || "-"}</span></td>
                          <td><strong>{c.backup_student_name || "-"}</strong><span>{c.backup_student_email || "-"}</span></td>
                          <td>{formatDateTime(c.expected_resolution_at)}</td>
                          <td><span className={`student-complaint-status ${statusClass(c.status)}`}>{c.status}</span></td>
                          <td><button className="student-complaints-view-button" onClick={() => navigateTo(`/student/complaints/view/${c.id}`)}>View</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="student-complaints-mobile-list">
                  {complaints.map((c) => (
                    <article className="student-complaint-mobile-card" key={c.id}>
                      <div className="mobile-card-top"><strong>{c.complaint_code}</strong><span className={`student-complaint-status ${statusClass(c.status)}`}>{c.status}</span></div>
                      <h3>{c.subject}</h3><p>{c.category}</p>
                      <div><span>Assigned Staff</span><strong>{c.assigned_staff_name || "Not assigned"}</strong></div>
                      <div><span>Mobile</span><strong>{c.assigned_staff_mobile || "-"}</strong></div>
                      <div><span>Backup Student</span><strong>{c.backup_student_name || "-"}</strong></div>
                      <div><span>Expected Resolution</span><strong>{formatDateTime(c.expected_resolution_at)}</strong></div>
                      <button onClick={() => navigateTo(`/student/complaints/view/${c.id}`)}>View Complaint</button>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </section>
      </main>
    </div>
  );
};

export default Complaints;
