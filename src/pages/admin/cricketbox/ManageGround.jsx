import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageGround.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ManageGround() {
    const navigate = useNavigate();

    const [grounds, setGrounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchGrounds();
    }, []);

    const fetchGrounds = async () => {
        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login", {
                replace: true
            });
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/admin/cricket-grounds/${id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to load cricket grounds."
                );
            }

            setGrounds(
                Array.isArray(data.grounds)
                    ? data.grounds
                    : []
            );
        } catch (err) {
            console.error(
                "Fetch Grounds Error:",
                err
            );

            setError(
                err.message ||
                "Cannot connect to backend server."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this cricket ground?"
        );

        if (!confirmDelete) {
            return;
        }

        const token = localStorage.getItem("adminToken");

        try {
            const response = await fetch(
                `${API_URL}/api/admin/cricket-grounds/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to delete ground."
                );
            }

            setGrounds((prevGrounds) =>
                prevGrounds.filter(
                    (ground) =>
                        ground.id !== id
                )
            );

            alert(
                "Cricket ground deleted successfully."
            );
        } catch (err) {
            console.error(
                "Delete Ground Error:",
                err
            );

            alert(
                err.message ||
                "Unable to delete ground."
            );
        }
    };

    const formatTime = (time) => {
        if (!time) {
            return "—";
        }

        const parts = String(time).split(":");
        const hour = Number(parts[0]);
        const minute = parts[1] || "00";

        if (Number.isNaN(hour)) {
            return time;
        }

        const period =
            hour >= 12 ? "PM" : "AM";

        const formattedHour =
            hour % 12 || 12;

        return `${formattedHour}:${minute} ${period}`;
    };

    const filteredGrounds = grounds.filter(
        (ground) => {
            const searchText =
                search.trim().toLowerCase();

            if (!searchText) {
                return true;
            }

            return (
                String(
                    ground.name || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    ground.location || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    ground.description || ""
                )
                    .toLowerCase()
                    .includes(searchText)
            );
        }
    );

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");

        navigate("/admin/login", {
            replace: true
        });
    };

    return (
        <div className="manage-ground-page">

            {/* SIDEBAR */}

            <aside className="manage-ground-sidebar">

                <div className="manage-ground-brand">

                    <div className="manage-ground-brand-icon">
                        🏠
                    </div>

                    <div>
                        <strong>
                            Hostel
                        </strong>

                        <span>
                            Admin Panel
                        </span>
                    </div>

                </div>

                <nav className="manage-ground-nav">

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/dashboard"
                            )
                        }
                    >
                        📊 Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/students"
                            )
                        }
                    >
                        🎓 Students
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/rooms"
                            )
                        }
                    >
                        🛏️ Rooms
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/fees"
                            )
                        }
                    >
                        💰 Fees
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/complaints"
                            )
                        }
                    >
                        📝 Complaints
                    </button>

                    <button
                        className="active"
                    >
                        🏏 Cricket Box
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/profile"
                            )
                        }
                    >
                        👤 Profile
                    </button>

                </nav>

                <button
                    className="manage-ground-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>

            {/* MAIN */}

            <main className="manage-ground-main">

                {/* HEADER */}

                <header className="manage-ground-header">

                    <div>

                        <span>
                            CRICKET BOX MANAGEMENT
                        </span>

                        <h1>
                            Manage Grounds
                        </h1>

                        <p>
                            Manage cricket boxes,
                            availability and pricing.
                        </p>

                    </div>

                    <div className="manage-ground-header-actions">

                        <button
                            className="manage-ground-refresh"
                            onClick={fetchGrounds}
                        >
                            ↻ Refresh
                        </button>

                        <button
                            className="manage-ground-add"
                            onClick={() =>
                                navigate(
                                    "/admin/cricket-box/add"
                                )
                            }
                        >
                            + Add Ground
                        </button>


                    </div>

                </header>

                {/* SEARCH */}

                <section className="manage-ground-toolbar">

                    <div className="manage-ground-search">

                        <span>
                            🔍
                        </span>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search ground, location..."
                        />

                    </div>

                    <div className="manage-ground-total">
                        {filteredGrounds.length}
                        {" Grounds"}
                    </div>

                      <button
                            className="manage-ground-add"
                            onClick={() =>
                                navigate(
                                    "/admin/cricket-box/booking-history"
                                )
                            }
                        >
                            📋 Booking History
                        </button>

                        <button
                            className="manage-ground-add"
                            onClick={() =>
                                navigate(
                                    "/admin/cricket-box/reports"
                                )
                            }
                        >
                            📝 Reports
                        </button>

                </section>

                {/* LOADING */}

                {loading && (

                    <div className="manage-ground-state">

                        <div>
                            ⏳
                        </div>

                        <p>
                            Loading cricket grounds...
                        </p>

                    </div>

                )}

                {/* ERROR */}

                {!loading && error && (

                    <div className="manage-ground-state error">

                        <div>
                            ⚠️
                        </div>

                        <h3>
                            Unable to Load Grounds
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={fetchGrounds}
                        >
                            Try Again
                        </button>

                    </div>

                )}

                {/* EMPTY */}

                {!loading &&
                    !error &&
                    filteredGrounds.length === 0 && (

                        <div className="manage-ground-state">

                            <div>
                                🏏
                            </div>

                            <h3>
                                No Cricket Grounds Found
                            </h3>

                            <p>
                                Add your first cricket
                                box to start accepting
                                bookings.
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/admin/cricket-box/add"
                                    )
                                }
                            >
                                + Add Ground
                            </button>

                        </div>

                    )}

                {/* GROUND GRID */}

                {!loading &&
                    !error &&
                    filteredGrounds.length > 0 && (

                        <section className="manage-ground-grid">

                            {filteredGrounds.map(
                                (ground) => (

                                    <article
                                        className="manage-ground-card"
                                        key={ground.id}
                                    >

                                        <div className="manage-ground-card-top">

                                            <div className="manage-ground-card-icon">
                                                🏏
                                            </div>

                                            <span
                                                className={
                                                    `manage-ground-status ${String(
                                                        ground.status ||
                                                        "Active"
                                                    ).toLowerCase()
                                                    }`
                                                }
                                            >
                                                {
                                                    ground.status ||
                                                    "Active"
                                                }
                                            </span>

                                        </div>

                                        <div className="manage-ground-card-content">

                                            <h2>
                                                {
                                                    ground.name ||
                                                    "Unnamed Ground"
                                                }
                                            </h2>

                                            <p className="manage-ground-location">
                                                📍{" "}
                                                {
                                                    ground.location ||
                                                    "Location not available"
                                                }
                                            </p>

                                            <p className="manage-ground-description">
                                                {
                                                    ground.description ||
                                                    "No description available."
                                                }
                                            </p>

                                        </div>

                                        <div className="manage-ground-details">

                                            <div>

                                                <span>
                                                    CAPACITY
                                                </span>

                                                <strong>
                                                    {
                                                        ground.capacity ||
                                                        "—"
                                                    }
                                                </strong>

                                            </div>

                                            <div>

                                                <span>
                                                    PRICE / HOUR
                                                </span>

                                                <strong>
                                                    ₹
                                                    {
                                                        Number(
                                                            ground.price_per_hour ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )
                                                    }
                                                </strong>

                                            </div>

                                        </div>

                                        <div className="manage-ground-timing">

                                            <span>
                                                🕐
                                            </span>

                                            <p>
                                                {
                                                    formatTime(
                                                        ground.opening_time
                                                    )
                                                }

                                                {" - "}

                                                {
                                                    formatTime(
                                                        ground.closing_time
                                                    )
                                                }
                                            </p>

                                        </div>

                                        <div className="manage-ground-slot-duration">

                                            <span>
                                                ⏱️
                                            </span>

                                            <p>
                                                Slot Duration:{" "}
                                                {ground.slot_duration || 60}
                                                {" Minutes"}
                                            </p>

                                        </div>


                                        <div className="manage-ground-actions">

                                            <button
                                                className="manage-ground-edit"
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/cricket-box/edit/${ground.id}`
                                                    )
                                                }
                                            >
                                                ✏️ Edit
                                            </button>

                                            <button
                                                className="manage-ground-delete"
                                                onClick={() =>
                                                    handleDelete(
                                                        ground.id
                                                    )
                                                }
                                            >
                                                🗑 Delete
                                            </button>

                                        </div>

                                    </article>

                                )
                            )}

                        </section>

                    )}

                {/* FOOTER */}

                <footer className="manage-ground-footer">

                    <span>
                        © 2026 Hostel Management System
                    </span>

                    <span>
                        Admin Panel
                    </span>

                </footer>

            </main>
        </div>
    );
}

export default ManageGround;