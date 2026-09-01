import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AllowEntry.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AllowEntry = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [gatePass, setGatePass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const security = JSON.parse(localStorage.getItem("security") || "{}");

  useEffect(() => {
    fetchGatePass();
  }, [id]);

  const fetchGatePass = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/security/gatepass/scan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            verification_code: id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to verify gate pass");
      }

      setGatePass(data.gatePass);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAllowEntry = async () => {
    if (!gatePass?.id) return;

    try {
      setProcessing(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/security/gatepass/${gatePass.id}/entry`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to allow entry");
      }

      alert("Student entry recorded successfully.");

      navigate("/security/gatepass/scan");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("security");
    localStorage.removeItem("securityToken");
    navigate("/security/login");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="entry-security-layout">
      <aside className="entry-security-sidebar">
        <div className="entry-security-logo">
          <div className="entry-security-logo-icon">🛡️</div>
          <div>
            <h2>Security</h2>
            <span>Hostel Management</span>
          </div>
        </div>

        <nav className="entry-security-nav">
          <button onClick={() => navigate("/security/dashboard")}>
            <span>📊</span>
            Dashboard
          </button>

          <button
            className="active"
            onClick={() => navigate("/security/gatepass/scan")}
          >
            <span>📷</span>
            Scan Gate Pass
          </button>

          <button
            onClick={() => navigate("/security/gatepass/exit-records")}
          >
            <span>🚪</span>
            Exit Records
          </button>

          <button
            onClick={() => navigate("/security/gatepass/entry-records")}
          >
            <span>🏠</span>
            Entry Records
          </button>

          <button onClick={() => navigate("/security/profile")}>
            <span>👤</span>
            Profile
          </button>
        </nav>

        <div className="entry-security-sidebar-bottom">
          <div className="entry-security-user">
            <div className="entry-security-avatar">
              {security?.name
                ? security.name.charAt(0).toUpperCase()
                : "S"}
            </div>

            <div className="entry-security-user-info">
              <strong>{security?.name || "Security Guard"}</strong>
              <span>{security?.hostel_name || "Hostel"}</span>
            </div>
          </div>

          <button className="entry-security-logout" onClick={handleLogout}>
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="entry-security-main">
        <div className="entry-security-header">
          <div>
            <h1>Allow Student Entry</h1>
            <p>Verify gate pass and record student's hostel entry</p>
          </div>

          <button
            className="entry-back-button"
            onClick={() => navigate("/security/gatepass/scan")}
          >
            ← Back to Scanner
          </button>
        </div>

        {loading && (
          <div className="entry-message entry-loading">
            <div className="entry-loader"></div>
            <p>Verifying gate pass...</p>
          </div>
        )}

        {!loading && error && (
          <div className="entry-message entry-error">
            <div className="entry-message-icon">⚠️</div>
            <h3>Gate Pass Verification Failed</h3>
            <p>{error}</p>

            <button
              className="entry-primary-button"
              onClick={() => navigate("/security/gatepass/scan")}
            >
              Back to Scanner
            </button>
          </div>
        )}

        {!loading && !error && gatePass && (
          <div className="entry-container">
            <div className="entry-verification-badge">
              <span>✓</span>
              Gate Pass Verified
            </div>

            <div className="entry-status-card">
              <div className="entry-status-icon">🏠</div>

              <div>
                <h2>Student Returning to Hostel</h2>
                <p>
                  Exit was recorded successfully. You can now record the
                  student's entry.
                </p>
              </div>
            </div>

            <div className="entry-student-card">
              <div className="entry-student-header">
                <h2>Student Details</h2>
                <span className="entry-approved-badge">
                  RECTOR APPROVED
                </span>
              </div>

              <div className="entry-student-content">
                <div className="entry-photo-wrapper">
                  {gatePass.photo ? (
                    <img
                      src={`${API_URL}/uploads/students/${gatePass.photo}`}
                      alt={gatePass.name}
                      className="entry-student-photo"
                    />
                  ) : (
                    <div className="entry-photo-placeholder">
                      {gatePass.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                  )}
                </div>

                <div className="entry-student-info">
                  <h3>{gatePass.name}</h3>

                  <div className="entry-info-grid">
                    <div>
                      <span>Student ID</span>
                      <strong>{gatePass.student_id}</strong>
                    </div>

                    <div>
                      <span>Mobile</span>
                      <strong>{gatePass.mobile || "-"}</strong>
                    </div>

                    <div>
                      <span>College</span>
                      <strong>{gatePass.college || "-"}</strong>
                    </div>

                    <div>
                      <span>Course</span>
                      <strong>{gatePass.course || "-"}</strong>
                    </div>

                    <div>
                      <span>Hostel</span>
                      <strong>{gatePass.hostel || "-"}</strong>
                    </div>

                    <div>
                      <span>Room</span>
                      <strong>
                        {gatePass.room_no
                          ? `${gatePass.block || ""} ${gatePass.room_no}`
                          : "-"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="entry-gatepass-card">
              <div className="entry-card-title">
                <span>🎫</span>
                <h2>Gate Pass Details</h2>
              </div>

              <div className="entry-gatepass-grid">
                <div className="entry-detail-item">
                  <span>Destination</span>
                  <strong>{gatePass.destination || "-"}</strong>
                </div>

                <div className="entry-detail-item">
                  <span>Purpose</span>
                  <strong>{gatePass.purpose || "-"}</strong>
                </div>

                <div className="entry-detail-item">
                  <span>Out Date</span>
                  <strong>{formatDate(gatePass.out_date)}</strong>
                </div>

                <div className="entry-detail-item">
                  <span>Return Date</span>
                  <strong>{formatDate(gatePass.return_date)}</strong>
                </div>

                <div className="entry-detail-item">
                  <span>Exit Time</span>
                  <strong>
                    {formatDateTime(
                      gatePass.security_exit_time ||
                        gatePass.exit_datetime
                    )}
                  </strong>
                </div>

                <div className="entry-detail-item">
                  <span>Entry Status</span>
                  <strong className="entry-pending-text">
                    Waiting for Entry
                  </strong>
                </div>
              </div>
            </div>

            <div className="allow-entry-card">
              <div className="allow-entry-icon">🏠</div>

              <div className="allow-entry-content">
                <h2>Allow Hostel Entry?</h2>

                <p>
                  Confirm that <strong>{gatePass.name}</strong> has
                  returned to the hostel.
                </p>

                <div className="entry-warning">
                  ✓ Previous hostel exit has already been recorded.
                </div>

                <button
                  className="allow-entry-button"
                  onClick={handleAllowEntry}
                  disabled={
                    processing ||
                    gatePass.security_exit !== "Yes" ||
                    gatePass.security_entry === "Yes"
                  }
                >
                  {processing
                    ? "Recording Entry..."
                    : gatePass.security_entry === "Yes"
                    ? "✓ Entry Already Recorded"
                    : "✓ Allow Entry"}
                </button>
              </div>
            </div>

            {gatePass.entry_datetime && (
              <div className="entry-recorded-info">
                <span>✓</span>
                Entry recorded at {formatDateTime(gatePass.entry_datetime)}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllowEntry;