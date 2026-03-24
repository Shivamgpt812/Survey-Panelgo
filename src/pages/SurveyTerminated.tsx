import React from "react";
import { useNavigate } from "react-router-dom";

const SurveyTerminated = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      fontFamily: "sans-serif",
      backgroundColor: "#f8fafc",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        maxWidth: "500px",
        width: "100%"
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          backgroundColor: "#ef4444",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: "40px"
        }}>
          ❌
        </div>
        
        <h1 style={{
          fontSize: "32px",
          fontWeight: "bold",
          color: "#1f2937",
          marginBottom: "16px",
          margin: "0 0 16px 0"
        }}>
          Survey Terminated
        </h1>
        
        <p style={{
          fontSize: "18px",
          color: "#6b7280",
          marginBottom: "32px",
          lineHeight: "1.5"
        }}>
          The survey was terminated. You did not meet the qualifying criteria for this survey.
        </p>
        
        <button
          onClick={() => navigate("/")}
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            fontSize: "16px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s",
            marginTop: "20px"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
        >
          Go Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SurveyTerminated;
