import React from "react";
import { useLocation } from "react-router-dom";

export default function SurveyTerminated() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const pid = params.get("pid");
  const uid = params.get("uid");
  const status = params.get("status");

  const statusMap: Record<string, string> = {
    "1": "Completed",
    "2": "Terminated",
    "3": "Quota Full",
    "4": "Security Terminated"
  };

  const statusText = statusMap[status || ""] || "Unknown";

  return (
    <div style={{
      padding: "40px",
      fontFamily: "sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f8fafc"
    }}>
      <h1 style={{ color: "#ef4444", marginBottom: "30px" }}>❌ Survey Terminated</h1>

      <div style={{
        marginTop: "20px",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        maxWidth: "500px",
        width: "100%",
        backgroundColor: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ marginBottom: "20px", color: "#1f2937" }}>Tracking Details</h2>
        
        <div style={{ marginBottom: "15px" }}>
          <p style={{ margin: "8px 0", fontSize: "16px" }}>
            <strong style={{ color: "#6b7280" }}>PID:</strong> 
            <span style={{ marginLeft: "10px", color: "#1f2937", fontFamily: "monospace" }}>
              {pid || "N/A"}
            </span>
          </p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <p style={{ margin: "8px 0", fontSize: "16px" }}>
            <strong style={{ color: "#6b7280" }}>UID:</strong> 
            <span style={{ marginLeft: "10px", color: "#1f2937", fontFamily: "monospace" }}>
              {uid || "N/A"}
            </span>
          </p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <p style={{ margin: "8px 0", fontSize: "16px" }}>
            <strong style={{ color: "#6b7280" }}>Status:</strong> 
            <span style={{ 
              marginLeft: "10px", 
              color: status === "1" ? "#10b981" : "#ef4444",
              fontWeight: "bold"
            }}>
              {statusText}
            </span>
          </p>
        </div>
      </div>

      <button 
        style={{
          marginTop: "30px",
          padding: "12px 24px",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
          transition: "background-color 0.2s"
        }}
        onClick={() => window.location.href = "/"}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
      >
        Go Back to Dashboard
      </button>
    </div>
  );
}
