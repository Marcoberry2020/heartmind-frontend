 import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PaymentSuccess.css";

const API = process.env.REACT_APP_API_URL || "https://heartmind-vghw.onrender.com";

export default function PaymentSuccess() {
  const [status, setStatus] = useState("Verifying payment...");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get("reference");
      const userId = urlParams.get("userId") || localStorage.getItem("userId");

      if (!reference || !userId) {
        setError("Payment reference or user ID is missing.");
        setStatus("");
        return;
      }

      try {
        const res = await axios.post(`${API}/api/payment/verify-payment`, {
          reference,
          userId
        });

        if (res.data.success) {
          setStatus("Payment successful! Your subscription is now active.");
          setUser(res.data.user);
          localStorage.setItem("userId", res.data.user._id);
        } else {
          setError(res.data.message || "Payment verification failed.");
          setStatus("");
        }
      } catch (err) {
        console.error("Payment verification error:", err.response?.data || err);
        setError(err.response?.data?.message || "Verification failed due to network error.");
        setStatus("");
      }
    };

    verifyPayment();
  }, []);

  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2 className="payment-title">HeartMind Payment Status</h2>
        {status && <p className="payment-status">{status}</p>}
        {error && <p className="payment-error">{error}</p>}
        <button className="dashboard-btn" onClick={goToDashboard}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
