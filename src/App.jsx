import { useState } from "react";
import SolsticeApp, { BRAND } from "./SolsticeApp.jsx";
import SolsticeAgentDashboard from "./SolsticeDashboard.jsx";

/* Wraps both halves of Solstice — the guest-facing marketplace and the
   host/agent dashboard — into one app. A slim switcher bar stands in for
   what would normally be separate routes (/ and /dashboard) once this is
   wired to real auth: a logged-out visitor sees the guest experience, a
   logged-in host/agent sees the dashboard. */
export default function App() {
  const [mode, setMode] = useState("guest");

  return (
    <div>
      <div
        className="flex items-center justify-center gap-1 py-2 px-2 text-xs sticky top-0 z-40"
        style={{ background: BRAND.ink, fontFamily: "Work Sans, sans-serif" }}
      >
        <button
          onClick={() => setMode("guest")}
          className="px-3 py-1.5 rounded-full transition-colors"
          style={{
            background: mode === "guest" ? BRAND.gold : "transparent",
            color: mode === "guest" ? BRAND.white : "#AEB6C6",
          }}
        >
          Guest experience
        </button>
        <button
          onClick={() => setMode("dashboard")}
          className="px-3 py-1.5 rounded-full transition-colors"
          style={{
            background: mode === "dashboard" ? BRAND.gold : "transparent",
            color: mode === "dashboard" ? BRAND.white : "#AEB6C6",
          }}
        >
          Host &amp; agent dashboard
        </button>
      </div>
      {mode === "guest" ? <SolsticeApp /> : <SolsticeAgentDashboard />}
    </div>
  );
}
