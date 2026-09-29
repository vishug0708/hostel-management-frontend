import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Complaints.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const menuItems = [
  { label: "Dashboard", icon: "📊", path: "/rector/dashboard" },
  { label: "Manage Rooms", icon: "🏠", path: "/rector/rooms" },
  { label: "Gate Pass", icon: "🚪", path: "/rector/gatepass" },
  { label: "Leave Requests", icon: "📋", path: "/rector/leave" },
  { label: "Complaints", icon: "📩", path: "/rector/complaints" },
  { label: "Cricket Box", icon: "🏏", path: "/rector/cricket-box" },
  { label: "Attendance", icon: "✅", path: "/rector/attendance" },
  { label: "Profile", icon: "👤", path: "/rector/profile" },
];

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
  const [rector, setRector] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getToken = () => localStorage.getItem("rectorToken") || localStorage.getItem("token");

  useEffect(() => {
    const saved = localStorage.getItem("rector");
    if (saved) {
      try { setRector(JSON.parse(saved)); } catch { setRector(null); }
    }
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    const token = getToken();
    if (!token) {
      navigate("/rector/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/rector/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("rectorToken");
        localStorage.removeItem("token");
        localStorage.removeItem("rector");
        navigate("/rector/login", { replace: true });
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

  const filtered = complaints.filter((c) => {
    const statusMatch = filterStatus === "All" || c.status === filterStatus;
    const categoryMatch = filterCategory === "All" || c.category === filterCategory;
    const q = searchTerm.toLowerCase().trim();
    const searchMatch = !q ||
      String(c.complaint_code || "").toLowerCase().includes(q) ||
      String(c.student_name || "").toLowerCase().includes(q) ||
      String(c.subject || "").toLowerCase().includes(q) ||
      String(c.assigned_staff_name || "").toLowerCase().includes(q);
    return statusMatch && categoryMatch && searchMatch;
  });

  const logout = () => {
    localStorage.removeItem("rectorToken");
    localStorage.removeItem("token");
    localStorage.removeItem("rector");
    navigate("/rector/login", { replace: true });
  };

  const photo = rector?.photo
    ? (String(rector.photo).startsWith("http") ? rector.photo : `${API_URL}/uploads/rectors/${String(rector.photo).replace(/^\/+/, "")}`)
    : "";

  const categories = ["All", ...Array.from(new Set(complaints.map((c) => c.category).filter(Boolean)))];

  return (
    <div className="rector-complaints-page">
      <aside ref={sidebarRef} className={`rector-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="rector-brand"><div className="rector-brand-icon">🏠</div><div><strong>Hostel</strong><span>Rector Panel</span></div></div>
        <nav className="rector-nav">
          {menuItems.map((item) => <button key={item.path} className={item.label === "Complaints" ? "active" : ""} onClick={() => navigate(item.path)}><span>{item.icon}</span><span>{item.label}</span></button>)}
        </nav>
        <button className="rector-logout" onClick={logout}><span>🚪</span><span>Logout</span></button>
      </aside>

      {mobileMenuOpen && <div className="rector-overlay" onClick={() => setMobileMenuOpen(false)} />}

      <main className="rector-complaints-main">
        <header className="rector-mobile-topbar">
          <button className="rector-mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>☰</button>
          <div><strong>Hostel Rector Panel</strong><span>Complaints Monitoring</span></div>
          <div className="rector-mobile-photo">{photo ? <img src={photo} alt="Rector" /> : "👤"}</div>
        </header>

        <header className="rector-complaints-header">
          <div><span>HOSTEL MONITORING</span><h1>Complaints</h1><p>Monitoring only. Rector cannot change status, resolve, close or verify OTP.</p></div>
          <button className="rector-header-profile" onClick={() => navigate("/rector/profile")}>{photo ? <img src={photo} alt="Rector" /> : "👤"}</button>
        </header>

        <section className="rector-complaints-content">
          {error && <div className="rector-error">⚠️ {error}<button onClick={fetchComplaints}>Retry</button></div>}

          <div className="rector-stat-grid">
            <div><span>Total</span><strong>{complaints.length}</strong></div>
            <div><span>Open</span><strong>{complaints.filter((c) => c.status !== "Closed").length}</strong></div>
            <div><span>OTP Verification</span><strong>{complaints.filter((c) => c.status === "OTP Verification").length}</strong></div>
            <div><span>Closed</span><strong>{complaints.filter((c) => c.status === "Closed").length}</strong></div>
          </div>

          <div className="rector-filter-bar">
            <input type="search" placeholder="Search complaint, student or staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolution Pending">Resolution Pending</option>
              <option value="OTP Verification">OTP Verification</option>
              <option value="Closed">Closed</option>
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              {categories.map((category) => <option key={category} value={category}>{category === "All" ? "All Categories" : category}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="rector-loading">Loading complaints...</div>
          ) : filtered.length === 0 ? (
            <div className="rector-empty">No complaints found.</div>
          ) : (
            <div className="rector-complaint-list">
              {filtered.map((c) => (
                <article className="rector-complaint-card" key={c.id}>
                  <div className="rector-complaint-card-top">
                    <div><strong>{c.complaint_code}</strong><span>{c.category}</span></div>
                    <span className={`rector-status status-${statusClass(c.status)}`}>{c.status}</span>
                  </div>
                  <h3>{c.subject}</h3>
                  <div className="rector-complaint-grid">
                    <div><span>Student</span><strong>{c.student_name || "-"}</strong></div>
                    <div><span>Room</span><strong>{c.student_room || "-"}</strong></div>
                    <div><span>Assigned Staff</span><strong>{c.assigned_staff_name || "-"}</strong></div>
                    <div><span>Staff Mobile</span><strong>{c.assigned_staff_mobile || "-"}</strong></div>
                    <div><span>Expected Resolution</span><strong>{formatDateTime(c.expected_resolution_at)}</strong></div>
                    <div><span>Rating</span><strong>{c.rating ? `${c.rating}/5` : "Not rated"}</strong></div>
                  </div>
                  <button className="rector-view-btn" onClick={() => navigate(`/rector/complaints/${c.id}`)}>View Details</button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Complaints;
