import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./ParentVerifyOtp.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ParentVerifyOtp = () => {
    const navigate = useNavigate();
    const { gatePassId } = useParams();
    const [searchParams] = useSearchParams();
    const linkToken = useMemo(
        () => searchParams.get("token") || "",
        [searchParams]
    );

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) {
            return;
        }

        const nextOtp = [...otp];
        nextOtp[index] = value;
        setOtp(nextOtp);
        setError("");

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, event) => {
        if (
            event.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const cleanOtp = otp.join("");

        if (!linkToken) {
            setError("This review link is invalid or incomplete.");
            return;
        }

        if (!/^\d{6}$/.test(cleanOtp)) {
            setError("Please enter the complete 6-digit OTP.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/parent/gatepass/${gatePassId}/verify-otp?token=${encodeURIComponent(linkToken)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        otp: cleanOtp
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to verify OTP."
                );
            }

            navigate(
                `/parent/gatepass/${gatePassId}?token=${encodeURIComponent(data.accessToken)}`,
                {
                    replace: true,
                    state: {
                        gatePass: data.gatePass || null
                    }
                }
            );
        } catch (err) {
            console.error("Parent OTP Error:", err);
            setError(
                err.message || "Unable to verify OTP."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="parentverifyotp-page">
            <section className="parentverifyotp-card">
                <div className="parentverifyotp-brand">
                    <div className="parentverifyotp-brand-icon">🏠</div>
                    <div>
                        <strong>Virtuous Hostel</strong>
                        <span>Parent Gate Pass Portal</span>
                    </div>
                </div>

                <div className="parentverifyotp-body">
                    <div className="parentverifyotp-icon">🔐</div>

                    <p className="parentverifyotp-eyebrow">
                        PARENT VERIFICATION
                    </p>

                    <h1>Verify Gate Pass</h1>

                    <p className="parentverifyotp-description">
                        Enter the 6-digit OTP received in your email to review your ward&apos;s gate pass request.
                    </p>

                    <div className="parentverifyotp-gatepass-id">
                        Gate Pass ID: <strong>GP-{gatePassId}</strong>
                    </div>

                    {error && (
                        <div className="parentverifyotp-error">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <label className="parentverifyotp-label">
                            Enter OTP
                        </label>

                        <div className="parentverifyotp-inputs">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(element) => {
                                        inputRefs.current[index] = element;
                                    }}
                                    className="parentverifyotp-input"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(event) =>
                                        handleOtpChange(
                                            index,
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={(event) =>
                                        handleKeyDown(index, event)
                                    }
                                    autoComplete="one-time-code"
                                    aria-label={`OTP digit ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="parentverifyotp-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Verifying..."
                                : "Verify & Review Gate Pass"}
                        </button>
                    </form>

                    <p className="parentverifyotp-note">
                        The student does not need to enter or verify this OTP. This verification is completed by the parent.
                    </p>
                </div>
            </section>
        </main>
    );
};

export default ParentVerifyOtp;
