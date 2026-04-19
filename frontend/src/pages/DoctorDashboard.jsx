import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    api.get("/appointments/my").then(r => setAppointments(r.data));
  }, []);

  const upcoming = appointments.filter(a => a.status === "confirmed");
  const completed = appointments.filter(a => a.status === "completed");

  const canJoinCall = (appt) => {
    const apptTime = new Date(appt.date_time);
    const now = new Date();
    const diff = Math.abs(now - apptTime) / 60000;
    return appt.status === "confirmed" && diff <= 30;
  };

  const tabStyle = (t) => ({
    padding: "8px 20px",
    border: "none",
    background: tab === t ? "var(--primary)" : "transparent",
    color: tab === t ? "white" : "var(--text-secondary)",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s"
  });

  const renderTable = (list, showAction = false) => (
    list.length === 0 ? (
      <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>🗓</div>
        <p>No appointments in this category.</p>
      </div>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Date & Time</th>
            <th>Reason</th>
            <th>Status</th>
            {showAction && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {list.map(appt => (
            <tr key={appt.id}>
              <td style={{ fontWeight: "500", color: "var(--text-primary)" }}>{appt.patient_name}</td>
              <td>{new Date(appt.date_time).toLocaleString()}</td>
              <td>{appt.reason || "—"}</td>
              <td><span className={`badge badge-${appt.status}`}>{appt.status}</span></td>
              {showAction && (
                <td>
                  {canJoinCall(appt) ? (
                    <button className="btn btn-accent" style={{ padding: "6px 14px", fontSize: "13px" }}
                      onClick={() => navigate(`/call/${appt.id}?patient_id=${appt.patient_id}`)}>
                      Join Call
                    </button>
                  ) : (
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {new Date(appt.date_time) > new Date() ? "Not yet time" : "Missed"}
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    )
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Doctor Dashboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Welcome, {user?.name}</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: "28px" }}>
        <div className="stat-card">
          <p className="stat-label">Total Appointments</p>
          <p className="stat-value">{appointments.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Upcoming</p>
          <p className="stat-value">{upcoming.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Completed</p>
          <p className="stat-value">{completed.length}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", background: "var(--surface)", padding: "6px", borderRadius: "10px", border: "1px solid var(--border)", width: "fit-content" }}>
        <button style={tabStyle("upcoming")} onClick={() => setTab("upcoming")}>Upcoming ({upcoming.length})</button>
        <button style={tabStyle("completed")} onClick={() => setTab("completed")}>Completed ({completed.length})</button>
      </div>

      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: "16px" }}>{tab === "upcoming" ? "Upcoming Appointments" : "Completed Appointments"}</h3>
        </div>
        {tab === "upcoming" ? renderTable(upcoming, true) : renderTable(completed, false)}
      </div>
    </div>
  );
}