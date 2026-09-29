import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewComplaint.css";

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

const categories = ["Electrical", "Plumbing", "Carpenter", "Cleaning", "IT", "Maintenance"];

const getPhotoUrl = (photo) => {
  if (!photo) return "";
  const value = String(photo).trim();
  if (value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http")) return value;
  const normalized = value.replace(/^\/+/, "");
  if (normalized.startsWith("uploads/")) return `${API_URL}/${normalized}`;
  return `${API_URL}/uploads/students/${normalized}`;
};

const NewComplaint = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [student, setStudent] = useState(null);
  const [backupStudents, setBackupStudents] = useState([]);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [form, setForm] = useState({ backup_student_id: "", category: "", subject: "", description: "" });
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    const id = student?.id || student?.student_id;
    const token = getToken();
    if (!id || !token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/student/complaints/backup-students/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 401) {
          localStorage.removeItem("studentToken");
          localStorage.removeItem("token");
          localStorage.removeItem("student");
          navigate("/student/login", { replace: true });
          return;
        }
        if (!response.ok || !data.success) throw new Error(data.message || "Failed to load backup students.");
        setBackupStudents(Array.isArray(data.students) ? data.students : []);
      })
      .catch((err) => setError(err.message || "Unable to load backup students."))
      .finally(() => setLoading(false));
  }, [student]);

  useEffect(() => {
    const outside = (event) => {
      if (mobileMenuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [mobileMenuOpen]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "backup_student_id") {
      setSelectedBackup(backupStudents.find((item) => String(item.id) === String(value)) || null);
    }
    setError("");
  };

  const handleAttachment = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setAttachment(null);
      return;
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      e.target.value = "";
      setAttachment(null);
      setError("Only JPG, JPEG, PNG, WEBP and PDF files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      e.target.value = "";
      setAttachment(null);
      setError("Attachment must be 5 MB or smaller.");
      return;
    }

    setAttachment(file);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.backup_student_id || !form.category || !form.subject.trim() || !form.description.trim()) {
      setError("Backup student, category, subject and description are required.");
      return;
    }

    const token = getToken();
    if (!token) {
      navigate("/student/login", { replace: true });
      return;
    }

    const body = new FormData();
    body.append("backup_student_id", form.backup_student_id);
    body.append("category", form.category);
    body.append("subject", form.subject.trim());
    body.append("description", form.description.trim());
    if (attachment) body.append("attachment", attachment);

    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/api/student/complaints`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("token");
        localStorage.removeItem("student");
        navigate("/student/login", { replace: true });
        return;
      }

      if (!response.ok || !data.success) throw new Error(data.message || "Failed to submit complaint.");

      alert(`Complaint ${data.complaint?.complaint_code || ""} submitted successfully.`);
      navigate("/student/complaints", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  const photo = getPhotoUrl(student?.photo);
  const initials = String(student?.name || "Student").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="student-complaint-page">
      <aside ref={sidebarRef} className={`student-dashboard-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="student-dashboard-brand"><div className="student-dashboard-brand-icon">🏠</div><div><strong>Hostel</strong><span>Student Portal</span></div></div>
        <nav className="student-dashboard-nav">
          {menuItems.map((item) => <button key={item.path} className={item.label === "Complaints" ? "active" : ""} onClick={() => navigateTo(item.path)}><span>{item.icon}</span><span>{item.label}</span></button>)}
        </nav>
        <button className="student-dashboard-logout" onClick={logout}><span>🚪</span><span>Logout</span></button>
      </aside>

      {mobileMenuOpen && <div className="student-dashboard-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}

      <main className="student-complaint-main">
        <header className="student-dashboard-mobile-topbar">
          <button ref={menuButtonRef} className="student-dashboard-mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>☰</button>
          <div className="student-dashboard-mobile-brand"><strong>Hostel Student Panel</strong><span>New Complaint</span></div>
          <div className="student-dashboard-mobile-photo">{photo ? <img src={photo} alt="Student" /> : initials}</div>
        </header>

        <header className="student-complaint-header">
          <div><span>HOSTEL SERVICES</span><h1>New Complaint</h1><p>Backup student is mandatory and staff is assigned automatically by complaint category.</p></div>
        </header>

        <section className="student-complaint-content">
          {error && <div className="student-complaint-error">⚠️ {error}</div>}

          {loading ? (
            <div className="student-complaint-loading">Loading backup students...</div>
          ) : (
            <form className="student-complaint-form" onSubmit={submit}>
              <section className="student-complaint-card">
                <div className="student-complaint-card-heading"><span>1</span><div><h2>Backup Student</h2><p>Select one backup student. Their details are loaded automatically.</p></div></div>

                <label className="student-complaint-label">Backup Student <span>*</span></label>
                <select name="backup_student_id" value={form.backup_student_id} onChange={handleChange} required>
                  <option value="">Select backup student</option>
                  {backupStudents.map((item) => <option key={item.id} value={item.id}>{item.name} — ID {item.student_id ?? item.id}</option>)}
                </select>

                {selectedBackup && (
                  <div className="backup-student-preview">
                    <div className="backup-student-photo">
                      {getPhotoUrl(selectedBackup.photo) ? <img src={getPhotoUrl(selectedBackup.photo)} alt={selectedBackup.name} /> : selectedBackup.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="backup-student-details">
                      <strong>{selectedBackup.name}</strong>
                      <span>ID: {selectedBackup.student_id ?? selectedBackup.id}</span>
                      <span>📱 {selectedBackup.mobile || "-"}</span>
                      <span>✉️ {selectedBackup.email || "-"}</span>
                      <span>🏠 {selectedBackup.room_no ? `${selectedBackup.block || ""}${selectedBackup.room_no}` : selectedBackup.hostel || "Hostel details unavailable"}</span>
                    </div>
                  </div>
                )}

                {backupStudents.length === 0 && <div className="student-complaint-warning">No other student is available as a backup student.</div>}
              </section>

              <section className="student-complaint-card">
                <div className="student-complaint-card-heading"><span>2</span><div><h2>Complaint Details</h2><p>Choose the field/category. The system will automatically select an active staff member with the lowest open complaint load.</p></div></div>

                <label className="student-complaint-label">Category <span>*</span></label>
                <select name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>

                <label className="student-complaint-label">Subject <span>*</span></label>
                <input name="subject" value={form.subject} onChange={handleChange} maxLength={200} placeholder="Short complaint subject" required />

                <label className="student-complaint-label">Description <span>*</span></label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={7} placeholder="Explain the issue clearly..." required />

                <label className="student-complaint-label">Attachment</label>
                <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleAttachment} />
                {attachment && <div className="student-complaint-file">Selected: {attachment.name}</div>}
              </section>

              <div className="student-complaint-form-actions">
                <button type="button" className="student-complaint-secondary-btn" onClick={() => navigateTo("/student/complaints")}>Cancel</button>
                <button type="submit" className="student-complaint-submit-btn" disabled={submitting || backupStudents.length === 0}>{submitting ? "Submitting..." : "Submit Complaint"}</button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
};

export default NewComplaint;
