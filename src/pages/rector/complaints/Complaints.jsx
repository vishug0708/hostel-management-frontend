import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Complaints.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const menuItems = [
  { label: "Dashboard", icon: "📊", path: "/rector/dashboard" },
  { label: "Complaints", icon: "📩", path: "/rector/complaints" },
  { label: "Staff Management", icon: "👥", path: "/rector/staff" },
  { label: "Students", icon: "🎓", path: "/rector/students" },
  { label: "Reports", icon: "📊", path: "/rector/reports" },
  { label: "Settings", icon: "⚙️", path: "/rector/settings" },
  { label: "Notifications", icon: "🔔", path: "/rector/notifications" },
];

const statusColors = {
  Submitted: "#f0f9ff",
  Assigned: "#f0fdf4",
  "In Progress": "#fef3c7",
  "Resolution Pending": "#fce7f3",
  "OTP Verification": "#f3e8ff",
  Closed: "#ecfdf5",
};

const statusTextColors = {
  Submitted: "#0c4a6e",
  Assigned: "#166534",
  "In Progress": "#92400e",
  "Resolution Pending": "#be185d",
  "OTP Verification": "#7e22ce",
  Closed: "#047857",
};

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

const Complaints = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [rector, setRector] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const statusList = [
    "All",
    "Submitted",
    "Assigned",
    "In Progress",
    "Resolution Pending",
    "OTP Verification",
    "Closed",
  ];
  const categoryList = [
    "All",
    "Electrical",
    "Plumbing",
    "Carpenter",
    "Cleaning",
    "IT",
    "Maintenance",
  ];

  const getToken = () =>
    localStorage.getItem("rectorToken") || localStorage.getItem("token");

  useEffect(() => {
    document.title = "Complaints | Rector Panel";
    const saved = localStorage.getItem("rector");
    if (saved) {
      try {
        setRector(JSON.parse(saved));
      } catch {
        setRector(null);
      }
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      "rector-complaints-menu-open",
      mobileMenuOpen,
    );
    return () => document.body.classList.remove("rector-complaints-menu-open");
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
    if (rector) fetchComplaints();
  }, [rector]);

  const fetchComplaints = async () => {
    const token = getToken();
    if (!token) {
      setError("Rector session not found.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
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
      if (!response.ok || !data.success)
        throw new Error(data.message || "Failed to load complaints.");
      setComplaints(Array.isArray(data.complaints) ? data.complaints : []);
    } catch (err) {
      console.error("Fetch Complaints Error:", err);
      setError(err.message || "Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const statusMatch =
      filterStatus === "All" || complaint.status === filterStatus;
    const categoryMatch =
      filterCategory === "All" || complaint.category === filterCategory;
    const searchMatch =
      searchTerm === "" ||
      complaint.complaint_code
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.student_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && categoryMatch && searchMatch;
  });

  const navigateTo = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };
  const handleLogout = () => {
    localStorage.removeItem("rectorToken");
    localStorage.removeItem("token");
    localStorage.removeItem("rector");
    navigate("/rector/login", { replace: true });
  };

  const photo = getPhotoUrl(rector?.photo);
  const initials = String(rector?.name || "Rector")
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

  if (loading)
    return (
      <div className="rector-complaints-loading">
        <div className="rector-complaints-loader" />
        <p>Loading complaints...</p>
      </div>
    );

  return (
    <div className="rector-complaints-page">
      <aside
        ref={sidebarRef}
        className={`rector-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}
      >
        <div className="rector-brand">
          <div className="rector-brand-icon">🏠</div>
          <div>
            <strong>Hostel</strong>
            <span>Rector Panel</span>
          </div>
        </div>
        <nav className="rector-nav">
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
        <button className="rector-logout" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </aside>
      {mobileMenuOpen && (
        <div
          className="rector-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <main className="rector-complaints-main">
        <div className="rector-mobile-topbar">
          <button
            ref={menuButtonRef}
            type="button"
            className="rector-mobile-menu-btn"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            ☰
          </button>
          <div className="rector-mobile-brand">
            <div className="rector-mobile-brand-icon">🏠</div>
            <div>
              <strong>Hostel</strong>
              <span>Rector</span>
            </div>
          </div>
          <div className="rector-mobile-photo">
            {photo ? <img src={photo} alt="Rector" /> : <span>{initials}</span>}
          </div>
        </div>
        <header className="rector-complaints-header">
          <div>
            <span>MONITORING</span>
            <h1>Complaints Management</h1>
            <p>Monitor and track all hostel complaints across students.</p>
          </div>
        </header>
        <section className="rector-complaints-content">
          <div className="rector-filters-bar">
            <div className="rector-filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Complaint code, subject, or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="rector-filter-group">
              <label>Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {statusList.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="rector-filter-group">
              <label>Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categoryList.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="rector-error-message">⚠️ {error}</div>}

          <div className="rector-stats">
            <div className="rector-stat-card">
              <span>Total</span>
              <strong>{complaints.length}</strong>
            </div>
            <div className="rector-stat-card">
              <span>Pending</span>
              <strong>
                {
                  complaints.filter(
                    (c) => c.status === "Submitted" || c.status === "Assigned",
                  ).length
                }
              </strong>
            </div>
            <div className="rector-stat-card">
              <span>In Progress</span>
              <strong>
                {
                  complaints.filter(
                    (c) =>
                      c.status === "In Progress" ||
                      c.status === "Resolution Pending",
                  ).length
                }
              </strong>
            </div>
            <div className="rector-stat-card">
              <span>Closed</span>
              <strong>
                {complaints.filter((c) => c.status === "Closed").length}
              </strong>
            </div>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="rector-no-data">No complaints found.</div>
          ) : (
            <div className="rector-complaints-list">
              {filteredComplaints.map((complaint) => (
                <div key={complaint.id} className="rector-complaint-card">
                  <div className="rector-complaint-header">
                    <div className="rector-complaint-title">
                      <span className="rector-complaint-code">
                        {complaint.complaint_code}
                      </span>
                      <h3>{complaint.subject}</h3>
                      <span className="rector-complaint-category">
                        {complaint.category}
                      </span>
                    </div>
                    <span
                      className="rector-complaint-status"
                      style={{
                        background: statusColors[complaint.status] || "#fff",
                        color: statusTextColors[complaint.status] || "#000",
                      }}
                    >
                      {complaint.status}
                    </span>
                  </div>

                  <div className="rector-complaint-body">
                    <div className="rector-info-section">
                      <h4>Student Information</h4>
                      <div className="rector-info-grid">
                        <div className="rector-info-item">
                          <div className="rector-student-photo">
                            {getPhotoUrl(complaint.student_photo) ? (
                              <img
                                src={getPhotoUrl(complaint.student_photo)}
                                alt={complaint.student_name}
                              />
                            ) : (
                              <span>
                                {complaint.student_name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "S"}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="rector-info-details">
                          <div>
                            <span>Name</span>
                            <strong>{complaint.student_name || "-"}</strong>
                          </div>
                          <div>
                            <span>ID</span>
                            <strong>{complaint.student_id || "-"}</strong>
                          </div>
                          <div>
                            <span>Room</span>
                            <strong>{complaint.student_room || "-"}</strong>
                          </div>
                          <div>
                            <span>Email</span>
                            <strong>{complaint.student_email || "-"}</strong>
                          </div>
                          <div>
                            <span>Phone</span>
                            <strong>{complaint.student_phone || "-"}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rector-info-section">
                      <h4>Complaint Details</h4>
                      <div>
                        <span>Description</span>
                        <p>{complaint.description || "-"}</p>
                      </div>
                      <div>
                        <span>Submitted</span>
                        <strong>{formatDateTime(complaint.created_at)}</strong>
                      </div>
                      {complaint.attachment && (
                        <div>
                          <span>Attachment</span>
                          <a
                            href={getPhotoUrl(complaint.attachment)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View File
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="rector-info-section">
                      <h4>Assigned Staff</h4>
                      <div className="rector-staff-box">
                        <div className="rector-staff-photo">
                          {getPhotoUrl(complaint.assigned_staff_photo) ? (
                            <img
                              src={getPhotoUrl(complaint.assigned_staff_photo)}
                              alt={complaint.assigned_staff_name}
                            />
                          ) : (
                            <span>
                              {complaint.assigned_staff_name
                                ?.charAt(0)
                                ?.toUpperCase() || "S"}
                            </span>
                          )}
                        </div>
                        <div className="rector-staff-info">
                          <div>
                            <span>Name</span>
                            <strong>
                              {complaint.assigned_staff_name || "Not assigned"}
                            </strong>
                          </div>
                          <div>
                            <span>Role</span>
                            <strong>
                              {complaint.assigned_staff_role || "-"}
                            </strong>
                          </div>
                          <div>
                            <span>Email</span>
                            <strong>
                              {complaint.assigned_staff_email || "-"}
                            </strong>
                          </div>
                          <div>
                            <span>Phone</span>
                            <strong>
                              {complaint.assigned_staff_mobile || "-"}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {complaint.status !== "Submitted" && (
                      <div className="rector-info-section">
                        <h4>Resolution Information</h4>
                        <div>
                          <span>Expected Resolution</span>
                          <strong>
                            {formatDateTime(complaint.expected_resolution_at) ||
                              "Not set"}
                          </strong>
                        </div>
                        <div>
                          <span>Resolution Note</span>
                          <p>
                            {complaint.resolution_note || "Not yet recorded"}
                          </p>
                        </div>
                        {complaint.otp_verified === "Yes" && (
                          <div>
                            <span>OTP Verified</span>
                            <strong>✓ Yes</strong>
                          </div>
                        )}
                        {complaint.closed_at && (
                          <div>
                            <span>Closed At</span>
                            <strong>
                              {formatDateTime(complaint.closed_at)}
                            </strong>
                          </div>
                        )}
                        {complaint.rating && (
                          <div>
                            <span>Rating</span>
                            <strong>{complaint.rating}/5</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rector-complaint-footer">
                    <button
                      onClick={() =>
                        navigate(`/rector/complaints/${complaint.id}`)
                      }
                      className="rector-view-btn"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Complaints;
