import React,{useEffect,useState}from"react";
import{useNavigate}from"react-router-dom";
import"./StaffCricketDashboard.css";
const API_URL=import.meta.env.VITE_API_URL||"http://localhost:5000";
const getStaff=()=>{try{return JSON.parse(localStorage.getItem("staff")||"{}")}catch{return{}}};
const photoUrl=p=>{if(!p)return"";p=String(p).trim();if(/^data:|^blob:|^https?:/.test(p))return p;p=p.replace(/^\/+/, "");return p.startsWith("uploads/")?`${API_URL}/${p}`:`${API_URL}/uploads/staff/${p}`};
export default function StaffCricketDashboard(){
 const nav=useNavigate(),[open,setOpen]=useState(false),[stats,setStats]=useState({}),[error,setError]=useState("");
 const token=localStorage.getItem("staffToken"),staff=getStaff(),photo=photoUrl(staff.photo||staff.profile_photo||staff.staff_photo||localStorage.getItem("staffPhoto"));
 useEffect(()=>{if(!token){nav("/staff/login",{replace:true});return}fetch(`${API_URL}/api/staff/cricket-box/stats`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()).then(d=>{if(!d.success)throw Error(d.message);setStats(d.stats||{})}).catch(e=>setError(e.message||"Unable to load dashboard."))},[]);
 const go=p=>{setOpen(false);nav(p)},logout=()=>{["staffToken","staff","staffPhoto"].forEach(k=>localStorage.removeItem(k));nav("/staff/login")};
 return <div className="sc-page">{open&&<div className="sc-overlay" onClick={()=>setOpen(false)}/>}
 <aside className={`sc-side ${open?"open":""}`}><div className="sc-brand"><b>🏠</b><div><strong>Hostel</strong><small>Staff Panel</small></div></div>
 <nav><button className="active" onClick={()=>go("/staff/cricket-box")}>📊 Dashboard</button><button onClick={()=>go("/staff/cricket-box/scan")}>📷 Scan QR</button><button onClick={()=>go("/staff/cricket-box/history")}>📋 Scan History</button><button onClick={()=>go("/staff/profile")}>👤 My Profile</button></nav>
 <button className="sc-logout" onClick={logout}>🚪 Logout</button></aside>
 <main className="sc-main"><header className="sc-top"><button className="sc-menu" onClick={()=>setOpen(true)}>☰</button><div><h1>Hostel Staff Panel</h1><span>Cricket Box QR Handler</span></div><div className="sc-photo">{photo?<img src={photo} alt="Staff"/>:"👤"}</div></header>
 <section className="sc-content"><span className="sc-kicker">CRICKET BOX</span><h2>QR Handler Dashboard</h2><p>Verify student cricket box bookings quickly and securely.</p>{error&&<div className="sc-error">{error}</div>}
 <div className="sc-stats">{[["📅","Today's Bookings","todayBookings"],["📷","Scanned Today","scannedToday"],["✅","Valid Entries","validToday"],["❌","Rejected Scans","rejectedToday"]].map(x=><div className="sc-stat" key={x[2]}><i>{x[0]}</i><div><small>{x[1]}</small><strong>{stats[x[2]]||0}</strong></div></div>)}</div>
 <div className="sc-actions"><div><b>📷</b><h3>Scan Booking QR</h3><p>Scan and verify a student's cricket booking.</p><button onClick={()=>go("/staff/cricket-box/scan")}>Open Scanner →</button></div><div><b>📋</b><h3>Scan History</h3><p>Review QR verification activity.</p><button onClick={()=>go("/staff/cricket-box/history")}>View History →</button></div></div></section></main></div>
}