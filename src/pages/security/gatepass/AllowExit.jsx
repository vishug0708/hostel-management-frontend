import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AllowExit.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AllowExit = () => {
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

  const handleAllowExit = async () => {
    if (!gatePass?.id) return;

    try {
      setProcessing(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/security/gatepass/${gatePass.id}/exit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to allow exit");
      }

      alert("Student exit allowed successfully.");

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
    <div className="security-layout">
      <aside className="security-sidebar">
        <div className="security-logo">
          <div className="security-logo-icon">🛡️</div>
          <div>
            <h2>Security</h2>
            <span>Hostel Management</span>
          </div>
        </div>

        <nav className="security-nav">
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

        <div className="security-sidebar-bottom">
          <div className="security-user">
            <div className="security-user-avatar">
              {security?.name
                ? security.name.charAt(0).toUpperCase()
                : "S"}
            </div>

            <div className="security-user-info">
              <strong>{security?.name || "Security Guard"}</strong>
              <span>{security?.hostel_name || "Hostel"}</span>
            </div>
          </div>

          <button className="security-logout" onClick={handleLogout}>
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="security-main">
        <div className="security-page-header">
          <div>
            <h1>Allow Student Exit</h1>
            <p>Verify gate pass and allow student to leave hostel</p>
          </div>

          <button
            className="back-button"
            onClick={() => navigate("/security/gatepass/scan")}
          >
            ← Back to Scanner
          </button>
        </div>

        {loading && (
          <div className="security-message loading-message">
            <div className="loader"></div>
            <p>Verifying gate pass...</p>
          </div>
        )}

        {!loading && error && (
          <div className="security-message error-message">
            <div className="message-icon">⚠️</div>
            <h3>Gate Pass Verification Failed</h3>
            <p>{error}</p>

            <button
              onClick={() => navigate("/security/gatepass/scan")}
              className="primary-button"
            >
              Back to Scanner
            </button>
          </div>
        )}

        {!loading && !error && gatePass && (
          <div className="allow-container">
            <div className="verification-badge">
              <span>✓</span>
              Gate Pass Verified
            </div>

            <div className="student-card">
              <div className="student-card-header">
                <h2>Student Details</h2>
                <span className="approved-badge">RECTOR APPROVED</span>
              </div>

              <div className="student-content">
                <div className="student-photo-wrapper">
                  {gatePass.photo ? (
                    <img
                      src={`${API_URL}/uploads/students/${gatePass.photo}`}
                      alt={gatePass.name}
                      className="student-photo"
                    />
                  ) : (
                    <div className="student-photo-placeholder">
                      {gatePass.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                  )}
                </div>

                <div className="student-info">
                  <h3>{gatePass.name}</h3>

                  <div className="info-grid">
                    <div className="info-item">
                      <span>Student ID</span>
                      <strong>{gatePass.student_id}</strong>
                    </div>

                    <div className="info-item">
                      <span>Mobile</span>
                      <strong>{gatePass.mobile || "-"}</strong>
                    </div>

                    <div className="info-item">
                      <span>College</span>
                      <strong>{gatePass.college || "-"}</strong>
                    </div>

                    <div className="info-item">
                      <span>Course</span>
                      <strong>{gatePass.course || "-"}</strong>
                    </div>

                    <div className="info-item">
                      <span>Hostel</span>
                      <strong>{gatePass.hostel || "-"}</strong>
                    </div>

                    <div className="info-item">
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

            <div className="gatepass-card">
              <div className="card-title">
                <span>🎫</span>
                <h2>Gate Pass Details</h2>
              </div>

              <div className="gatepass-grid">
                <div className="detail-item">
                  <span>Destination</span>
                  <strong>{gatePass.destination || "-"}</strong>
                </div>

                <div className="detail-item">
                  <span>Purpose</span>
                  <strong>{gatePass.purpose || "-"}</strong>
                </div>

                <div className="detail-item">
                  <span>Out Date</span>
                  <strong>{formatDate(gatePass.out_date)}</strong>
                </div>

                <div className="detail-item">
                  <span>Return Date</span>
                  <strong>{formatDate(gatePass.return_date)}</strong>
                </div>

                <div className="detail-item">
                  <span>Out Time</span>
                  <strong>{gatePass.out_time || "-"}</strong>
                </div>

                <div className="detail-item">
                  <span>Parent OTP</span>
                  <strong className="verified-text">
                    ✓ Verified
                  </strong>
                </div>
              </div>
            </div>

            <div className="exit-confirm-card">
              <div className="exit-icon">🚪</div>

              <div className="exit-content">
                <h2>Allow Hostel Exit?</h2>
                <p>
                  Confirm that <strong>{gatePass.name}</strong> is leaving
                  the hostel using this approved gate pass.
                </p>

                <div className="exit-warning">
                  ⚠️ Once exit is recorded, the student can use the same
                  gate pass for entry when returning.
                </div>

                <button
                  className="allow-exit-button"
                  onClick={handleAllowExit}
                  disabled={
                    processing || gatePass.security_exit === "Yes"
                  }
                >
                  {processing
                    ? "Recording Exit..."
                    : gatePass.security_exit === "Yes"
                    ? "✓ Exit Already Recorded"
                    : "✓ Allow Exit"}
                </button>
              </div>
            </div>

            {gatePass.exit_datetime && (
              <div className="recorded-info">
                <span>✓</span>
                Exit recorded at {formatDateTime(gatePass.exit_datetime)}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllowExit;