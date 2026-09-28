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
    { label: "Cricket Box", icon: "🏏", path: "/student/cricket-box/bookings" },
    { label: "Notifications", icon: "🔔", path: "/student/notifications" }
];
const categories = ["Electrical", "Plumbing", "Carpenter", "Cleaning", "IT", "Maintenance"];

const getPhotoUrl = (photo) => {
    if (!photo) return "";
    const value = String(photo).trim();
    if (value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http://") || value.startsWith("https://")) return value;
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
    const [success, setSuccess] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getToken = () => localStorage.getItem("studentToken") || localStorage.getItem("token");
    const getStudentId = () => student?.id || student?.student_id || null;

    useEffect(() => {
        document.title = "New Complaint | Hostel Management System";
        const saved = localStorage.getItem("student");
        if (saved) {
            try { setStudent(JSON.parse(saved)); } catch { setStudent(null); }
        }
    }, []);

    useEffect(() => {
        document.body.classList.toggle("student-complaint-menu-open", mobileMenuOpen);
        return () => document.body.classList.remove("student-complaint-menu-open");
    }, [mobileMenuOpen]);

    useEffect(() => {
        if (!mobileMenuOpen) return;
        const outside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && menuButtonRef.current && !menuButtonRef.current.contains(event.target)) setMobileMenuOpen(false);
        };
        document.addEventListener("pointerdown", outside, true);
        return () => document.removeEventListener("pointerdown", outside, true);
    }, [mobileMenuOpen]);

    useEffect(() => {
        const id = getStudentId();
        const token = getToken();
        if (!id || !token) { setLoading(false); return; }
        fetch(`${API_URL}/api/student/complaints/backup-students/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(async (response) => {
                const data = await response.json();
                if (response.status === 401) throw new Error("Your student login session has expired. Please login again.");
                if (!response.ok || !data.success) throw new Error(data.message || "Failed to load backup students.");
                setBackupStudents(Array.isArray(data.students) ? data.students : []);
            })
            .catch((err) => setError(err.message || "Unable to load backup students."))
            .finally(() => setLoading(false));
    }, [student]);

    const navigateTo = (path) => { setMobileMenuOpen(false); navigate(path); };

    const handleLogout = () => {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("token");
        localStorage.removeItem("student");
        navigate("/student/login", { replace: true });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        if (name === "backup_student_id") setSelectedBackup(backupStudents.find((item) => String(item.id) === String(value)) || null);
        setError("");
        setSuccess("");
    };

    const handleAttachment = (event) => {
        const file = event.target.files?.[0] || null;
        if (!file) { setAttachment(null); return; }
        const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
        if (!allowed.includes(file.type)) { event.target.value = ""; setAttachment(null); setError("Only JPG, JPEG, PNG, WEBP and PDF files are allowed."); return; }
        if (file.size > 5 * 1024 * 1024) { event.target.value = ""; setAttachment(null); setError("Attachment size must be less than 5 MB."); return; }
        setAttachment(file);
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        if (!form.backup_student_id || !form.category || !form.subject.trim() || !form.description.trim()) {
            setError("Backup student, category, subject and description are required.");
            return;
        }
        const token = getToken();
        if (!token) { navigate("/student/login", { replace: true }); return; }
        const body = new FormData();
        body.append("backup_student_id", form.backup_student_id);
        body.append("category", form.category);
        body.append("subject", form.subject.trim());
        body.append("description", form.description.trim());
        if (attachment) body.append("attachment", attachment);
        try {
            setSubmitting(true);
            const response = await fetch(`${API_URL}/api/student/complaints`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body });
            const data = await response.json();
            if (response.status === 401) {
                localStorage.removeItem("studentToken");
                localStorage.removeItem("token");
                localStorage.removeItem("student");
                navigate("/student/login", { replace: true });
                return;
            }
            if (!response.ok || !data.success) throw new Error(data.message || "Failed to submit complaint.");
            setSuccess(`Complaint ${data.complaint?.complaint_code || ""} submitted successfully.`);
            setTimeout(() => navigate("/student/complaints"), 900);
        } catch (err) {
            setError(err.message || "Unable to submit complaint.");
        } finally {
            setSubmitting(false);
        }
    };

    const photo = getPhotoUrl(student?.photo);
    const initials = String(student?.name || "Student").split(" ").map((part) => part.charAt(0)).join("").substring(0, 2).toUpperCase();

    return (
        <div className="student-complaint-page">
            <aside ref={sidebarRef} className={`student-dashboard-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
                <div className="student-dashboard-brand"><div className="student-dashboard-brand-icon">🏠</div><div><strong>Hostel</strong><span>Student Portal</span></div></div>
                <nav className="student-dashboard-nav">{menuItems.map((item) => <button key={item.path} className={item.label === "Complaints" ? "active" : ""} onClick={() => navigateTo(item.path)}><span>{item.icon}</span><span>{item.label}</span></button>)}</nav>
                <button className="student-dashboard-logout" onClick={handleLogout}><span>🚪</span><span>Logout</span></button>
            </aside>
            {mobileMenuOpen && <div className="student-dashboard-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}
            <main className="student-complaint-main">
                <div className="student-dashboard-mobile-topbar">
                    <button ref={menuButtonRef} type="button" className="student-dashboard-mobile-menu-btn" onClick={() => setMobileMenuOpen((open) => !open)}>☰</button>
                    <div className="student-dashboard-mobile-brand"><div className="student-dashboard-mobile-brand-icon">🏠</div><div><strong>Hostel</strong><span>Student Portal</span></div></div>
                    <div className="student-dashboard-mobile-photo">{photo ? <img src={photo} alt="Student" /> : <span>{initials}</span>}</div>
                </div>
                <header className="student-complaint-header"><div><span>HOSTEL SERVICES</span><h1>Raise New Complaint</h1><p>Submit your hostel issue. Staff will be assigned automatically based on category.</p></div></header>
                <section className="new-complaint-content">
                    <button className="new-complaint-back" onClick={() => navigateTo("/student/complaints")}>← Back to Complaints</button>
                    {error && <div className="new-complaint-message error">⚠️ {error}</div>}
                    {success && <div className="new-complaint-message success">✓ {success}</div>}
                    <form className="new-complaint-card" onSubmit={handleSubmit}>
                        <div className="new-complaint-card-header"><div><span>COMPLAINT DETAILS</span><h2>Raise a Complaint</h2></div></div>
                        <div className="new-complaint-form-grid">
                            <div className="new-complaint-field full"><label>Backup Student <b>*</b></label><select name="backup_student_id" value={form.backup_student_id} onChange={handleChange} disabled={loading || submitting}><option value="">Select backup student</option>{backupStudents.map((item) => <option key={item.id} value={item.id}>{item.name} — ID {item.student_id || item.id}</option>)}</select><small>Backup student is mandatory. Their details are fetched automatically.</small></div>
                            {selectedBackup && <div className="backup-student-card"><div className="backup-student-photo">{getPhotoUrl(selectedBackup.photo) ? <img src={getPhotoUrl(selectedBackup.photo)} alt={selectedBackup.name} /> : <span>{selectedBackup.name?.charAt(0)?.toUpperCase() || "S"}</span>}</div><div className="backup-student-details"><strong>{selectedBackup.name}</strong><span>ID: {selectedBackup.student_id || selectedBackup.id}</span><span>Mobile: {selectedBackup.mobile || "-"}</span><span>Email: {selectedBackup.email || "-"}</span><span>Hostel: {selectedBackup.hostel || "-"}</span></div></div>}
                            <div className="new-complaint-field"><label>Complaint Category <b>*</b></label><select name="category" value={form.category} onChange={handleChange} disabled={submitting}><option value="">Select category</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                            <div className="assignment-info"><span>Automatic Assignment</span><strong>{form.category ? `${form.category} staff` : "Select a category"}</strong><small>System assigns one active staff member automatically.</small></div>
                            <div className="new-complaint-field full"><label>Subject <b>*</b></label><input name="subject" maxLength="200" value={form.subject} onChange={handleChange} placeholder="Enter complaint subject" disabled={submitting} /></div>
                            <div className="new-complaint-field full"><label>Description <b>*</b></label><textarea name="description" rows="7" value={form.description} onChange={handleChange} placeholder="Describe your problem clearly..." disabled={submitting} /></div>
                            <div className="new-complaint-field full"><label>Attachment <span>(Optional)</span></label><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleAttachment} disabled={submitting} /><small>JPG, JPEG, PNG, WEBP or PDF. Maximum 5 MB.</small>{attachment && <div className="attachment-name">📎 {attachment.name}</div>}</div>
                        </div>
                        <div className="new-complaint-actions"><button type="button" onClick={() => navigateTo("/student/complaints")} disabled={submitting}>Cancel</button><button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Complaint"}</button></div>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default NewComplaint;
