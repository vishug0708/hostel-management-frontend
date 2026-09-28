import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Complaints.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const statusColors = {
  Assigned: "#f0fdf4",
  "In Progress": "#fef3c7",
  "Resolution Pending": "#fce7f3",
  "OTP Verification": "#f3e8ff",
  Closed: "#ecfdf5",
};

const statusTextColors = {
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
  const [staff, setStaff] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const statusList = [
    "All",
    "Assigned",
    "In Progress",
    "Resolution Pending",
    "OTP Verification",
    "Closed",
  ];

  const getToken = () =>
    localStorage.getItem("staffToken") || localStorage.getItem("token");

  useEffect(() => {
    document.title = "My Complaints | Staff Panel";
    const saved = localStorage.getItem("staff");
    if (saved) {
      try {
        setStaff(JSON.parse(saved));
      } catch {
        setStaff(null);
      }
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    const token = getToken();
    if (!token) {
      setError("Staff session not found.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/api/staff/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("staffToken");
        localStorage.removeItem("token");
        localStorage.removeItem("staff");
        navigate("/staff/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load complaints.`);
      }

      const data = await response.json();
      if (!data.success)
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
    const searchMatch =
      searchTerm === "" ||
      complaint.complaint_code
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.student_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const handleLogout = () => {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("token");
    localStorage.removeItem("staff");
    navigate("/staff/login", { replace: true });
  };

  if (loading)
    return (
      <div className="staff-complaints-loading">
        <div className="staff-complaints-loader" />
        <p>Loading complaints...</p>
      </div>
    );

  return (
    <div className="staff-complaints-page">
      <header className="staff-complaints-header">
        <div>
          <span>MY ASSIGNED</span>
          <h1>Complaints</h1>
          <p>Manage and resolve assigned complaints</p>
        </div>
        <button onClick={handleLogout} className="staff-logout-btn">
          Logout
        </button>
      </header>

      <section className="staff-complaints-content">
        <div className="staff-filters-bar">
          <div className="staff-filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Complaint code, subject, or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="staff-filter-group">
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
          <button className="staff-refresh-btn" onClick={fetchComplaints}>
            🔄 Refresh
          </button>
        </div>

        {error && <div className="staff-error-message">⚠️ {error}</div>}

        <div className="staff-stats">
          <div className="staff-stat-card">
            <span>Total</span>
            <strong>{complaints.length}</strong>
          </div>
          <div className="staff-stat-card">
            <span>Pending</span>
            <strong>
              {
                complaints.filter(
                  (c) => c.status === "Assigned" || c.status === "In Progress",
                ).length
              }
            </strong>
          </div>
          <div className="staff-stat-card">
            <span>Resolution Pending</span>
            <strong>
              {complaints.filter((c) => c.status === "Resolution Pending").length}
            </strong>
          </div>
          <div className="staff-stat-card">
            <span>Closed</span>
            <strong>
              {complaints.filter((c) => c.status === "Closed").length}
            </strong>
          </div>
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="staff-no-data">No complaints found.</div>
        ) : (
          <div className="staff-complaints-list">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="staff-complaint-card">
                <div className="staff-complaint-header">
                  <div className="staff-complaint-title">
                    <span className="staff-complaint-code">
                      {complaint.complaint_code}
                    </span>
                    <h3>{complaint.subject}</h3>
                    <span className="staff-complaint-category">
                      {complaint.category}
                    </span>
                  </div>
                  <span
                    className="staff-complaint-status"
                    style={{
                      background: statusColors[complaint.status] || "#fff",
                      color: statusTextColors[complaint.status] || "#000",
                    }}
                  >
                    {complaint.status}
                  </span>
                </div>

                <div className="staff-complaint-body">
                  <div className="staff-info-section">
                    <h4>Student Information</h4>
                    <div className="staff-info-grid">
                      <div className="staff-student-photo">
                        {getPhotoUrl(complaint.student_photo) ? (
                          <img
                            src={getPhotoUrl(complaint.student_photo)}
                            alt={complaint.student_name}
                          />
                        ) : (
                          <span>
                            {complaint.student_name?.charAt(0)?.toUpperCase() ||
                              "S"}
                          </span>
                        )}
                      </div>
                      <div className="staff-info-details">
                        <div>
                          <span>Name</span>
                          <strong>{complaint.student_name || "-"}</strong>
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

                  <div className="staff-info-section">
                    <h4>Complaint Details</h4>
                    <div>
                      <span>Description</span>
                      <p>{complaint.description || "-"}</p>
                    </div>
                    <div>
                      <span>Submitted</span>
                      <strong>{formatDateTime(complaint.created_at)}</strong>
                    </div>
                    {complaint.expected_resolution_at && (
                      <div>
                        <span>Expected Resolution</span>
                        <strong>
                          {formatDateTime(complaint.expected_resolution_at)}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="staff-complaint-footer">
                  <button
                    onClick={() =>
                      navigate(`/staff/complaints/${complaint.id}`)
                    }
                    className="staff-view-btn"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Complaints;
