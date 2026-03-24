import { useLocation } from "react-router-dom";

const statusConfig: Record<string, { label: string; color: string }> = {
  "1": { label: "Completed", color: "#22c55e" },
  "2": { label: "Terminated", color: "#ef4444" },
  "3": { label: "Quota Full", color: "#f59e0b" },
  "4": { label: "Security Terminated", color: "#6b7280" }
};

export default function SurveyResultCard() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const pid = params.get("pid");
  const uid = params.get("uid");
  const status = params.get("status");
  const ip = params.get("ip");
  const time = params.get("time");

  const config = status ? statusConfig[status] : { label: "Result", color: "#7C83FD" };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF2FF] p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 md:p-8">

        {/* Title */}
        <h1
          className="text-2xl md:text-3xl font-bold mb-6"
          style={{ color: config.color }}
        >
          {config.label}
        </h1>

        {/* DATA SECTION */}
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 text-sm md:text-base">

          <div className="flex gap-2">
            <span className="font-semibold">PID:</span>
            <span className="break-all">{pid || "N/A"}</span>
          </div>

          <div className="flex gap-2">
            <span className="font-semibold">UID:</span>
            <span className="break-all">{uid || "N/A"}</span>
          </div>

          <div className="flex gap-2">
            <span className="font-semibold">Status:</span>
            <span>{config.label}</span>
          </div>

          <div className="flex gap-2">
            <span className="font-semibold">IP:</span>
            <span className="break-all">{ip || "N/A"}</span>
          </div>

          <div className="flex gap-2">
            <span className="font-semibold">Time:</span>
            <span>
              {time ? new Date(time).toLocaleString() : "N/A"}
            </span>
          </div>

        </div>

        {/* BUTTON */}
        <div className="mt-8">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full md:w-auto px-5 py-2 rounded-xl text-white"
            style={{ background: "#7C83FD" }}
          >
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
