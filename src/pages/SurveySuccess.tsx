import React from "react";

export default function SurveySuccess() {
  console.log("SurveySuccess rendered");

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      fontFamily: "sans-serif"
    }}>
      <h1>✅ Survey Completed</h1>
      <p>Your response has been recorded successfully.</p>
      <button onClick={() => window.location.href = "/"}>
        Go Back to Dashboard
      </button>
    </div>
  );
}
