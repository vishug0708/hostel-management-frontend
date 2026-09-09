import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CricketBooking.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getPhotoUrl = (photo) => {
    if (!photo) return "";
    const value = String(photo).trim();

    if (
        value.startsWith("data:") ||
        value.startsWith("blob:") ||
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    const normalized = value.replace(/^\/+/, "");

    if (normalized.startsWith("uploads/")) {
        return `${API_URL}/${normalized}`;
    }

    return `${API_URL}/uploads/students/${normalized}`;
};

const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getStudent = () => {
    try {
        return JSON.parse(localStorage.getItem("student") || "{}");
    } catch {
        return {};
    }
};

function CricketBooking() {
    const navigate = useNavigate();
    const location = useLocation();

    const student = getStudent();
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("studentToken");

    const queryParams = new URLSearchParams(location.search);
    const queryGroundId = queryParams.get("ground");

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [grounds, setGrounds] = useState([]);
    const [slots, setSlots] = useState([]);
    const [allSlots, setAllSlots] = useState([]);

    const [selectedGround, setSelectedGround] = useState(
        queryGroundId ? Number(queryGroundId) : ""
    );
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState(null);

    const [players, setPlayers] = useState([
        {
            student_name:
                student.name ||
                student.student_name ||
                student.full_name ||
                "",
            student_id: String(
                student.student_id ??
                student.roll_no ??
                student.registration_no ??
                ""
            ),
            mobile: student.mobile || student.phone || "",
            isMainStudent: true,
        },
    ]);

    const [loadingGrounds, setLoadingGrounds] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchGrounds();
    }, []);

    useEffect(() => {
        if (selectedGround) {
            fetchSlots(selectedGround, selectedDate);
        } else {
            setSlots([]);
            setAllSlots([]);
            setSelectedSlot(null);
        }
    }, [selectedGround]);

    const fetchGrounds = async () => {
        try {
            setLoadingGrounds(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/student/cricket/grounds`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load grounds");
            }

            const groundList = Array.isArray(data)
                ? data
                : data.grounds || data.data || [];

            setGrounds(groundList);

            if (queryGroundId) {
                const exists = groundList.some(
                    (ground) => Number(ground.id) === Number(queryGroundId)
                );

                if (!exists) {
                    setSelectedGround("");
                }
            }
        } catch (err) {
            setError(err.message || "Unable to load cricket grounds");
        } finally {
            setLoadingGrounds(false);
        }
    };

    const fetchSlots = async (groundId, bookingDate = selectedDate) => {
        try {
            setLoadingSlots(true);
            setError("");
            setSelectedSlot(null);

            const dateQuery = bookingDate
                ? `?date=${encodeURIComponent(bookingDate)}`
                : "";

            const response = await fetch(
                `${API_URL}/api/student/cricket/grounds/${groundId}/slots${dateQuery}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load slots");
            }

            const slotList = Array.isArray(data)
                ? data
                : data.slots || data.data || [];

            setAllSlots(slotList);

            setSlots(
                filterSlotsByRealTime(
                    slotList,
                    bookingDate
                )
            );
        } catch (err) {
            setSlots([]);
            setAllSlots([]);
            setError(err.message || "Unable to load slots");
        } finally {
            setLoadingSlots(false);
        }
    };

    const filterSlotsByRealTime = (slotList, bookingDate) => {
        if (!bookingDate) {
            return slotList;
        }

        const today = getToday();

        if (bookingDate !== today) {
            return slotList;
        }

        const now = new Date();

        const currentMinutes =
            now.getHours() * 60 + now.getMinutes();

        return slotList.filter((slot) => {
            if (!slot.start_time) {
                return false;
            }

            const timeParts = String(slot.start_time)
                .split(":")
                .map(Number);

            const slotMinutes =
                timeParts[0] * 60 + timeParts[1];

            return slotMinutes > currentMinutes;
        });
    };

    useEffect(() => {
        const updateSlots = () => {
            if (!selectedDate || allSlots.length === 0) {
                return;
            }

            setSlots(
                filterSlotsByRealTime(
                    allSlots,
                    selectedDate
                )
            );
        };

        updateSlots();

        const interval = setInterval(updateSlots, 30000);

        return () => clearInterval(interval);
    }, [selectedDate, allSlots]);

    const selectedGroundData = useMemo(() => {
        return grounds.find(
            (ground) => Number(ground.id) === Number(selectedGround)
        );
    }, [grounds, selectedGround]);

    const selectedSlotData = useMemo(() => {
        return slots.find(
            (slot) => Number(slot.id) === Number(selectedSlot)
        );
    }, [slots, selectedSlot]);

    const addPlayer = () => {
        const capacity = Number(selectedGroundData?.capacity || 0);

        if (!selectedGround) {
            setError("Please select a cricket ground first.");
            return;
        }

        if (capacity > 0 && players.length >= capacity) {
            setError(
                `This cricket box has a maximum capacity of ${capacity} students.`
            );
            return;
        }

        setError("");

        setPlayers((prev) => [
            ...prev,
            {
                student_name: "",
                student_id: "",
                mobile: "",
                isMainStudent: false,
            },
        ]);
    };

    const removePlayer = (index) => {
        if (index === 0) return;

        setPlayers((prev) => prev.filter((_, i) => i !== index));
    };

    const updatePlayer = (index, field, value) => {
        setPlayers((prev) =>
            prev.map((player, i) =>
                i === index
                    ? {
                        ...player,
                        [field]: value,
                    }
                    : player
            )
        );
    };

    const searchStudent = async (index, name) => {
        updatePlayer(index, "student_name", name);

        if (!name.trim() || name.trim().length < 2) {
            updatePlayer(index, "student_id", "");
            updatePlayer(index, "mobile", "");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/student/cricket/students/search?name=${encodeURIComponent(
                    name.trim()
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return;
            }

            const students = Array.isArray(data)
                ? data
                : data.students || data.data || [];

            if (students.length === 1) {
                const foundStudent = students[0];

                // Student database ID
                const studentId =
                    foundStudent.student_id ??
                    foundStudent.id ??
                    foundStudent.roll_no ??
                    foundStudent.registration_no ??
                    "";

                // Student mobile number
                const mobile =
                    foundStudent.mobile ??
                    foundStudent.phone ??
                    "";

                updatePlayer(
                    index,
                    "student_id",
                    String(studentId)
                );

                updatePlayer(
                    index,
                    "mobile",
                    String(mobile)
                );
            }
        } catch (error) {
            console.error(
                "Student search error:",
                error
            );
        }
    };

    const totalAmount = Number(
        selectedSlotData?.price ??
        selectedSlotData?.price_per_hour ??
        selectedGroundData?.price_per_hour ??
        0
    );

    const handleBooking = async () => {
        setError("");
        setSuccess("");

        if (!selectedGround) {
            setError("Please select a cricket ground.");
            return;
        }

        if (!selectedDate) {
            setError("Please select a booking date.");
            return;
        }

        if (!selectedSlot) {
            setError("Please select an available slot.");
            return;
        }

        const currentSlot = slots.find(
            (slot) => Number(slot.id) === Number(selectedSlot)
        );

        const currentSlotAvailable =
            currentSlot &&
            (
                Number(currentSlot.is_available) === 1 ||
                currentSlot.is_available === true ||
                currentSlot.availability_status === "Available"
            );

        if (!currentSlotAvailable) {
            setError(
                "This time slot is no longer available. Please select another slot."
            );
            setSelectedSlot(null);
            return;
        }

        for (let i = 0; i < players.length; i++) {
            if (!players[i].student_name.trim()) {
                setError(`Please enter player ${i + 1} name.`);
                return;
            }
        }

        try {
            setBookingLoading(true);

            const bookingData = {
                ground_id: Number(selectedGround),
                slot_id: Number(selectedSlot),
                booking_date: selectedDate,
                players: players.map((player) => ({
                    student_name: String(
                        player.student_name ?? ""
                    ).trim(),

                    student_id: String(
                        player.student_id ?? ""
                    ).trim() || null,

                    mobile: String(
                        player.mobile ?? ""
                    ).trim() || null
                }))
            };

            const response = await fetch(
                `${API_URL}/api/student/cricket/bookings`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(bookingData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Booking failed");
            }

            setSuccess(
                data.message ||
                "Cricket box booking request submitted successfully."
            );

            setTimeout(() => {
                const bookingId =
                    data.booking?.id ||
                    data.booking_id ||
                    data.id;

                if (bookingId) {
                    navigate(
                        `/student/cricket-box/bookings/${bookingId}`
                    );
                } else {
                    navigate("/student/cricket-box/bookings");
                }
            }, 1200);
        } catch (err) {
            setError(err.message || "Booking failed. Please try again.");
        } finally {
            setBookingLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("studentToken");
        localStorage.removeItem("student");

        navigate("/student/login");
    };

    const goTo = (path) => {
        setSidebarOpen(false);
        navigate(path);
    };

    const studentName =
        student.name ||
        student.student_name ||
        student.full_name ||
        "Student";

    const studentPhoto = getPhotoUrl(
        student.photo ||
        student.profile_photo ||
        student.student_photo ||
        student.image
    );

    const initials = studentName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();

    return (
        <div className="cricket-booking-layout">
            {sidebarOpen && (
                <div
                    className="cricket-booking-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`cricket-booking-sidebar ${sidebarOpen ? "cricket-booking-sidebar-open" : ""
                    }`}
            >
                <div className="cricket-booking-brand">
                    <div className="cricket-booking-brand-icon">🏠</div>
                    <div>
                        <h2>Hostel</h2>
                        <span>Student Portal</span>
                    </div>
                </div>

                <nav className="cricket-booking-nav">
                    <button
                        className="cricket-booking-nav-item"
                        onClick={() => goTo("/student/dashboard")}
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </button>

                    <button
                        className="cricket-booking-nav-item"
                        onClick={() => goTo("/student/profile")}
                    >
                        <span>👤</span>
                        <span>My Profile</span>
                    </button>

                    <button
                        className="cricket-booking-nav-item"
                        onClick={() => goTo("/student/room")}
                    >
                        <span>🛏️</span>
                        <span>My Room</span>
                    </button>

                    <button
                        className="cricket-booking-nav-item"
                        onClick={() => goTo("/student/leaves")}
                    >
                        <span>📝</span>
                        <span>My Leave</span>
                    </button>

                    <button
                        className="cricket-booking-nav-item"
                        onClick={() => goTo("/student/apply-leave")}
                    >
                        <span>➕</span>
                        <span>Apply Leave</span>
                    </button>

                    <button
                        className="cricket-booking-nav-item"
                        onClick={() => goTo("/student/gatepass")}
                    >
                        <span>🎫</span>
                        <span>Gate Pass</span>
                    </button>

                    <button
                        className="cricket-booking-nav-item"
                        onClick={() => goTo("/student/complaints")}
                    >
                        <span>📝</span>
                        <span>Complaints</span>
                    </button>

                    <button
                        className="cricket-booking-nav-item"
                        onClick={() => goTo("/student/fees")}
                    >
                        <span>💰</span>
                        <span>My Fees</span>
                    </button>

                    <button
                        className="cricket-booking-nav-item"
                        onClick={() => goTo("/student/notifications")}
                    >
                        <span>🔔</span>
                        <span>Notifications</span>
                    </button>

                    <button
                        className="cricket-booking-nav-item active"
                        onClick={() => goTo("/student/cricketbox")}
                    >
                        <span>🏏</span>
                        <span>Cricket Box</span>
                    </button>
                </nav>

                <button
                    className="cricket-booking-logout"
                    onClick={handleLogout}
                >
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </aside>

            <div className="cricket-booking-main">
                <header className="cricket-booking-topbar">
                    <button
                        className="cricket-booking-hamburger"
                        onClick={() =>
                            setSidebarOpen((prev) => !prev)
                        }
                        aria-label="Toggle menu"
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    <div className="cricket-booking-panel-title">
                        <strong>Hostel Student Panel</strong>
                        <span>Cricket Box Booking</span>
                    </div>

                    <div className="cricket-booking-profile">
                        {studentPhoto ? (
                            <img
                                src={studentPhoto}
                                alt="Student"
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                    event.currentTarget.nextSibling.style.display = "flex";
                                }}
                            />
                        ) : null}
                        <div
                            className="cricket-booking-photo-fallback"
                            style={{
                                display: studentPhoto ? "none" : "flex",
                            }}
                        >
                            {initials || "ST"}
                        </div>
                    </div>
                </header>

                <main className="cricket-booking-content">
                    <div className="cricket-booking-heading">
                        <div>
                            <span className="cricket-page-label">
                                CRICKET BOX
                            </span>
                            <h1>Book Cricket Box</h1>
                            <p>
                                Select ground, date, time slot and add
                                your players.
                            </p>
                        </div>

                        <button
                            className="back-cricket-btn"
                            onClick={() =>
                                navigate("/student/cricket-box")
                            }
                        >
                            ← Back
                        </button>
                    </div>

                    {error && (
                        <div className="cricket-alert cricket-alert-error">
                            <span>⚠️</span>
                            <div>{error}</div>
                        </div>
                    )}

                    {success && (
                        <div className="cricket-alert cricket-alert-success">
                            <span>✅</span>
                            <div>{success}</div>
                        </div>
                    )}

                    <div className="cricket-booking-grid">
                        <section className="cricket-booking-card">
                            <div className="cricket-card-header">
                                <div className="step-number">1</div>
                                <div>
                                    <h3>Booking Details</h3>
                                    <p>Select your ground and date</p>
                                </div>
                            </div>

                            <div className="cricket-form-group">
                                <label>
                                    Cricket Ground{" "}
                                    <span>*</span>
                                </label>

                                {loadingGrounds ? (
                                    <div className="cricket-loading-box">
                                        Loading grounds...
                                    </div>
                                ) : (
                                    <select
                                        value={selectedGround}
                                        onChange={(event) => {
                                            setSelectedGround(
                                                event.target.value
                                            );
                                            setSelectedSlot(null);
                                        }}
                                    >
                                        <option value="">
                                            Select Cricket Ground
                                        </option>

                                        {grounds.map((ground) => (
                                            <option
                                                key={ground.id}
                                                value={ground.id}
                                            >
                                                {ground.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {selectedGroundData && (
                                <div className="selected-ground-info">
                                    <div className="ground-info-icon">
                                        🏏
                                    </div>

                                    <div>
                                        <strong>
                                            {selectedGroundData.name}
                                        </strong>

                                        {selectedGroundData.location && (
                                            <span>
                                                📍{" "}
                                                {
                                                    selectedGroundData.location
                                                }
                                            </span>
                                        )}

                                        {selectedGroundData.description && (
                                            <p>
                                                {
                                                    selectedGroundData.description
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="cricket-form-group">
                                <label>
                                    Booking Date{" "}
                                    <span>*</span>
                                </label>

                                <input
                                    type="date"
                                    min={getToday()}
                                    value={selectedDate}
                                    onChange={(event) => {
                                        const date = event.target.value;

                                        setSelectedDate(date);
                                        setSelectedSlot(null);

                                        if (selectedGround) {
                                            fetchSlots(selectedGround, date);
                                        } else {
                                            setSlots(
                                                filterSlotsByRealTime(
                                                    allSlots,
                                                    date
                                                )
                                            );
                                        }
                                    }}
                                />
                            </div>
                        </section>

                        <section className="cricket-booking-card">
                            <div className="cricket-card-header">
                                <div className="step-number">2</div>
                                <div>
                                    <h3>Select Time Slot</h3>
                                    <p>Choose your preferred time</p>
                                </div>
                            </div>

                            {!selectedGround ? (
                                <div className="empty-slot-state">
                                    <div>🏟️</div>
                                    <strong>
                                        Select a ground first
                                    </strong>
                                    <span>
                                        Available time slots will appear
                                        here.
                                    </span>
                                </div>
                            ) : loadingSlots ? (
                                <div className="empty-slot-state">
                                    <div className="slot-spinner" />
                                    <strong>Loading slots...</strong>
                                </div>
                            ) : slots.length === 0 ? (
                                <div className="empty-slot-state">
                                    <div>⏰</div>
                                    <strong>
                                        No active slots available
                                    </strong>
                                    <span>
                                        Please choose another ground.
                                    </span>
                                </div>
                            ) : (
                                <div className="slot-grid">
                                    {slots.map((slot) => {
                                        const isSelected =
                                            Number(selectedSlot) === Number(slot.id);

                                        const isAvailable =
                                            Number(slot.is_available) === 1 ||
                                            slot.is_available === true ||
                                            slot.availability_status === "Available";

                                        const price = Number(
                                            slot.price ??
                                            slot.price_per_hour ??
                                            selectedGroundData?.price_per_hour ??
                                            0
                                        );

                                        return (
                                            <button
                                                key={slot.id}
                                                type="button"
                                                disabled={!isAvailable}
                                                className={`slot-card ${isSelected ? "selected" : ""
                                                    } ${isAvailable
                                                        ? "slot-available"
                                                        : "slot-unavailable"
                                                    }`}
                                                onClick={() => {
                                                    if (!isAvailable) {
                                                        return;
                                                    }

                                                    setSelectedSlot(slot.id);
                                                }}
                                            >
                                                <div className="slot-radio">
                                                    {isSelected ? "✓" : ""}
                                                </div>

                                                <div className="slot-time">
                                                    {slot.start_time?.slice(0, 5)}{" "}
                                                    -{" "}
                                                    {slot.end_time?.slice(0, 5)}
                                                </div>

                                                <div className="slot-price">
                                                    ₹{price.toFixed(2)}
                                                </div>

                                                <div
                                                    className={`slot-availability ${isAvailable
                                                        ? "slot-availability-available"
                                                        : "slot-availability-unavailable"
                                                        }`}
                                                >
                                                    {isAvailable
                                                        ? "🟢 Available"
                                                        : "🔴 Unavailable"}
                                                </div>

                                                {!isAvailable && slot.unavailable_reason && (
                                                    <div className="slot-unavailable-reason">
                                                        {slot.unavailable_reason}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="cricket-booking-card cricket-players-card">
                            <div className="cricket-card-header">
                                <div className="step-number">3</div>
                                <div>
                                    <h3>Players</h3>
                                    <p>
                                        Logged-in student is added
                                        automatically
                                    </p>
                                </div>
                            </div>

                            <div className="main-player-box">
                                <div className="player-number">
                                    1
                                </div>

                                <div className="player-fields">
                                    <div className="cricket-form-group">
                                        <label>
                                            Student Name{" "}
                                            <span>*</span>
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                players[0]
                                                    ?.student_name || ""
                                            }
                                            readOnly
                                        />
                                    </div>

                                    <div className="cricket-form-group">
                                        <label>Student ID</label>

                                        <input
                                            type="text"
                                            value={
                                                players[0]
                                                    ?.student_id || ""
                                            }
                                            readOnly
                                        />
                                    </div>

                                    <div className="cricket-form-group">
                                        <label>Mobile</label>

                                        <input
                                            type="text"
                                            value={
                                                players[0]?.mobile || ""
                                            }
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="main-player-badge">
                                    You
                                </div>
                            </div>

                            {players.slice(1).map((player, index) => {
                                const actualIndex = index + 1;

                                return (
                                    <div
                                        className="additional-player-box"
                                        key={actualIndex}
                                    >
                                        <div className="player-number">
                                            {actualIndex + 1}
                                        </div>

                                        <div className="player-fields">
                                            <div className="cricket-form-group">
                                                <label>
                                                    Player Name{" "}
                                                    <span>*</span>
                                                </label>

                                                <input
                                                    type="text"
                                                    placeholder="Enter player name"
                                                    value={
                                                        player.student_name
                                                    }
                                                    onChange={(event) =>
                                                        searchStudent(
                                                            actualIndex,
                                                            event.target.value
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="cricket-form-group">
                                                <label>
                                                    Student ID
                                                </label>

                                                <input
                                                    type="text"
                                                    placeholder="Student ID"
                                                    value={player.student_id || ""}
                                                    readOnly
                                                />
                                            </div>

                                            <div className="cricket-form-group">
                                                <label>Mobile</label>

                                                <input
                                                    type="text"
                                                    placeholder="Mobile number"
                                                    value={player.mobile || ""}
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="remove-player-btn"
                                            onClick={() =>
                                                removePlayer(
                                                    actualIndex
                                                )
                                            }
                                        >
                                            ×
                                        </button>
                                    </div>
                                );
                            })}

                            <button
                                type="button"
                                className="add-player-btn"
                                onClick={addPlayer}
                                disabled={
                                    !selectedGround ||
                                    (
                                        Number(selectedGroundData?.capacity || 0) > 0 &&
                                        players.length >= Number(selectedGroundData?.capacity)
                                    )
                                }
                            >
                                {selectedGroundData?.capacity &&
                                    players.length >= Number(selectedGroundData.capacity)
                                    ? `Maximum ${selectedGroundData.capacity} Students`
                                    : "+ Add Another Player"}
                            </button>


                        </section>

                        <aside className="booking-summary-card">
                            <div className="summary-header">
                                <div className="summary-icon">
                                    🏏
                                </div>
                                <div>
                                    <h3>Booking Summary</h3>
                                    <span>
                                        Review before confirming
                                    </span>
                                </div>
                            </div>

                            <div className="summary-details">
                                <div className="summary-row">
                                    <span>Ground</span>
                                    <strong>
                                        {selectedGroundData?.name ||
                                            "Not selected"}
                                    </strong>
                                </div>

                                <div className="summary-row">
                                    <span>Date</span>
                                    <strong>
                                        {selectedDate
                                            ? new Date(
                                                `${selectedDate}T00:00:00`
                                            ).toLocaleDateString(
                                                "en-IN",
                                                {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                }
                                            )
                                            : "Not selected"}
                                    </strong>
                                </div>

                                <div className="summary-row">
                                    <span>Time</span>
                                    <strong>
                                        {selectedSlotData
                                            ? `${selectedSlotData.start_time?.slice(
                                                0,
                                                5
                                            )} - ${selectedSlotData.end_time?.slice(
                                                0,
                                                5
                                            )}`
                                            : "Not selected"}
                                    </strong>
                                </div>

                                <div className="summary-row">
                                    <span>Players</span>
                                    <strong>
                                        {players.length}
                                    </strong>
                                </div>
                            </div>

                            <div className="summary-total">
                                <span>Total Amount</span>
                                <strong>
                                    ₹{totalAmount.toFixed(2)}
                                </strong>
                            </div>

                            <div className="booking-note">
                                <span>ℹ️</span>
                                <p>
                                    Your booking will remain{" "}
                                    <strong>Pending Approval</strong>{" "}
                                    until it is approved by the
                                    Rector.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="confirm-booking-btn"
                                disabled={
                                    bookingLoading ||
                                    !selectedGround ||
                                    !selectedDate ||
                                    !selectedSlot
                                }
                                onClick={handleBooking}
                            >
                                {bookingLoading
                                    ? "Submitting..."
                                    : "Confirm Booking →"}
                            </button>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default CricketBooking;