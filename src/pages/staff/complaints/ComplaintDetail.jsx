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
  if (value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http")) return value;
  const normalized = value.replace(/^\/+/, "");
  if (normalized.startsWith("uploads/")) return `${API_URL}/${normalized}`;
  return `${API_URL}/uploads/staff/${normalized}`;
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

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const ComplaintDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [staff, setStaff] = useState(null);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [recipientType, setRecipientType] = useState("Student");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getToken = () =>
    localStorage.getItem("staffToken") || localStorage.getItem("token");

  useEffect(() => {
    const saved = localStorage.getItem("staff");
    if (saved) {
      try {
        setStaff(JSON.parse(saved));
      } catch {
        setStaff(null);
      }
    }
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    const token = getToken();
    if (!token) {
      navigate("/staff/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/api/staff/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("staffToken");
        localStorage.removeItem("token");
        localStorage.removeItem("staff");
        navigate("/staff/login", { replace: true });
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load complaint.");
      }

      setComplaint(data.complaint);
      setExpectedDate(toDateTimeLocal(data.complaint.expected_resolution_at));
      setResolutionNote(data.complaint.resolution_note || "");
      setRecipientType(data.complaint.otp_recipient_type || "Student");
    } catch (err) {
      console.error("Complaint Detail Error:", err);
      setError(err.message || "Unable to load complaint.");
    } finally {
      setLoading(false);
    }
  };

  const request = async (url, options = {}) => {
    const token = getToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const data = await response.json();
    if (response.status === 401) {
      localStorage.removeItem("staffToken");
      localStorage.removeItem("token");
      localStorage.removeItem("staff");
      navigate("/staff/login", { replace: true });
      throw new Error("Staff session expired.");
    }
    if (!response.ok || !data.success) throw new Error(data.message || "Request failed.");
    return data;
  };

  const updateStatus = async (status) => {
    try {
      setBusy(true);
      await request(`${API_URL}/api/staff/complaints/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      await fetchComplaint();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveExpectedDate = async () => {
    if (!expectedDate) {
      setError("Please select expected resolution date and time.");
      return;
    }
    try {
      setBusy(true);
      await request(`${API_URL}/api/staff/complaints/${id}/expected-date`, {
        method: "PUT",
        body: JSON.stringify({ expectedDate }),
      });
      await fetchComplaint();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveResolutionNote = async () => {
    if (!resolutionNote.trim()) {
      setError("Please enter the resolution note.");
      return;
    }
    try {
      setBusy(true);
      await request(`${API_URL}/api/staff/complaints/${id}/resolution-note`, {
        method: "PUT",
        body: JSON.stringify({ note: resolutionNote.trim() }),
      });
      await fetchComplaint();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const sendOTP = async () => {
    if (!recipientType) {
      setError("Select the OTP recipient.");
      return;
    }

    try {
      setBusy(true);
      const data = await request(`${API_URL}/api/staff/complaints/${id}/send-otp`, {
        method: "POST",
        body: JSON.stringify({ recipient_type: recipientType }),
      });
      setError("");
      alert(`OTP sent to ${data.recipient_type}: ${data.recipient_email}`);
      await fetchComplaint();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const verifyOTP = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    try {
      setBusy(true);
      const data = await request(`${API_URL}/api/staff/complaints/${id}/verify-otp`, {
        method: "POST",
        body: JSON.stringify({ otp }),
      });
      setError("");
      alert(data.message);
      await fetchComplaint();
      setOtp("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("token");
    localStorage.removeItem("staff");
    localStorage.removeItem("staffPhoto");
    navigate("/staff/login", { replace: true });
  };

  const profilePhoto = getPhotoUrl(staff?.photo);
  const studentPhoto = complaint ? getPhotoUrl(complaint.student_photo) : "";
  const backupPhoto = complaint ? getPhotoUrl(complaint.backup_student_photo) : "";

  if (loading) {
    return <div className="staff-detail-loading"><div className="staff-detail-loader" /><p>Loading complaint...</p></div>;
  }

  if (!complaint) {
    return <div className="staff-detail-error">⚠️ {error || "Complaint not found."}</div>;
  }

  return (
    <div className="staff-detail-page">
      <aside className={`staff-detail-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="staff-detail-brand">
          <div className="staff-detail-brand-icon">🏠</div>
          <div><strong>Hostel</strong><span>Staff Panel</span></div>
        </div>
        <nav className="staff-detail-nav">
          <button className="staff-detail-nav-item" onClick={() => navigate("/staff/dashboard")}><span>📊</span>Dashboard</button>
          <button className="staff-detail-nav-item" onClick={() => navigate("/staff/profile")}><span>👤</span>My Profile</button>
          <button className="staff-detail-nav-item" onClick={() => navigate("/staff/attendance")}><span>📅</span>Attendance</button>
          <button className="staff-detail-nav-item active" onClick={() => navigate("/staff/complaints")}><span>📝</span>Complaints</button>
          <button className="staff-detail-nav-item" onClick={() => navigate("/staff/announcements")}><span>📢</span>Announcements</button>
          <button className="staff-detail-nav-item" onClick={() => navigate("/staff/change-password")}><span>🔐</span>Change Password</button>
        </nav>
        <button className="staff-detail-logout" onClick={logout}><span>🚪</span>Logout</button>
      </aside>

      {mobileMenuOpen && <div className="staff-detail-overlay" onClick={() => setMobileMenuOpen(false)} />}

      <main className="staff-detail-main">
        <div className="staff-detail-mobile-header">
          <button className="staff-detail-hamburger" onClick={() => setMobileMenuOpen(true)}>☰</button>
          <div><strong>Hostel</strong><span>Staff Panel</span></div>
          <button className="staff-detail-mobile-profile" onClick={() => navigate("/staff/profile")}>
            {profilePhoto ? <img src={profilePhoto} alt="Staff" /> : "👤"}
          </button>
        </div>

        <header className="staff-detail-header">
          <button onClick={() => navigate("/staff/complaints")} className="staff-back-btn">← Back</button>
          <div>
            <h1>{complaint.subject}</h1>
            <p>{complaint.complaint_code}</p>
          </div>
          <div className="staff-detail-header-right">
            <span className="staff-detail-status" style={{ background: statusColors[complaint.status], color: statusTextColors[complaint.status] }}>
              {complaint.status}
            </span>
            <button className="staff-detail-header-profile" onClick={() => navigate("/staff/profile")}>
              {profilePhoto ? <img src={profilePhoto} alt="Staff" /> : "👤"}
            </button>
          </div>
        </header>

        <section className="staff-detail-content">
          {error && <div className="staff-detail-error">⚠️ {error}</div>}

          <div className="staff-detail-grid">
            <div className="staff-detail-card">
              <h3>Student Information</h3>
              <div className="staff-detail-row">
                <div className="staff-detail-photo">
                  {studentPhoto ? <img src={studentPhoto} alt="Student" /> : <span>{complaint.student_name?.charAt(0)?.toUpperCase() || "S"}</span>}
                </div>
                <div>
                  <div><span>Name</span><strong>{complaint.student_name || "-"}</strong></div>
                  <div><span>Room</span><strong>{complaint.student_room || "-"} {complaint.student_block ? `(${complaint.student_block})` : ""}</strong></div>
                  <div><span>Email</span><strong>{complaint.student_email || "-"}</strong></div>
                  <div><span>Phone</span><strong>{complaint.student_phone || "-"}</strong></div>
                </div>
              </div>
            </div>

            <div className="staff-detail-card">
              <h3>Backup Student</h3>
              <div className="staff-detail-row">
                <div className="staff-detail-photo">
                  {backupPhoto ? <img src={backupPhoto} alt="Backup" /> : <span>{complaint.backup_student_name?.charAt(0)?.toUpperCase() || "B"}</span>}
                </div>
                <div>
                  <div><span>Name</span><strong>{complaint.backup_student_name || "-"}</strong></div>
                  <div><span>ID</span><strong>{complaint.backup_student_id || "-"}</strong></div>
                  <div><span>Email</span><strong>{complaint.backup_student_email || "-"}</strong></div>
                  <div><span>Phone</span><strong>{complaint.backup_student_mobile || "-"}</strong></div>
                </div>
              </div>
            </div>

            <div className="staff-detail-card">
              <h3>Complaint Details</h3>
              <div><span>Category</span><strong>{complaint.category}</strong></div>
              <div><span>Subject</span><strong>{complaint.subject}</strong></div>
              <div><span>Description</span><p>{complaint.description}</p></div>
              <div><span>Submitted</span><strong>{formatDateTime(complaint.created_at)}</strong></div>
              {complaint.attachment && (
                <div><span>Attachment</span><a href={`${API_URL}/${String(complaint.attachment).replace(/^\/+/, "")}`} target="_blank" rel="noreferrer">View Attachment</a></div>
              )}
            </div>

            <div className="staff-detail-card">
              <h3>Expected Resolution</h3>
              <div className="staff-detail-form">
                <input type="datetime-local" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} disabled={complaint.status === "Closed"} />
                <button className="staff-action-btn" disabled={busy || complaint.status === "Closed"} onClick={saveExpectedDate}>Save Date & Time</button>
              </div>
              <div><span>Current</span><strong>{formatDateTime(complaint.expected_resolution_at)}</strong></div>
            </div>

            <div className="staff-detail-card">
              <h3>Resolution Note</h3>
              <div className="staff-detail-form">
                <textarea value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} rows={5} placeholder="Write what was done to resolve the complaint..." disabled={complaint.status === "Closed"} />
                <button className="staff-action-btn" disabled={busy || complaint.status === "Closed"} onClick={saveResolutionNote}>Save Resolution Note</button>
              </div>
            </div>

            <div className="staff-detail-card">
              <h3>Complaint Workflow</h3>
              <div className="staff-detail-actions">
                {complaint.status === "Assigned" && (
                  <button className="staff-action-btn" disabled={busy} onClick={() => updateStatus("In Progress")}>Start Work</button>
                )}
                {complaint.status === "In Progress" && (
                  <button className="staff-action-btn" disabled={busy} onClick={() => updateStatus("Resolution Pending")}>Mark Resolution Pending</button>
                )}
                {complaint.status === "Resolution Pending" && (
                  <div className="staff-resolution-ready">
                    <strong>Work completed?</strong>
                    <p>Select exactly one recipient. OTP will be sent to that selected email.</p>
                  </div>
                )}
              </div>
            </div>

            {(complaint.status === "Resolution Pending" || complaint.status === "OTP Verification") && (
              <div className="staff-detail-card full-width">
                <h3>{complaint.status === "OTP Verification" ? "OTP Verification" : "Resolution Done & OTP"}</h3>
                {complaint.status === "Resolution Pending" ? (
                  <>
                    <div className="staff-recipient-options">
                      <label className={`staff-recipient-option ${recipientType === "Student" ? "selected" : ""}`}>
                        <input type="radio" name="recipientType" value="Student" checked={recipientType === "Student"} onChange={(e) => setRecipientType(e.target.value)} />
                        <div><strong>Complaint Student</strong><span>{complaint.student_name} — {complaint.student_email}</span></div>
                      </label>
                      <label className={`staff-recipient-option ${recipientType === "Backup Student" ? "selected" : ""}`}>
                        <input type="radio" name="recipientType" value="Backup Student" checked={recipientType === "Backup Student"} onChange={(e) => setRecipientType(e.target.value)} />
                        <div><strong>Backup Student</strong><span>{complaint.backup_student_name} — {complaint.backup_student_email}</span></div>
                      </label>
                    </div>
                    <button className="staff-action-btn-primary" disabled={busy} onClick={sendOTP}>Mark Resolution Done & Send OTP</button>
                  </>
                ) : (
                  <>
                    <p>OTP sent to <strong>{complaint.otp_recipient_type}</strong>: {complaint.otp_email}</p>
                    <div className="staff-detail-form">
                      <input type="text" inputMode="numeric" maxLength={6} placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
                      <button className="staff-action-btn-primary" disabled={busy} onClick={verifyOTP}>Verify OTP & Close Complaint</button>
                      <button className="staff-action-btn" disabled={busy} onClick={sendOTP}>Resend OTP</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {complaint.status === "Closed" && (
              <div className="staff-detail-card full-width">
                <h3>Closed Complaint</h3>
                <p>OTP verified at {formatDateTime(complaint.otp_verified_at)}.</p>
                <p>Rating: {complaint.rating ? `${complaint.rating}/5` : "Waiting for recipient rating"}</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ComplaintDetail;
