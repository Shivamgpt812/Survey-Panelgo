import React from "react";
import { useLocation } from "react-router-dom";

const SurveySecurity = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const pid = params.get("pid");
  const uid = params.get("uid");
  const status = params.get("status");
  const ip = params.get("ip");
  const time = params.get("time");

  const statusMap: Record<string, string> = {
    "1": "Completed",
    "2": "Terminated",
    "3": "Quota Full",
    "4": "Security Terminated"
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1 style={{ color: "#6b7280" }}>
        {status ? statusMap[status] : "Survey Result"}
      </h1>

      <div style={{
        margin: "20px auto",
        padding: "20px",
        maxWidth: "400px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        background: "#fff"
      }}>
        <h2>Tracking Details</h2>

        <p><strong>PID:</strong> {pid || "N/A"}</p>
        <p><strong>UID:</strong> {uid || "N/A"}</p>
        <p><strong>Status:</strong> {status ? statusMap[status] : "Unknown"}</p>
        <p><strong>IP Address:</strong> {ip || "N/A"}</p>
        <p><strong>Time:</strong> {time ? new Date(time).toLocaleString() : "N/A"}</p>
      </div>

      <button
        onClick={() => (window.location.href = "/")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#3b82f6",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Go Back to Dashboard
      </button>
    </div>
  );
};

export default SurveySecurity;
