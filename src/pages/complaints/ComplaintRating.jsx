import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ComplaintRating.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ComplaintRating = () => {
  const { token } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadComplaint();
  }, [token]);

  const loadComplaint = async () => {
    try {
      const response = await fetch(`${API_URL}/api/student/complaints/rating/${encodeURIComponent(token)}`);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Invalid rating link.");
      setComplaint(data.complaint);
    } catch (err) {
      setError(err.message || "Unable to load rating page.");
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const response = await fetch(`${API_URL}/api/student/complaints/rating/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, rating_feedback: feedback.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to submit rating.");
      setMessage(data.message);
      setComplaint((prev) => ({ ...prev, rating }));
    } catch (err) {
      setError(err.message || "Unable to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="complaint-rating-page"><div className="complaint-rating-card">Loading...</div></div>;

  return (
    <div className="complaint-rating-page">
      <div className="complaint-rating-card">
        <div className="complaint-rating-logo">🏠</div>
        <span className="complaint-rating-eyebrow">HOSTEL MANAGEMENT SYSTEM</span>
        <h1>Rate Complaint Resolution</h1>

        {error ? (
          <div className="complaint-rating-error">⚠️ {error}</div>
        ) : complaint ? (
          <>
            <div className="complaint-rating-summary">
              <span>Complaint</span>
              <strong>{complaint.complaint_code}</strong>
              <p>{complaint.subject}</p>
              <small>{complaint.category}</small>
            </div>

            {complaint.rating ? (
              <div className="complaint-rating-success">✅ This complaint has already been rated: <strong>{complaint.rating}/5</strong></div>
            ) : message ? (
              <div className="complaint-rating-success">✅ {message}</div>
            ) : (
              <>
                <p className="complaint-rating-text">Please rate the resolution received for this complaint.</p>
                <div className="complaint-rating-stars">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} type="button" className={value <= rating ? "selected" : ""} onClick={() => setRating(value)} aria-label={`${value} star rating`}>★</button>
                  ))}
                </div>
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Optional feedback..." rows={5} />
                <button className="complaint-rating-submit" disabled={submitting} onClick={submit}>{submitting ? "Submitting..." : "Submit Rating"}</button>
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ComplaintRating;
