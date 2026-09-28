import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ComplaintDetail.css";

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

const ComplaintDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("detail"); // detail, otp

  const getToken = () =>
    localStorage.getItem("staffToken") || localStorage.getItem("token");

  useEffect(() => {
    if (id) fetchComplaintDetail();
  }, [id]);

  const fetchComplaintDetail = async () => {
    const token = getToken();
    if (!token) {
      setError("Staff session not found.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/api/staff/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("staffToken");
        localStorage.removeItem("token");
        navigate("/staff/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load complaint.");
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setComplaint(data.complaint);
      setStatus(data.complaint.status);
      setExpectedDate(data.complaint.expected_resolution_at?.split("T")[0] || "");
      setResolutionNote(data.complaint.resolution_note || "");
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message || "Unable to load complaint.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    const token = getToken();
    try {
      const response = await fetch(
        `${API_URL}/api/staff/complaints/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setStatus(newStatus);
      setComplaint({ ...complaint, status: newStatus });
      alert("Status updated successfully");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleSetExpectedDate = async () => {
    if (!expectedDate) {
      alert("Please select a date");
      return;
    }

    const token = getToken();
    try {
      const response = await fetch(
        `${API_URL}/api/staff/complaints/${id}/expected-date`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ expectedDate }),
        }
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      alert("Expected date set successfully");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleAddNote = async () => {
    if (!resolutionNote) {
      alert("Please add a note");
      return;
    }

    const token = getToken();
    try {
      const response = await fetch(
        `${API_URL}/api/staff/complaints/${id}/resolution-note`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ note: resolutionNote }),
        }
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      alert("Note added successfully");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleSendOTP = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/api/staff/complaints/${id}/send-otp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setStep("otp");
      alert("OTP sent to student email");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/api/staff/complaints/${id}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      alert("OTP verified! Complaint closed successfully");
      navigate("/staff/complaints");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="staff-detail-loading">
        <div className="staff-detail-loader" />
        <p>Loading complaint...</p>
      </div>
    );

  if (!complaint) return <div className="staff-detail-error">Complaint not found</div>;

  return (
    <div className="staff-detail-page">
      <header className="staff-detail-header">
        <button onClick={() => navigate("/staff/complaints")} className="staff-back-btn">
          ← Back
        </button>
        <div>
          <h1>{complaint.subject}</h1>
          <p>{complaint.complaint_code}</p>
        </div>
        <span
          className="staff-detail-status"
          style={{
            background: statusColors[status] || "#fff",
            color: statusTextColors[status] || "#000",
          }}
        >
          {status}
        </span>
      </header>

      <section className="staff-detail-content">
        {error && <div className="staff-detail-error">⚠️ {error}</div>}

        {step === "detail" ? (
          <div className="staff-detail-grid">
            {/* Student Info */}
            <div className="staff-detail-card">
              <h3>Student Information</h3>
              <div className="staff-detail-row">
                <div className="staff-detail-photo">
                  {getPhotoUrl(complaint.student_photo) ? (
                    <img src={getPhotoUrl(complaint.student_photo)} alt={complaint.student_name} />
                  ) : (
                    <span>{complaint.student_name?.charAt(0)?.toUpperCase() || "S"}</span>
                  )}
                </div>
                <div>
                  <div>
                    <span>Name</span>
                    <strong>{complaint.student_name}</strong>
                  </div>
                  <div>
                    <span>Room</span>
                    <strong>{complaint.student_room}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{complaint.student_email}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{complaint.student_phone}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaint Details */}
            <div className="staff-detail-card">
              <h3>Complaint Details</h3>
              <div>
                <span>Category</span>
                <strong>{complaint.category}</strong>
              </div>
              <div>
                <span>Description</span>
                <p>{complaint.description}</p>
              </div>
              <div>
                <span>Submitted</span>
                <strong>{formatDateTime(complaint.created_at)}</strong>
              </div>
            </div>

            {/* Status Update */}
            <div className="staff-detail-card">
              <h3>Update Status</h3>
              <div className="staff-detail-actions">
                {status !== "Closed" && (
                  <>
                    {status === "Assigned" && (
                      <button
                        className="staff-action-btn"
                        onClick={() => handleUpdateStatus("In Progress")}
                      >
                        Mark In Progress
                      </button>
                    )}
                    {(status === "In Progress" || status === "Assigned") && (
                      <button
                        className="staff-action-btn"
                        onClick={() => handleUpdateStatus("Resolution Pending")}
                      >
                        Mark Resolution Pending
                      </button>
                    )}
                    {(status === "Resolution Pending" || status === "In Progress") && (
                      <button
                        className="staff-action-btn"
                        onClick={() => handleUpdateStatus("OTP Verification")}
                      >
                        Mark OTP Verification
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Expected Date */}
            <div className="staff-detail-card">
              <h3>Expected Resolution Date</h3>
              <div className="staff-detail-form">
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                />
                <button className="staff-action-btn" onClick={handleSetExpectedDate}>
                  Set Date
                </button>
              </div>
              {complaint.expected_resolution_at && (
                <div>
                  <span>Current Expected Date</span>
                  <strong>{formatDateTime(complaint.expected_resolution_at)}</strong>
                </div>
              )}
            </div>

            {/* Resolution Note */}
            <div className="staff-detail-card">
              <h3>Resolution Note</h3>
              <div className="staff-detail-form">
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Add your resolution notes..."
                  rows={4}
                />
                <button className="staff-action-btn" onClick={handleAddNote}>
                  Save Note
                </button>
              </div>
            </div>

            {/* Send OTP */}
            {status === "OTP Verification" && (
              <div className="staff-detail-card full-width">
                <h3>Send OTP to Student</h3>
                <p>Student will receive OTP via email to verify complaint resolution</p>
                <button className="staff-action-btn-primary" onClick={handleSendOTP}>
                  Send OTP
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="staff-otp-section">
            <div className="staff-detail-card">
              <h3>Verify OTP</h3>
              <p>Enter the OTP sent to student to close this complaint</p>
              <div className="staff-detail-form">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                />
                <button className="staff-action-btn-primary" onClick={handleVerifyOTP}>
                  Verify & Close Complaint
                </button>
                <button className="staff-back-btn" onClick={() => setStep("detail")}>
                  Back
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ComplaintDetail;
