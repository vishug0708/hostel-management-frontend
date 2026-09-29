import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Complaints.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getPhotoUrl = (photo) => {
  if (!photo) return "";
  const value = String(photo).trim();
  if (
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    value.startsWith("http")
  )
    return value;
  const normalized = value.replace(/^\/+/, "");
  if (normalized.startsWith("uploads/")) return `${API_URL}/${normalized}`;
  return `${API_URL}/uploads/staff/${normalized}`;
};

const formatDateTime = (value) => {
  if (!value) return "Not set";
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

const statusClass = (status) =>
  String(status || "Submitted")
    .toLowerCase()
    .replace(/\s+/g, "-");

const Complaints = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getToken = () => {
    const staffToken = localStorage.getItem("staffToken");

    if (staffToken) {
      return staffToken;
    }

    return localStorage.getItem("token");
  };

  useEffect(() => {
    const saved = localStorage.getItem("staff");
    if (saved) {
      try {
        setStaff(JSON.parse(saved));
      } catch {
        setStaff(null);
      }
    }
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    const token = getToken();

    console.log("========== STAFF COMPLAINT DEBUG ==========");
    console.log("API URL:", API_URL);
    console.log("Staff token exists:", Boolean(token));

    if (!token) {
        console.error("Staff token not found.");

        setError("Staff session not found.");
        setLoading(false);

        return;
    }

    try {
        setLoading(true);
        setError("");

        const endpoint =
            `${API_URL}/api/staff/complaints`;

        console.log(
            "Staff Complaint API:",
            endpoint
        );

        const response = await fetch(
            endpoint,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(
            "Staff Complaint HTTP Status:",
            response.status
        );

        const rawText = await response.text();

        console.log(
            "Staff Complaint Raw Response:",
            rawText
        );

        let data;

        try {
            data = JSON.parse(rawText);
        } catch (parseError) {
            console.error(
                "Staff Complaint JSON Parse Error:",
                parseError
            );

            throw new Error(
                `Backend returned invalid JSON. HTTP ${response.status}`
            );
        }

        console.log(
            "Staff Complaint Response:",
            data
        );

        if (response.status === 401) {
            localStorage.removeItem(
                "staffToken"
            );

            localStorage.removeItem(
                "staff"
            );

            navigate(
                "/staff/login",
                {
                    replace: true
                }
            );

            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                `Failed to load complaints. HTTP ${response.status}`
            );
        }

        const assignedComplaints =
            Array.isArray(data.complaints)
                ? data.complaints
                : [];

        console.log(
            "Assigned complaints:",
            assignedComplaints
        );

        console.log(
            "Assigned complaint count:",
            assignedComplaints.length
        );

        setComplaints(
            assignedComplaints
        );

    } catch (error) {
        console.error(
            "Fetch Staff Complaints Error:",
            error
        );

        setError(
            error.message ||
            "Unable to load complaints."
        );

    } finally {
        setLoading(false);
    }
};

  const logout = () => {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("token");
    localStorage.removeItem("staff");
    localStorage.removeItem("staffPhoto");
    navigate("/staff/login", { replace: true });
  };

  const filtered = complaints.filter((item) => {
    const statusMatch = filterStatus === "All" || item.status === filterStatus;
    const q = searchTerm.toLowerCase().trim();
    const searchMatch =
      !q ||
      String(item.complaint_code || "")
        .toLowerCase()
        .includes(q) ||
      String(item.subject || "")
        .toLowerCase()
        .includes(q) ||
      String(item.student_name || "")
        .toLowerCase()
        .includes(q);
    return statusMatch && searchMatch;
  });

  const photo = getPhotoUrl(staff?.photo);

  return (
    <div className="staff-complaints-page">
      <aside
        className={`staff-complaints-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}
      >
        <div className="staff-complaints-brand">
          <div className="staff-complaints-brand-icon">🏠</div>
          <div>
            <strong>Hostel</strong>
            <span>Staff Panel</span>
          </div>
        </div>

        <nav className="staff-complaints-nav">
          <button
            className="staff-complaints-nav-item"
            onClick={() => navigate("/staff/dashboard")}
          >
            <span>📊</span>Dashboard
          </button>
          <button
            className="staff-complaints-nav-item"
            onClick={() => navigate("/staff/profile")}
          >
            <span>👤</span>My Profile
          </button>
          <button
            className="staff-complaints-nav-item"
            onClick={() => navigate("/staff/attendance")}
          >
            <span>📅</span>Attendance
          </button>
          <button
            className="staff-complaints-nav-item active"
            onClick={() => navigate("/staff/complaints")}
          >
            <span>📝</span>Complaints
          </button>
          <button
            className="staff-complaints-nav-item"
            onClick={() => navigate("/staff/announcements")}
          >
            <span>📢</span>Announcements
          </button>
          <button
            className="staff-complaints-nav-item"
            onClick={() => navigate("/staff/change-password")}
          >
            <span>🔐</span>Change Password
          </button>
        </nav>

        <button className="staff-complaints-logout" onClick={logout}>
          <span>🚪</span>Logout
        </button>
      </aside>

      {mobileMenuOpen && (
        <div
          className="staff-complaints-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="staff-complaints-main">
        <header className="staff-complaints-mobile-header">
          <button
            className="staff-complaints-hamburger"
            onClick={() => setMobileMenuOpen(true)}
          >
            ☰
          </button>
          <div className="staff-complaints-mobile-title">
            <strong>Hostel Staff Panel</strong>
            <span>My Complaints</span>
          </div>
          <button
            className="staff-complaints-mobile-profile"
            onClick={() => navigate("/staff/profile")}
          >
            {photo ? <img src={photo} alt="Staff" /> : "👤"}
          </button>
        </header>

        <header className="staff-complaints-header">
          <div>
            <span>HOSTEL SERVICES</span>
            <h1>My Complaints</h1>
            <p>
              Work only on complaints automatically assigned to your staff role.
            </p>
          </div>
          <button
            className="staff-complaints-profile"
            onClick={() => navigate("/staff/profile")}
          >
            {photo ? <img src={photo} alt="Staff" /> : "👤"}
          </button>
        </header>

        <section className="staff-complaints-content">
          <div className="staff-complaints-toolbar">
            <input
              type="search"
              placeholder="Search complaint, subject or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolution Pending">Resolution Pending</option>
              <option value="OTP Verification">OTP Verification</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {error && <div className="staff-complaints-error">⚠️ {error}</div>}

          {loading ? (
            <div className="staff-complaints-loading">
              <div className="staff-complaints-loader" />
              <p>Loading complaints...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="staff-complaints-empty">
              <div>📋</div>
              <h3>No complaints found</h3>
              <p>There are no complaints matching the selected filter.</p>
            </div>
          ) : (
            <div className="staff-complaints-list">
              {filtered.map((complaint) => (
                <article className="staff-complaint-card" key={complaint.id}>
                  <div className="staff-complaint-top">
                    <div>
                      <strong>{complaint.complaint_code}</strong>
                      <span>{complaint.category}</span>
                    </div>
                    <span
                      className={`staff-complaint-status status-${statusClass(complaint.status)}`}
                    >
                      {complaint.status}
                    </span>
                  </div>
                  <h3>{complaint.subject}</h3>
                  <p className="staff-complaint-description">
                    {complaint.description}
                  </p>
                  <div className="staff-complaint-meta">
                    <div>
                      <span>Student</span>
                      <strong>{complaint.student_name || "-"}</strong>
                    </div>
                    <div>
                      <span>Room</span>
                      <strong>{complaint.student_room || "-"}</strong>
                    </div>
                    <div>
                      <span>Expected Resolution</span>
                      <strong>
                        {formatDateTime(complaint.expected_resolution_at)}
                      </strong>
                    </div>
                  </div>
                  <button
                    className="staff-view-btn"
                    onClick={() =>
                      navigate(`/staff/complaints/${complaint.id}`)
                    }
                  >
                    Open Complaint
                  </button>
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
