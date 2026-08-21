import { useState } from "react";
import { Link } from "react-router-dom";
import "./Index.css";

function Index() {

    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <div className="home-page">

            {/* =====================================================
                NAVBAR
            ===================================================== */}

            <nav className="home-navbar">

                <div className="navbar-container">

                    <Link
                        to="/"
                        className="navbar-brand"
                        onClick={closeMenu}
                    >

                        <div className="brand-icon">
                            🏠
                        </div>

                        <div className="brand-text">
                            <span className="brand-title">
                                Hostel
                            </span>

                            <span className="brand-subtitle">
                                Management System
                            </span>
                        </div>

                    </Link>


                    <div
                        className={`navbar-links ${menuOpen ? "active" : ""
                            }`}
                    >

                        <a href="#home" onClick={closeMenu}>
                            Home
                        </a>

                        <a href="#about" onClick={closeMenu}>
                            About
                        </a>

                        <a href="#features" onClick={closeMenu}>
                            Features
                        </a>

                        <a href="#gallery" onClick={closeMenu}>
                            Gallery
                        </a>

                        <a href="#contact" onClick={closeMenu}>
                            Contact
                        </a>


                        <div className="mobile-nav-buttons">

                            <Link
                                to="/student/login"
                                className="nav-login"
                                onClick={closeMenu}
                            >
                                Login
                            </Link>

                            <Link
                                to="/student/register"
                                className="nav-register"
                                onClick={closeMenu}
                            >
                                Register
                            </Link>

                        </div>

                    </div>


                    <div className="navbar-actions">

                        <Link
                            to="/student/login"
                            className="nav-login"
                        >
                            Login
                        </Link>

                        <Link
                            to="/student/register"
                            className="nav-register"
                        >
                            Register
                        </Link>

                    </div>


                    <button
                        className="menu-toggle"
                        onClick={() =>
                            setMenuOpen(!menuOpen)
                        }
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                </div>

            </nav>


            {/* =====================================================
                HERO SECTION
            ===================================================== */}

            <section
                className="hero-section"
                id="home"
            >

                <div className="hero-overlay"></div>

                <div className="hero-container">

                    <div className="hero-content">

                        <div className="hero-badge">

                            <span className="badge-dot"></span>

                            Smart & Secure Hostel Management

                        </div>


                        <h1>

                            Manage Your Hostel Life

                            <span>
                                Smarter & Better
                            </span>

                        </h1>


                        <p>
                            A modern digital platform designed
                            to make hostel management simple,
                            secure and convenient for students,
                            administrators, rectors and security
                            staff.
                        </p>


                        <div className="hero-buttons">

                            <Link
                                to="/student/login"
                                className="hero-primary-btn"
                            >
                                Student Login
                                <span>→</span>
                            </Link>

                            <a
                                href="#portals"
                                className="hero-secondary-btn"
                            >
                                Explore Portal
                            </a>

                        </div>


                        <div className="hero-stats">

                            <div className="hero-stat">
                                <strong>24/7</strong>
                                <span>Access</span>
                            </div>

                            <div className="stat-divider"></div>

                            <div className="hero-stat">
                                <strong>100%</strong>
                                <span>Digital</span>
                            </div>

                            <div className="stat-divider"></div>

                            <div className="hero-stat">
                                <strong>Secure</strong>
                                <span>Platform</span>
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                LOGIN PORTALS
            ===================================================== */}

            <section
                className="portal-section"
                id="portals"
            >

                <div className="section-container">

                    <div className="section-heading">

                        <span className="section-label">
                            ACCESS PORTALS
                        </span>

                        <h2>
                            Choose Your Portal
                        </h2>

                        <p>
                            Select the portal according to your
                            role in the hostel management system.
                        </p>

                    </div>


                    <div className="portal-grid">


                        {/* ADMIN */}

                        <div className="portal-card">

                            <div className="portal-icon admin-icon">
                                👨‍💼
                            </div>

                            <span className="portal-number">
                                01
                            </span>

                            <h3>
                                Admin Login
                            </h3>

                            <p>
                                Manage students, rooms, fees,
                                reports, complaints and complete
                                hostel operations.
                            </p>

                            
                            <Link
                                to="/admin/login"
                                className="portal-button"
                            >
                                Admin Login
                                <span>→</span>
                            </Link>
                        </div>


                        {/* STUDENT */}

                        <div className="portal-card featured-portal">

                            <div className="portal-icon student-icon">
                                🎓
                            </div>

                            <span className="portal-number">
                                02
                            </span>

                            <h3>
                                Student Login
                            </h3>

                            <p>
                                Access your profile, room,
                                fees, gatepass, complaints and
                                hostel services.
                            </p>

                            <Link
                                to="/student/login"
                                className="portal-button"
                            >
                                Student Login
                                <span>→</span>
                            </Link>

                        </div>


                        {/* RECTOR */}

                        <div className="portal-card">

                            <div className="portal-icon rector-icon">
                                🧑‍🏫
                            </div>

                            <span className="portal-number">
                                03
                            </span>

                            <h3>
                                Rector Login
                            </h3>

                            <p>
                                Supervise hostel activities,
                                students, complaints, reports
                                and daily operations.
                            </p>

                            <button
                                className="portal-button"
                                onClick={() =>
                                    alert(
                                        "Rector Login will be available soon."
                                    )
                                }
                            >
                                Rector Login
                                <span>→</span>
                            </button>

                        </div>


                        {/* SECURITY */}

                        <div className="portal-card">

                            <div className="portal-icon security-icon">
                                🛡️
                            </div>

                            <span className="portal-number">
                                04
                            </span>

                            <h3>
                                Security Login
                            </h3>

                            <p>
                                Scan QR gatepasses, verify
                                students and manage entry
                                and exit records.
                            </p>

                            <button
                                className="portal-button"
                                onClick={() =>
                                    alert(
                                        "Security Login will be available soon."
                                    )
                                }
                            >
                                Security Login
                                <span>→</span>
                            </button>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                ABOUT SECTION
            ===================================================== */}

            <section
                className="about-section"
                id="about"
            >

                <div className="section-container">

                    <div className="about-grid">

                        <div className="about-image">

                            <div className="about-image-overlay">

                                <strong>
                                    Smart Hostel
                                </strong>

                                <span>
                                    Digital Management
                                </span>

                            </div>

                        </div>


                        <div className="about-content">

                            <span className="section-label">
                                ABOUT US
                            </span>

                            <h2>
                                A Smarter Way To
                                Manage Your Hostel
                            </h2>

                            <p>
                                Hostel Management System is a
                                centralized digital platform created
                                to simplify and modernize hostel
                                operations.
                            </p>

                            <p>
                                From room allocation and fee
                                management to digital gatepasses
                                and security verification, everything
                                can be managed through one platform.
                            </p>


                            <div className="about-points">

                                <div>
                                    <span>✓</span>
                                    Easy to use
                                </div>

                                <div>
                                    <span>✓</span>
                                    Secure & reliable
                                </div>

                                <div>
                                    <span>✓</span>
                                    Fast digital services
                                </div>

                                <div>
                                    <span>✓</span>
                                    Mobile friendly
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                FEATURES
            ===================================================== */}

            <section
                className="features-section"
                id="features"
            >

                <div className="section-container">

                    <div className="section-heading">

                        <span className="section-label">
                            OUR FEATURES
                        </span>

                        <h2>
                            Everything You Need
                        </h2>

                        <p>
                            Powerful features designed to make
                            hostel management easier.
                        </p>

                    </div>


                    <div className="features-grid">

                        <div className="feature-card">
                            <div>🛏️</div>
                            <h3>Room Management</h3>
                            <p>
                                Manage rooms, capacity,
                                allocation and room status.
                            </p>
                        </div>


                        <div className="feature-card">
                            <div>💳</div>
                            <h3>Fee Management</h3>
                            <p>
                                Track pending fees, payments
                                and payment history.
                            </p>
                        </div>


                        <div className="feature-card">
                            <div>🎫</div>
                            <h3>Digital Gatepass</h3>
                            <p>
                                Apply, approve and manage
                                digital student gatepasses.
                            </p>
                        </div>


                        <div className="feature-card">
                            <div>📱</div>
                            <h3>QR Verification</h3>
                            <p>
                                Quickly verify gatepasses using
                                QR code scanning.
                            </p>
                        </div>


                        <div className="feature-card">
                            <div>📢</div>
                            <h3>Announcements</h3>
                            <p>
                                Keep students updated with
                                important hostel announcements.
                            </p>
                        </div>


                        <div className="feature-card">
                            <div>📊</div>
                            <h3>Reports</h3>
                            <p>
                                Get useful reports for hostel
                                operations and management.
                            </p>
                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                GALLERY
            ===================================================== */}

            <section
                className="gallery-section"
                id="gallery"
            >

                <div className="section-container">

                    <div className="section-heading">

                        <span className="section-label">
                            HOSTEL GALLERY
                        </span>

                        <h2>
                            Explore Our Hostel
                        </h2>

                        <p>
                            A glimpse of the facilities and
                            environment available to students.
                        </p>

                    </div>


                    <div className="gallery-grid">

                        <div className="gallery-item gallery-large">
                            <img
                                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80"
                                alt="Hostel room"
                            />
                            <span>Hostel Rooms</span>
                        </div>


                        <div className="gallery-item">
                            <img
                                src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80"
                                alt="Study area"
                            />
                            <span>Study Area</span>
                        </div>


                        <div className="gallery-item">
                            <img
                                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                                alt="Campus"
                            />
                            <span>Campus</span>
                        </div>


                        <div className="gallery-item">
                            <img
                                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"
                                alt="University"
                            />
                            <span>Campus Life</span>
                        </div>


                        <div className="gallery-item">
                            <img
                                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
                                alt="Students"
                            />
                            <span>Student Life</span>
                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                CONTACT
            ===================================================== */}

            <section
                className="contact-section"
                id="contact"
            >

                <div className="section-container">

                    <div className="contact-box">

                        <div className="contact-content">

                            <span className="section-label">
                                CONTACT US
                            </span>

                            <h2>
                                Need Help?
                            </h2>

                            <p>
                                Have a question about hostel
                                services? Our support team is
                                here to help.
                            </p>

                        </div>


                        <div className="contact-details">

                            <div className="contact-item">
                                <span>📍</span>
                                <div>
                                    <strong>Address</strong>
                                    <p>
                                        University Hostel Campus
                                    </p>
                                </div>
                            </div>


                            <div className="contact-item">
                                <span>📞</span>
                                <div>
                                    <strong>Phone</strong>
                                    <p>
                                        +91 98765 43210
                                    </p>
                                </div>
                            </div>


                            <div className="contact-item">
                                <span>✉️</span>
                                <div>
                                    <strong>Email</strong>
                                    <p>
                                        support@hostelmanagement.com
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                FOOTER
            ===================================================== */}

            <footer className="home-footer">

                <div className="section-container">

                    <div className="footer-grid">


                        {/* ABOUT */}

                        <div className="footer-about">

                            <div className="footer-brand">

                                <div className="footer-logo">
                                    🏠
                                </div>

                                <div>
                                    <strong>
                                        Hostel Management
                                    </strong>

                                    <span>
                                        System
                                    </span>
                                </div>

                            </div>

                            <p>
                                A modern digital hostel management
                                platform designed for students,
                                administrators, rectors and
                                security teams.
                            </p>


                            {/* SOCIAL */}

                            <div className="social-links">

                                <a
                                    href="#instagram"
                                    aria-label="Instagram"
                                >
                                    ◎
                                </a>

                                <a
                                    href="#facebook"
                                    aria-label="Facebook"
                                >
                                    f
                                </a>

                                <a
                                    href="#youtube"
                                    aria-label="YouTube"
                                >
                                    ▶
                                </a>

                                <a
                                    href="#linkedin"
                                    aria-label="LinkedIn"
                                >
                                    in
                                </a>

                            </div>

                        </div>


                        {/* QUICK LINKS */}

                        <div className="footer-column">

                            <h3>
                                Quick Links
                            </h3>

                            <a href="#home">
                                Home
                            </a>

                            <a href="#about">
                                About Us
                            </a>

                            <a href="#features">
                                Features
                            </a>

                            <a href="#gallery">
                                Gallery
                            </a>

                            <a href="#contact">
                                Contact Us
                            </a>

                        </div>


                        {/* PORTALS */}

                        <div className="footer-column">

                            <h3>
                                Login Portals
                            </h3>

                            <Link to="/student/login">
                                Student Login
                            </Link>

                            <a href="/admin/login">
                                Admin Login
                            </a>

                            <a href="#rector">
                                Rector Login
                            </a>

                            <a href="#security">
                                Security Login
                            </a>

                        </div>


                        {/* CONTACT */}

                        <div className="footer-column footer-contact">

                            <h3>
                                Contact Us
                            </h3>

                            <p>
                                📍 University Hostel Campus
                            </p>

                            <p>
                                📞 +91 98765 43210
                            </p>

                            <p>
                                ✉️ support@hostelmanagement.com
                            </p>

                            <p>
                                🕐 Mon - Sat: 9:00 AM - 6:00 PM
                            </p>

                        </div>

                    </div>


                    {/* FOOTER BOTTOM */}

                    <div className="footer-bottom">

                        <p>
                            © 2026 Hostel Management System.
                            All Rights Reserved.
                        </p>

                        <div>

                            <a href="#privacy">
                                Privacy Policy
                            </a>

                            <a href="#terms">
                                Terms & Conditions
                            </a>

                        </div>

                    </div>

                </div>

            </footer>

        </div>
    );
}

export default Index;