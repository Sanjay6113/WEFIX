"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

const statuses = ["Diagnosing", "Parts Ordered", "Repairing", "Stress-Testing", "Ready"];

const demoRepairs = [
  {
    id: "WF-1042",
    phone: "9876543210",
    device: "ASUS TUF A15",
    repair: "Motherboard IC repair",
    status: "Repairing",
    quote: "Rs. 3,800"
  },
  {
    id: "WF-1088",
    phone: "9000012345",
    device: "MacBook Air M1",
    repair: "Water damage recovery",
    status: "Stress-Testing",
    quote: "Rs. 6,500"
  }
];

export function RepairTracker() {
  const [query, setQuery] = useState("");
  const result = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return null;
    return demoRepairs.find(
      (repair) => repair.id.toLowerCase() === normalized || repair.phone.endsWith(normalized)
    );
  }, [query]);

  const activeIndex = result ? statuses.indexOf(result.status) : -1;

  return (
    <div className="panel tracker-card">
      <p className="section-kicker">Live repair tracker</p>
      <h1 style={{ fontSize: "clamp(2.4rem, 7vw, 5.3rem)" }}>Check Status</h1>
      <p className="section-copy">
        Enter a ticket ID or registered phone number. Demo tickets: WF-1042 or WF-1088.
      </p>
      <div className="input-grid" style={{ marginTop: 24 }}>
        <input
          className="field"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ticket ID or phone"
          value={query}
        />
        <button className="button button-primary" type="button">
          <Search size={18} />
          Check
        </button>
      </div>

      {query && !result ? (
        <div className="glass-card" style={{ marginTop: 22 }}>
          <h3>No matching repair found</h3>
          <p>Check the ticket ID, or message WeFix if your job was recently created.</p>
        </div>
      ) : null}

      {result ? (
        <div className="glass-card" style={{ marginTop: 22 }}>
          <div className="summary-list">
            <div className="summary-row">
              <span>Ticket</span>
              <strong>{result.id}</strong>
            </div>
            <div className="summary-row">
              <span>Device</span>
              <strong>{result.device}</strong>
            </div>
            <div className="summary-row">
              <span>Repair</span>
              <strong>{result.repair}</strong>
            </div>
            <div className="summary-row">
              <span>Quote</span>
              <strong>{result.quote}</strong>
            </div>
          </div>
          <div className="status-rail">
            {statuses.map((status, index) => (
              <div
                className={`status-node ${index < activeIndex ? "done" : ""} ${
                  index === activeIndex ? "current" : ""
                }`}
                key={status}
              >
                {status}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
